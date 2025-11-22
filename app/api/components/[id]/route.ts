// app/api/components/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// Convert yyyy-mm-dd -> Date (local midnight)
const parseDateOnly = (str: string): Date => {
  if (!str) return new Date();

  // If the DB already returned a full timestamp, keep it
  if (str.includes("T")) return new Date(str);

  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// -------------------------------------------------------
// GET /api/components/:id
// -------------------------------------------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const compRes = await pool.query(
      `
      SELECT 
        id,
        serial_number AS "serialNumber",
        type,
        date_received AS "dateReceived",
        arrived_from AS "arrivedFrom",
        primary_fault AS "primaryFault",
        secondary_fault AS "secondaryFault",
        update_date AS "updateDate",
        status
      FROM components
      WHERE id = $1
      `,
      [id]
    );

    if (compRes.rows.length === 0) {
      return new NextResponse("NOT FOUND", { status: 404 });
    }

    const histRes = await pool.query(
      `
      SELECT
        version,
        timestamp,
        updated_by AS "updatedBy",
        changes,
        full_state AS "fullState"
      FROM component_hist
      WHERE component_id = $1
      ORDER BY version ASC
      `,
      [id]
    );

    return NextResponse.json({
      ...compRes.rows[0],
      history: histRes.rows,
    });
  } catch (err) {
    console.error("GET /components/:id error:", err);
    return new NextResponse("ERROR", { status: 500 });
  }
}

// -------------------------------------------------------
// PUT /api/components/:id
// -------------------------------------------------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { updatedFields } = await req.json();

  // Normalize dates coming from client
  if (updatedFields.dateReceived) {
    updatedFields.dateReceived = parseDateOnly(updatedFields.dateReceived);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT 
          id,
          serial_number AS "serialNumber",
          type,
          date_received AS "dateReceived",
          arrived_from AS "arrivedFrom",
          primary_fault AS "primaryFault",
          secondary_fault AS "secondaryFault",
          update_date AS "updateDate",
          status
        FROM components
        WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return new NextResponse("NOT FOUND", { status: 404 });
    }

    const old = rows[0];

    const map: Record<string, string> = {
      serialNumber: "serial_number",
      type: "type",
      dateReceived: "date_received",
      arrivedFrom: "arrived_from",
      primaryFault: "primary_fault",
      secondaryFault: "secondary_fault",
      status: "status",
    };

    const apply: any = {};
    const changes: any = {};

    for (const key in updatedFields) {
      if (!map[key]) continue;

      const newVal = updatedFields[key];
      const oldVal = old[key];

      // Compare correctly (dates must match local midnight)
      const equal =
        newVal instanceof Date &&
        oldVal instanceof Date &&
        newVal.getTime() === new Date(oldVal).getTime();

      if (!equal && oldVal !== newVal) {
        apply[map[key]] = newVal;
        changes[key] = { old: oldVal, new: newVal };
      }
    }

    const now = new Date();
    apply["update_date"] = now;

    const columns = Object.keys(apply);
    const values = Object.values(apply);
    values.push(id);

    const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(", ");

    const updated = await client.query(
      `
      UPDATE components
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING 
        id,
        serial_number AS "serialNumber",
        type,
        date_received AS "dateReceived",
        arrived_from AS "arrivedFrom",
        primary_fault AS "primaryFault",
        secondary_fault AS "secondaryFault",
        update_date AS "updateDate",
        status
      `,
      values
    );

    const versionRes = await client.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS v
       FROM component_hist
       WHERE component_id = $1`,
      [id]
    );

    const version = versionRes.rows[0].v;

    await client.query(
      `
      INSERT INTO component_hist 
      (component_id, version, timestamp, updated_by, changes, full_state)
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [id, version, now, "מערכת", changes, updated.rows[0]]
    );

    await client.query("COMMIT");

    return NextResponse.json(updated.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT ERROR:", err);
    return new NextResponse("ERROR", { status: 500 });
  } finally {
    client.release();
  }
}

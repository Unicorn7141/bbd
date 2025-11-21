import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ✅ FIXED
  const { updatedFields } = await req.json();

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Fetch old component
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

      if (old[key] !== updatedFields[key]) {
        apply[map[key]] = updatedFields[key];
        changes[key] = { old: old[key], new: updatedFields[key] };
      }
    }

    const now = new Date().toISOString();
    apply["update_date"] = now;

    const columns = Object.keys(apply);
    const values = Object.values(apply);

    const setClause = columns
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");

    // Push ID last
    values.push(id);

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

    // Insert history entry
    const versionRes = await client.query(
      `SELECT COALESCE(MAX(version), 0) + 1 AS v
       FROM component_history
       WHERE component_id = $1`,
      [id]
    );

    const version = versionRes.rows[0].v;

    await client.query(
      `
      INSERT INTO component_history 
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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 1. Fetch component
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

    // 2. Fetch history for this component
    const histRes = await pool.query(
      `
      SELECT
        version,
        timestamp,
        updated_by AS "updatedBy",
        changes,
        full_state AS "fullState"
      FROM component_history
      WHERE component_id = $1
      ORDER BY version ASC
      `,
      [id]
    );

    // 3. Return both
    return NextResponse.json({
      ...compRes.rows[0],
      history: histRes.rows,
    });

  } catch (err) {
    console.error("GET /components/:id error:", err);
    return new NextResponse("ERROR", { status: 500 });
  }
}

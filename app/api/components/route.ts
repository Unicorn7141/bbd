import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query(`
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
    ORDER BY id DESC
  `);

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    serialNumber,
    type,
    dateReceived,
    arrivedFrom,
    primaryFault,
    secondaryFault,
  } = body;

  const now = new Date().toISOString();

  const inserted = await pool.query(
    `
    INSERT INTO components 
    (serial_number, type, date_received, arrived_from, primary_fault, secondary_fault, update_date, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'in-process')
    RETURNING *
    `,
    [
      serialNumber,
      type,
      dateReceived,
      arrivedFrom,
      primaryFault,
      secondaryFault,
      now,
    ]
  );

  return NextResponse.json(inserted.rows[0]);
}

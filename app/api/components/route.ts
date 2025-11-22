import { NextResponse } from "next/server";
import { db } from "@/db";
import { components, componentHistory } from "@/db/schema";

// -------------------------------------------------------------
// GET → Return list of all components
// -------------------------------------------------------------
export async function GET() {
  try {
    const rows = await db.select().from(components);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/components ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// -------------------------------------------------------------
// POST → Create new component + initial history entry
// -------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = Math.random().toString(36).slice(2);
    const now = new Date();
    const iso = now.toISOString();
    const today = iso.split("T")[0];

    // Build safe base object
    const base = {
      id,
      serialNumber: body.serialNumber?.toUpperCase() ?? "",
      type: body.type ?? "",
      dateReceived: body.dateReceived || today,
      arrivedFrom: body.arrivedFrom ?? "",
      primaryFault: body.primaryFault ?? "",
      secondaryFault: body.secondaryFault ?? "",
      updateDate: now, // MUST be a Date object for Drizzle
      status: "in-process",
    };

    // Insert main component
    await db.insert(components).values(base);

    // Insert initial history entry
    await db.insert(componentHistory).values({
      componentId: id,
      version: 1,
      timestamp: now, // MUST be Date object
      updatedBy: "system",
      changes: { initial: true },
      fullState: base,
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("POST /api/components ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

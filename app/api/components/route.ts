// app/api/components/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { components, componentHistory } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = Math.random().toString(36).slice(2);
    const now = new Date();

    const base = {
      id,
      serialNumber: body.serialNumber?.toUpperCase() ?? "",
      type: body.type ?? "",
      dateReceived: now.toISOString().split("T")[0],
      arrivedFrom: body.arrivedFrom ?? "",
      primaryFault: body.primaryFault ?? "",
      secondaryFault: body.secondaryFault ?? "",
      updateDate: now,
      status: "in-process",
    };

    await db.insert(components).values(base);

    await db.insert(componentHistory).values({
      componentId: id,
      version: 1,
      updatedBy: "system",

      // creation event
      changes: {
        initial: {
          new: "נוצר",
        },
      },

      fullState: base,
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET ALL COMPONENTS
export async function GET() {
  try {
    const all = await db.select().from(components);
    return NextResponse.json(all);
  } catch (err: any) {
    console.error("GET /api/components ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

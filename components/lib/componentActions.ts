"use server";

import { db } from "@/db";
import { components, componentHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Component } from "./types";

export async function getAllComponents(): Promise<Component[]> {
  const rows = await db.select().from(components);
  return rows as unknown as Component[];
}

export async function addComponentAction(data: Partial<Component>): Promise<boolean> {
  const id = Math.random().toString(36).slice(2);
  const now = new Date().toISOString();

  const base: Component = {
    id,
    serialNumber: (data.serialNumber || "").toUpperCase(),
    type: data.type || "",
    dateReceived: data.dateReceived || now.split("T")[0],
    arrivedFrom: data.arrivedFrom || "",
    primaryFault: data.primaryFault || "",
    secondaryFault: data.secondaryFault || "",
    updateDate: now,
    status: "in-process",
    history: [],
  };

  await db.insert(components).values(base);

  await db.insert(componentHistory).values({
    componentId: id,
    version: 1,
    timestamp: now,
    updatedBy: "מערכת",
    changesJson: JSON.stringify({ initial: "נוצר" }),
    fullStateJson: JSON.stringify(base),
  });

  return true;
}

export async function updateComponentAction(
  id: string,
  updatedFields: Partial<Component>
): Promise<boolean> {
  const [current] = await db.select().from(components).where(eq(components.id, id));
  if (!current) return false;

  const now = new Date().toISOString();
  const changes: Record<string, any> = {};
  const fieldsToCheck = { ...updatedFields };
  delete (fieldsToCheck as any).id;
  delete (fieldsToCheck as any).history;

  for (const key of Object.keys(fieldsToCheck) as (keyof Component)[]) {
    if (current[key] !== fieldsToCheck[key]) {
      changes[key] = { old: current[key], new: fieldsToCheck[key] };
    }
  }

  if (Object.keys(changes).length === 0) return true;

  if (changes.serialNumber && typeof updatedFields.serialNumber === "string") {
    updatedFields.serialNumber = updatedFields.serialNumber.toUpperCase();
    changes.serialNumber.new = updatedFields.serialNumber;
  }

  const newState = {
    ...current,
    ...fieldsToCheck,
    updateDate: now,
  };

  await db
    .update(components)
    .set(newState)
    .where(eq(components.id, id));

  const countRows = await db
    .select({ count: componentHistory.version })
    .from(componentHistory)
    .where(eq(componentHistory.componentId, id));

  const version = (countRows.length || 0) + 1;

  await db.insert(componentHistory).values({
    componentId: id,
    version,
    timestamp: now,
    updatedBy: "מערכת",
    changesJson: JSON.stringify(changes),
    fullStateJson: JSON.stringify(newState),
  });

  return true;
}

export async function getHistoryAction(componentId: string) {
  const rows = await db
    .select()
    .from(componentHistory)
    .where(eq(componentHistory.componentId, componentId))
    .orderBy(desc(componentHistory.version));

  return rows.map((r) => ({
    version: r.version,
    timestamp: r.timestamp,
    updatedBy: r.updatedBy,
    changes: JSON.parse(r.changesJson),
    fullState: JSON.parse(r.fullStateJson),
  }));
}

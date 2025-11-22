"use server";

import { db } from "@/db";
import { components, componentHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Component, HistoryEntry, HistoryChange } from "./types";


// Only keys that actually exist in the DB row
type DBKey =
  | "serialNumber"
  | "type"
  | "dateReceived"
  | "arrivedFrom"
  | "primaryFault"
  | "secondaryFault"
  | "status";

// --------------------------------------------------
// GET ALL COMPONENTS
// --------------------------------------------------
export async function getAllComponents(): Promise<Component[]> {
  const rows = await db.select().from(components);

  return rows.map((row) => ({
    ...row,
    updateDate: row.updateDate.toISOString(),
  })) as Component[];
}

// --------------------------------------------------
// ADD COMPONENT
// --------------------------------------------------
export async function addComponentAction(
  data: Partial<Component>
): Promise<boolean> {
  const id = Math.random().toString(36).slice(2);
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const base = {
    id,
    serialNumber: (data.serialNumber ?? "").toUpperCase(),
    type: data.type ?? "",
    dateReceived: data.dateReceived ?? today,
    arrivedFrom: data.arrivedFrom ?? "",
    primaryFault: data.primaryFault ?? "",
    secondaryFault: data.secondaryFault ?? "",
    status: "in-process",
  };

  await db.insert(components).values(base);

  await db.insert(componentHistory).values({
    componentId: id,
    version: 1,
    updatedBy: "system",
    changes: {},
    fullState: base,
  });

  return true;
}

// --------------------------------------------------
// UPDATE COMPONENT
// --------------------------------------------------
export async function updateComponentAction(
  id: string,
  updatedFields: Partial<Component>
): Promise<boolean> {
  const [current] = await db
    .select()
    .from(components)
    .where(eq(components.id, id));

  if (!current) return false;

  const normalized: Record<string, any> = {};
  const changes: Record<string, any> = {};

  const dbKeys: DBKey[] = [
    "serialNumber",
    "type",
    "dateReceived",
    "arrivedFrom",
    "primaryFault",
    "secondaryFault",
    "status",
  ];

  for (const key of dbKeys) {
    let newVal = updatedFields[key];

    if (key === "serialNumber" && typeof newVal === "string") {
      newVal = newVal.toUpperCase();
    }

    if (newVal !== undefined && current[key] !== newVal) {
      normalized[key] = newVal;
      changes[key] = { old: current[key], new: newVal };
    }
  }

  if (Object.keys(changes).length === 0) return true;

  normalized.updateDate = new Date();

  await db.update(components).set(normalized).where(eq(components.id, id));

  const last = await db
    .select({ version: componentHistory.version })
    .from(componentHistory)
    .where(eq(componentHistory.componentId, id))
    .orderBy(desc(componentHistory.version))
    .limit(1);

  const nextVersion = last.length ? last[0].version + 1 : 1;

  const newState = { ...current, ...normalized };

  await db.insert(componentHistory).values({
    componentId: id,
    version: nextVersion,
    updatedBy: "מערכת",
    changes,
    fullState: newState,
  });

  return true;
}

// --------------------------------------------------
// GET HISTORY
// --------------------------------------------------
export async function getHistoryAction(
  componentId: string
): Promise<HistoryEntry[]> {
  const rows = await db
    .select()
    .from(componentHistory)
    .where(eq(componentHistory.componentId, componentId))
    .orderBy(desc(componentHistory.version));

  return rows.map((r) => ({
    version: r.version,
    timestamp: r.timestamp.toISOString(),
    updatedBy: r.updatedBy,
    changes: r.changes as Record<string, string | HistoryChange>,
    fullState: r.fullState as Component,
  }));
}

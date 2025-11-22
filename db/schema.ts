import { pgTable, text, jsonb, integer, timestamp, bigserial } from "drizzle-orm/pg-core";

// ========== COMPONENTS TABLE ==========
export const components = pgTable("components", {
  id: text("id").primaryKey(),
  serialNumber: text("serial_number").notNull(),
  type: text("type").notNull(),
  dateReceived: text("date_received"),       // DATE → text or date? choose date clone below
  arrivedFrom: text("arrived_from"),
  primaryFault: text("primary_fault"),
  secondaryFault: text("secondary_fault"),
  updateDate: timestamp("update_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  status: text("status").notNull(),
});

// If you want `date_received` to be a real DATE type, use:
// dateReceived: date("date_received"),  <-- but requires importing date()

// ========== COMPONENT HISTORY TABLE ==========
export const componentHistory = pgTable("component_hist", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  componentId: text("component_id").notNull(),
  version: integer("version").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: text("updated_by").notNull(),
  changes: jsonb("changes").notNull(),
  fullState: jsonb("full_state").notNull(),
});


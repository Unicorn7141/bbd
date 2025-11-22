import {
  pgTable,
  text,
  date,
  timestamp,
  jsonb,
  integer,
  bigserial,
} from "drizzle-orm/pg-core";

// ---------------------------
// COMPONENTS TABLE
// ---------------------------
export const components = pgTable("components", {
  id: text("id").primaryKey(),

  serialNumber: text("serial_number").notNull(),
  type: text("type").notNull(),

  // Auto-fill using now()::date
  dateReceived: date("date_received", { mode: "string" })
    .notNull()
    .defaultNow(),          // ✅ Supported by your Drizzle version

  arrivedFrom: text("arrived_from").notNull(),
  primaryFault: text("primary_fault").notNull(),
  secondaryFault: text("secondary_fault").notNull(),

  updateDate: timestamp("update_date", { withTimezone: true })
    .notNull()
    .defaultNow(),          // DB auto-fills the timestamp

  status: text("status").notNull(),
});

// ---------------------------
// COMPONENT HISTORY TABLE
// ---------------------------
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

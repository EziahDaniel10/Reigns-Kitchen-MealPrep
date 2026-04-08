import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const contactEnquiriesTable = pgTable("contact_enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ContactEnquiry = typeof contactEnquiriesTable.$inferSelect;
export type InsertContactEnquiry = typeof contactEnquiriesTable.$inferInsert;

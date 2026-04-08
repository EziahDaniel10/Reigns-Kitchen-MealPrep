import { pgTable, serial, text, numeric, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryType: text("delivery_type").notNull(),
  deliveryAddress: text("delivery_address"),
  deliveryDate: text("delivery_date"),
  deliveryWindow: text("delivery_window"),
  allergies: text("allergies"),
  note: text("note"),
  items: jsonb("items").notNull().$type<Array<{ name: string; qty: number; price: number }>>(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  couponCode: text("coupon_code"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentId: text("payment_id"),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
export type InsertOrder = typeof ordersTable.$inferInsert;

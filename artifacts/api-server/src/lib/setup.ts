import { sql } from 'drizzle-orm';
import { db } from '@workspace/db';

export async function setupDatabase() {
  console.log('Running database setup…');

  const statements = [
    `CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      delivery_type TEXT NOT NULL,
      delivery_address TEXT,
      delivery_date TEXT,
      delivery_window TEXT,
      allergies TEXT,
      note TEXT,
      items JSONB NOT NULL DEFAULT '[]',
      subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
      delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
      tax NUMERIC(10,2) NOT NULL DEFAULT 0,
      discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      coupon_code TEXT,
      total NUMERIC(10,2) NOT NULL DEFAULT 0,
      payment_id TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS contact_enquiries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      reply_text TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      discount_type TEXT NOT NULL,
      discount_value NUMERIC(10,2) NOT NULL,
      min_order_amount NUMERIC(10,2),
      max_uses INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      expires_at TIMESTAMP,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS staff (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'support',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      staff_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`,

    `ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS reply_text TEXT`,
  ];

  for (const statement of statements) {
    try {
      await db.execute(sql.raw(statement));
    } catch (err: any) {
      console.error('Setup statement failed:', err?.message ?? err);
    }
  }

  console.log('Database setup complete.');
}

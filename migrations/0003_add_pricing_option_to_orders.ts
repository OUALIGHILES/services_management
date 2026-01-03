import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { pgMigrationsTable, drizzle } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export async function up(db) {
  // Add pricing_option column to orders table
  await db.execute(sql`ALTER TABLE orders ADD COLUMN pricing_option TEXT CHECK (pricing_option IN ('auto_accept', 'choose_offer'))`);
}

export async function down(db) {
  // Remove pricing_option column from orders table
  await db.execute(sql`ALTER TABLE orders DROP COLUMN pricing_option`);
}
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// For serverless environments, we need to handle connections differently
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Configure for serverless
      max: 10, // Increase max connections
      idleTimeoutMillis: 120000, // Increase idle timeout to 120 seconds
      connectionTimeoutMillis: 20000, // Increase connection timeout to 20 seconds
      maxUses: 750, // Close connection after 750 uses to prevent memory leaks
      keepAlive: true, // Enable keep-alive
    });

    dbInstance = drizzle(pool, { schema });
  }

  return dbInstance;
}

// For backward compatibility, export the db instance
export const db = getDb();

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
      max: 1, // Limit connections since each function is isolated
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    dbInstance = drizzle(pool, { schema });
  }

  return dbInstance;
}

// For backward compatibility, export the db instance
export const db = getDb();

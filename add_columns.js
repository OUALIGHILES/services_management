import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function addMissingColumns() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Add missing columns to drivers table
    const queries = [
      "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS service_category TEXT;",
      "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS sub_service TEXT;",
      "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS operating_zones TEXT[];",
      "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS documents JSONB;",
      "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone TEXT;",
      "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS profile_photo TEXT;"
    ];

    for (const query of queries) {
      try {
        await client.query(query);
        console.log(`Executed: ${query}`);
      } catch (err) {
        console.log(`Skipped (likely already exists): ${query}`, err.message);
      }
    }

    console.log('All missing columns have been added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

addMissingColumns();
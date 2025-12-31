import { Client } from 'pg';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kqwjlknbrmwdzottevtv:ghilespmsservies@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function runSQLDirectly() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');
    
    // Run the CREATE TABLE command directly
    const createTableSQL = `CREATE TABLE IF NOT EXISTS "home_banners" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "image_url" text NOT NULL,
      "link_url" text,
      "position" integer NOT NULL,
      "status" text DEFAULT 'active' NOT NULL,
      "created_at" timestamp DEFAULT now(),
      "modified_at" timestamp DEFAULT now()
    );`;
    
    const result = await client.query(createTableSQL);
    console.log('Table creation result:', result.command, result.rowCount);
    
    // Now check if it exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'home_banners'
      );
    `);
    
    console.log('Table exists after creation:', checkResult.rows[0].exists);
    
  } catch (err) {
    console.error('Error executing SQL:', err.message);
    console.error('Error details:', err);
  } finally {
    await client.end();
  }
}

runSQLDirectly();
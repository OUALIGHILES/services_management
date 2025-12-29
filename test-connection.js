import pg from 'pg';

// Manually load .env file
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const envLines = envFile.split('\n');

  for (const line of envLines) {
    if (line.startsWith('DATABASE_URL=')) {
      const value = line.substring('DATABASE_URL='.length).trim();
      process.env.DATABASE_URL = value.replace(/^"|"$/g, ''); // Remove quotes if present
    } else if (line.startsWith('SESSION_SECRET=')) {
      const value = line.substring('SESSION_SECRET='.length).trim();
      process.env.SESSION_SECRET = value.replace(/^"|"$/g, '');
    }
  }
}

const { Pool } = pg;

console.log('Testing database connection...');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

console.log('Using DATABASE_URL:', process.env.DATABASE_URL.replace(/:([^@]+)@/, ':***@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase
  }
});

try {
  const client = await pool.connect();
  console.log('Connected to database successfully!');

  // Test query
  const result = await client.query('SELECT version();');
  console.log('Database version:', result.rows[0].version);

  client.release();
  console.log('Connection test completed successfully');
} catch (error) {
  console.error('Database connection error:', error.message);
} finally {
  await pool.end();
  console.log('Pool closed');
}
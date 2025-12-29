import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Load environment variables
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const envLines = envFile.split('\n');

  for (const line of envLines) {
    if (line.startsWith('DATABASE_URL=')) {
      const value = line.substring('DATABASE_URL='.length).trim();
      process.env.DATABASE_URL = value.replace(/^"|"$/g, '');
    }
  }
}

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkCategories() {
  try {
    const client = await pool.connect();
    
    // Check if service_categories table exists and has data
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'service_categories'
    `);
    
    if (result.rows.length === 0) {
      console.log('service_categories table does not exist');
    } else {
      console.log('service_categories table exists');
      
      // Check if there are any records
      const categories = await client.query('SELECT * FROM service_categories;');
      console.log(`Found ${categories.rows.length} service categories:`);
      
      for (const category of categories.rows) {
        console.log('- ID:', category.id, 'Name:', JSON.stringify(category.name));
      }
    }
    
    client.release();
  } catch (error) {
    console.error('Error checking categories:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategories();
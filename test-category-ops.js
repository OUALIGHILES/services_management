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

async function testCategoryOperations() {
  try {
    const client = await pool.connect();
    
    console.log('Before adding new category:');
    const categoriesBefore = await client.query('SELECT id, name FROM service_categories;');
    console.log(`Found ${categoriesBefore.rows.length} categories:`);
    for (const category of categoriesBefore.rows) {
      console.log('- ID:', category.id, 'Name:', JSON.stringify(category.name));
    }
    
    // Add a test category
    const testCategory = {
      id: 'test-' + Date.now(),
      name: { en: "Test Category", ar: "فئة تجريبية", ur: "ٹیسٹ زمرہ" },
      active: true,
      created_at: new Date().toISOString()
    };
    
    console.log('\nAdding a new test category...');
    // Note: We'll use the actual table structure
    const insertResult = await client.query(`
      INSERT INTO service_categories (name, active) 
      VALUES ($1, $2) 
      RETURNING id, name, active, created_at
    `, [JSON.stringify(testCategory.name), testCategory.active]);
    
    console.log('Added category:', insertResult.rows[0]);
    
    console.log('\nAfter adding new category:');
    const categoriesAfter = await client.query('SELECT id, name, created_at FROM service_categories ORDER BY created_at DESC;');
    console.log(`Found ${categoriesAfter.rows.length} categories:`);
    for (const category of categoriesAfter.rows.slice(0, 5)) { // Show last 5
      console.log('- ID:', category.id, 'Name:', JSON.stringify(category.name), 'Created:', category.created_at);
    }
    
    client.release();
  } catch (error) {
    console.error('Error testing category operations:', error.message);
  } finally {
    await pool.end();
  }
}

testCategoryOperations();
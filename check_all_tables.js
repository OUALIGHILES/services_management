import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kqwjlknbrmwdzottevtv:ghilespmsservies@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function checkAllTables() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');
    
    // Get all tables in the public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check for specific tables that should exist based on the schema
    const expectedTables = [
      'users', 'drivers', 'service_categories', 'orders', 'home_banners',
      'driver_documents', 'impersonation_logs', 'permissions', 
      'products', 'stores', 'sub_admin_permissions', 'subcategories'
    ];
    
    console.log('\nChecking for expected tables:');
    for (const table of expectedTables) {
      const exists = result.rows.some(row => row.table_name === table);
      console.log(`  ${table}: ${exists ? '✓' : '✗'}`);
    }
    
  } catch (err) {
    console.error('Error checking tables:', err.message);
    console.error('Error details:', err);
  } finally {
    await client.end();
  }
}

checkAllTables();
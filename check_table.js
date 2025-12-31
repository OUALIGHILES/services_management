import { Client } from 'pg';

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.kqwjlknbrmwdzottevtv:ghilespmsservies@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

async function checkTableExists() {
  const client = new Client({
    connectionString: DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');
    
    // Check if home_banners table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'home_banners'
      );
    `);
    
    console.log('Table exists:', result.rows[0].exists);
    
    if (result.rows[0].exists) {
      console.log('home_banners table exists in the database');
      // Also check the structure
      const tableInfo = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'home_banners'
        ORDER BY ordinal_position;
      `);
      console.log('home_banners table structure:');
      tableInfo.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('home_banners table does NOT exist in the database');
    }
    
  } catch (err) {
    console.error('Error checking table:', err.message);
  } finally {
    await client.end();
  }
}

checkTableExists();
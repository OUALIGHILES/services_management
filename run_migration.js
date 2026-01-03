const { Client } = require('pg');
require('dotenv').config();

// Read the SQL file
const fs = require('fs');
const sql = fs.readFileSync('./add_missing_order_columns.sql', 'utf8');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    await client.query(sql);
    console.log('Successfully added missing columns to orders table');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

runMigration();
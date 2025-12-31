#!/usr/bin/env node

import { Client } from 'pg';
import 'dotenv/config';

async function addMissingColumn() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');
    
    // Check if the column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'subcategory_id';
    `;
    
    const result = await client.query(checkColumnQuery);
    
    if (result.rows.length === 0) {
      console.log('subcategory_id column does not exist, adding it...');
      
      // Add the missing column
      const addColumnQuery = `
        ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id uuid;
      `;
      await client.query(addColumnQuery);
      console.log('subcategory_id column added successfully');
      
      // Add the foreign key constraint
      const addConstraintQuery = `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'products_subcategory_id_subcategories_id_fk' 
            AND table_name = 'products'
          ) THEN
            ALTER TABLE products 
            ADD CONSTRAINT products_subcategory_id_subcategories_id_fk 
            FOREIGN KEY (subcategory_id) REFERENCES subcategories(id);
          END IF;
        END $$;
      `;
      await client.query(addConstraintQuery);
      console.log('Foreign key constraint added successfully');
    } else {
      console.log('subcategory_id column already exists');
    }
  } catch (error) {
    console.error('Error adding subcategory_id column:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
addMissingColumn().catch(console.error);
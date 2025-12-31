-- Add missing subcategory_id column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id uuid;

-- Add foreign key constraint if it doesn't exist
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
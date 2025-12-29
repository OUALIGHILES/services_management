-- SQL code to run in Supabase SQL editor to fix driver signup process

-- First, ensure the driver_documents table exists (it should be in your schema but let's make sure)
CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    document_type TEXT CHECK (document_type IN ('license', 'vehicle_registration', 'national_id', 'insurance')) NOT NULL,
    document_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_driver_documents_driver_id ON driver_documents(driver_id);

-- Create a function to handle driver registration that properly separates the forms
-- This is a simplified version of what should happen in your backend

-- If you need to reset the driver signup process, you can run:
-- TRUNCATE TABLE driver_documents, drivers, users RESTART IDENTITY CASCADE;
-- But only do this in development!

-- Make sure the enum values are properly set for orders status (if not already done)
DO $$ 
BEGIN
    -- Check if 'picked_up' status exists in the enum, if not add it
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'picked_up' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'orders_status_enum')) THEN
        ALTER TYPE orders_status_enum ADD VALUE 'picked_up';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'orders_status_enum')
ORDER BY enumsortorder;

-- Add any missing indexes that might improve performance
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_documents_verified ON driver_documents(verified);

-- Create a view to help with driver registration status
CREATE OR REPLACE VIEW driver_registration_status AS
SELECT 
    d.id,
    d.user_id,
    d.status,
    d.created_at,
    u.email,
    u.full_name,
    u.phone,
    EXISTS(SELECT 1 FROM driver_documents dd WHERE dd.driver_id = d.id) AS has_documents_uploaded
FROM drivers d
JOIN users u ON d.user_id = u.id;

-- This view will help you track driver registration progress
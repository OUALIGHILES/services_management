-- Add missing columns to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS service_category TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS sub_service TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS operating_zones TEXT[];
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS documents JSONB;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS profile_photo TEXT;
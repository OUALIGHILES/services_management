-- Add missing columns to orders table that are expected by the application

-- Add pricing_option column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pricing_option" text CHECK ("pricing_option" IN ('auto_accept', 'choose_offer'));

-- Add booking_type column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "booking_type" text CHECK ("booking_type" IN ('auto_accept', 'offer_based'));

-- Add location_image column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "location_image" text;

-- Add admin_notes_displayed column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "admin_notes_displayed" text;

-- Add customer_notes column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_notes" text;

-- Add driver_edited_price column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "driver_edited_price" numeric;

-- Add price_edit_status column
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "price_edit_status" text CHECK ("price_edit_status" IN ('pending', 'accepted', 'rejected'));
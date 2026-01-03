-- Migration: Add fields to orders table for new booking flow
-- Add booking_type, location_image, admin_notes_displayed, customer_notes, 
-- driver_edited_price, and price_edit_status fields

-- Add booking_type column with enum values
ALTER TABLE "orders" ADD COLUMN "booking_type" text CHECK ("booking_type" IN ('auto_accept', 'offer_based'));

-- Add location_image column
ALTER TABLE "orders" ADD COLUMN "location_image" text;

-- Add admin_notes_displayed column
ALTER TABLE "orders" ADD COLUMN "admin_notes_displayed" text;

-- Add customer_notes column
ALTER TABLE "orders" ADD COLUMN "customer_notes" text;

-- Add driver_edited_price column
ALTER TABLE "orders" ADD COLUMN "driver_edited_price" numeric;

-- Add price_edit_status column
ALTER TABLE "orders" ADD COLUMN "price_edit_status" text CHECK ("price_edit_status" IN ('pending', 'accepted', 'rejected'));

-- Update existing orders to have booking_type based on pricing_option
UPDATE "orders" 
SET "booking_type" = CASE 
    WHEN "pricing_option" = 'auto_accept' THEN 'auto_accept'
    WHEN "pricing_option" = 'choose_offer' THEN 'offer_based'
    ELSE 'auto_accept'
END;
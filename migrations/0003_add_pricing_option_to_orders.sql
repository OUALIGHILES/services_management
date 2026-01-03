-- Migration: Add pricing_option column to orders table
-- This enables the auto_accept vs choose_offer functionality

ALTER TABLE "orders" ADD COLUMN "pricing_option" text CHECK ("pricing_option" IN ('auto_accept', 'choose_offer'));

-- Update the check constraint to include the new enum values
-- Note: PostgreSQL doesn't have native enum types in the same way as other databases
-- The CHECK constraint ensures valid values
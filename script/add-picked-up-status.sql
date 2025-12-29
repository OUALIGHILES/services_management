-- Add 'picked_up' status to the orders.status enum type
ALTER TYPE "public"."orders_status_enum" ADD VALUE 'picked_up';

-- Verify the change
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'orders_status_enum')
ORDER BY enumsortorder;
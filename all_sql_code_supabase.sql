-- SQL SCHEMA FOR DELIVERY HUB PROJECT
-- This file contains all SQL schema code for direct database execution

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'driver', 'admin', 'subadmin')),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INTEGER,
    base_fare NUMERIC NOT NULL,
    price_per_km NUMERIC NOT NULL,
    images TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: drivers
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'offline', 'online')),
    wallet_balance NUMERIC DEFAULT '0',
    special BOOLEAN DEFAULT false,
    profile JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: zones
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    coords JSONB,
    avg_price NUMERIC,
    fixed_price NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: service_categories
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL,
    description JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: services
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id) NOT NULL,
    name JSONB NOT NULL,
    delivery_type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: pricing
CREATE TABLE IF NOT EXISTS pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID REFERENCES services(id),
    zone_id UUID REFERENCES zones(id),
    price_type TEXT CHECK (price_type IN ('fixed', 'average')),
    fixed_price NUMERIC,
    average_price NUMERIC,
    commission_type TEXT CHECK (commission_type IN ('percentage', 'fixed')),
    commission_value NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    service_id UUID REFERENCES services(id) NOT NULL,
    sub_service TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'pending', 'in_progress', 'picked_up', 'delivered', 'cancelled')),
    payment_method TEXT,
    total_amount NUMERIC,
    driver_share NUMERIC,
    location JSONB,
    notes TEXT,
    scheduled_for TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: order_offers
CREATE TABLE IF NOT EXISTS order_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    price NUMERIC NOT NULL,
    accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'adjustment', 'commission')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    from_user UUID REFERENCES users(id) NOT NULL,
    to_user UUID REFERENCES users(id) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: ratings
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    rater_id UUID REFERENCES users(id) NOT NULL,
    rated_id UUID REFERENCES users(id) NOT NULL,
    rating INTEGER NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: admin_settings
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_vehicle_id ON drivers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_service_id ON orders(service_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- VIEWS
-- View to get driver information with user details
CREATE OR REPLACE VIEW driver_with_user AS
SELECT
    d.id,
    d.user_id,
    d.vehicle_id,
    d.status,
    d.wallet_balance,
    d.special,
    d.profile,
    d.created_at,
    u.email,
    u.full_name,
    u.phone
FROM drivers d
JOIN users u ON d.user_id = u.id;

-- View to get order information with customer and driver details
CREATE OR REPLACE VIEW order_with_details AS
SELECT
    o.id,
    o.request_number,
    o.customer_id,
    o.driver_id,
    o.service_id,
    o.sub_service,
    o.status,
    o.payment_method,
    o.total_amount,
    o.driver_share,
    o.location,
    o.notes,
    o.scheduled_for,
    o.created_at,
    cu.full_name AS customer_name,
    du.full_name AS driver_name
FROM orders o
LEFT JOIN users cu ON o.customer_id = cu.id
LEFT JOIN users du ON o.driver_id = du.id;

-- FUNCTIONS
-- Function to generate a unique request number for orders
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    new_request_number TEXT;
BEGIN
    LOOP
        new_request_number := 'REQ-' || EXTRACT(EPOCH FROM NOW()) || '-' || FLOOR(RANDOM() * 1000)::INTEGER;
        EXIT WHEN (SELECT COUNT(*) FROM orders WHERE request_number = new_request_number) = 0;
    END LOOP;
    RETURN new_request_number;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
-- Trigger to automatically set request number for new orders
CREATE OR REPLACE FUNCTION set_order_request_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := generate_request_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_request_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_request_number();

-- Trigger to update updated_at timestamp for admin_settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- SAMPLE DATA INSERTION
-- Insert sample users
INSERT INTO users (email, password, full_name, role, phone) VALUES
('admin@example.com', 'password123', 'Super Admin', 'admin', '1234567890'),
('driver@example.com', 'password123', 'John Driver', 'driver', '0987654321'),
('customer@example.com', 'password123', 'Jane Customer', 'customer', '1122334455')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vehicle
INSERT INTO vehicles (name, base_fare, price_per_km, capacity, images) VALUES
('Water Tanker 5000L', '50', '5', 5000, '{}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample driver
INSERT INTO drivers (user_id, vehicle_id, status, wallet_balance, special, profile)
SELECT
    u.id,
    v.id,
    'online',
    '0',
    false,
    '{}'
FROM users u, vehicles v
WHERE u.email = 'driver@example.com' AND v.name = 'Water Tanker 5000L'
ON CONFLICT (id) DO NOTHING;

-- Insert sample zone
INSERT INTO zones (name, address, coords, avg_price, fixed_price) VALUES
('Downtown', 'City Center', '{"lat": 24.7136, "lng": 46.6753}', '100', '120')
ON CONFLICT (id) DO NOTHING;

-- Insert sample service category
INSERT INTO service_categories (name, description, active) VALUES
('{"en": "Water Delivery", "ar": "توصيل مياه", "ur": "پانی کی ترسیل"}', '{"en": "Fresh water delivery"}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample service
INSERT INTO services (category_id, name, delivery_type)
SELECT
    sc.id,
    '{"en": "5000L Tanker", "ar": "صهريج 5000 لتر", "ur": "5000 لیٹر ٹینکر"}',
    'scheduled'
FROM service_categories sc
WHERE sc.name->>'en' = 'Water Delivery'
ON CONFLICT (id) DO NOTHING;

-- Insert sample order
INSERT INTO orders (customer_id, service_id, status, total_amount, location, notes)
SELECT
    u.id,
    s.id,
    'new',
    '150',
    '{"address": "123 Main St"}',
    'Please arrive before noon'
FROM users u, services s
WHERE u.email = 'customer@example.com' AND s.name->>'en' = '5000L Tanker'
ON CONFLICT (id) DO NOTHING;

-- Additional SQL code from setup_db.sql
-- Setup script for Delivery Hub database
-- This script creates the database and user for local development

-- NOTE: The following commands should be run separately as superuser (like postgres)
-- CREATE DATABASE delivery_hub;
-- GRANT ALL PRIVILEGES ON DATABASE delivery_hub TO postgres;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The rest of the schema will be created by Drizzle ORM when the app starts

-- Additional SQL code from script/add-picked-up-status.sql
-- NOTE: This command should be run after the schema is created
-- Add 'picked_up' status to the orders.status enum type
-- ALTER TYPE "public"."orders_status_enum" ADD VALUE 'picked_up';

-- Verify the change
-- SELECT enumlabel
-- FROM pg_enum
-- WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'orders_status_enum')
-- ORDER BY enumsortorder;

-- SQL code derived from Drizzle schema definitions (shared/schema.ts)
-- The following SQL represents the database schema as defined in the Drizzle schema file
-- This includes all table definitions, relationships, and constraints

-- The Drizzle schema defines the following tables with their relationships:
-- users table: Core user information with roles (customer, driver, admin, subadmin)
-- vehicles table: Vehicle information for drivers
-- drivers table: Driver profiles linked to users and vehicles
-- zones table: Geographic zones with pricing information
-- service_categories table: Categories of services offered
-- services table: Specific services within categories
-- pricing table: Pricing rules for services in zones
-- orders table: Customer orders with status tracking
-- order_offers table: Driver offers for orders
-- transactions table: Financial transactions
-- notifications table: User notifications
-- messages table: Communication between users regarding orders
-- ratings table: Reviews and ratings for services
-- admin_settings table: Administrative configuration settings

-- The schema includes foreign key relationships between:
-- drivers and users (one-to-one)
-- drivers and vehicles (one-to-one, optional)
-- orders and users (customer and driver references)
-- orders and services
-- pricing and services/zones
-- order_offers and orders/drivers
-- transactions and users
-- notifications and users
-- messages and orders/users
-- ratings and orders/users
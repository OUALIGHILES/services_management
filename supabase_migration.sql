-- Migration to set up the Delivery Hub database schema in Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
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

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create sub_admin_permissions table
CREATE TABLE IF NOT EXISTS sub_admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    permission_id UUID REFERENCES permissions(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INTEGER,
    base_fare NUMERIC NOT NULL,
    price_per_km NUMERIC NOT NULL,
    images TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'offline', 'online')),
    wallet_balance NUMERIC DEFAULT '0',
    special BOOLEAN DEFAULT false,
    profile JSONB,
    service_category TEXT,
    sub_service TEXT,
    operating_zones TEXT[],
    documents JSONB,
    phone TEXT,
    profile_photo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create driver_documents table
CREATE TABLE IF NOT EXISTS driver_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    document_type TEXT CHECK (document_type IN ('license', 'vehicle_registration', 'national_id', 'insurance')) NOT NULL,
    document_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    coords JSONB,
    avg_price NUMERIC,
    fixed_price NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL,
    description JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id) NOT NULL,
    name JSONB NOT NULL,
    description JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id) NOT NULL,
    name JSONB NOT NULL,
    delivery_type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id) NOT NULL,
    subcategory_id UUID REFERENCES subcategories(id),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    discounted_price NUMERIC,
    color TEXT,
    brand TEXT,
    unit TEXT,
    size TEXT,
    images TEXT[],
    description TEXT,
    modified_by TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP DEFAULT NOW()
);

-- Create pricing table
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

-- Create orders table
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
    pricing_option TEXT CHECK (pricing_option IN ('auto_accept', 'choose_offer')),
    booking_type TEXT CHECK (booking_type IN ('auto_accept', 'offer_based')),
    location_image TEXT,
    admin_notes_displayed TEXT,
    customer_notes TEXT,
    driver_edited_price NUMERIC,
    price_edit_status TEXT CHECK (price_edit_status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_notes table
CREATE TABLE IF NOT EXISTS admin_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID REFERENCES subcategories(id) NOT NULL,
    title_en TEXT,
    title_ar TEXT,
    title_ur TEXT,
    content_en TEXT,
    content_ar TEXT,
    content_ur TEXT,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create order_offers table
CREATE TABLE IF NOT EXISTS order_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    price NUMERIC NOT NULL,
    accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'adjustment', 'commission')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    from_user UUID REFERENCES users(id) NOT NULL,
    to_user UUID REFERENCES users(id) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    rater_id UUID REFERENCES users(id) NOT NULL,
    rated_id UUID REFERENCES users(id) NOT NULL,
    rating INTEGER NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create impersonation_logs table
CREATE TABLE IF NOT EXISTS impersonation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES users(id) NOT NULL,
    target_user_id UUID REFERENCES users(id) NOT NULL,
    target_user_role TEXT CHECK (target_user_role IN ('customer', 'driver', 'admin', 'subadmin')) NOT NULL,
    action TEXT CHECK (action IN ('start', 'stop')) NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'pending' NOT NULL,
    category_id UUID REFERENCES service_categories(id) NOT NULL,
    description TEXT,
    rating NUMERIC DEFAULT '0',
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP DEFAULT NOW()
);

-- Create home_banners table
CREATE TABLE IF NOT EXISTS home_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position INTEGER NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
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

-- Create views
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

-- Functions
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

-- Triggers
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

-- Insert default admin user
INSERT INTO users (email, password, full_name, role, phone) VALUES
('admin@example.com', 'pbkdf2:sha256:260000$...', 'System Administrator', 'admin', '+1234567890')
ON CONFLICT (email) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, category) VALUES
('order_management', 'Manage orders', 'orders'),
('driver_management', 'Manage drivers', 'drivers'),
('user_management', 'Manage users', 'users'),
('payment_management', 'Manage payments', 'payments')
ON CONFLICT (name) DO NOTHING;

-- Insert default service category
INSERT INTO service_categories (name, description, active) VALUES
('{"en": "Water Delivery", "ar": "توصيل مياه", "ur": "پانی کی ترسیل"}', '{"en": "Fresh water delivery"}', true),
('{"en": "Sand Transport", "ar": "نقل و انتقال رمل", "ur": "ریت کا ٹرانسپورٹ"}', '{"en": "Sand and construction materials transport"}', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default zone
INSERT INTO zones (name, address, coords, avg_price, fixed_price) VALUES
('Downtown', 'City Center', '{"lat": 24.7136, "lng": 46.6753}', '100', '120')
ON CONFLICT (id) DO NOTHING;

-- Insert default vehicle
INSERT INTO vehicles (name, base_fare, price_per_km, capacity, images) VALUES
('Water Tanker 5000L', '50', '5', 5000, '{}')
ON CONFLICT (id) DO NOTHING;

-- Insert default service
INSERT INTO services (category_id, name, delivery_type)
SELECT 
    sc.id,
    '{"en": "5000L Tanker", "ar": "صهريج 5000 لتر", "ur": "5000 لیٹر ٹینکر"}',
    'scheduled'
FROM service_categories sc
WHERE sc.name->>'en' = 'Water Delivery'
ON CONFLICT (id) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
('store_show_in_app', '{"value": true}'),
('driver_wallet_negative_limit', '{"value": -100}'),
('request_distance_km', '{"value": 10}')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security (RLS) for important tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (these would need to be customized based on your auth requirements)
-- Example policy for users table (users can only see their own data)
CREATE POLICY user_is_owner ON users FOR ALL TO authenticated USING (auth.uid() = id);

-- Example policy for drivers table (drivers can only see their own profile)
CREATE POLICY driver_is_owner ON drivers FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Example policy for orders table (users can only see their own orders)
CREATE POLICY order_is_owner ON orders FOR ALL TO authenticated 
  USING (auth.uid() = customer_id OR auth.uid() = (SELECT user_id FROM drivers WHERE id = driver_id));

-- Example policy for transactions table (users can only see their own transactions)
CREATE POLICY transaction_is_owner ON transactions FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create storage bucket for images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated upload access" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');

CREATE POLICY "Allow authenticated update access" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated delete access" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'images');
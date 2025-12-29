-- SQL SCHEMA FOR SUB-ADMIN PERMISSIONS
-- This file extends the existing schema with permissions for sub-admins

-- Create permissions table to define available permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'order_management', 'driver_management'
    description TEXT,
    category TEXT, -- e.g., 'orders', 'drivers', 'users', 'payments'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create sub_admin_permissions junction table to link sub-admins to their permissions
CREATE TABLE IF NOT EXISTS sub_admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- References the sub-admin user
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, permission_id) -- Prevent duplicate permission assignments
);

-- Insert default permissions based on the project requirements
INSERT INTO permissions (name, description, category) VALUES
('order_management', 'Can view and manage orders', 'orders'),
('driver_management', 'Can manage drivers and their status', 'drivers'),
('user_management', 'Can manage users and their accounts', 'users'),
('payment_management', 'Can manage payments and transactions', 'payments'),
('notification_management', 'Can manage admin notifications', 'notifications'),
('settings_management', 'Can manage admin settings', 'settings'),
('zone_management', 'Can manage zones and pricing', 'zones'),
('category_management', 'Can manage service categories', 'categories'),
('product_management', 'Can manage admin products', 'products'),
('rating_management', 'Can manage ratings and reviews', 'ratings'),
('help_management', 'Can manage help center queries', 'help'),
('seo_management', 'Can manage SEO settings', 'seo'),
('store_management', 'Can manage store details', 'stores'),
('vehicle_management', 'Can manage vehicle details', 'vehicles'),
('home_banner_management', 'Can manage home banner images', 'home_banners')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sub_admin_permissions_user_id ON sub_admin_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_admin_permissions_permission_id ON sub_admin_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- Create a view to easily get sub-admin permissions
CREATE OR REPLACE VIEW sub_admin_permissions_view AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.email,
    u.is_active,
    u.created_at AS user_created_at,
    p.id AS permission_id,
    p.name AS permission_name,
    p.description AS permission_description,
    p.category AS permission_category
FROM users u
JOIN sub_admin_permissions sap ON u.id = sap.user_id
JOIN permissions p ON sap.permission_id = p.id
WHERE u.role = 'subadmin';

-- Function to assign permissions to a sub-admin
CREATE OR REPLACE FUNCTION assign_permission_to_subadmin(
    p_user_id UUID,
    p_permission_id UUID
) RETURNS VOID AS $$
BEGIN
    -- Check if user is a sub-admin
    IF (SELECT role FROM users WHERE id = p_user_id) != 'subadmin' THEN
        RAISE EXCEPTION 'User is not a sub-admin';
    END IF;
    
    -- Insert the permission assignment
    INSERT INTO sub_admin_permissions (user_id, permission_id)
    VALUES (p_user_id, p_permission_id)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to remove permissions from a sub-admin
CREATE OR REPLACE FUNCTION remove_permission_from_subadmin(
    p_user_id UUID,
    p_permission_id UUID
) RETURNS VOID AS $$
BEGIN
    DELETE FROM sub_admin_permissions
    WHERE user_id = p_user_id AND permission_id = p_permission_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all permissions for a sub-admin
CREATE OR REPLACE FUNCTION get_subadmin_permissions(p_user_id UUID)
RETURNS TABLE (
    permission_id UUID,
    permission_name TEXT,
    permission_description TEXT,
    permission_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.category
    FROM permissions p
    JOIN sub_admin_permissions sap ON p.id = sap.permission_id
    WHERE sap.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a sub-admin has a specific permission
CREATE OR REPLACE FUNCTION subadmin_has_permission(
    p_user_id UUID,
    p_permission_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    has_perm BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM sub_admin_permissions sap
        JOIN permissions p ON sap.permission_id = p.id
        WHERE sap.user_id = p_user_id AND p.name = p_permission_name
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql;
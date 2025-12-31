-- Add indexes for better query performance

-- Index on products table for category lookups
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" ("category_id");

-- Index on products table for subcategory lookups
CREATE INDEX IF NOT EXISTS "products_subcategory_id_idx" ON "products" ("subcategory_id");

-- Index on subcategories table for category lookups
CREATE INDEX IF NOT EXISTS "subcategories_category_id_idx" ON "subcategories" ("category_id");

-- Index on subcategories table for active status (frequently used in queries)
CREATE INDEX IF NOT EXISTS "subcategories_active_idx" ON "subcategories" ("active");

-- Index on service_categories table for active status (frequently used in queries)
CREATE INDEX IF NOT EXISTS "service_categories_active_idx" ON "service_categories" ("active");

-- Index on orders table for created_at (for ordering)
CREATE INDEX IF NOT EXISTS "orders_created_at_idx" ON "orders" ("created_at");

-- Index on notifications table for user_id and created_at (for ordering)
CREATE INDEX IF NOT EXISTS "notifications_user_id_created_at_idx" ON "notifications" ("user_id", "created_at");

-- Index on impersonation_logs table for admin_id and target_user_id
CREATE INDEX IF NOT EXISTS "impersonation_logs_admin_target_idx" ON "impersonation_logs" ("admin_id", "target_user_id");

-- Index on home_banners table for position
CREATE INDEX IF NOT EXISTS "home_banners_position_idx" ON "home_banners" ("position");
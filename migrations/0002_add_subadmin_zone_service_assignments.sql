-- Migration to add zone and service category assignments for sub-admins

-- Create table for sub-admin zone assignments
CREATE TABLE "sub_admin_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"zone_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Create table for sub-admin service category assignments
CREATE TABLE "sub_admin_service_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"service_category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints for sub_admin_zones
ALTER TABLE "sub_admin_zones" ADD CONSTRAINT "sub_admin_zones_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sub_admin_zones" ADD CONSTRAINT "sub_admin_zones_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE no action ON UPDATE no action;

-- Add foreign key constraints for sub_admin_service_categories
ALTER TABLE "sub_admin_service_categories" ADD CONSTRAINT "sub_admin_service_categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sub_admin_service_categories" ADD CONSTRAINT "sub_admin_service_categories_service_category_id_service_categories_id_fk" FOREIGN KEY ("service_category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;

-- Add unique constraints to prevent duplicate assignments
ALTER TABLE "sub_admin_zones" ADD CONSTRAINT "sub_admin_zones_user_id_zone_id_unique" UNIQUE("user_id", "zone_id");
ALTER TABLE "sub_admin_service_categories" ADD CONSTRAINT "sub_admin_service_categories_user_id_service_category_id_unique" UNIQUE("user_id", "service_category_id");
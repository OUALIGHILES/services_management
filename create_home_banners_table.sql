-- SQL script to create the home_banners table if it doesn't exist
-- This addresses the "relation 'home_banners' does not exist" error

CREATE TABLE IF NOT EXISTS "home_banners" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "image_url" text NOT NULL,
    "link_url" text,
    "position" integer NOT NULL,
    "status" text DEFAULT 'active' NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "modified_at" timestamp DEFAULT now()
);

-- Add comments to document the table
COMMENT ON TABLE home_banners IS 'Table for storing home page banner information';
COMMENT ON COLUMN home_banners.id IS 'Unique identifier for the banner';
COMMENT ON COLUMN home_banners.title IS 'Title of the banner';
COMMENT ON COLUMN home_banners.description IS 'Description of the banner';
COMMENT ON COLUMN home_banners.image_url IS 'URL of the banner image';
COMMENT ON COLUMN home_banners.link_url IS 'URL the banner links to when clicked';
COMMENT ON COLUMN home_banners.position IS 'Display order position of the banner';
COMMENT ON COLUMN home_banners.status IS 'Status of the banner (active/inactive)';
COMMENT ON COLUMN home_banners.created_at IS 'Timestamp when the banner was created';
COMMENT ON COLUMN home_banners.modified_at IS 'Timestamp when the banner was last modified';
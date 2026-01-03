-- Migration: Add admin_notes table for admin-defined notes by subcategory

CREATE TABLE "admin_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcategory_id" uuid NOT NULL,
	"title_en" text,
	"title_ar" text,
	"title_ur" text,
	"content_en" text,
	"content_ar" text,
	"content_ur" text,
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE no action ON UPDATE no action;
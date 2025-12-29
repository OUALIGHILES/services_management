-- Setup script for Delivery Hub database
-- This script creates the database and user for local development

-- Connect as superuser to create the database
-- This should be run as a superuser (like postgres)
CREATE DATABASE delivery_hub;
GRANT ALL PRIVILEGES ON DATABASE delivery_hub TO postgres;

-- Connect to the newly created database
\c delivery_hub;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The rest of the schema will be created by Drizzle ORM when the app starts
#!/bin/bash
# Supabase Bucket Setup Script
# This script helps set up the required storage buckets in your Supabase project

echo "Setting up Supabase storage buckets..."

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "Error: Missing Supabase environment variables."
    echo "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY before running this script."
    echo ""
    echo "Example:"
    echo "export SUPABASE_URL=https://your-project.supabase.co"
    echo "export SUPABASE_SERVICE_KEY=your_service_role_key"
    echo ""
    echo "Or add them to a .env file and source it:"
    echo "echo 'SUPABASE_URL=your_url' >> .env"
    echo "echo 'SUPABASE_SERVICE_KEY=your_key' >> .env"
    echo "source .env"
    exit 1
fi

echo "✓ Environment variables are set"

echo ""
echo "To run the bucket creation, execute:"
echo "npm run setup-storage"
echo ""
echo "This will create the following buckets in your Supabase project:"
echo "- vehicle-images (public)"
echo "- driver-documents (private)"
echo "- product-images (public)"
echo "- banner-images (public)"
echo "- user-avatars (public)"
echo ""
echo "After running the script, you'll need to set up database policies manually"
echo "by running the SQL in scripts/create_buckets.sql in your Supabase SQL editor."
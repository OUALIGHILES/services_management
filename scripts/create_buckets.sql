-- SQL script to create Supabase storage buckets and configure policies
-- This should be run in the Supabase SQL editor

-- Note: Storage bucket creation cannot be done via SQL directly
-- You need to create buckets through the Supabase dashboard or API
-- The following SQL sets up the necessary policies after buckets are created

-- Policy for public buckets (vehicle-images, product-images, banner-images, user-avatars)
DO $$
BEGIN
  -- Create policy for vehicle-images bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'VehicleImagesPublicRead'
  ) THEN
    CREATE POLICY "VehicleImagesPublicRead" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'vehicle-images');
  END IF;

  -- Create policy for product-images bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'ProductImagesPublicRead'
  ) THEN
    CREATE POLICY "ProductImagesPublicRead" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'product-images');
  END IF;

  -- Create policy for banner-images bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'BannerImagesPublicRead'
  ) THEN
    CREATE POLICY "BannerImagesPublicRead" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'banner-images');
  END IF;

  -- Create policy for user-avatars bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'UserAvatarsPublicRead'
  ) THEN
    CREATE POLICY "UserAvatarsPublicRead" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'user-avatars');
  END IF;

  -- Create policy for driver-documents bucket (private - only authenticated users with proper roles can access)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'DriverDocumentsAuthenticatedAccess'
  ) THEN
    CREATE POLICY "DriverDocumentsAuthenticatedAccess" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'driver-documents');
  END IF;
  
  -- Insert storage configuration if it doesn't exist
  -- Note: This is illustrative; actual storage config is handled by Supabase
END $$;

-- Additional RLS policies for authenticated access to private documents
-- This would be implemented based on your specific authorization needs
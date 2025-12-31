# Supabase Image Storage Setup

This document explains how to set up and use Supabase Storage for image uploads in the Delivery Hub application.

## Prerequisites

1. A Supabase project set up with your database
2. Environment variables configured:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service role key (for server-side operations)

## Environment Variables

Add these to your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

## Supabase Storage Buckets

The application uses the following buckets:

1. `vehicle-images` - Public bucket for vehicle images
2. `driver-documents` - Private bucket for driver documents (PDFs and images)
3. `product-images` - Public bucket for product images
4. `banner-images` - Public bucket for home banner images
5. `user-avatars` - Public bucket for user profile images

## Setting up Buckets

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create the following buckets with these settings:

#### vehicle-images, product-images, banner-images, user-avatars
- Public: Yes
- File size limit: 5MB
- Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp

#### driver-documents
- Public: No (Private)
- File size limit: 10MB
- Allowed MIME types: image/png, image/jpeg, image/jpg, image/webp, application/pdf

### Option 2: Using the Setup Script (Recommended)

1. Set your Supabase environment variables:

**On Windows Command Prompt:**
```cmd
set SUPABASE_URL=your_supabase_url
set SUPABASE_SERVICE_KEY=your_service_role_key
npm run setup-storage
```

**On Windows PowerShell:**
```powershell
$env:SUPABASE_URL="your_supabase_url"
$env:SUPABASE_SERVICE_KEY="your_service_role_key"
npm run setup-storage
```

**On macOS/Linux:**
```bash
export SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_KEY=your_service_role_key
npm run setup-storage
```

**Or create a .env file:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

Then run:
```bash
npm run setup-storage
```

2. You can also use the provided scripts:
   - On Windows: `setup_buckets.bat` (after setting environment variables)
   - On macOS/Linux: `./setup_buckets.sh` (after setting environment variables)

Note: The setup script will create the buckets but you still need to apply the database policies manually using the SQL in `scripts/create_buckets.sql`.

## Database Policies

After creating the buckets, you need to set up the appropriate database policies for access control. Run the following SQL in your Supabase SQL editor:

```sql
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
END $$;
```

## API Endpoints

### Image Upload Endpoints

#### Upload Vehicle Image
- **POST** `/api/images/vehicle`
- Requires admin or subadmin role
- Form field: `image`
- Max file size: 5MB
- Accepted types: Images only

#### Upload Product Image
- **POST** `/api/images/product`
- Requires admin or subadmin role
- Form field: `image`
- Max file size: 5MB
- Accepted types: Images only

#### Upload Banner Image
- **POST** `/api/images/banner`
- Requires admin or subadmin role
- Form field: `image`
- Max file size: 5MB
- Accepted types: Images only

#### Upload User Avatar
- **POST** `/api/images/avatar`
- Requires authentication
- Form field: `image`
- Max file size: 5MB
- Accepted types: Images only

#### Upload Driver Document
- **POST** `/api/drivers/upload-document`
- Requires authentication and driver role
- Form field: `document`
- Max file size: 10MB
- Accepted types: Images and PDFs
- Additional body field: `documentType` (valid values: 'license', 'vehicle_registration', 'national_id', 'insurance')

### Response Format

Successful uploads return:
```json
{
  "success": true,
  "url": "https://your-project.supabase.co/storage/v1/object/public/bucket-name/file-path",
  "fileName": "timestamp-uuid-original-filename"
}
```

Failed uploads return:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Usage in Frontend

To upload an image from the frontend:

```javascript
const uploadImage = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    credentials: 'include', // Include session cookies
  });

  return response.json();
};

// Example usage
const fileInput = document.getElementById('image-upload');
const file = fileInput.files[0];
const result = await uploadImage(file, '/api/images/product');
```

## Security Considerations

1. The service role key should only be used on the server-side
2. Public buckets allow read access to anyone with the URL
3. Private buckets require authentication for access
4. File size limits prevent large file uploads
5. MIME type filtering prevents non-image uploads where appropriate

## Testing the Functionality

Once you've set up the buckets and started your server, you can test the image upload functionality:

### Starting the Server

```bash
npm run dev
```

### Testing Endpoints

You can test the endpoints using curl commands or a tool like Postman:

#### Test Vehicle Image Upload (Admin required)
```bash
curl -X POST http://localhost:3000/api/images/vehicle \
  -H "Cookie: connect.sid=your-session-cookie" \
  -F "image=@path/to/your/image.jpg"
```

#### Test Product Image Upload (Admin required)
```bash
curl -X POST http://localhost:3000/api/images/product \
  -H "Cookie: connect.sid=your-session-cookie" \
  -F "image=@path/to/your/image.jpg"
```

#### Test Banner Image Upload (Admin required)
```bash
curl -X POST http://localhost:3000/api/images/banner \
  -H "Cookie: connect.sid=your-session-cookie" \
  -F "image=@path/to/your/image.jpg"
```

#### Test User Avatar Upload (Authentication required)
```bash
curl -X POST http://localhost:3000/api/images/avatar \
  -H "Cookie: connect.sid=your-session-cookie" \
  -F "image=@path/to/your/image.jpg"
```

#### Test Driver Document Upload (Driver authentication required)
```bash
curl -X POST http://localhost:3000/api/drivers/upload-document \
  -H "Cookie: connect.sid=your-session-cookie" \
  -F "document=@path/to/your/document.pdf" \
  -F "documentType=license"
```

### Frontend Testing

You can also test from the frontend by creating a simple HTML form:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Image Upload Test</title>
</head>
<body>
    <h2>Upload Vehicle Image</h2>
    <form id="uploadForm" enctype="multipart/form-data">
        <input type="file" id="image" name="image" accept="image/*" required>
        <button type="submit">Upload</button>
    </form>

    <div id="result"></div>

    <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            const fileInput = document.getElementById('image');
            formData.append('image', fileInput.files[0]);

            try {
                const response = await fetch('/api/images/vehicle', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include' // Include session cookies
                });

                const result = await response.json();
                document.getElementById('result').innerHTML =
                    '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
            } catch (error) {
                console.error('Upload error:', error);
                document.getElementById('result').innerHTML =
                    '<p>Error: ' + error.message + '</p>';
            }
        });
    </script>
</body>
</html>
```

## Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**: Ensure your service key is correct and has the proper permissions
2. **"File too large" errors**: Check that your file is under the size limit for the specific bucket
3. **"Invalid file type" errors**: Ensure your file is of an allowed MIME type
4. **"Unauthorized" errors**: Check that you're authenticated and have the required role
5. **"Missing Supabase environment variables"**: Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set

### Debugging

Check the server logs for detailed error messages. The image storage functions log errors to help with debugging.
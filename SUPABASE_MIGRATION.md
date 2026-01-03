# Supabase Migration Guide for Delivery Hub

This guide explains how to migrate your Delivery Hub database to Supabase.

## Prerequisites

1. Install Supabase CLI:
```bash
# For Windows
winget install --id=Supabase.Supabase
# Or download from: https://github.com/supabase/cli/releases
```

2. Create a Supabase account at [supabase.com](https://supabase.com)

3. Link your Supabase project:
```bash
supabase login
supabase link --project-ref <your-project-ref>
```

## Migration Steps

### Option 1: Using the SQL Migration File (Recommended)

1. Copy the contents of `supabase_migration.sql` and run it in the Supabase SQL Editor:
   - Go to your Supabase dashboard
   - Navigate to "SQL Editor"
   - Paste the contents of `supabase_migration.sql`
   - Click "Run"

2. Or use the Supabase CLI to execute the migration:
```bash
supabase db remote exec supabase_migration.sql
```

### Option 2: Using Drizzle Kit (Alternative)

1. Update your `.env` file with your Supabase connection string:
```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=require"
```

2. Run the migration:
```bash
npx drizzle-kit push
```

## Environment Configuration

Update your `.env` file with Supabase connection details:

```env
# Supabase connection string
DATABASE_URL="postgresql://[YOUR-USER]:[YOUR-PASSWORD]@[YOUR-HOST]:[YOUR-PORT]/[YOUR-DATABASE]?sslmode=require"

# Supabase project details
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

## Supabase-Specific Features Enabled

The migration includes:

1. **Row Level Security (RLS)**: Enabled for sensitive tables with basic policies
2. **Storage**: Created an 'images' bucket for file uploads
3. **Functions**: Custom functions for generating request numbers
4. **Triggers**: Automatic timestamp updates and request number generation
5. **Views**: Helpful views for common queries

## Post-Migration Steps

1. **Update RLS Policies**: The default RLS policies are basic. You may need to customize them based on your application's requirements.

2. **Configure Authentication**: Set up Supabase Auth according to your application's needs.

3. **Update API Endpoints**: If using Supabase's built-in functions, update your API calls accordingly.

4. **Test the Connection**: Verify that your application can connect to the Supabase database.

## Troubleshooting

If you encounter issues:

1. Check that your connection string is correct
2. Ensure all required extensions (like `uuid-ossp`) are enabled
3. Verify that RLS policies are properly configured for your use case
4. Check that storage buckets have the correct permissions

## Rollback

To rollback the migration, you would need to manually drop the tables and extensions in reverse order of creation. It's recommended to backup your data before migration.
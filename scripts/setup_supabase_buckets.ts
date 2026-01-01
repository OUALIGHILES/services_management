import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  console.log('Example:');
  console.log('SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_SERVICE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
  console.log('Setting up Supabase storage buckets...');

  // Define the buckets we need
  const buckets = [
    {
      name: 'vehicle-images',
      options: {
        public: true,
      }
    },
    {
      name: 'driver-documents',
      options: {
        public: false, // Documents should be private
      }
    },
    {
      name: 'product-images',
      options: {
        public: true,
      }
    },
    {
      name: 'banner-images',
      options: {
        public: true,
      }
    },
    {
      name: 'user-avatars',
      options: {
        public: true,
      }
    },
    {
      name: 'categories',
      options: {
        public: true,
      }
    }
  ];

  for (const bucket of buckets) {
    try {
      console.log(`Creating bucket: ${bucket.name}`);

      const { error: createError } = await supabase.storage.createBucket(
        bucket.name,
        {
          public: bucket.options.public
        }
      );

      if (createError) {
        if (createError.message.includes('duplicate key value violates unique constraint')) {
          console.log(`✓ Bucket ${bucket.name} already exists`);
        } else {
          console.error(`✗ Error creating bucket ${bucket.name}:`, createError);
          continue;
        }
      } else {
        console.log(`✓ Successfully created bucket: ${bucket.name}`);
      }
    } catch (error) {
      console.error(`✗ Unexpected error with bucket ${bucket.name}:`, error);
    }
  }

  console.log('\n✓ Bucket setup completed!');
  console.log('\nNote: Database policies need to be set up separately in the Supabase SQL editor.');
  console.log('Please run the SQL from scripts/create_buckets.sql in your Supabase dashboard.');
}

// Run the setup
setupBuckets().catch(console.error);
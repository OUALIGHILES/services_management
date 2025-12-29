// Script to setup impersonation permission in the database
import { db } from './server/db.ts';
import { permissions } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function setupImpersonationPermission() {
  try {
    console.log('Setting up impersonation permission...');

    const impersonationPermissionName = 'user_impersonation';

    // Check if the permission already exists
    const existingPermission = await db.select()
      .from(permissions)
      .where(eq(permissions.name, impersonationPermissionName));

    if (existingPermission.length === 0) {
      console.log('Creating impersonation permission...');
      await db.insert(permissions).values({
        name: impersonationPermissionName,
        description: 'Permission to impersonate users',
        isActive: true
      });
      console.log('Impersonation permission created successfully.');
    } else {
      console.log('Impersonation permission already exists.');
    }

    console.log('Impersonation permission setup completed successfully!');
  } catch (error) {
    console.error('Error setting up impersonation permission:', error);
  }
}

// Run the setup
setupImpersonationPermission();
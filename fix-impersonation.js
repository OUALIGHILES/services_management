// Script to fix impersonation issues by ensuring proper setup
import { db } from './server/db.ts';
import { users, permissions, subAdminPermissions } from './shared/schema.ts';
import { eq, and } from 'drizzle-orm';

async function setupImpersonationPermissions() {
  try {
    console.log('Setting up impersonation permissions...');
    
    // Create the impersonation permission if it doesn't exist
    const impersonationPermissionName = 'user_impersonation';
    
    // Check if the permission already exists
    const existingPermission = await db.select().from(permissions).where(eq(permissions.name, impersonationPermissionName));
    
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
    
    // Find all admin users and assign impersonation permission to them
    const admins = await db.select().from(users).where(eq(users.role, 'admin'));
    
    for (const admin of admins) {
      console.log(`Assigning impersonation permission to admin: ${admin.fullName} (${admin.id})`);
      
      // Check if the permission is already assigned
      const permission = await db.select({ id: permissions.id })
        .from(permissions)
        .where(eq(permissions.name, impersonationPermissionName));

      if (permission.length === 0) {
        console.log(`Permission ${impersonationPermissionName} not found for admin ${admin.id}`);
        continue; // Skip this admin if permission doesn't exist
      }

      const existingAssignment = await db.select()
        .from(subAdminPermissions)
        .where(and(
          eq(subAdminPermissions.userId, admin.id),
          eq(subAdminPermissions.permissionId, permission[0].id)
        ));
      
      if (existingAssignment.length === 0) {
        // First get the permission ID
        const permission = await db.select({ id: permissions.id })
          .from(permissions)
          .where(eq(permissions.name, impersonationPermissionName));
        
        if (permission.length > 0) {
          // Assign the permission to the admin
          await db.insert(subAdminPermissions).values({
            userId: admin.id,
            permissionId: permission[0].id
          });
          console.log(`Impersonation permission assigned to admin: ${admin.fullName}`);
        }
      } else {
        console.log(`Impersonation permission already assigned to admin: ${admin.fullName}`);
      }
    }
    
    // Also assign to subadmins
    const subadmins = await db.select().from(users).where(eq(users.role, 'subadmin'));
    
    for (const subadmin of subadmins) {
      console.log(`Assigning impersonation permission to subadmin: ${subadmin.fullName} (${subadmin.id})`);
      
      // Get the permission ID
      const permission = await db.select({ id: permissions.id })
        .from(permissions)
        .where(eq(permissions.name, impersonationPermissionName));
      
      if (permission.length > 0) {
        // Check if already assigned
        const existingAssignment = await db.select()
          .from(subAdminPermissions)
          .where(and(
            eq(subAdminPermissions.userId, subadmin.id),
            eq(subAdminPermissions.permissionId, permission[0].id)
          ));
        
        if (existingAssignment.length === 0) {
          // Assign the permission to the subadmin
          await db.insert(subAdminPermissions).values({
            userId: subadmin.id,
            permissionId: permission[0].id
          });
          console.log(`Impersonation permission assigned to subadmin: ${subadmin.fullName}`);
        } else {
          console.log(`Impersonation permission already assigned to subadmin: ${subadmin.fullName}`);
        }
      }
    }
    
    console.log('Impersonation permissions setup completed successfully!');
  } catch (error) {
    console.error('Error setting up impersonation permissions:', error);
  }
}

// Run the setup
setupImpersonationPermissions();
import { storage } from "./storage";
import { InsertNotification, User } from "@shared/schema";

export interface NotificationPayload {
  title: string;
  message: string;
  type?: string;
  userId?: string; // Specific user to notify
  role?: 'customer' | 'driver' | 'admin' | 'subadmin'; // Role-based notification
  excludeUserId?: string; // Exclude a specific user (useful for notifications about user's own actions)
}

export class NotificationService {
  /**
   * Send a notification to a specific user
   */
  static async sendToUser(userId: string, payload: Omit<NotificationPayload, 'userId'>): Promise<void> {
    try {
      const notification: InsertNotification = {
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'general',
      };

      await storage.createNotification(notification);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  /**
   * Send a notification to all users of a specific role
   */
  static async sendToRole(role: 'customer' | 'driver' | 'admin' | 'subadmin', payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    try {
      const users = await storage.getAllUsers(role); // Using the role parameter

      for (const user of users) {
        // Skip if this user should be excluded
        if (payload.excludeUserId && user.id === payload.excludeUserId) {
          continue;
        }

        const notification: InsertNotification = {
          userId: user.id,
          title: payload.title,
          message: payload.message,
          type: payload.type || 'general',
        };

        await storage.createNotification(notification);
      }
    } catch (error) {
      console.error('Error sending notification to role:', error);
      throw error;
    }
  }

  /**
   * Send a notification to all users (customers, drivers, admins, subadmins)
   */
  static async sendToAll(payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    try {
      // Get all users regardless of role
      const users = await storage.getAllUsers();

      for (const user of users) {
        // Skip if this user should be excluded
        if (payload.excludeUserId && user.id === payload.excludeUserId) {
          continue;
        }

        const notification: InsertNotification = {
          userId: user.id,
          title: payload.title,
          message: payload.message,
          type: payload.type || 'general',
        };

        await storage.createNotification(notification);
      }
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      throw error;
    }
  }

  /**
   * Send a notification to multiple specific users
   */
  static async sendToMultipleUserIds(userIds: string[], payload: Omit<NotificationPayload, 'userId'>): Promise<void> {
    try {
      for (const userId of userIds) {
        const notification: InsertNotification = {
          userId,
          title: payload.title,
          message: payload.message,
          type: payload.type || 'general',
        };

        await storage.createNotification(notification);
      }
    } catch (error) {
      console.error('Error sending notification to multiple users:', error);
      throw error;
    }
  }

  /**
   * Send a notification to all users except those with specific roles
   */
  static async sendToAllExceptRoles(rolesToExclude: ('customer' | 'driver' | 'admin' | 'subadmin')[], payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    try {
      const allUsers = await storage.getAllUsers();

      for (const user of allUsers) {
        // Skip if this user should be excluded
        if (payload.excludeUserId && user.id === payload.excludeUserId) {
          continue;
        }

        // Skip if user has a role that should be excluded
        if (rolesToExclude.includes(user.role as any)) {
          continue;
        }

        const notification: InsertNotification = {
          userId: user.id,
          title: payload.title,
          message: payload.message,
          type: payload.type || 'general',
        };

        await storage.createNotification(notification);
      }
    } catch (error) {
      console.error('Error sending notification to all except specific roles:', error);
      throw error;
    }
  }

  /**
   * Send notification to users based on a custom filter function
   */
  static async sendToFilteredUsers(
    filterFn: (user: User) => boolean,
    payload: Omit<NotificationPayload, 'userId' | 'role'>
  ): Promise<void> {
    try {
      const allUsers = await storage.getAllUsers();

      for (const user of allUsers) {
        // Skip if this user should be excluded
        if (payload.excludeUserId && user.id === payload.excludeUserId) {
          continue;
        }

        // Only send if the user passes the filter
        if (filterFn(user)) {
          const notification: InsertNotification = {
            userId: user.id,
            title: payload.title,
            message: payload.message,
            type: payload.type || 'general',
          };

          await storage.createNotification(notification);
        }
      }
    } catch (error) {
      console.error('Error sending notification to filtered users:', error);
      throw error;
    }
  }

  // Specific notification functions for different user types

  /**
   * Send notification to all customers
   */
  static async sendToAllCustomers(payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    await this.sendToRole('customer', payload);
  }

  /**
   * Send notification to all drivers
   */
  static async sendToAllDrivers(payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    await this.sendToRole('driver', payload);
  }

  /**
   * Send notification to all admins
   */
  static async sendToAllAdmins(payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    await this.sendToRole('admin', payload);
  }

  /**
   * Send notification to all subadmins
   */
  static async sendToAllSubAdmins(payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    await this.sendToRole('subadmin', payload);
  }

  /**
   * Send system-wide notification to all users except admins (for system announcements)
   */
  static async sendSystemNotification(payload: Omit<NotificationPayload, 'userId' | 'role'>): Promise<void> {
    await this.sendToAllExceptRoles(['admin'], payload);
  }

  /**
   * Send order-related notification to customer
   */
  static async sendOrderNotificationToCustomer(customerId: string, title: string, message: string, orderId?: string): Promise<void> {
    await this.sendToUser(customerId, {
      title,
      message,
      type: 'order',
    });
  }

  /**
   * Send order-related notification to driver
   */
  static async sendOrderNotificationToDriver(driverId: string, title: string, message: string, orderId?: string): Promise<void> {
    await this.sendToUser(driverId, {
      title,
      message,
      type: 'order',
    });
  }

  /**
   * Send order-related notification to all drivers (e.g., new order available)
   */
  static async sendOrderNotificationToAllDrivers(title: string, message: string, excludeDriverId?: string): Promise<void> {
    await this.sendToRole('driver', {
      title,
      message,
      type: 'order',
      excludeUserId: excludeDriverId
    });
  }

  /**
   * Send system maintenance notification to all non-admin users
   */
  static async sendMaintenanceNotification(message: string): Promise<void> {
    await this.sendToAllExceptRoles(['admin'], {
      title: 'System Maintenance',
      message,
      type: 'maintenance'
    });
  }

  /**
   * Send promotional notification to all customers
   */
  static async sendPromotionalNotificationToCustomers(title: string, message: string): Promise<void> {
    await this.sendToRole('customer', {
      title,
      message,
      type: 'promotional'
    });
  }

  /**
   * Send alert notification to all admins and subadmins
   */
  static async sendAlertToAdmins(title: string, message: string): Promise<void> {
    await this.sendToAllExceptRoles(['customer', 'driver'], {
      title,
      message,
      type: 'alert'
    });
  }
}
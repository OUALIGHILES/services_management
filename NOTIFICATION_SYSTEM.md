# Notification System for All User Types

## Overview
The notification system in the Delivery Hub application supports sending notifications to all user types: customers, drivers, admins, and subadmins. The system is built with scalability and role-based targeting in mind.

## Architecture

### Backend Components
1. **Database Schema**: `notifications` table with fields for userId, title, message, type, and read status
2. **Notification Service**: `server/notifications.ts` - Comprehensive service for sending notifications to different user groups
3. **Storage Layer**: Enhanced with order status change notifications
4. **API Endpoints**: RESTful endpoints for notification management

### Frontend Components
1. **Notification Dropdown**: Universal component in layout.tsx for all user types
2. **React Hooks**: useNotifications, useUpdateNotification, etc.
3. **UI Components**: Notification display and management

## Notification Service Features

### Core Methods
- `sendToUser(userId, payload)` - Send to specific user
- `sendToRole(role, payload)` - Send to all users of a specific role
- `sendToAll(payload)` - Send to all users
- `sendToMultipleUserIds(userIds, payload)` - Send to multiple specific users
- `sendToAllExceptRoles(rolesToExclude, payload)` - Send to all except specific roles

### Role-Specific Methods
- `sendToAllCustomers(payload)` - Send to all customers
- `sendToAllDrivers(payload)` - Send to all drivers
- `sendToAllAdmins(payload)` - Send to all admins
- `sendToAllSubAdmins(payload)` - Send to all subadmins

### Specialized Methods
- `sendSystemNotification(payload)` - Send to all non-admins
- `sendOrderNotificationToCustomer(customerId, title, message)` - Order updates to customer
- `sendOrderNotificationToDriver(driverId, title, message)` - Order updates to driver
- `sendPromotionalNotificationToCustomers(title, message)` - Marketing notifications
- `sendAlertToAdmins(title, message)` - Critical alerts to admins

## API Endpoints

### Standard Endpoints
- `GET /api/notifications` - Get user's notifications
- `POST /api/notifications` - Create notification (admin/subadmin only)
- `PATCH /api/notifications/:id` - Update notification (user can mark as read)
- `DELETE /api/notifications/:id` - Delete notification (admin/subadmin only)

### Enhanced Endpoints
- `POST /api/notifications/send-to-role` - Send to specific role (admin/subadmin only)
- `POST /api/notifications/send-to-all` - Send to all users (admin/subadmin only)
- `POST /api/notifications/send-to-multiple` - Send to multiple users (admin/subadmin only)

## Automatic Notifications

### Order Status Changes
The system automatically sends notifications when order statuses change:
- New order: Customer and assigned driver are notified
- Driver assigned: Customer is notified
- Order picked up: Customer is notified
- Order delivered: Customer is notified
- Order cancelled: Both customer and driver are notified

### Driver Status Changes
- Driver application approved/rejected: Driver is notified
- Driver status updates: Driver is notified

## Usage Examples

### Backend Usage
```typescript
// Send notification to all drivers
await NotificationService.sendToAllDrivers({
  title: 'New Order Available',
  message: 'There is a new order available for pickup',
  type: 'order'
});

// Send notification to specific customer
await NotificationService.sendToUser(customerId, {
  title: 'Order Update',
  message: 'Your order status has changed',
  type: 'order_status'
});

// Send system announcement to all non-admins
await NotificationService.sendSystemNotification({
  title: 'System Maintenance',
  message: 'Scheduled maintenance will occur tonight',
  type: 'maintenance'
});
```

### Frontend Usage
The notification dropdown is automatically included in the layout for all user types (customers, drivers, admins, subadmins) via:
```tsx
{user && <NotificationDropdown userId={user.id} />}
```

## Security & Permissions
- Only admins and subadmins can send new notifications
- Users can only update (mark as read) their own notifications
- Only admins and subadmins can delete notifications
- All endpoints require authentication

## Testing
Run the test files to verify functionality:
- `test_notifications.ts` - Tests backend notification service
- `test_notification_api.ts` - Tests API endpoints

## Integration Points
1. **Order Management**: Automatic notifications on status changes
2. **Driver Management**: Notifications for status changes
3. **Admin Panel**: Manual notification sending capability
4. **User Profiles**: Notification preferences and settings

This notification system ensures that all user types (customers, drivers, admins, and subadmins) receive relevant notifications through a unified, scalable architecture.
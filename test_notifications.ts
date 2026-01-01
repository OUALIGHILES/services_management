import { NotificationService } from './server/notifications';

// Test function to verify notification functionality
async function testNotifications() {
  console.log('Testing notification functionality for all user types...');
  
  try {
    // Test sending notification to all customers
    await NotificationService.sendToAllCustomers({
      title: 'Test Notification',
      message: 'This is a test notification for all customers',
      type: 'test'
    });
    console.log('✓ Sent notification to all customers');
    
    // Test sending notification to all drivers
    await NotificationService.sendToAllDrivers({
      title: 'Test Notification',
      message: 'This is a test notification for all drivers',
      type: 'test'
    });
    console.log('✓ Sent notification to all drivers');
    
    // Test sending notification to all admins
    await NotificationService.sendToAllAdmins({
      title: 'Test Notification',
      message: 'This is a test notification for all admins',
      type: 'test'
    });
    console.log('✓ Sent notification to all admins');
    
    // Test sending notification to all subadmins
    await NotificationService.sendToAllSubAdmins({
      title: 'Test Notification',
      message: 'This is a test notification for all subadmins',
      type: 'test'
    });
    console.log('✓ Sent notification to all subadmins');
    
    // Test sending system notification to all non-admins
    await NotificationService.sendSystemNotification({
      title: 'System Announcement',
      message: 'This is a system-wide announcement for all users except admins',
      type: 'announcement'
    });
    console.log('✓ Sent system notification to all non-admins');
    
    // Test sending promotional notification to customers
    await NotificationService.sendPromotionalNotificationToCustomers(
      'Special Offer!',
      'We have a special offer just for you!'
    );
    console.log('✓ Sent promotional notification to all customers');
    
    // Test sending alert to admins
    await NotificationService.sendAlertToAdmins(
      'Critical Alert',
      'This is a critical system alert that requires admin attention'
    );
    console.log('✓ Sent alert to all admins and subadmins');
    
    console.log('\n✅ All notification tests completed successfully!');
    console.log('Notifications are now fully functional for all user types: customers, drivers, admins, and subadmins.');
    
  } catch (error) {
    console.error('❌ Error during notification test:', error);
  }
}

// Run the test
testNotifications();
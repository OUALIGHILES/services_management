import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Phone, MapPin, Wallet, CreditCard, Settings, Bell, Lock, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function CustomerProfile() {
  const { user, isLoading } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isPrivacySettingsOpen, setIsPrivacySettingsOpen] = useState(false);

  // Initialize form states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    locationSharing: false,
    dataSharing: true
  });

  // Reset password form when dialog opens/closes
  useEffect(() => {
    if (!isChangePasswordOpen) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  }, [isChangePasswordOpen]);

  // Reset notification settings when dialog opens/closes
  useEffect(() => {
    if (!isNotificationSettingsOpen) {
      setNotificationSettings({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false
      });
    }
  }, [isNotificationSettingsOpen]);

  // Reset privacy settings when dialog opens/closes
  useEffect(() => {
    if (!isPrivacySettingsOpen) {
      setPrivacySettings({
        profileVisibility: "public",
        locationSharing: false,
        dataSharing: true
      });
    }
  }, [isPrivacySettingsOpen]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handlePrivacyChange = (setting: keyof typeof privacySettings, value: string | boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call an API to change the password
    console.log("Password change submitted:", passwordData);
    setIsChangePasswordOpen(false);
  };

  const handleSaveNotificationSettings = () => {
    // In a real app, you would save the notification settings to the backend
    console.log("Notification settings saved:", notificationSettings);
    setIsNotificationSettingsOpen(false);
  };

  const handleSavePrivacySettings = () => {
    // In a real app, you would save the privacy settings to the backend
    console.log("Privacy settings saved:", privacySettings);
    setIsPrivacySettingsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-80 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Enhanced Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl">
            <User className="w-16 h-16 text-white" />
          </div>
          {/* Decorative ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full blur-xl opacity-30 -z-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black font-display bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {user?.fullName || 'Customer Profile'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Manage your account and preferences
          </p>
        </div>
      </motion.div>

      {/* Profile Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.03, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-purple-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Info
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{user?.fullName || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Address Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.03, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-purple-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Addresses
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Default Address</p>
                  <p className="font-medium">123 Main Street<br />New York, NY 10001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Work Address</p>
                  <p className="font-medium">456 Business Ave<br />New York, NY 10002</p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                Add New Address
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.03, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-purple-900 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Account
              </CardTitle>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account Type</span>
                <span className="font-medium capitalize bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                  {user?.role || 'customer'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="font-medium">Jan 2024</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wallet Balance</span>
                <span className="font-medium text-green-600 font-bold">$0.00</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Methods</span>
                <span className="font-medium">1</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" className="border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                  Add Payment Method
                </Button>
                <Button variant="outline" className="border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                  View Transaction History
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.03 }}>
              <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md transition-all h-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsChangePasswordOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        Update Password
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Dialog open={isNotificationSettingsOpen} onOpenChange={setIsNotificationSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md transition-all h-full">
                    <Bell className="w-4 h-4 mr-2" />
                    Notification Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Settings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive email updates</p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={() => handleNotificationChange('emailNotifications')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications" className="text-sm font-medium">SMS Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive text message updates</p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={() => handleNotificationChange('smsNotifications')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications" className="text-sm font-medium">Push Notifications</Label>
                        <p className="text-xs text-muted-foreground">Receive app notifications</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={() => handleNotificationChange('pushNotifications')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketing-emails" className="text-sm font-medium">Marketing Emails</Label>
                        <p className="text-xs text-muted-foreground">Receive promotional emails</p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={() => handleNotificationChange('marketingEmails')}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsNotificationSettingsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        onClick={handleSaveNotificationSettings}
                      >
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Dialog open={isPrivacySettingsOpen} onOpenChange={setIsPrivacySettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-sm hover:shadow-md transition-all h-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Privacy Settings
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-visibility">Profile Visibility</Label>
                      <select
                        id="profile-visibility"
                        value={privacySettings.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="location-sharing" className="text-sm font-medium">Location Sharing</Label>
                        <p className="text-xs text-muted-foreground">Allow others to see your location</p>
                      </div>
                      <Switch
                        id="location-sharing"
                        checked={privacySettings.locationSharing}
                        onCheckedChange={(checked) => handlePrivacyChange('locationSharing', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="data-sharing" className="text-sm font-medium">Data Sharing</Label>
                        <p className="text-xs text-muted-foreground">Share data with third parties</p>
                      </div>
                      <Switch
                        id="data-sharing"
                        checked={privacySettings.dataSharing}
                        onCheckedChange={(checked) => handlePrivacyChange('dataSharing', checked)}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsPrivacySettingsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        onClick={handleSavePrivacySettings}
                      >
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
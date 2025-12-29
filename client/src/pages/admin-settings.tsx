import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Store, Wallet, MapPin, Globe, CreditCard, Shield, Users, Truck } from "lucide-react";
import { useState } from "react";

export default function AdminSettings() {
  const [activeSetting, setActiveSetting] = useState('general');

  const settingsSections = [
    { id: 'general', name: 'General Settings', icon: Settings, component: GeneralSettings },
    { id: 'store', name: 'Store Settings', icon: Store, component: StoreSettings },
    { id: 'wallet', name: 'Driver Wallet Settings', icon: Wallet, component: DriverWalletSettings },
    { id: 'distance', name: 'Delivery Distance Settings', icon: MapPin, component: DeliveryDistanceSettings },
    { id: 'localization', name: 'Localization', icon: Globe, component: LocalizationSettings },
    { id: 'payment', name: 'Payment Settings', icon: CreditCard, component: PaymentSettings },
    { id: 'security', name: 'Security', icon: Shield, component: SecuritySettings },
    { id: 'user', name: 'User Management', icon: Users, component: UserManagementSettings },
    { id: 'driver', name: 'Driver Settings', icon: Truck, component: DriverSettings },
  ];

  const renderActiveSetting = () => {
    const activeSection = settingsSections.find(section => section.id === activeSetting);
    if (activeSection) {
      const Component = activeSection.component;
      return <Component />;
    }
    return <GeneralSettings />;
  };

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    className={`flex items-center gap-3 p-3 rounded-lg w-full text-left ${
                      activeSetting === section.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => setActiveSetting(section.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {section.name}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {renderActiveSetting()}
        </div>
      </div>
    </div>
  );
}

// Individual Settings Components
const GeneralSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        General Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <Label htmlFor="store-show-app">Store Show in App</Label>
          <p className="text-sm text-muted-foreground">When enabled, the store appears in the user app and becomes visible to customers</p>
        </div>
        <Switch id="store-show-app" defaultChecked />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="app-name">App Name</Label>
          <Input id="app-name" defaultValue="Delivery Hub" placeholder="Enter app name" />
        </div>

        <div>
          <Label htmlFor="app-description">App Description</Label>
          <Textarea id="app-description" placeholder="Enter app description" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save General Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const StoreSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Store className="w-5 h-5" />
        Store Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <Label htmlFor="store-show-app">Store Show in App</Label>
          <p className="text-sm text-muted-foreground">When enabled, the store appears in the user app and becomes visible to customers</p>
        </div>
        <Switch id="store-show-app" defaultChecked />
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="store-name">Store Name</Label>
          <Input id="store-name" defaultValue="Delivery Hub" placeholder="Enter store name" />
        </div>

        <div>
          <Label htmlFor="store-address">Store Address</Label>
          <Textarea id="store-address" placeholder="Enter store address" />
        </div>

        <div>
          <Label htmlFor="store-phone">Store Phone</Label>
          <Input id="store-phone" defaultValue="+1 (555) 123-4567" placeholder="Enter store phone" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save Store Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const DriverWalletSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Wallet className="w-5 h-5" />
        Driver Wallet Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="driver-wallet-limit">Driver Wallet Negative Limit</Label>
        <div className="flex items-center gap-2">
          <Input id="driver-wallet-limit" type="number" defaultValue="-100" placeholder="Enter negative limit" />
          <span className="text-muted-foreground">USD</span>
        </div>
        <p className="text-sm text-muted-foreground">Defines the maximum negative balance allowed for drivers. Example: if set to -100, once the driver reaches this balance, they are automatically blocked from working.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver-min-withdrawal">Minimum Withdrawal Amount</Label>
        <div className="flex items-center gap-2">
          <Input id="driver-min-withdrawal" type="number" defaultValue="20" placeholder="Enter minimum amount" />
          <span className="text-muted-foreground">USD</span>
        </div>
        <p className="text-sm text-muted-foreground">Minimum amount drivers can withdraw from their wallet.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver-commission">Driver Commission Percentage</Label>
        <div className="flex items-center gap-2">
          <Input id="driver-commission" type="number" defaultValue="80" placeholder="Enter commission percentage" />
          <span className="text-muted-foreground">%</span>
        </div>
        <p className="text-sm text-muted-foreground">Percentage of order amount that goes to the driver.</p>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save Wallet Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const DeliveryDistanceSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Delivery Distance Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="request-distance">Request Distance (Kilometers)</Label>
        <div className="flex items-center gap-2">
          <Input id="request-distance" type="number" defaultValue="10" placeholder="Enter distance in km" />
          <span className="text-muted-foreground">km</span>
        </div>
        <p className="text-sm text-muted-foreground">Defines the delivery radius used to determine order eligibility based on distance.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="max-delivery-distance">Maximum Delivery Distance</Label>
        <div className="flex items-center gap-2">
          <Input id="max-delivery-distance" type="number" defaultValue="25" placeholder="Enter maximum distance" />
          <span className="text-muted-foreground">km</span>
        </div>
        <p className="text-sm text-muted-foreground">Maximum distance for which deliveries are allowed.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="delivery-fee-per-km">Delivery Fee Per Kilometer</Label>
        <div className="flex items-center gap-2">
          <Input id="delivery-fee-per-km" type="number" step="0.01" defaultValue="1.50" placeholder="Enter fee per km" />
          <span className="text-muted-foreground">USD</span>
        </div>
        <p className="text-sm text-muted-foreground">Amount charged per kilometer for delivery.</p>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save Distance Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const LocalizationSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Globe className="w-5 h-5" />
        Localization Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="default-language">Default Language</Label>
        <Select defaultValue="en">
          <SelectTrigger id="default-language">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="default-currency">Default Currency</Label>
        <Select defaultValue="USD">
          <SelectTrigger id="default-currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">US Dollar (USD)</SelectItem>
            <SelectItem value="EUR">Euro (EUR)</SelectItem>
            <SelectItem value="GBP">British Pound (GBP)</SelectItem>
            <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
            <SelectItem value="AED">UAE Dirham (AED)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time-format">Time Format</Label>
        <Select defaultValue="12h">
          <SelectTrigger id="time-format">
            <SelectValue placeholder="Select time format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12h">12 Hour</SelectItem>
            <SelectItem value="24h">24 Hour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save Localization Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const PaymentSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Payment Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="cash-payment">Cash Payment</Label>
            <p className="text-sm text-muted-foreground">Allow customers to pay with cash</p>
          </div>
          <Switch id="cash-payment" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="card-payment">Card Payment</Label>
            <p className="text-sm text-muted-foreground">Allow customers to pay with credit/debit cards</p>
          </div>
          <Switch id="card-payment" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="digital-wallet">Digital Wallet</Label>
            <p className="text-sm text-muted-foreground">Allow customers to pay using digital wallets</p>
          </div>
          <Switch id="digital-wallet" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment-gateway">Payment Gateway</Label>
        <Select defaultValue="stripe">
          <SelectTrigger id="payment-gateway">
            <SelectValue placeholder="Select payment gateway" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
            <SelectItem value="razorpay">Razorpay</SelectItem>
            <SelectItem value="paystack">Paystack</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save Payment Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const SecuritySettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Security Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
          </div>
          <Switch id="two-factor-auth" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="login-attempts">Login Attempt Limit</Label>
            <p className="text-sm text-muted-foreground">Number of failed login attempts before lockout</p>
          </div>
          <Input id="login-attempts" type="number" defaultValue="5" className="w-24" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <p className="text-sm text-muted-foreground">Minutes of inactivity before session expires</p>
          </div>
          <Input id="session-timeout" type="number" defaultValue="30" className="w-24" />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save Security Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const UserManagementSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="w-5 h-5" />
        User Management Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="user-registration">User Registration</Label>
            <p className="text-sm text-muted-foreground">Allow new user registrations</p>
          </div>
          <Switch id="user-registration" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-verification">Email Verification</Label>
            <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
          </div>
          <Switch id="email-verification" defaultChecked />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-role">Default User Role</Label>
          <Select defaultValue="customer">
            <SelectTrigger id="default-role">
              <SelectValue placeholder="Select default role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save User Management Settings</Button>
      </div>
    </CardContent>
  </Card>
);

const DriverSettings = () => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Truck className="w-5 h-5" />
        Driver Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="driver-verification">Driver Verification</Label>
            <p className="text-sm text-muted-foreground">Require driver verification before accepting orders</p>
          </div>
          <Switch id="driver-verification" defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="driver-rating">Driver Rating System</Label>
            <p className="text-sm text-muted-foreground">Enable rating system for drivers</p>
          </div>
          <Switch id="driver-rating" defaultChecked />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min-rating">Minimum Driver Rating</Label>
          <div className="flex items-center gap-2">
            <Input id="min-rating" type="number" step="0.1" defaultValue="3.5" placeholder="Enter minimum rating" />
            <span className="text-muted-foreground">stars</span>
          </div>
          <p className="text-sm text-muted-foreground">Minimum rating required for drivers to receive orders.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="driver-commission-type">Driver Commission Type</Label>
          <Select defaultValue="percentage">
            <SelectTrigger id="driver-commission-type">
              <SelectValue placeholder="Select commission type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <Button>Save Driver Settings</Button>
      </div>
    </CardContent>
  </Card>
);
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";

// Customer Pages
import CustomerHome from "@/pages/customer-home";
import BookService from "@/pages/book-service";
import CustomerOrders from "@/pages/customer-orders";
import CustomerProfile from "@/pages/customer-profile";
import CustomerSubcategories from "@/pages/customer-subcategories";
import OrderTracking from "@/pages/order-tracking";
import RateService from "@/pages/rate-service";

// Driver Pages
import DriverDashboard from "@/pages/driver-dashboard";
import DriverOrders from "@/pages/driver-orders";
import DriverRegister from "@/pages/driver-register";

// Admin Pages
import Admin from "@/pages/admin";
import AdminOrders from "@/pages/admin-orders";
import AdminOrderDetails from "@/pages/admin-order-details";
import AdminDrivers from "@/pages/admin-drivers";
import AdminDriverDetails from "@/pages/admin-driver-details";
import AdminZones from "@/pages/admin-zones";
import AdminUsers from "@/pages/admin-users";
import AdminPayments from "@/pages/admin-payments";
import AdminNotifications from "@/pages/admin-notifications";
import AdminSettings from "@/pages/admin-settings";
import AdminSubAdmins from "@/pages/admin-subadmins";
import AdminRatings from "@/pages/admin-ratings";
import AdminHelp from "@/pages/admin-help";
import AdminSeo from "@/pages/admin-seo";
import AdminStoreCategory from "@/pages/admin-store-category";
import AdminProducts from "@/pages/admin-products";
import AdminServiceCategory from "@/pages/admin-service-category";
import AdminStoreDetails from "@/pages/admin-store-details";
import UserWelcome from "@/pages/user-welcome";
import DriverWelcome from "@/pages/driver-welcome";
import AdminVehicleDetails from "@/pages/admin-vehicle-details";
import AdminHomeBanner from "@/pages/admin-home-banner";
import AdminAccountControl from "@/pages/admin-account-control";

function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType, 
  allowedRoles?: string[] 
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Redirect to="/auth" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/auth" />; // Or unauthorized page
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Root redirect based on role is handled in AuthPage usually, but let's handle "/" explicitly */}
      <Route path="/">
        {(_params) => {
           // We can't use hooks here easily without wrapping component
           // So we just render AuthPage which handles redirect logic if logged in
           return <AuthPage />;
        }}
      </Route>

      {/* Customer Routes */}
      <Route path="/customer">
        <ProtectedRoute component={CustomerHome} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/services/:id?">
         <ProtectedRoute component={BookService} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/services/:categoryId/subcategories">
         <ProtectedRoute component={CustomerSubcategories} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/book/:serviceId?">
         <ProtectedRoute component={BookService} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/orders">
         <ProtectedRoute component={CustomerOrders} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/orders/:id/tracking">
         <ProtectedRoute component={OrderTracking} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/orders/:id/rate">
         <ProtectedRoute component={RateService} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/profile">
         <ProtectedRoute component={CustomerProfile} allowedRoles={['customer']} />
      </Route>

      {/* Driver Routes */}
      <Route path="/driver">
         <ProtectedRoute component={DriverDashboard} allowedRoles={['driver']} />
      </Route>
      <Route path="/driver/orders">
         <ProtectedRoute component={DriverOrders} allowedRoles={['driver']} />
      </Route>
      <Route path="/driver/register" component={DriverRegister} />

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={Admin} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/orders">
         <ProtectedRoute component={AdminOrders} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/orders/:id">
         <ProtectedRoute component={AdminOrderDetails} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/drivers">
         <ProtectedRoute component={AdminDrivers} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/drivers/:id">
         <ProtectedRoute component={AdminDriverDetails} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/zones">
         <ProtectedRoute component={AdminZones} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/users">
         <ProtectedRoute component={AdminUsers} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/payments">
         <ProtectedRoute component={AdminPayments} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/notifications">
         <ProtectedRoute component={AdminNotifications} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/settings">
         <ProtectedRoute component={AdminSettings} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/subadmins">
         <ProtectedRoute component={AdminSubAdmins} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/ratings">
         <ProtectedRoute component={AdminRatings} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/help">
         <ProtectedRoute component={AdminHelp} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/seo">
         <ProtectedRoute component={AdminSeo} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/store-category">
         <ProtectedRoute component={AdminStoreCategory} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/products">
         <ProtectedRoute component={AdminProducts} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/service-category">
         <ProtectedRoute component={AdminServiceCategory} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/store-details">
         <ProtectedRoute component={AdminStoreDetails} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/user/welcome" component={UserWelcome} />
      <Route path="/driver/welcome" component={DriverWelcome} />
      <Route path="/admin/vehicle-details">
         <ProtectedRoute component={AdminVehicleDetails} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/home-banner">
         <ProtectedRoute component={AdminHomeBanner} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/account-control">
         <ProtectedRoute component={AdminAccountControl} allowedRoles={['admin', 'subadmin']} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

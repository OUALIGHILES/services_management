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

// Driver Pages
import DriverDashboard from "@/pages/driver-dashboard";

// Admin Pages
import AdminDashboard from "@/pages/admin-dashboard";
import AdminOrders from "@/pages/admin-orders";

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
      <Route path="/customer/book/:serviceId?">
         <ProtectedRoute component={BookService} allowedRoles={['customer']} />
      </Route>
      <Route path="/customer/orders">
         <ProtectedRoute component={CustomerOrders} allowedRoles={['customer']} />
      </Route>

      {/* Driver Routes */}
      <Route path="/driver">
         <ProtectedRoute component={DriverDashboard} allowedRoles={['driver']} />
      </Route>
      {/* Add /driver/orders if needed, but dashboard covers it for now */}

      {/* Admin Routes */}
      <Route path="/admin">
         <ProtectedRoute component={AdminDashboard} allowedRoles={['admin', 'subadmin']} />
      </Route>
      <Route path="/admin/orders">
         <ProtectedRoute component={AdminOrders} allowedRoles={['admin', 'subadmin']} />
      </Route>
      {/* <Route path="/admin/drivers" ... /> Placeholder for now */}
      
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

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUsers } from "@/hooks/use-users";
import { useDrivers } from "@/hooks/use-drivers";
import { useVehicles } from "@/hooks/use-vehicles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import {
  Search,
  User,
  Mail,
  Phone,
  Car,
  MapPin,
  DollarSign,
  Eye,
  LogOut,
  Users,
  Truck
} from "lucide-react";
import { User as UserType, Driver } from "@shared/schema";
import { Redirect } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Define types for impersonation state
type ImpersonationState = {
  userId: string | null;
  role: 'customer' | 'driver' | null;
  originalUser: UserType | null;
};

export default function AdminAccountControl() {
  const { user: currentUser, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: drivers, isLoading: driversLoading, refetch: refetchDrivers } = useDrivers();
  const { data: vehicles } = useVehicles();

  // Check impersonation status
  const { data: impersonationStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['impersonation-status'],
    queryFn: async () => {
      const res = await fetch(api.impersonation.status.path);
      if (!res.ok) throw new Error('Failed to get impersonation status');
      return await res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const [customerSearch, setCustomerSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState<UserType[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);

  // Redirect if not admin or subadmin
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "subadmin")) {
    return <Redirect to="/auth" />;
  }

  // Filter customers based on search
  useEffect(() => {
    if (users) {
      const filtered = users.filter(user =>
        user.role === 'customer' &&
        (
          user.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
          user.phone?.toLowerCase().includes(customerSearch.toLowerCase()) ||
          user.id.toLowerCase().includes(customerSearch.toLowerCase())
        )
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearch, users]);

  // Filter drivers based on search
  useEffect(() => {
    if (drivers) {
      const filtered = drivers.map(driver => {
        const user = users?.find(u => u.id === driver.userId);
        return { ...driver, user };
      }).filter(driver =>
        driver.user &&
        (
          driver.user.fullName.toLowerCase().includes(driverSearch.toLowerCase()) ||
          (driver.vehicleId && vehicles?.find(v => v.id === driver.vehicleId)?.name?.toLowerCase().includes(driverSearch.toLowerCase())) ||
          driver.user.phone?.toLowerCase().includes(driverSearch.toLowerCase()) ||
          driver.id.toLowerCase().includes(driverSearch.toLowerCase())
        )
      );
      setFilteredDrivers(filtered);
    }
  }, [driverSearch, drivers, users, vehicles]);

  // Mutation to start impersonating a user
  const startImpersonation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'customer' | 'driver' }) => {
      const url = buildUrl(api.impersonation.start.path, { userId });
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to start impersonation');
      }

      return await res.json();
    },
    onSuccess: (data) => {
      // After successful impersonation, redirect to the appropriate interface
      if (data.targetUser.role === 'customer') {
        window.location.href = '/customer';
      } else if (data.targetUser.role === 'driver') {
        window.location.href = '/driver';
      } else {
        // For other roles, we might want to redirect differently
        window.location.href = '/';
      }
    },
    onError: (error: Error) => {
      alert(`Error starting impersonation: ${error.message}`);
    }
  });

  // Mutation to stop impersonation
  const stopImpersonation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.impersonation.stop.path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to stop impersonation');
      }

      return await res.json();
    },
    onSuccess: (data) => {
      // After stopping impersonation, refresh the page to get back to admin view
      window.location.reload();
    },
    onError: (error: Error) => {
      alert(`Error stopping impersonation: ${error.message}`);
    }
  });

  // Function to start impersonating a customer
  const startCustomerImpersonation = async (customer: UserType) => {
    startImpersonation.mutate({ userId: customer.id, role: 'customer' });
  };

  // Function to start impersonating a driver
  const startDriverImpersonation = async (driver: Driver) => {
    // Find the user associated with this driver
    const driverUser = users?.find(u => u.id === driver.userId);
    if (!driverUser) return;

    startImpersonation.mutate({ userId: driver.userId, role: 'driver' });
  };

  // Function to exit impersonation
  const exitImpersonation = () => {
    stopImpersonation.mutate();
  };

  return (
    <div className="space-y-8">
      {/* Impersonation Banner - Visible when impersonating */}
      {impersonationStatus?.isImpersonating && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-100 p-2 rounded-full">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">
                  Admin acting as {impersonationStatus.targetUser?.role === 'customer' ? 'Customer' : 'Driver'}:
                  <span className="font-bold ml-1">
                    {users?.find(u => u.id === impersonationStatus.targetUser?.id)?.fullName || 'Unknown'}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Original admin: {impersonationStatus.originalUser?.fullName}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={exitImpersonation}
              disabled={stopImpersonation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {stopImpersonation.isPending ? 'Exiting...' : 'Exit Account'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Account Control Center</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            <Users className="w-3 h-3 mr-1" />
            {currentUser?.role}
          </Badge>
        </div>
      </div>

      {/* Dual View Layout - 50% / 50% Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Section - Customer Accounts */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Customer Accounts
              </CardTitle>
              <Badge variant="secondary">
                {filteredCustomers.length} customers
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Customer Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, phone, or ID..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Customer List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {usersLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading customers...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div 
                    key={customer.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{customer.fullName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <StatusBadge status={customer.isActive ? "active" : "inactive"} />
                      </div>
                      
                      <Button
                        size="sm"
                        variant={impersonationStatus?.targetUser?.id === customer.id ? "secondary" : "outline"}
                        onClick={() => startCustomerImpersonation(customer)}
                        disabled={impersonationStatus?.targetUser?.id === customer.id || startImpersonation.isPending}
                      >
                        {impersonationStatus?.targetUser?.id === customer.id ? (
                          <>
                            <LogOut className="w-4 h-4 mr-1" />
                            Active
                          </>
                        ) : startImpersonation.isPending && impersonationStatus?.targetUser?.id === customer.id ? (
                          <>
                            <LogOut className="w-4 h-4 mr-1" />
                            Exiting...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Enter Account
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Section - Driver Accounts */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                Driver Accounts
              </CardTitle>
              <Badge variant="secondary">
                {filteredDrivers.length} drivers
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Driver Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name, vehicle, phone, or ID..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-full"
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Driver List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {driversLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading drivers...
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No drivers found
                </div>
              ) : (
                filteredDrivers.map((driver) => {
                  const driverUser = users?.find(u => u.id === driver.userId);
                  const vehicle = vehicles?.find(v => v.id === driver.vehicleId);
                  
                  return (
                    <div 
                      key={driver.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{driverUser?.fullName || 'Unknown Driver'}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {vehicle?.name || 'No vehicle assigned'}
                          </div>
                          {driverUser?.phone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {driverUser.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Availability</div>
                          <StatusBadge status={driver.status || "offline"} />
                        </div>
                        
                        <div>
                          <div className="text-xs text-muted-foreground">Status</div>
                          <StatusBadge 
                            status={driver.status === 'online' || driver.status === 'approved' ? 'active' : 
                                   driver.status === 'pending' ? 'pending' : 'inactive'} 
                          />
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Balance</div>
                          <div className="font-medium flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {driver.walletBalance || "0.00"}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant={impersonationStatus?.targetUser?.id === driver.userId ? "secondary" : "outline"}
                          onClick={() => startDriverImpersonation(driver)}
                          disabled={impersonationStatus?.targetUser?.id === driver.userId || startImpersonation.isPending}
                        >
                          {impersonationStatus?.targetUser?.id === driver.userId ? (
                            <>
                              <LogOut className="w-4 h-4 mr-1" />
                              Active
                            </>
                          ) : startImpersonation.isPending && impersonationStatus?.targetUser?.id === driver.userId ? (
                            <>
                              <LogOut className="w-4 h-4 mr-1" />
                              Exiting...
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Enter Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
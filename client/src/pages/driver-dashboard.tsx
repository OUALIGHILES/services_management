import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useUpdateDriverStatus, useDrivers } from "@/hooks/use-drivers";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation, CheckCircle, DollarSign, Truck, Bell, Package, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Link } from "wouter";

// Define types for driver earnings and wallet
type DriverEarnings = {
  totalEarnings: string;
  todayEarnings: string;
  thisWeekEarnings: string;
  walletBalance: string;
};

// Define types for order status updates
type OrderStatus = 'new' | 'pending' | 'in_progress' | 'picked_up' | 'delivered' | 'cancelled';

export default function DriverDashboard() {
  const { user } = useAuth();

  // Check if driver status is pending
  const isPending = user?.driverProfile?.status === "pending";

  // Fetch driver profile and earnings
  const driverId = user?.driverProfile?.id;

  // If driver status is pending, show a message
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md w-full">
          <div className="text-yellow-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your registration is currently under review. Please wait for approval from the administration.
          </p>
          <p className="text-sm text-gray-500">
            You will be notified once your account has been approved or if additional information is required.
          </p>
        </div>
      </div>
    );
  }

  const updateStatus = useUpdateDriverStatus();

  // Fetch driver earnings and wallet information
  const { data: driverEarnings, isLoading: loadingEarnings } = useQuery<DriverEarnings>({
    queryKey: ['driver-earnings', driverId],
    queryFn: async () => {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll return mock data based on the user's driver profile
      const walletBalance = user?.driverProfile?.walletBalance || "0.00";
      return {
        totalEarnings: "1250.00",
        todayEarnings: "85.50",
        thisWeekEarnings: "320.75",
        walletBalance
      };
    },
    enabled: !!driverId
  });

  // Fetch recent orders for dashboard summary
  const { data: recentOrders, isLoading: loadingRecent } = useOrders({
    driverId: driverId,
    status: "in_progress,picked_up,delivered"
  });

  return (
    <div className="space-y-8">
      {/* Driver Status Toggle */}
      <Card className="bg-slate-900 text-white border-none">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Driver Status</h2>
            <p className="text-slate-400 text-sm">Go online to receive new orders</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="font-medium">Offline</span>
             <Switch
               checked={user?.driverProfile?.status === "online"}
               onCheckedChange={(checked) => {
                 if(driverId) updateStatus.mutate({ id: driverId, status: checked ? "online" : "offline" });
               }}
             />
             <span className="font-medium text-green-400">Online</span>
          </div>
        </CardContent>
      </Card>

      {/* Driver Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Wallet Balance</p>
              <p className="text-lg font-bold">
                {loadingEarnings ? <Skeleton className="h-5 w-16" /> : `$${driverEarnings?.walletBalance || '0.00'}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today's Earnings</p>
              <p className="text-lg font-bold">
                {loadingEarnings ? <Skeleton className="h-5 w-16" /> : `$${driverEarnings?.todayEarnings || '0.00'}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Week</p>
              <p className="text-lg font-bold">
                {loadingEarnings ? <Skeleton className="h-5 w-16" /> : `$${driverEarnings?.thisWeekEarnings || '0.00'}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Orders</p>
              <p className="text-lg font-bold">
                {loadingRecent ? <Skeleton className="h-5 w-8" /> : recentOrders?.filter(order =>
                  order.status === 'in_progress' || order.status === 'picked_up'
                ).length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access to Orders */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Orders Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-display">Recent Orders</h3>
            <Link to="/driver/orders">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loadingRecent ? <Skeleton className="h-40" /> : recentOrders?.length === 0 ? (
             <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
               No recent orders. Check back later!
             </div>
          ) : (
            <div className="space-y-3">
              {recentOrders?.slice(0, 3).map(order => (
                <Card key={order.id} className="border-l-4 border-l-indigo-500">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">#{order.requestNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.status === 'in_progress' ? 'In Progress' :
                         order.status === 'picked_up' ? 'Picked Up' :
                         order.status === 'delivered' ? 'Delivered' :
                         'New Request'}
                      </p>
                    </div>
                    <StatusBadge status={order.status || "new"} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Available Requests Summary */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-display">Available Requests</h3>
            <Link to="/driver/orders">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loadingRecent ? <Skeleton className="h-40" /> : recentOrders?.filter(order =>
            order.status === 'new' || order.status === 'pending'
          ).length === 0 ? (
             <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
               No new requests available.
             </div>
          ) : (
            <div className="space-y-3">
              {recentOrders?.filter(order => order.status === 'new' || order.status === 'pending')
                .slice(0, 3).map(order => (
                <Card key={order.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">#{order.requestNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(order.totalAmount || '0.00')}
                      </p>
                    </div>
                    <StatusBadge status={order.status || "new"} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

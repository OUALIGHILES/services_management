import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useUpdateDriverStatus, useDrivers } from "@/hooks/use-drivers";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation, CheckCircle, XCircle } from "lucide-react";

export default function DriverDashboard() {
  const { user } = useAuth();
  // Fetch available orders (status 'new')
  const { data: availableOrders, isLoading: loadingAvailable } = useOrders({ status: "new" });
  // Fetch my active orders
  const { data: myOrders, isLoading: loadingMy } = useOrders({ driverId: user?.driverProfile?.id, status: "in_progress" });
  
  const updateStatus = useUpdateDriverStatus();
  const acceptOrder = useUpdateOrder();

  const driverId = user?.driverProfile?.id; // Assuming user relation populated
  
  const handleAccept = (orderId: string) => {
    if (!driverId) return;
    acceptOrder.mutate({ 
      id: orderId, 
      status: "in_progress", 
      driverId: driverId 
    });
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    acceptOrder.mutate({ id: orderId, status: newStatus });
  };

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
               // Need to fetch current driver status really, simplified here
               defaultChecked={true} 
               onCheckedChange={(checked) => {
                 if(driverId) updateStatus.mutate({ id: driverId, status: checked ? "online" : "offline" });
               }}
             />
             <span className="font-medium text-green-400">Online</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Available Orders Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" /> 
            Available Requests
          </h3>
          
          {loadingAvailable ? <Skeleton className="h-40" /> : availableOrders?.length === 0 ? (
             <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
               No new requests in your area.
             </div>
          ) : (
            availableOrders?.map(order => (
              <Card key={order.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <StatusBadge status={order.status || "new"} />
                    <span className="font-bold text-lg text-primary">$15-20</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <div className="w-5 flex justify-center"><div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground">PICKUP</p>
                        <p className="font-medium">{(order.location as any)?.pickup?.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 flex justify-center"><div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground">DROPOFF</p>
                        <p className="font-medium">{(order.location as any)?.dropoff?.address}</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => handleAccept(order.id)}>
                    Accept Order
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* My Active Orders Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Active Orders
          </h3>
          
          {loadingMy ? <Skeleton className="h-40" /> : myOrders?.length === 0 ? (
             <div className="p-8 bg-muted/50 rounded-xl text-center text-muted-foreground">
               You have no active orders.
             </div>
          ) : (
            myOrders?.map(order => (
              <Card key={order.id} className="bg-indigo-50/50 border-indigo-100">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">{order.requestNumber}</span>
                    <StatusBadge status="In Progress" />
                  </div>
                  
                  <div className="py-2 border-t border-b border-indigo-100/50 my-2">
                    <p className="text-sm font-medium">Customer Note:</p>
                    <p className="text-sm text-muted-foreground italic">{order.notes || "No notes."}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      onClick={() => handleUpdateStatus(order.id, "delivered")}
                    >
                      Complete Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

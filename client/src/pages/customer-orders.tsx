import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Map, Truck, Star } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomerOrders() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders({ customerId: user?.id });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold font-display">My Orders</h2>

      {orders?.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No orders yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Start by browsing services and booking your first delivery.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders?.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-muted-foreground">{order.requestNumber}</span>
                      <StatusBadge status={order.status || "new"} />
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <span className="font-medium">Pickup:</span>
                        <span className="ml-2 text-muted-foreground">{(order.location as any)?.pickup?.address}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                        <span className="font-medium">Dropoff:</span>
                        <span className="ml-2 text-muted-foreground">{(order.location as any)?.dropoff?.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {order.createdAt && format(new Date(order.createdAt), "MMM d, yyyy")}
                      </div>
                      {order.totalAmount && (
                        <div className="font-bold text-foreground text-lg">
                          ${order.totalAmount}
                        </div>
                      )}
                    </div>

                    {/* Track Button for active orders */}
                    {(order.status === 'pending' || order.status === 'in_progress' || order.status === 'picked_up') && (
                      <Link href={`/customer/orders/${order.id}/tracking`}>
                        <Button size="sm" variant="outline">
                          <Truck className="w-4 h-4 mr-2" />
                          Track Order
                        </Button>
                      </Link>
                    )}

                    {/* Rate Button for completed orders */}
                    {order.status === 'delivered' && (
                      <Link href={`/customer/orders/${order.id}/rate`}>
                        <Button size="sm" variant="outline">
                          <Star className="w-4 h-4 mr-2" />
                          Rate Service
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

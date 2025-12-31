import { useRoute } from "wouter";
import { useOrder } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Truck, Phone, MessageCircle, Star, Package } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";

export default function OrderTracking() {
  const [match, params] = useRoute("/customer/orders/:id/tracking");
  const { data: order, isLoading } = useOrder(params?.id || "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground mt-2">The order you're looking for doesn't exist.</p>
        <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  // Mock driver data (in real app, this would come from the order)
  const driver = {
    name: "John Smith",
    phone: "+1 (555) 123-4567",
    rating: 4.8,
    vehicle: "White Truck #ABC-123"
  };

  // Order timeline based on status
  const timelineSteps = [
    { status: "new", label: "Order Placed", completed: true },
    { status: "pending", label: "Driver Assigned", completed: order.status === "pending" || order.status === "in_progress" || order.status === "picked_up" || order.status === "delivered" },
    { status: "in_progress", label: "On the Way", completed: order.status === "in_progress" || order.status === "picked_up" || order.status === "delivered" },
    { status: "picked_up", label: "Picked Up", completed: order.status === "picked_up" || order.status === "delivered" },
    { status: "delivered", label: "Delivered", completed: order.status === "delivered" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-display">Order Tracking</h2>
          <p className="text-muted-foreground">#{order.requestNumber}</p>
        </div>
        <StatusBadge status={order.status || "new"} />
      </div>

      {/* Driver Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Driver Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{driver.name}</h3>
              <p className="text-muted-foreground text-sm">{driver.vehicle}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{driver.rating} Rating</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            {timelineSteps.map((step, index) => (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {index + 1}
                </div>
                <p className={`text-center mt-2 text-sm ${
                  step.completed ? "font-medium" : "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
                {step.status === order.status && (
                  <span className="text-xs text-primary mt-1">Current</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="mt-8 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ 
                width: `${timelineSteps.filter(step => step.completed).length / timelineSteps.length * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Real-time Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-xl h-64 flex items-center justify-center">
            <div className="text-center">
              <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Driver location will appear here</p>
              <p className="text-sm text-muted-foreground mt-1">Live tracking coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Pickup Location</h4>
                <p className="text-muted-foreground">
                  {(order.location as any)?.pickup?.address || "123 Main St, City, State"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">Dropoff Location</h4>
                <p className="text-muted-foreground">
                  {(order.location as any)?.dropoff?.address || "456 Oak Ave, City, State"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Service</h4>
                <p className="text-muted-foreground">
                  {order.serviceId || "Delivery Service"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Order Time</h4>
                <p className="text-muted-foreground">
                  {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy h:mm a") : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex-1">
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat with Driver
        </Button>
        <Button variant="outline" className="flex-1">
          <Phone className="w-4 h-4 mr-2" />
          Call Driver
        </Button>
      </div>
    </div>
  );
}
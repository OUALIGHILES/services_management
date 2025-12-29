import { useRoute } from "wouter";
import { useOrder } from "@/hooks/use-orders";
import { useCreateRating } from "@/hooks/use-ratings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Package, Star } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import RatingSystem from "@/components/ui/rating-system";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function RateService() {
  const [match, params] = useRoute("/customer/orders/:id/rate");
  const { data: order, isLoading } = useOrder(params?.id);
  const createRating = useCreateRating();
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleRatingSubmit = (rating: number, feedback: string) => {
    if (!order || !params?.id) return;

    // Create rating payload
    const ratingPayload = {
      orderId: params.id,
      raterId: order.customerId, // Assuming this is the customer ID
      ratedId: order.driverId || "", // Driver ID
      rating: rating,
      feedback: feedback
    };

    createRating.mutate(ratingPayload, {
      onSuccess: () => {
        setRatingSubmitted(true);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
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

  if (ratingSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-green-600 fill-current" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
        <p className="text-muted-foreground mb-6">
          Your feedback helps us improve our service.
        </p>
        <Button onClick={() => window.location.href = '/customer/orders'}>
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-display">Rate Your Service</h2>
          <p className="text-muted-foreground">#{order.requestNumber}</p>
        </div>
        <StatusBadge status={order.status || "new"} />
      </div>

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

      {/* Rating System */}
      <RatingSystem 
        orderId={order.id} 
        onSubmitRating={handleRatingSubmit} 
      />
    </div>
  );
}
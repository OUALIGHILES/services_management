import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Car, Clock, Phone, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useOrder } from "@/hooks/use-orders";
import { useOrderOffers, useUpdateOrderOffer } from "@/hooks/use-order-offers";
import { useAuth } from "@/hooks/use-auth";

export default function ReviewOffersPage() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/customer/orders/:orderId/review-offers");
  const orderId = params?.orderId;
  
  const { user } = useAuth();
  const { data: order } = useOrder(orderId || "");
  const { data: offers, isLoading } = useOrderOffers({ orderId });
  const updateOrderOffer = useUpdateOrderOffer();
  
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const handleAcceptOffer = (offerId: string) => {
    // Update the offer as accepted
    updateOrderOffer.mutate(
      { id: offerId, accepted: true },
      {
        onSuccess: () => {
          // Also update the order to assign the driver and set status to pending
          // This would require an additional API call to update the order
          // For now, we'll just redirect to the order tracking page
          setLocation(`/customer/orders/${orderId}/tracking`);
        }
      }
    );
  };

  const handleRejectOffer = (offerId: string) => {
    // Update the offer as rejected (we can set accepted to false or delete it)
    updateOrderOffer.mutate({ id: offerId, accepted: false });
  };

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Order...</h1>
        <p className="text-muted-foreground">Please wait while we load your order details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review Offers</h1>
        <p className="text-muted-foreground">
          Compare and choose the best offer for your delivery from {order.location?.pickup?.address} to {order.location?.dropoff?.address}
        </p>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Pickup Location</h3>
                <p className="text-muted-foreground">{order.location?.pickup?.address}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Dropoff Location</h3>
                <p className="text-muted-foreground">{order.location?.dropoff?.address}</p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Customer Notes</h3>
                <p className="text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Available Offers</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading offers...</p>
          </div>
        ) : !offers || offers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No offers available yet. Drivers will submit offers shortly.</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Refresh Offers
            </Button>
          </div>
        ) : (
          offers.map((offer) => (
            <Card key={offer.id} className="relative">
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="text-green-600">
                  New Offer
                </Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Car className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle className="text-xl">Driver Offer</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm">4.8/5</span>
                        </div>
                        <span className="text-sm text-muted-foreground">• Toyota Camry</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{offer.price} SAR</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      30 min
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-1" />
                      +9665XXXXXXXX
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      Available now
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Offer
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleRejectOffer(offer.id)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Back to Orders
        </Button>
      </div>
    </div>
  );
}
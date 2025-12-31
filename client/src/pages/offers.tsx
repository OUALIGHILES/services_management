import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Car, Clock, Phone, MapPin } from "lucide-react";
import { useLocation } from "wouter";

export default function OffersPage() {
  const [location, setLocation] = useLocation();
  
  // Mock data for driver offers
  const [offers] = useState([
    {
      id: 1,
      driverName: "Ahmed",
      price: 120,
      rating: 4.8,
      estimatedTime: 30,
      vehicle: "Toyota Camry",
      phone: "+9665XXXXXXXX"
    },
    {
      id: 2,
      driverName: "Mohammed",
      price: 110,
      rating: 4.5,
      estimatedTime: 40,
      vehicle: "Honda Civic",
      phone: "+9665XXXXXXXX"
    },
    {
      id: 3,
      driverName: "Ali",
      price: 130,
      rating: 4.9,
      estimatedTime: 25,
      vehicle: "Hyundai Accent",
      phone: "+9665XXXXXXXX"
    }
  ]);

  const acceptOffer = (offerId: number) => {
    // Navigate to tracking page after accepting offer
    setLocation("/customer/orders/12345/tracking");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Offers</h1>
        <p className="text-muted-foreground">Compare and choose the best offer for your delivery</p>
      </div>

      <div className="space-y-6">
        {offers.map((offer) => (
          <Card key={offer.id} className="relative">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="text-green-600">
                Available
              </Badge>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-xl">Driver {offer.driverName}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm">{offer.rating}/5</span>
                      </div>
                      <span className="text-sm text-muted-foreground">• {offer.vehicle}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{offer.price} SAR</div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    {offer.estimatedTime} min
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="w-4 h-4 mr-1" />
                    {offer.phone}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    Available now
                  </div>
                </div>
                <Button onClick={() => acceptOffer(offer.id)}>
                  ✅ Accept Offer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          ← Back to Booking
        </Button>
      </div>
    </div>
  );
}
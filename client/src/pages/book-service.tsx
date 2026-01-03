import { useLocation, useRoute } from "wouter";
import { useServices } from "@/hooks/use-services";
import { useCreateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Truck, DollarSign, MessageCircle, MapPin, Camera, CreditCard, ShoppingCart, CheckCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Schema
const orderSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  orderType: z.enum(["direct", "quote"], { required_error: "Order type is required" }),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  dropoffAddress: z.string().min(5, "Dropoff address is required"),
  notes: z.string().optional(),
  fragile: z.boolean().optional(),
  gateCode: z.string().optional(),
  paymentMethod: z.enum(["cash", "electronic"], { required_error: "Payment method is required" }),
  photos: z.array(z.string()).optional(),
});

export default function BookService() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/customer/book/:serviceId?");
  const { data: services } = useServices();
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [bookingStep, setBookingStep] = useState<'details' | 'confirmation'>('details');

  // Get selected service for confirmation step
  const selectedService = services?.find(service => service.id === form.getValues('serviceId'));

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      serviceId: params?.serviceId || "",
      orderType: "direct",
      pickupAddress: "",
      dropoffAddress: "",
      notes: "",
      fragile: false,
      gateCode: "",
      paymentMethod: "cash",
      photos: [],
    },
  });

  const handleBookingNow = () => {
    // Validate required fields before proceeding
    if (!form.getValues('pickupAddress') || !form.getValues('dropoffAddress')) {
      toast({
        title: "Missing Information",
        description: "Please fill in both pickup and dropoff addresses",
        variant: "destructive",
      });
      return;
    }
    setBookingStep('confirmation');
  };

  const handleConfirmBooking = (bookingType: 'auto_accept' | 'offer_based') => {
    const formData = form.getValues();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a service",
        variant: "destructive",
      });
      return;
    }

    // Construct the payload matching DB schema roughly
    // Location is jsonb, so we simulate lat/lng for now
    const payload = {
      customerId: user.id,
      serviceId: formData.serviceId,
      status: bookingType === 'auto_accept' ? 'pending' : 'new',
      location: {
        pickup: { address: formData.pickupAddress, lat: 0, lng: 0 },
        dropoff: { address: formData.dropoffAddress, lat: 0, lng: 0 },
      },
      notes: formData.notes,
      subService: bookingType === 'offer_based' ? "quote_request" : undefined,
      requestNumber: `REQ-${Math.floor(Math.random() * 100000)}`, // Simple generation
      paymentMethod: formData.paymentMethod,
      photos: formData.photos,
      orderType: bookingType === 'auto_accept' ? 'direct' : 'quote',
      pricingOption: bookingType,
    };

    createOrder.mutate(payload, {
      onSuccess: (response) => {
        if (bookingType === 'offer_based') {
          // Redirect to offers page to see available quotes
          setLocation("/customer/offers");
        } else {
          // For direct booking, go to orders
          setLocation("/customer/orders");
        }
        toast({
          title: "Order Placed",
          description: "Your order has been placed successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Order Failed",
          description: error.message || "Failed to place order",
          variant: "destructive",
        });
      }
    });
  };

  if (bookingStep === 'confirmation') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => setBookingStep('details')}
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back to Details
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-muted rounded-lg w-16 h-16 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedService ? (typeof selectedService.name === 'object' ? selectedService.name.en || selectedService.name.ar || selectedService.name.ur : selectedService.name) : 'Delivery Service'}</h3>
                    <p className="text-lg font-bold text-primary">$88.00</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Location</h4>
                    <p className="font-medium">
                      {form.getValues('pickupAddress')} to {form.getValues('dropoffAddress')}
                    </p>
                  </div>

                  {form.getValues('notes') && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Customer Notes</h4>
                      <p className="font-medium">{form.getValues('notes')}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Expected Price</h4>
                    <p className="text-xl font-bold text-primary">
                      $88.00 + Delivery Fee
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Final price confirmed when driver accepts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Booking Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full flex flex-col items-center justify-center py-6"
                    onClick={() => handleConfirmBooking('auto_accept')}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-8 h-8 mb-2" />
                        <span className="font-bold text-lg">Confirm & Send to Driver</span>
                        <p className="text-sm mt-1 text-muted-foreground">
                          Order sent directly to available drivers
                        </p>
                      </>
                    )}
                  </Button>

                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full flex flex-col items-center justify-center py-6"
                    onClick={() => handleConfirmBooking('offer_based')}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-8 h-8 mb-2" />
                        <span className="font-bold text-lg">Choose Offer</span>
                        <p className="text-sm mt-1 text-muted-foreground">
                          Order sent to drivers for bidding
                        </p>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 w-4 h-4" /> Back
      </Button>

      <Card className="shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Book a Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBookingNow();
            }} className="space-y-6">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!params?.serviceId}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services?.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {typeof service.name === 'object' ? service.name.en || service.name.ar || service.name.ur : service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Type Selection */}
              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Type</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={field.value === "direct" ? "default" : "outline"}
                        onClick={() => field.onChange("direct")}
                        className="flex flex-col items-center justify-center py-6"
                      >
                        <Truck className="w-6 h-6 mb-2" />
                        <span>Direct Order</span>
                        <p className="text-xs mt-1 text-muted-foreground">First available driver</p>
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "quote" ? "default" : "outline"}
                        onClick={() => field.onChange("quote")}
                        className="flex flex-col items-center justify-center py-6"
                      >
                        <DollarSign className="w-6 h-6 mb-2" />
                        <span>Request Quote</span>
                        <p className="text-xs mt-1 text-muted-foreground">Get quotes from multiple drivers</p>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Start St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoffAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Address</FormLabel>
                      <FormControl>
                        <Input placeholder="456 End Ave" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Options</h3>

                <FormField
                  control={form.control}
                  name="fragile"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Fragile Items</FormLabel>
                      </div>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">No</span>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-5 w-5 rounded border-input bg-background"
                          />
                          <span className="text-sm text-muted-foreground">Yes</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gateCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gate Code / Access Instructions</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes for Driver</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Fragile item, gate code is 1234, etc." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>💳 Payment Method</FormLabel>
                    <div className="grid grid-cols-1 gap-4">
                      <Button
                        type="button"
                        variant={field.value === "electronic" ? "default" : "outline"}
                        onClick={() => field.onChange("electronic")}
                        className="flex items-center justify-center py-6"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Electronic
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Attachment */}
              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>🖼️ Attach Photos</FormLabel>
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors">
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Click to upload photos</p>
                      <p className="text-xs text-muted-foreground">For hard-to-describe locations</p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                <p>Estimated Price: <span className="font-bold text-foreground">$15.00 - $20.00</span></p>
                <p className="text-xs mt-1">Final price confirmed when driver accepts.</p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  variant="outline"
                  onClick={() => {
                    form.setValue('orderType', 'quote');
                    handleBookingNow();
                  }}
                >
                  💰 Get Price Quotes
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    form.setValue('orderType', 'direct');
                    handleBookingNow();
                  }}
                >
                  ✅ Book Now
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

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
import { Loader2, ArrowLeft, Truck, DollarSign, MessageCircle, MapPin, Camera, CreditCard, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const onSubmit = (data: any) => {
    if (!user) return;

    // Construct the payload matching DB schema roughly
    // Location is jsonb, so we simulate lat/lng for now
    const payload = {
      customerId: user.id,
      serviceId: data.serviceId,
      status: "new",
      location: {
        pickup: { address: data.pickupAddress, lat: 0, lng: 0 },
        dropoff: { address: data.dropoffAddress, lat: 0, lng: 0 },
      },
      notes: data.notes,
      subService: data.orderType === "quote" ? "quote_request" : undefined,
      requestNumber: `REQ-${Math.floor(Math.random() * 100000)}`, // Simple generation
      paymentMethod: data.paymentMethod,
      photos: data.photos,
    };

    createOrder.mutate(payload, {
      onSuccess: () => {
        if (data.orderType === "quote") {
          // Redirect to offers page to see available quotes
          setLocation("/customer/offers");
        } else {
          // For direct booking, go to orders
          setLocation("/customer/orders");
        }
      },
    });
  };

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={field.value === "cash" ? "default" : "outline"}
                        onClick={() => field.onChange("cash")}
                        className="flex items-center justify-center py-6"
                      >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Cash
                      </Button>
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
                  type="submit"
                  size="lg"
                  className="flex-1"
                  disabled={createOrder.isPending}
                  onClick={() => form.setValue('orderType', 'quote')}
                >
                  {createOrder.isPending ? <Loader2 className="animate-spin mr-2" /> : "💰 Get Price Quotes"}
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1"
                  variant="secondary"
                  disabled={createOrder.isPending}
                  onClick={() => form.setValue('orderType', 'direct')}
                >
                  {createOrder.isPending ? <Loader2 className="animate-spin mr-2" /> : "✅ Book Now"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

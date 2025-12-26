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
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schema
const orderSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  dropoffAddress: z.string().min(5, "Dropoff address is required"),
  notes: z.string().optional(),
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
      pickupAddress: "",
      dropoffAddress: "",
      notes: "",
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
      requestNumber: `REQ-${Math.floor(Math.random() * 100000)}`, // Simple generation
    };

    createOrder.mutate(payload, {
      onSuccess: () => setLocation("/customer/orders"),
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
                            {(service.name as any).en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                <p>Estimated Price: <span className="font-bold text-foreground">$15.00 - $20.00</span></p>
                <p className="text-xs mt-1">Final price confirmed when driver accepts.</p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={createOrder.isPending}>
                {createOrder.isPending ? <Loader2 className="animate-spin mr-2" /> : "Confirm Booking"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

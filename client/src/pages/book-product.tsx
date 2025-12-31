import { useLocation, useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
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
import { Loader2, ArrowLeft, Truck, DollarSign, MessageCircle, MapPin, Camera, CreditCard, ShoppingCart, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";

// Schema
const orderSchema = z.object({
  orderType: z.enum(["direct", "quote"], { required_error: "Order type is required" }),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  dropoffAddress: z.string().min(5, "Dropoff address is required"),
  notes: z.string().optional(),
  fragile: z.boolean().optional(),
  gateCode: z.string().optional(),
  paymentMethod: z.enum(["cash", "electronic"], { required_error: "Payment method is required" }),
  photos: z.array(z.string()).optional(),
});

export default function BookProduct() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/customer/book-product/:productId?");
  const { data: product } = useProduct(params?.productId || '');
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
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

  // Handle image selection and preview
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPreviews: string[] = [];
    const newImages: string[] = [];

    for (let i = 0; i < Math.min(files.length, 5); i++) { // Limit to 5 images
      const file = files[i];
      if (!file.type.match('image.*')) continue;

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
      newImages.push(file.name); // We'll upload the file later
    }

    setImagePreviews(prev => [...prev, ...newPreviews]);
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  // Remove an image
  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);

    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);

    // Revoke object URLs to free memory
    URL.revokeObjectURL(imagePreviews[index]);
  };

  // Upload images to server
  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < selectedImages.length; i++) {
      const fileInput = fileInputRef.current;
      if (!fileInput || !fileInput.files || i >= fileInput.files.length) continue;

      const file = fileInput.files[i];
      if (!file) continue;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('/api/images/customer-photos', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to upload image ${i + 1}`);
        }

        const result = await response.json();
        uploadedUrls.push(result.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Upload Error",
          description: `Failed to upload image ${i + 1}: ${(error as Error).message}`,
          variant: "destructive",
        });
        // Don't continue uploading if one fails
        break;
      }
    }

    return uploadedUrls;
  };

  const onSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a product",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload images first
      const uploadedPhotos = await uploadImages();

      // Construct the payload matching DB schema
      const payload = {
        customerId: user.id,
        serviceId: "delivery-service", // Default service for product delivery
        status: "new",
        location: {
          pickup: { address: data.pickupAddress, lat: 0, lng: 0 },
          dropoff: { address: data.dropoffAddress, lat: 0, lng: 0 },
        },
        notes: data.notes ? `${data.notes} | Product ID: ${data.productId}` : `Product ID: ${data.productId}`,
        subService: data.orderType === "quote" ? "quote_request" : undefined,
        requestNumber: `REQ-${Math.floor(Math.random() * 100000)}`, // Simple generation
        paymentMethod: data.paymentMethod,
        photos: uploadedPhotos,
        orderType: data.orderType, // Add order type
      };

      createOrder.mutate(payload, {
        onSuccess: () => {
          if (data.orderType === "quote") {
            toast({
              title: "Quote Request Sent",
              description: "Your quote request has been submitted successfully.",
            });
            // Redirect to offers page to see available quotes
            setLocation("/customer/offers");
          } else {
            toast({
              title: "Order Placed",
              description: "Your order has been placed successfully.",
            });
            // For direct booking, go to orders
            setLocation("/customer/orders");
          }
        },
        onError: (error) => {
          toast({
            title: "Order Failed",
            description: error.message || "Failed to place order",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: (error as Error).message || "Failed to upload images",
        variant: "destructive",
      });
    }
  };

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The product you're trying to book doesn't exist or is no longer available.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 hover:bg-transparent hover:text-primary" 
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 w-4 h-4" /> Back
      </Button>

      {/* Product Summary Card */}
      <Card className="mb-6 shadow-lg border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-lg w-20 h-20 flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <ShoppingCart className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{product.name}</h3>
              <p className="text-muted-foreground text-sm">{product.description}</p>
              <p className="text-lg font-bold text-primary mt-1">${parseFloat(product.price).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl font-display">Book Product Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <FormLabel>📍 Pickup Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pickup address" {...field} />
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
                      <FormLabel>📍 Dropoff Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter delivery address" {...field} />
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
                            onChange={(e) => field.onChange(e.target.checked)}
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
                        <Textarea 
                          placeholder="Special instructions, fragile items, access details, etc." 
                          className="resize-none" 
                          {...field} 
                        />
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
                render={() => (
                  <FormItem>
                    <FormLabel>🖼️ Attach Photos</FormLabel>
                    <div 
                      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Click to upload photos</p>
                      <p className="text-xs text-muted-foreground">For hard-to-describe locations</p>
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    
                    {/* Preview images */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                            >
                              <span className="w-4 h-4">✕</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                <p>Estimated Price: <span className="font-bold text-foreground">${product.price} + Delivery Fee</span></p>
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
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
import { Loader2, ArrowLeft, Truck, DollarSign, MessageCircle, MapPin, Camera, CreditCard, ShoppingCart, Upload, CheckCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";

// Schema
const orderSchema = z.object({
  orderType: z.enum(["direct", "quote"], { required_error: "Order type is required" }),
  pricingOption: z.enum(["auto_accept", "choose_offer"], { required_error: "Pricing option is required" }),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  dropoffAddress: z.string().min(5, "Dropoff address is required"),
  notes: z.string().optional(),
  fragile: z.boolean().optional(),
  gateCode: z.string().optional(),
  paymentMethod: z.enum(["electronic"], { required_error: "Payment method is required" }),
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
  const [bookingStep, setBookingStep] = useState<'details' | 'confirmation'>('details');

  const form = useForm({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderType: "direct",
      pricingOption: "auto_accept",
      pickupAddress: "",
      dropoffAddress: "",
      notes: "",
      fragile: false,
      gateCode: "",
      paymentMethod: "electronic",
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

  const handleConfirmBooking = async (bookingType: 'auto_accept' | 'offer_based') => {
    const formData = form.getValues();

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
        status: bookingType === 'auto_accept' ? "pending" : "new", // If auto_accept, set to pending to wait for driver assignment
        location: {
          pickup: { address: formData.pickupAddress, lat: 0, lng: 0 },
          dropoff: { address: formData.dropoffAddress, lat: 0, lng: 0 },
        },
        notes: formData.notes ? `${formData.notes} | Product ID: ${params?.productId}` : `Product ID: ${params?.productId}`,
        subService: bookingType === 'offer_based' ? "quote_request" : undefined,
        requestNumber: `REQ-${Math.floor(Math.random() * 100000)}`, // Simple generation
        paymentMethod: formData.paymentMethod,
        photos: uploadedPhotos,
        orderType: bookingType === 'auto_accept' ? 'direct' : 'quote',
        pricingOption: bookingType,
      };

      createOrder.mutate(payload, {
        onSuccess: (response) => {
          if (bookingType === 'offer_based') {
            toast({
              title: "Quote Request Sent",
              description: "Your quote request has been submitted successfully.",
            });
            // Redirect to offers page to see available quotes
            setLocation("/customer/offers");
          } else {
            // For direct booking with auto_accept, the order goes to pending status
            // and should be assigned to a driver automatically
            toast({
              title: "Order Placed",
              description: "Your order has been placed successfully.",
            });
            // Go to orders page to see the pending order
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
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-lg font-bold text-primary">${parseFloat(product.price).toFixed(2)}</p>
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
                      ${parseFloat(product.price).toFixed(2)} + Delivery Fee
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
            <form onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBookingNow();
            }} className="space-y-6">
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

              {/* Pricing Option Selection */}
              <FormField
                control={form.control}
                name="pricingOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pricing Option</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={field.value === "auto_accept" ? "default" : "outline"}
                        onClick={() => field.onChange("auto_accept")}
                        className="flex flex-col items-center justify-center py-6"
                      >
                        <CheckCircle className="w-6 h-6 mb-2" />
                        <span>Auto Accept</span>
                        <p className="text-xs mt-1 text-muted-foreground">Automatically accept first driver</p>
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "choose_offer" ? "default" : "outline"}
                        onClick={() => field.onChange("choose_offer")}
                        className="flex flex-col items-center justify-center py-6"
                      >
                        <DollarSign className="w-6 h-6 mb-2" />
                        <span>Choose Offer</span>
                        <p className="text-xs mt-1 text-muted-foreground">Review and select best offer</p>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">📍 Location Selection</h3>
                <p className="text-sm text-muted-foreground">Select location on map</p>

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

                {/* Map placeholder */}
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Interactive Map for KSA Location Selection</p>
                  <p className="text-sm text-muted-foreground mt-1">Click on the map to select your location</p>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">📝 Additional Notes</h3>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Example: There's a dog at home</FormLabel>
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
              </div>

              <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                <p>Expected Price: <span className="font-bold text-foreground">${product.price} + Delivery Fee</span></p>
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
                    form.setValue('pricingOption', 'choose_offer');
                    handleBookingNow();
                  }}
                >
                  Choose Offer
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    form.setValue('orderType', 'direct');
                    form.setValue('pricingOption', 'auto_accept');
                    handleBookingNow();
                  }}
                >
                  Confirm
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
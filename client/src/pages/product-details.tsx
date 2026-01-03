import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { useServiceCategory } from "@/hooks/use-service-categories";
import { useServicesByCategory } from "@/hooks/use-services";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Package, ShoppingCart, Heart, Share2, Camera, CreditCard, X, ChevronLeft, ChevronRight, Truck, DollarSign, CheckCircle, AlertCircle, Save } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import KsaMap from "@/components/KsaMap";
import AdminNotesDisplay from "@/components/AdminNotesDisplay";
import CustomerNotesInput from "@/components/CustomerNotesInput";

export default function ProductDetails() {
  const [match, params] = useRoute("/customer/products/:categoryId/:subcategoryId?/:productId");
  const productId = params?.productId || '';
  const subcategoryId = params?.subcategoryId || '';

  console.log('ProductDetails params:', params);
  console.log('Product ID being fetched:', productId);
  console.log('Subcategory ID:', subcategoryId);

  const { toast } = useToast();
  const { user } = useAuth();
  const { data: product, isLoading } = useProduct(productId);
  const { data: category, isLoading: isCategoryLoading } = useServiceCategory(product?.categoryId || '');
  const { data: services = [], isLoading: isServicesLoading } = useServicesByCategory(product?.categoryId || '');
  const primaryService = services[0]; // Use the first service associated with this category
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [locationImage, setLocationImage] = useState<string | null>(null);
  const [customerNotes, setCustomerNotes] = useState('');
  const [bookingStep, setBookingStep] = useState<'details' | 'confirmation'>('details');
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-16 h-16 text-muted-foreground mb-4 animate-spin" />
        <h2 className="text-2xl font-bold mb-2">Loading Product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist or is no longer available.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setSelectedLocation(location);
  };

  const handleImageUpload = (image: string) => {
    setLocationImage(image);
  };

  const handleBookingNow = () => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    if (isServicesLoading) {
      toast({ title: "Loading", description: "Please wait while we load service information." });
      return;
    }

    if (!primaryService?.id) {
      toast({
        title: "Error",
        description: "Service information not available. Cannot proceed with booking.",
        variant: "destructive"
      });
      return;
    }

    setBookingStep('confirmation');
  };

  const handleConfirmBooking = (bookingType: 'auto_accept' | 'offer_based') => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    // Check if we have a valid service ID
    if (!primaryService?.id) {
      toast({
        title: "Error",
        description: "Service information not available. Cannot create order.",
        variant: "destructive"
      });
      return;
    }

    // Check if user is authenticated
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an order.",
        variant: "destructive"
      });
      return;
    }

    // Prepare order data (customerId is set by backend from authenticated user)
    const orderData: any = {
      serviceId: primaryService.id, // Use the actual service ID
      status: bookingType === 'auto_accept' ? 'pending' : 'new', // If auto_accept, set to pending; if offer_based, set to new
      location: {
        pickup: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: selectedLocation.address || `Lat: ${selectedLocation.lat}, Lng: ${selectedLocation.lng}`
        },
        dropoff: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: selectedLocation.address || `Lat: ${selectedLocation.lat}, Lng: ${selectedLocation.lng}`
        }
      },
      notes: customerNotes || undefined,
      pricingOption: bookingType === 'auto_accept' ? 'auto_accept' : 'choose_offer',
      bookingType: bookingType, // New field
      customerNotes: customerNotes || undefined, // New field
      // Include subService only if it exists
      ...(product.subcategoryId && { subService: product.subcategoryId }),
      // Include locationImage only if it exists
      ...(locationImage && { locationImage: locationImage }),
      // adminNotesDisplayed would be populated on the backend based on subcategory
    };

    createOrder(orderData, {
      onSuccess: (response) => {
        toast({ title: "Order Created", description: "Your request has been submitted." });
        // Navigate to appropriate page based on booking type
        if (bookingType === 'auto_accept') {
          // Navigate to orders page
          window.location.hash = '#/customer/orders';
        } else {
          // Navigate to offers page to see offers from drivers
          window.location.hash = '#/customer/offers';
        }
      },
      onError: (error) => {
        console.error('Error creating order:', error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
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
          <ChevronLeft className="mr-2 w-4 h-4" /> Back to Details
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
                      <Package className="w-8 h-8 text-muted-foreground" />
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
                      {selectedLocation?.address ||
                        `Lat: ${selectedLocation?.lat.toFixed(6)}, Lng: ${selectedLocation?.lng.toFixed(6)}`}
                    </p>
                  </div>

                  {customerNotes && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Customer Notes</h4>
                      <p className="font-medium">{customerNotes}</p>
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
                    disabled={isCreatingOrder || isServicesLoading}
                  >
                    {isCreatingOrder ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isServicesLoading ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
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
                    disabled={isCreatingOrder || isServicesLoading}
                  >
                    {isCreatingOrder ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isServicesLoading ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image Carousel */}
          <div className="relative group">
            <Carousel
              opts={{
                align: "start",
                loop: true
              }}
              className="w-full"
              setApi={(api) => {
                api.on("select", () => {
                  setSelectedImage(api.selectedScrollSnap());
                });
              }}
            >
              <CarouselContent>
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <CarouselItem key={index} className="relative">
                      <div
                        className="bg-muted rounded-2xl aspect-square flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => {
                          setLightboxOpen(true);
                          setLightboxIndex(index);
                        }}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white/80 backdrop-blur-sm rounded-full p-3">
                            <Package className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-full h-full flex items-center justify-center rounded-2xl">
                      <Package className="w-24 h-24 text-purple-600" />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-600 border border-purple-200 shadow-lg" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white text-purple-600 border border-purple-200 shadow-lg" />
            </Carousel>

            {/* Thumbnail Indicators */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedImage === index
                        ? "bg-purple-600 w-6"
                        : "bg-muted-foreground/50 hover:bg-muted-foreground"
                    }`}
                    onClick={() => {
                      setSelectedImage(index);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm">4.8</span>
                  </div>
                  <span className="text-muted-foreground text-sm">(128 reviews)</span>
                </div>
              </div>
              <Button variant="outline" size="icon">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                {product.discountedPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${parseFloat(product.discountedPrice).toFixed(2)}
                  </span>
                )}
                {product.discountedPrice && (
                  <Badge variant="secondary" className="text-green-600">
                    Save ${(parseFloat(product.discountedPrice) - parseFloat(product.price)).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Description</h3>
              <p className="text-muted-foreground mt-1">{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">Category</h3>
                <p className="text-muted-foreground mt-1">
                  {isCategoryLoading ? 'Loading...' : category?.name?.en || product.categoryId}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Subcategory</h3>
                <p className="text-muted-foreground mt-1">{product.subcategoryId || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">Availability</h3>
                <p className="text-green-600 mt-1">In Stock</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Brand</h3>
                <p className="text-muted-foreground mt-1">{product.brand || 'N/A'}</p>
              </div>
            </div>

            {product.color && (
              <div>
                <h3 className="font-semibold text-lg">Color</h3>
                <p className="text-muted-foreground mt-1">{product.color}</p>
              </div>
            )}

            {product.size && (
              <div>
                <h3 className="font-semibold text-lg">Size</h3>
                <p className="text-muted-foreground mt-1">{product.size}</p>
              </div>
            )}

            {product.unit && (
              <div>
                <h3 className="font-semibold text-lg">Unit</h3>
                <p className="text-muted-foreground mt-1">{product.unit}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Enter Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* KSA Map Integration */}
            <div>
              <h3 className="text-lg font-medium mb-4">📍 Location Selection</h3>
              <KsaMap
                onLocationSelect={handleLocationSelect}
                onImageUpload={handleImageUpload}
                initialLocation={selectedLocation || undefined}
                initialImage={locationImage || undefined}
              />
            </div>

            {/* Admin Notes Display */}
            {subcategoryId && (
              <div>
                <h3 className="text-lg font-medium mb-4">📋 Admin Notes</h3>
                <AdminNotesDisplay subcategoryId={subcategoryId} />
              </div>
            )}

            {/* Customer Notes */}
            <div>
              <h3 className="text-lg font-medium mb-4">📝 Additional Notes</h3>
              <CustomerNotesInput
                value={customerNotes}
                onChange={setCustomerNotes}
                placeholder="Example: There's a dog at home, gate code is 1234, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Booking Button - appears after location is selected */}
        <div className="mt-6 flex items-center gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleBookingNow}
            disabled={!selectedLocation || isServicesLoading}
          >
            {isServicesLoading ? (
              <>
                <Save className="w-5 h-5 mr-2 animate-spin" />
                Loading Services...
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                BOOKING NOW
              </>
            )}
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && product.images && product.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative w-full h-[80vh] flex items-center justify-center">
              <img
                src={product.images[lightboxIndex]}
                alt={`${product.name} - Image ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {product.images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                    }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    className="absolute right-4 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          lightboxIndex === index ? "bg-white" : "bg-white/50"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxIndex(index);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
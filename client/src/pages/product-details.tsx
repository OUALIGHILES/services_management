import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Package, ShoppingCart, Heart, Share2, Camera, CreditCard, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function ProductDetails() {
  const [matchWithSubcategory, paramsWithSubcategory] = useRoute("/customer/products/:categoryId/:subcategoryId/:productId");
  const [matchWithoutSubcategory, paramsWithoutSubcategory] = useRoute("/customer/products/:categoryId/:productId");

  // Determine which route matched and extract parameters accordingly
  let params, productId;
  if (matchWithSubcategory) {
    params = paramsWithSubcategory;
    productId = params.productId || '';
    console.log('Matched route with subcategory:', params);
  } else if (matchWithoutSubcategory) {
    params = paramsWithoutSubcategory;
    productId = params.productId || '';
    console.log('Matched route without subcategory:', params);
  } else {
    params = null;
    productId = '';
    console.log('No route matched');
  }

  console.log('ProductDetails params:', params);
  console.log('Product ID being fetched:', productId);
  console.log('Route matches - withSubcategory:', matchWithSubcategory, 'withoutSubcategory:', matchWithoutSubcategory);

  const { data: product, isLoading } = useProduct(productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  const addToCart = () => {
    // Navigate to booking page with product information
    window.location.hash = `#/customer/book-product/${product.id}`;
  };

  const navigateToBooking = () => {
    window.location.hash = `#/customer/book-product/${product.id}`;
  };

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
                <p className="text-muted-foreground mt-1">{product.categoryId}</p>
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

          <div className="flex items-center gap-4">
            <Button size="lg" className="flex-1" onClick={navigateToBooking}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Enter Booking Data
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Form Section */}
      <div className="mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Enter Booking Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">📍 Location Selection</label>
                  <div className="bg-muted rounded-lg p-4 flex items-center justify-center h-40">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                    <p className="ml-2 text-muted-foreground">Select location on map</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">📝 Additional Notes</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    rows={3}
                    placeholder="Example: There's a dog at home"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">🖼️ Attach Photos</label>
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors">
                    <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Click to upload photos</p>
                    <p className="text-xs text-muted-foreground">For hard-to-describe locations</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">💳 Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Cash
                    </Button>
                    <Button variant="outline">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Electronic
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button size="lg" className="flex-1" onClick={navigateToBooking}>
                💰 Get Price Quotes
              </Button>
              <Button size="lg" className="flex-1" variant="secondary" onClick={navigateToBooking}>
                ✅ Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
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
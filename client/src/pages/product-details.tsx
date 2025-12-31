import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Package, ShoppingCart, Heart, Share2, Camera, CreditCard } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const [match, params] = useRoute("/customer/products/:categoryId/:subcategoryId?/:productId");
  const { data: product, isLoading } = useProduct(params?.productId || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
          <div className="bg-muted rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-purple-600" />
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`rounded-xl aspect-square flex items-center justify-center overflow-hidden ${
                    selectedImage === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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
    </div>
  );
}
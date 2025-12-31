import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Package,
  ShoppingCart,
  Heart,
  Share2,
  Camera,
  CreditCard,
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Tag,
  Palette,
  Ruler,
  Package2,
  Calendar,
  User,
  Eye,
  TrendingUp,
  ShoppingCart as ShoppingCartIcon
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Product as ProductType } from "@shared/schema";

export default function AdminProductDetails() {
  const [match, params] = useRoute("/admin/products/:productId");
  const { data: product, isLoading, error } = useProduct(params?.productId || '');
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-16 h-16 text-muted-foreground mb-4 animate-spin" />
        <h2 className="text-2xl font-bold mb-2">Loading Product...</h2>
        <p className="text-muted-foreground">Please wait while we fetch the product details</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist or is no longer available.</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const handleEdit = () => {
    // In a real implementation, this would open an edit dialog
    alert(`Edit product functionality would open for product: ${product.name}`);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the product "${product.name}"?`)) {
      // In a real implementation, this would call the delete API
      alert(`Delete product functionality would execute for product: ${product.name}`);
    }
  };

  // Mock data for product statistics - in a real app, this would come from an API
  const productStats = {
    views: 1242,
    orders: 89,
    revenue: 2456.75,
    rating: 4.8
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Product Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Product Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Views</p>
                <p className="text-2xl font-bold text-blue-900">{productStats.views.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Orders</p>
                <p className="text-2xl font-bold text-green-900">{productStats.orders}</p>
              </div>
              <ShoppingCartIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Revenue</p>
                <p className="text-2xl font-bold text-purple-900">${productStats.revenue.toFixed(2)}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-800">Rating</p>
                <p className="text-2xl font-bold text-amber-900">{productStats.rating}</p>
              </div>
              <Star className="w-8 h-8 text-amber-600 fill-current" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <motion.div
            className="bg-muted rounded-2xl aspect-square flex items-center justify-center overflow-hidden shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={typeof product.name === 'object' ? product.name.en || product.name.ar || product.name.ur : product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 w-full h-full flex items-center justify-center">
                <Package2 className="w-24 h-24 text-purple-600" />
              </div>
            )}
          </motion.div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  className={`rounded-xl aspect-square flex items-center justify-center overflow-hidden border-2 ${
                    selectedImage === index ? "border-primary ring-2 ring-primary/30" : "border-transparent"
                  }`}
                  onClick={() => setSelectedImage(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  {typeof product.name === 'object'
                    ? product.name.en || product.name.ar || product.name.ur
                    : product.name}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{productStats.rating}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">(128 reviews)</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  ${parseFloat(product.price || '0').toFixed(2)}
                </span>
                {product.discountedPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${parseFloat(product.discountedPrice).toFixed(2)}
                  </span>
                )}
                {product.discountedPrice && (
                  <Badge variant="secondary" className="text-green-600 bg-green-100">
                    Save ${(parseFloat(product.discountedPrice) - parseFloat(product.price || '0')).toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Description
              </h3>
              <p className="text-muted-foreground mt-1 bg-muted/50 p-4 rounded-lg">
                {product.description || 'No description available'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Category
                </h3>
                <p className="text-muted-foreground mt-1 bg-muted/30 p-3 rounded-lg">
                  {product.categoryId}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Subcategory
                </h3>
                <p className="text-muted-foreground mt-1 bg-muted/30 p-3 rounded-lg">
                  {product.subcategoryId || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Modified By
                </h3>
                <p className="text-muted-foreground mt-1 bg-muted/30 p-3 rounded-lg">
                  {product.modifiedBy}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Created Date
                </h3>
                <p className="text-muted-foreground mt-1 bg-muted/30 p-3 rounded-lg">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {product.brand && (
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Brand
                </h3>
                <p className="text-muted-foreground mt-1 bg-muted/30 p-3 rounded-lg">
                  {product.brand}
                </p>
              </div>
            )}

            {product.color && (
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-300"
                    style={{ backgroundColor: product.color }}
                  ></div>
                  <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {product.color}
                  </p>
                </div>
              </div>
            )}

            {product.size && (
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  Size
                </h3>
                <p className="text-muted-foreground mt-1 bg-muted/30 p-3 rounded-lg">
                  {product.size}
                </p>
              </div>
            )}

            {product.unit && (
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package2 className="w-5 h-5" />
                  Unit
                </h3>
                <p className="text-muted-foreground mt-1 bg-muted/30 p-3 rounded-lg">
                  {product.unit}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Additional Information Card */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-xl">
          <CardHeader className="bg-muted/30 rounded-t-xl">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package2 className="w-6 h-6" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Product ID
                  </h4>
                  <p className="text-muted-foreground font-mono bg-muted/30 p-3 rounded-lg">
                    {product.id}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created Date
                  </h4>
                  <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Modified Date
                  </h4>
                  <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {product.modifiedAt ? new Date(product.modifiedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price Information
                  </h4>
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Base Price:</span>
                      <span className="font-medium text-lg">${parseFloat(product.price || '0').toFixed(2)}</span>
                    </div>
                    {product.discountedPrice && (
                      <div className="flex justify-between items-center">
                        <span>Discounted Price:</span>
                        <span className="font-medium text-lg text-destructive">${parseFloat(product.discountedPrice).toFixed(2)}</span>
                      </div>
                    )}
                    {product.discountedPrice && (
                      <div className="flex justify-between items-center pt-2 border-t border-muted-foreground/30">
                        <span className="font-medium">You Save:</span>
                        <span className="font-medium text-green-600">
                          ${(parseFloat(product.price || '0') - parseFloat(product.discountedPrice)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance Metrics
                  </h4>
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Total Views:</span>
                      <span className="font-medium">{productStats.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Orders:</span>
                      <span className="font-medium">{productStats.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Revenue:</span>
                      <span className="font-medium">${productStats.revenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
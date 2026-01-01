import { useRoute, useLocation } from "wouter";
import { useProducts, useProductsByCategory, useProductsBySubcategory } from "@/hooks/use-products";
import { useServiceCategories } from "@/hooks/use-services";
import { useSubcategoriesByCategory } from "@/hooks/use-subcategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, Truck, ShoppingBag, MapPin, ArrowRight, Grid, List, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { filterProductsBySubcategory } from "@/utils/product-utils";
import AutoScrollImageCarousel from "@/components/ui/auto-scroll-image-carousel";

export default function CustomerProducts() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/customer/products/:categoryId/:subcategoryId?");
  const { data: categories } = useServiceCategories();
  const { data: subcategories } = useSubcategoriesByCategory(params?.categoryId || "");

  // Use subcategory filter if subcategoryId is provided, otherwise use category filter
  const { data: productsByCategory, isLoading: categoryLoading } = useProductsByCategory(params?.categoryId || '');
  const { data: productsBySubcategory, isLoading: subcategoryLoading } = useProductsBySubcategory(params?.subcategoryId || '');

  const products = params?.subcategoryId ? productsBySubcategory : productsByCategory;
  const isLoading = params?.subcategoryId ? subcategoryLoading : categoryLoading;

  console.log('Products data:', products, 'Params:', params);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentCategory = categories?.find(cat => cat.id === params?.categoryId);
  const currentSubcategory = subcategories?.find(sub => sub.id === params?.subcategoryId);

  // Products are already filtered by category or subcategory from the server
  const filteredProducts = products || [];

  // Additional client-side filtering to ensure products match the selected subcategory
  const finalFilteredProducts = params?.subcategoryId
    ? filterProductsBySubcategory(filteredProducts, params.subcategoryId)
    : filteredProducts;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-80 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-4 mb-6"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          className="hover:bg-purple-50 hover:text-purple-600 border border-purple-200 rounded-xl shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-4xl font-black font-display bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            {currentSubcategory ? (currentSubcategory.name as any).en : (currentCategory?.name as any)?.en || "Products"}
          </h2>
          <p className="text-xl text-muted-foreground">
            {currentSubcategory
              ? `Products in ${(currentSubcategory.name as any).en} subcategory`
              : `Products in ${(currentCategory?.name as any)?.en || "category"}`}
          </p>
        </div>
      </motion.div>

      {/* Category and Subcategory Navigation */}
      <div className="space-y-6">
        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={category.id === params?.categoryId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocation(`/customer/products/${category.id}`)}
                    className={`border-2 ${
                      category.id === params?.categoryId
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white shadow-lg hover:shadow-xl"
                        : "border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                    } rounded-xl px-4 py-2 transition-all`}
                  >
                    {(category.name as any).en}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Subcategory Navigation (if category is selected) */}
        {params?.categoryId && subcategories && subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Subcategories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    key="all"
                    variant={!params?.subcategoryId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocation(`/customer/products/${params.categoryId}`)}
                    className={`border-2 ${
                      !params?.subcategoryId
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white shadow-lg hover:shadow-xl"
                        : "border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                    } rounded-xl px-4 py-2 transition-all`}
                  >
                    All Products
                  </Button>
                  {subcategories.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      variant={subcategory.id === params?.subcategoryId ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLocation(`/customer/products/${params.categoryId}/${subcategory.id}`)}
                      className={`border-2 ${
                        subcategory.id === params?.subcategoryId
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white shadow-lg hover:shadow-xl"
                          : "border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                      } rounded-xl px-4 py-2 transition-all`}
                    >
                      {(subcategory.name as any).en}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* View Toggle and Product Count */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <p className="text-xl text-muted-foreground">
          Showing <span className="font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{finalFilteredProducts.length}</span> products
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex border-2 border-purple-200 rounded-xl p-1 bg-purple-50">
            <Button
              variant={viewMode === 'grid' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "hover:bg-purple-100"
              }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "hover:bg-purple-100"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Products List */}
      {finalFilteredProducts.length === 0 ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-muted/30 to-purple-50/20 border-dashed border-2 hover:border-purple-300 transition-all overflow-hidden">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center relative">
              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200/20 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl" />

              <motion.div
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-xl relative z-10"
              >
                <Package className="w-12 h-12 text-purple-600" />
              </motion.div>

              <h3 className="text-3xl font-black mb-2 relative z-10">
                No products found
              </h3>
              <p className="text-muted-foreground max-w-md mt-3 text-lg relative z-10">
                Select a different category or subcategory to see available products.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {finalFilteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              <Card
                className="overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl cursor-pointer group"
                onClick={() => {
                  // Use the current params to determine the URL structure
                  // If we're in a specific subcategory view, include it in the URL
                  // If we're in the "All Products" view (no subcategory selected), don't include it
                  const productUrl = params.subcategoryId
                    ? `/customer/products/${params.categoryId}/${params.subcategoryId}/${product.id}`
                    : `/customer/products/${params.categoryId}/${product.id}`;
                  setLocation(productUrl);
                }}
              >
                <div className={`${
                  viewMode === 'list' ? "flex-shrink-0 w-24 h-24" : "h-48"
                } rounded-t-2xl rounded-b-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center relative overflow-hidden`}>
                  {product.images && product.images.length > 0 ? (
                    <AutoScrollImageCarousel
                      images={product.images}
                      altText={typeof product.name === 'object' ? product.name.en || product.name.ar || product.name.ur : product.name}
                      className={`w-full h-full ${
                        viewMode === 'list' ? "rounded-l-2xl" : "rounded-t-2xl"
                      }`}
                      autoScrollInterval={4000}
                      showIndicators={false}
                      showNavigation={false}
                    />
                  ) : (
                    <Package className="w-12 h-12 text-purple-600" />
                  )}
                </div>

                <CardContent className={`p-6 ${
                  viewMode === 'list' ? "flex-grow" : ""
                }`}>
                  <div className="space-y-4">
                    <h4 className="font-black text-2xl text-purple-900">{typeof product.name === 'object' ? product.name.en || product.name.ar || product.name.ur : product.name}</h4>
                    <p className="text-muted-foreground text-base line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        {product.discountedPrice && (
                          <div>
                            <span className="ml-2 text-lg text-muted-foreground line-through">
                              ${parseFloat(product.discountedPrice).toFixed(2)}
                            </span>
                            <span className="ml-3 text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Save ${(parseFloat(product.price) - parseFloat(product.discountedPrice)).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the card click event from firing
                          // Use the current params to determine the URL structure
                          // If we're in a specific subcategory view, include it in the URL
                          // If we're in the "All Products" view (no subcategory selected), don't include it
                          const productUrl = params.subcategoryId
                            ? `/customer/products/${params.categoryId}/${params.subcategoryId}/${product.id}`
                            : `/customer/products/${params.categoryId}/${product.id}`;
                          console.log('View Details button clicked, URL:', productUrl, 'params:', params, 'product:', product);
                          setLocation(productUrl);
                        }}
                      >
                        View Details
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
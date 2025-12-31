import { useRoute, useLocation } from "wouter";
import { useServiceCategories } from "@/hooks/use-services";
import { useSubcategoriesByCategory } from "@/hooks/use-subcategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, Truck, ShoppingBag, MapPin, ArrowRight, Grid, List } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";

export default function CustomerServices() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/customer/services/:categoryId/:subcategoryId?");
  const { data: categories } = useServiceCategories();
  const { data: subcategories } = useSubcategoriesByCategory(params?.categoryId || "");
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentCategory = categories?.find(cat => cat.id === params?.categoryId);
  const currentSubcategory = subcategories?.find(sub => sub.id === params?.subcategoryId);

  if (!subcategories) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          className="hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold font-display">
            {currentSubcategory ? (currentSubcategory.name as any).en : (currentCategory?.name as any)?.en || "Services"}
          </h2>
          <p className="text-muted-foreground">
            {currentSubcategory 
              ? `Services in ${(currentSubcategory.name as any).en} subcategory`
              : `Services in ${(currentCategory?.name as any)?.en || "category"}`}
          </p>
        </div>
      </div>

      {/* Category and Subcategory Navigation */}
      <div className="space-y-6">
        {/* Category Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={category.id === params?.categoryId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocation(`/customer/services/${category.id}`)}
                >
                  {(category.name as any).en}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subcategory Navigation (if category is selected) */}
        {params?.categoryId && subcategories && subcategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subcategories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  key="all"
                  variant={!params?.subcategoryId ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocation(`/customer/services/${params.categoryId}`)}
                >
                  All Services
                </Button>
                {subcategories.map((subcategory) => (
                  <Button
                    key={subcategory.id}
                    variant={subcategory.id === params?.subcategoryId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLocation(`/customer/services/${params.categoryId}/${subcategory.id}`)}
                  >
                    {(subcategory.name as any).en}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Toggle and Service Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-muted-foreground">
          Showing <span className="font-medium">{subcategories?.length || 0}</span> services
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-1.5"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-1.5"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Services List */}
      {subcategories && subcategories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed">
          <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No services found</h3>
          <p>Select a different category to see available services.</p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {subcategories?.map((subcategory, index) => (
            <motion.div
              key={subcategory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`hover:shadow-md transition-shadow duration-200 ${
                viewMode === 'list' ? "flex items-center gap-6 p-4" : ""
              }`}>
                <div className={`${
                  viewMode === 'list' ? "flex-shrink-0 w-24 h-24" : "h-48"
                } rounded-t-2xl rounded-b-2xl bg-muted flex items-center justify-center`}>
                  <Truck className="w-12 h-12 text-muted-foreground" />
                </div>
                
                <CardContent className={`p-4 ${
                  viewMode === 'list' ? "flex-grow" : ""
                }`}>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg">{(subcategory.name as any).en}</h4>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {(subcategory.description as any)?.en || "Professional service for your needs."}
                    </p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Available in multiple zones
                        </span>
                      </div>
                      
                      <Link href={`/customer/book/${subcategory.id}?type=subcategory`}>
                        <Button size="sm">
                          Book Service
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
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
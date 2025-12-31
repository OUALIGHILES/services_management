import { useRoute, useLocation } from "wouter";
import { useSubcategoriesByCategory } from "@/hooks/use-subcategories";
import { useServiceCategories } from "@/hooks/use-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Package, Truck, ShoppingBag, MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function CustomerSubcategories() {
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/customer/services/:categoryId/subcategories");
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategoriesByCategory(params?.categoryId || "");
  const { data: categories } = useServiceCategories();
  
  const currentCategory = categories?.find(cat => cat.id === params?.categoryId);

  // Mapping some icons to categories for visual flair
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("water")) return Truck;
    if (n.includes("tank")) return Package;
    if (n.includes("sand")) return ShoppingBag;
    return MapPin;
  };

  if (subcategoriesLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
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
        <h2 className="text-2xl font-bold font-display">
          {(currentCategory?.name as any)?.en || "Service Subcategories"}
        </h2>
      </div>

      {(!subcategories || subcategories.length === 0) ? (
        <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed">
          No subcategories available for this service. Please select another service.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((subcat, index) => {
            const Icon = getIcon((subcat.name as any).en || "service");

            return (
              <motion.div
                key={subcat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/customer/products/${params?.categoryId}/${subcat.id}`}>
                  <div className="group relative bg-card hover:bg-gradient-to-br hover:from-card hover:to-indigo-50/50 rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-bold mb-2">{(subcat.name as any).en}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {(subcat.description as any)?.en || "Service option for your needs."}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-primary font-medium text-sm group-hover:underline decoration-2 underline-offset-4">
                      View Products <ArrowRight className="ml-1 w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
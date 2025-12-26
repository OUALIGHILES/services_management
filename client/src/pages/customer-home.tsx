import { useServiceCategories } from "@/hooks/use-services";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package, Truck, ShoppingBag, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerHome() {
  const { data: categories, isLoading } = useServiceCategories();

  // Mapping some icons to categories for visual flair
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("food")) return ShoppingBag;
    if (n.includes("parcel")) return Package;
    return Truck;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold font-display leading-tight">
            Need something moved?
            <br />
            We've got you covered.
          </h2>
          <p className="text-indigo-100 text-lg max-w-lg">
            From small parcels to furniture, book a trusted driver instantly.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-indigo-50 mt-4 font-semibold">
            Book Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
        {/* Abstract decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
      </section>

      {/* Categories */}
      <section>
        <h3 className="text-xl font-bold mb-6 font-display">Service Categories</h3>
        
        {(!categories || categories.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-2xl border border-dashed">
            No services available yet. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, index) => {
              const Icon = getIcon((cat.name as any).en || "service");
              
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/customer/services/${cat.id}`}>
                    <div className="group relative bg-card hover:bg-gradient-to-br hover:from-card hover:to-indigo-50/50 rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">{(cat.name as any).en}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {(cat.description as any)?.en || "Professional delivery service for your needs."}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center text-primary font-medium text-sm group-hover:underline decoration-2 underline-offset-4">
                        View Services <ArrowRight className="ml-1 w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

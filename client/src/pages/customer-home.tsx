import { useServiceCategories } from "@/hooks/use-services";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package, Truck, ShoppingBag, MapPin, ArrowRight, Wallet, Clock, Package2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { api } from "@shared/routes";
import WelcomeCarousel from "@/components/ui/welcome-carousel";

// Define the banner type
interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: number;
  status: 'active' | 'inactive';
  createdAt: string;
  modifiedAt: string;
}

export default function CustomerHome() {
  const { data: categories, isLoading: categoriesLoading } = useServiceCategories();
  const { user } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders({
    customerId: user?.id,
    limit: 5 // Get only the 5 most recent orders
  });

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user is a first-time visitor
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedCustomerHome');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedCustomerHome', 'true');
    }
  }, []);

  // Fetch active banners from the backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(api.homeBanners.list.path, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
          }
        });

        if (response.ok) {
          const allBanners: Banner[] = await response.json();
          // Filter only active banners and sort by position
          const activeBanners = allBanners
            .filter(banner => banner.status === 'active')
            .sort((a, b) => a.position - b.position);
          setBanners(activeBanners);
        } else {
          console.error('Failed to fetch banners:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Mapping some icons to categories for visual flair
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("food")) return ShoppingBag;
    if (n.includes("parcel")) return Package;
    return Truck;
  };

  // Calculate quick stats
  const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
  const pendingOrders = orders?.filter(order =>
    order.status === 'new' || order.status === 'pending' || order.status === 'in_progress'
  ).length || 0;

  // Handle welcome carousel completion
  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomeCarousel onComplete={handleWelcomeComplete} />;
  }

  if (categoriesLoading || ordersLoading || bannersLoading) {
    return (
      <div className="space-y-8">
        {/* Banner skeleton */}
        <Skeleton className="h-64 rounded-3xl" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>

        {/* Categories skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner - Display active banners */}
      {banners.length > 0 ? (
        <div className="space-y-4">
          {banners.map((banner) => (
            <section
              key={banner.id}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 md:p-12 shadow-2xl"
            >
              <div className="relative z-10 max-w-2xl space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight">
                  {banner.title}
                </h2>
                <p className="text-indigo-100 text-lg max-w-lg">
                  {banner.description}
                </p>
                {banner.linkUrl && (
                  <Link href={banner.linkUrl}>
                    <Button size="lg" className="bg-white text-primary hover:bg-indigo-50 mt-4 font-semibold">
                      Learn More <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
              {/* Abstract decorative circles */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
            </section>
          ))}
        </div>
      ) : (
        // Default banner if no active banners
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold font-display leading-tight">
              Welcome back, {user?.fullName || 'Customer'}!
            </h2>
            <p className="text-indigo-100 text-lg max-w-lg">
              From small parcels to furniture, book a trusted driver instantly.
            </p>
            <Link href="/customer/book">
              <Button size="lg" className="bg-white text-primary hover:bg-indigo-50 mt-4 font-semibold">
                Book New Delivery <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          {/* Abstract decorative circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
        </section>
      )}

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package2 className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Package className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Recent Orders */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold font-display">Recent Orders</h3>
          <Link href="/customer/orders">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {orders?.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No orders yet</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Start by browsing services and booking your first delivery.
              </p>
              <Link href="/customer/book">
                <Button className="mt-4">
                  Book Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders?.slice(0, 3).map(order => (
              <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground">{order.requestNumber}</span>
                        <StatusBadge status={order.status || "new"} />
                      </div>

                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <span className="font-medium">Pickup:</span>
                          <span className="ml-2 text-muted-foreground">{(order.location as any)?.pickup?.address}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                          <span className="font-medium">Dropoff:</span>
                          <span className="ml-2 text-muted-foreground">{(order.location as any)?.dropoff?.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {order.createdAt && format(new Date(order.createdAt), "MMM d, yyyy")}
                      </div>
                      {order.totalAmount && (
                        <div className="font-bold text-foreground text-lg">
                          ${order.totalAmount}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                  <Link href={`/customer/services/${cat.id}/subcategories`}>
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

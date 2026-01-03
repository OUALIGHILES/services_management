import { useServiceCategories } from "@/hooks/use-services";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { Package, Truck, ShoppingBag, MapPin, ArrowRight, Wallet, Clock, Package2, User, Sparkles, TrendingUp, Star } from "lucide-react";
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
    limit: 5
  });

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 300], [0, 150]);
  const bannerOpacity = useTransform(scrollY, [0, 200], [1, 0.3]);

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
          },
          credentials: 'include'
        });

        if (response.ok) {
          const allBanners: Banner[] = await response.json();
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

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("food")) return ShoppingBag;
    if (n.includes("parcel")) return Package;
    return Truck;
  };

  const completedOrders = orders?.filter(order => order.status === 'delivered').length || 0;
  const pendingOrders = orders?.filter(order =>
    order.status === 'new' || order.status === 'pending' || order.status === 'in_progress'
  ).length || 0;

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomeCarousel onComplete={handleWelcomeComplete} />;
  }

  if (categoriesLoading || ordersLoading || bannersLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-80 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Enhanced Banner with Parallax */}
      <motion.div
        style={{ y: bannerY, opacity: bannerOpacity }}
        className="relative"
      >
        {banners.length > 0 ? (
          <div className="space-y-4">
            {banners.map((banner, index) => (
              <motion.section
                key={banner.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-10 md:p-16 shadow-2xl"
              >
                <div className="relative z-10 max-w-2xl space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    Featured Service
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-5xl font-black font-display leading-tight tracking-tight"
                  >
                    {banner.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-violet-100 text-lg md:text-xl max-w-lg leading-relaxed"
                  >
                    {banner.description}
                  </motion.p>

                  {banner.linkUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {banner.linkUrl.startsWith('http') ? (
                        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                          <Button
                            size="lg"
                            className="bg-white text-purple-700 hover:bg-purple-50 mt-6 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                          >
                            Learn More
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </a>
                      ) : (
                        <Link href={banner.linkUrl}>
                          <Button
                            size="lg"
                            className="bg-white text-purple-700 hover:bg-purple-50 mt-6 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                          >
                            Learn More
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Banner image */}
                {banner.imageUrl && (
                  <div className="absolute top-0 right-0 w-1/2 h-full">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                  </div>
                )}
                
                {/* Enhanced decorative elements */}
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                
                {/* Floating particles */}
                <motion.div
                  animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute top-20 right-20 w-8 h-8 bg-white/20 rounded-lg"
                />
                <motion.div
                  animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-20 right-40 w-6 h-6 bg-purple-300/30 rounded-full"
                />
              </motion.section>
            ))}
          </div>
        ) : (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-10 md:p-16 shadow-2xl"
          >
            <div className="relative z-10 max-w-2xl space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Welcome Back
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-black font-display leading-tight tracking-tight"
              >
                Hello, {user?.fullName || 'Customer'}! 👋
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-violet-100 text-lg md:text-xl max-w-lg leading-relaxed"
              >
                From small parcels to furniture, book a trusted driver instantly and track in real-time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/customer/book">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 hover:bg-purple-50 mt-6 font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                  >
                    Book New Delivery
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Fallback banner image */}
            <div className="absolute top-0 right-0 w-1/2 h-full">
              <div className="w-full h-full bg-gradient-to-l from-violet-700/30 to-indigo-800/30 flex items-center justify-center">
                <div className="text-white text-center p-8">
                  <div className="text-5xl mb-4">🚚</div>
                  <p className="text-lg">Reliable Delivery Services</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced decorative elements */}
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-pink-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            {/* Floating particles */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 right-20 w-8 h-8 bg-white/20 rounded-lg"
            />
            <motion.div
              animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 right-40 w-6 h-6 bg-purple-300/30 rounded-full"
            />
          </motion.section>
        )}
      </motion.div>

      {/* Enhanced Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onHoverStart={() => setHoveredCard('total')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-purple-900">Total Orders</CardTitle>
              <motion.div
                animate={{ rotate: hoveredCard === 'total' ? 360 : 0 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg"
              >
                <Package2 className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
              >
                {orders?.length || 0}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                All time deliveries
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onHoverStart={() => setHoveredCard('active')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-orange-300 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-orange-900">Active Orders</CardTitle>
              <motion.div
                animate={{ 
                  rotate: hoveredCard === 'active' ? 360 : 0,
                  scale: hoveredCard === 'active' ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg"
              >
                <Clock className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
              >
                {pendingOrders}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-orange-500 rounded-full"
                />
                In progress now
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onHoverStart={() => setHoveredCard('completed')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-green-300 transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-green-900">Completed</CardTitle>
              <motion.div
                animate={{ rotate: hoveredCard === 'completed' ? 360 : 0 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <Package className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                {completedOrders}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-green-500 text-green-500" />
                Successfully delivered
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>


      {/* Enhanced Categories */}
      <section>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-2xl font-black mb-6 font-display bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Service Categories
        </motion.h3>

        {(!categories || categories.length === 0) ? (
          <div className="text-center py-16 text-muted-foreground bg-gradient-to-br from-muted/50 to-purple-50/20 rounded-3xl border-2 border-dashed">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Package className="w-16 h-16" />
            </motion.div>
            <p className="text-lg font-semibold">No services available yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, index) => {
              const Icon = getIcon((cat.name as any).en || "service");

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 50, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.05, y: -10, rotateY: 5 }}
                >
                  <Link href={`/customer/products/${cat.id}`}>
                    <div className="group relative bg-gradient-to-br from-white to-purple-50/30 hover:to-indigo-50/50 rounded-3xl p-8 border-2 border-border hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between overflow-hidden">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-100/0 to-indigo-100/0 group-hover:via-purple-100/30 group-hover:to-indigo-100/20 transition-all duration-500" />
                      
                      <div className="relative z-10">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl"
                        >
                          <Icon className="w-8 h-8" />
                        </motion.div>
                        
                        <h4 className="text-2xl font-black mb-3 group-hover:text-purple-600 transition-colors">
                          {(cat.name as any).en}
                        </h4>
                        
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                          {(cat.description as any)?.en || "Professional delivery service for your needs."}
                        </p>
                      </div>
                      
                      <motion.div
                        className="relative z-10 flex items-center text-purple-600 font-bold text-sm group-hover:text-purple-700"
                        whileHover={{ x: 5 }}
                      >
                        View Services 
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </motion.div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl group-hover:bg-purple-300/30 transition-all" />
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl group-hover:bg-indigo-300/30 transition-all" />
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
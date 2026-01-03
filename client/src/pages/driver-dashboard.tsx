import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { useUpdateDriverStatus, useDrivers } from "@/hooks/use-drivers";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation, CheckCircle, DollarSign, Truck, Bell, Package, ArrowRight, Sparkles, TrendingUp, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

// Define types for driver earnings and wallet
type DriverEarnings = {
  totalEarnings: string;
  todayEarnings: string;
  thisWeekEarnings: string;
  walletBalance: string;
};

// Define types for order status updates
type OrderStatus = 'new' | 'pending' | 'in_progress' | 'picked_up' | 'delivered' | 'cancelled';

export default function DriverDashboard() {
  const { user } = useAuth();

  // Check if driver status is pending
  const isPending = user?.driverProfile?.status === "pending";

  // Fetch driver profile and earnings
  const driverId = user?.driverProfile?.id;

  // If driver status is pending, show a message
  if (isPending) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-8 max-w-md w-full shadow-lg"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
            className="text-amber-600 text-5xl mb-4"
          >
            ⚠️
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black font-display mb-2 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent"
          >
            Account Pending Approval
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            Your registration is currently under review. Please wait for approval from the administration.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-500"
          >
            You will be notified once your account has been approved or if additional information is required.
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  const updateStatus = useUpdateDriverStatus();

  // Fetch driver earnings and wallet information
  const { data: driverEarnings, isLoading: loadingEarnings } = useQuery<DriverEarnings>({
    queryKey: ['driver-earnings', driverId],
    queryFn: async () => {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll return mock data based on the user's driver profile
      const walletBalance = user?.driverProfile?.walletBalance || "0.00";
      return {
        totalEarnings: "1250.00",
        todayEarnings: "85.50",
        thisWeekEarnings: "320.75",
        walletBalance
      };
    },
    enabled: !!driverId
  });

  // Fetch recent orders for dashboard summary
  const { data: recentOrders, isLoading: loadingRecent } = useOrders({
    driverId: driverId,
    status: "in_progress,picked_up,delivered"
  });

  return (
    <div className="space-y-12 pb-12">
      {/* Enhanced Driver Status Toggle with Motion */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-2 border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black font-display text-white">Driver Status</h2>
              <p className="text-slate-300">Go online to receive new orders</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-medium ${user?.driverProfile?.status === "online" ? 'text-slate-400' : 'text-white'}`}>Offline</span>
              <div
                onClick={() => {
                  if(driverId) updateStatus.mutate({ status: user?.driverProfile?.status === "online" ? "offline" : "online" });
                }}
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  updateStatus.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  user?.driverProfile?.status === "online" ? 'bg-green-500' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    user?.driverProfile?.status === "online" ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className={`font-medium ${user?.driverProfile?.status === "online" ? 'text-green-400' : 'text-slate-400'}`}>Online</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Driver Stats Cards with Motion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-green-300 transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-green-900">Wallet Balance</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
              >
                <DollarSign className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                {loadingEarnings ? <Skeleton className="h-8 w-20" /> : `$${driverEarnings?.walletBalance || '0.00'}`}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Available funds
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-blue-900">Today's Earnings</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
              >
                <DollarSign className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              >
                {loadingEarnings ? <Skeleton className="h-8 w-20" /> : `$${driverEarnings?.todayEarnings || '0.00'}`}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Current day
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-purple-900">This Week</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg"
              >
                <DollarSign className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"
              >
                {loadingEarnings ? <Skeleton className="h-8 w-20" /> : `$${driverEarnings?.thisWeekEarnings || '0.00'}`}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Weekly earnings
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05, y: -5 }}
        >
          <Card className="h-full overflow-hidden border-2 hover:border-indigo-300 transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 shadow-lg hover:shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold text-indigo-900">Active Orders</CardTitle>
              <motion.div
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg"
              >
                <Truck className="w-6 h-6 text-white" />
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
              >
                {loadingRecent ? <Skeleton className="h-8 w-8" /> : recentOrders?.filter(order =>
                  order.status === 'in_progress' || order.status === 'picked_up'
                ).length || 0}
              </motion.div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Currently handling
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Enhanced Quick Access to Orders */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Orders Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black font-display bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Recent Orders
            </h3>
            <Link to="/driver/orders">
              <Button variant="outline" size="sm" className="font-semibold">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loadingRecent ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : recentOrders?.length === 0 ? (
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               transition={{ duration: 0.4 }}
             >
               <Card className="bg-gradient-to-br from-muted/30 to-indigo-50/20 border-dashed border-2 hover:border-indigo-300 transition-all overflow-hidden">
                 <CardContent className="flex flex-col items-center justify-center py-12 text-center relative">
                   {/* Decorative elements */}
                   <div className="absolute top-8 right-8 w-24 h-24 bg-indigo-200/20 rounded-full blur-3xl" />
                   <div className="absolute bottom-8 left-8 w-24 h-24 bg-purple-200/20 rounded-full blur-3xl" />

                   <motion.div
                     animate={{
                       y: [0, -10, 0],
                       rotate: [0, 3, -3, 0]
                     }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 shadow-xl relative z-10"
                   >
                     <Truck className="w-10 h-10 text-indigo-600" />
                   </motion.div>

                   <h3 className="text-2xl font-black mb-2 relative z-10">No recent orders</h3>
                   <p className="text-muted-foreground max-w-xs mt-2 text-sm relative z-10">
                     Check back later for completed or in-progress deliveries.
                   </p>
                 </CardContent>
               </Card>
             </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {recentOrders?.slice(0, 3).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-300 overflow-hidden group bg-gradient-to-r from-white to-indigo-50/10 group-hover:to-indigo-50/30">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full shadow-sm"
                          >
                            {order.requestNumber}
                          </motion.span>
                          <StatusBadge status={order.status || "new"} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-sm block mb-0.5">Status</span>
                              <span className="text-sm text-muted-foreground">
                                {order.status === 'in_progress' ? 'In Progress' :
                                 order.status === 'picked_up' ? 'Picked Up' :
                                 order.status === 'delivered' ? 'Delivered' :
                                 'New Request'}
                              </span>
                            </div>
                          </div>

                          {order.totalAmount && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-indigo-600">${order.totalAmount}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Available Requests Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black font-display bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Available Requests
            </h3>
            <Link to="/driver/orders">
              <Button variant="outline" size="sm" className="font-semibold">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loadingRecent ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : recentOrders?.filter(order =>
            order.status === 'new' || order.status === 'pending'
          ).length === 0 ? (
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               transition={{ duration: 0.4 }}
             >
               <Card className="bg-gradient-to-br from-muted/30 to-blue-50/20 border-dashed border-2 hover:border-blue-300 transition-all overflow-hidden">
                 <CardContent className="flex flex-col items-center justify-center py-12 text-center relative">
                   {/* Decorative elements */}
                   <div className="absolute top-8 right-8 w-24 h-24 bg-blue-200/20 rounded-full blur-3xl" />
                   <div className="absolute bottom-8 left-8 w-24 h-24 bg-cyan-200/20 rounded-full blur-3xl" />

                   <motion.div
                     animate={{
                       y: [0, -10, 0],
                       rotate: [0, 3, -3, 0]
                     }}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4 shadow-xl relative z-10"
                   >
                     <Package className="w-10 h-10 text-blue-600" />
                   </motion.div>

                   <h3 className="text-2xl font-black mb-2 relative z-10">No new requests</h3>
                   <p className="text-muted-foreground max-w-xs mt-2 text-sm relative z-10">
                     New delivery requests will appear here when available.
                   </p>
                 </CardContent>
               </Card>
             </motion.div>
          ) : (
            <motion.div
              key="requests"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {recentOrders?.filter(order => order.status === 'new' || order.status === 'pending')
                .slice(0, 3).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scale: 1.02, x: -5 }}
                >
                  <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 overflow-hidden group bg-gradient-to-r from-white to-blue-50/10 group-hover:to-blue-50/30">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col justify-between gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full shadow-sm"
                          >
                            {order.requestNumber}
                          </motion.span>
                          <StatusBadge status={order.status || "new"} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-sm block mb-0.5">Pickup</span>
                              <span className="text-sm text-muted-foreground break-words">
                                {(order.location as any)?.pickup?.address}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-sm block mb-0.5">Dropoff</span>
                              <span className="text-sm text-muted-foreground break-words">
                                {(order.location as any)?.dropoff?.address}
                              </span>
                            </div>
                          </div>

                          {order.totalAmount && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">${order.totalAmount}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Clock, Map, Truck, Star, Package, TrendingUp, Filter, Search, ArrowUpDown, Eye, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export default function CustomerOrders() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders({ customerId: user?.id });
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredOrder, setHoveredOrder] = useState<string | null>(null);

  // Filter orders based on status
  const filteredOrders = orders?.filter(order => {
    const matchesFilter = filter === "all" || 
      (filter === "active" && ['pending', 'in_progress', 'picked_up', 'new'].includes(order.status || '')) ||
      (filter === "completed" && order.status === 'delivered') ||
      (filter === "cancelled" && order.status === 'cancelled');
    
    const matchesSearch = order.requestNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.location as any)?.pickup?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.location as any)?.dropoff?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: orders?.length || 0,
    active: orders?.filter(o => ['pending', 'in_progress', 'picked_up', 'new'].includes(o.status || '')).length || 0,
    completed: orders?.filter(o => o.status === 'delivered').length || 0,
    cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-16 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h2 className="text-4xl font-black font-display bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
          My Orders
        </h2>
        <p className="text-muted-foreground text-lg">Track and manage all your deliveries in one place</p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setFilter("all")}
          className={`cursor-pointer ${filter === "all" ? "ring-2 ring-purple-500" : ""}`}
        >
          <Card className="bg-gradient-to-br from-white to-purple-50/30 border-2 hover:border-purple-300 transition-all shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.total}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setFilter("active")}
          className={`cursor-pointer ${filter === "active" ? "ring-2 ring-orange-500" : ""}`}
        >
          <Card className="bg-gradient-to-br from-white to-orange-50/30 border-2 hover:border-orange-300 transition-all shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {stats.active}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Active</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setFilter("completed")}
          className={`cursor-pointer ${filter === "completed" ? "ring-2 ring-green-500" : ""}`}
        >
          <Card className="bg-gradient-to-br from-white to-green-50/30 border-2 hover:border-green-300 transition-all shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {stats.completed}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          onClick={() => setFilter("cancelled")}
          className={`cursor-pointer ${filter === "cancelled" ? "ring-2 ring-gray-500" : ""}`}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50/30 border-2 hover:border-gray-300 transition-all shadow-lg hover:shadow-xl">
            <CardContent className="p-6 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
                {stats.cancelled}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Cancelled</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Search and Filter Bar */}
      {orders && orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by order number or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white shadow-sm"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter("all")}
            className="px-6 py-3 rounded-xl border-2 border-border hover:border-purple-500 bg-white hover:bg-purple-50 transition-all font-semibold flex items-center gap-2 shadow-sm"
          >
            <Filter className="w-5 h-5" />
            {filter === "all" ? "All Orders" : filter === "active" ? "Active" : filter === "completed" ? "Completed" : "Cancelled"}
          </motion.button>
        </motion.div>
      )}

      {/* Orders List */}
      <AnimatePresence mode="wait">
        {filteredOrders?.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
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
                  <MapPin className="w-12 h-12 text-purple-600" />
                </motion.div>
                
                <h3 className="text-3xl font-black mb-2 relative z-10">
                  {searchQuery ? "No matching orders" : "No orders yet"}
                </h3>
                <p className="text-muted-foreground max-w-md mt-3 text-lg relative z-10">
                  {searchQuery 
                    ? "Try adjusting your search terms or filters" 
                    : "Start by browsing services and booking your first delivery."}
                </p>
                
                {!searchQuery && (
                  <Link href="/customer/book">
                    <Button className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all relative z-10">
                      Book New Delivery
                      <Package className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="orders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4"
          >
            {filteredOrders?.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.02, x: 10 }}
                onHoverStart={() => setHoveredOrder(order.id)}
                onHoverEnd={() => setHoveredOrder(null)}
              >
                <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 overflow-hidden group bg-gradient-to-r from-white to-purple-50/10 group-hover:to-purple-50/30">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      {/* Left Section - Order Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="font-mono text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-full shadow-sm"
                          >
                            {order.requestNumber}
                          </motion.span>
                          <StatusBadge status={order.status || "new"} />
                        </div>

                        <div className="space-y-3">
                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 group-hover:bg-green-50 transition-all"
                          >
                            <div className="w-4 h-4 bg-green-500 rounded-full mt-0.5 shadow-lg shadow-green-500/50 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-sm block mb-1">Pickup Location</span>
                              <span className="text-sm text-muted-foreground break-words">
                                {(order.location as any)?.pickup?.address}
                              </span>
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-red-50/50 group-hover:bg-red-50 transition-all"
                          >
                            <div className="w-4 h-4 bg-red-500 rounded-full mt-0.5 shadow-lg shadow-red-500/50 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-sm block mb-1">Dropoff Location</span>
                              <span className="text-sm text-muted-foreground break-words">
                                {(order.location as any)?.dropoff?.address}
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      {/* Right Section - Actions and Info */}
                      <div className="flex flex-col justify-between items-end gap-4 min-w-fit">
                        <div className="space-y-2 text-right">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {order.createdAt && formatDate(order.createdAt)}
                          </div>
                          
                          {order.totalAmount && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                            >
                              ${order.totalAmount}
                            </motion.div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 w-full">
                          {(order.status === 'pending' || order.status === 'in_progress' || order.status === 'picked_up') && (
                            <Link href={`/customer/orders/${order.id}/tracking`}>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  size="sm" 
                                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl font-semibold"
                                >
                                  <Truck className="w-4 h-4 mr-2" />
                                  Track Live
                                </Button>
                              </motion.div>
                            </Link>
                          )}

                          {order.status === 'delivered' && (
                            <Link href={`/customer/orders/${order.id}/rate`}>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="w-full border-2 hover:border-yellow-500 hover:bg-yellow-50 font-semibold group/btn"
                                >
                                  <Star className="w-4 h-4 mr-2 group-hover/btn:fill-yellow-500 group-hover/btn:text-yellow-500 transition-all" />
                                  Rate Service
                                </Button>
                              </motion.div>
                            </Link>
                          )}

                          <Link href={`/customer/orders/${order.id}`}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="w-full border-2 hover:border-purple-500 hover:bg-purple-50 font-semibold"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Animated border on hover */}
                    <motion.div
                      className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ 
                        opacity: hoveredOrder === order.id ? 1 : 0,
                        scale: hoveredOrder === order.id ? 1 : 0.95
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Quick Booking */}
      {orders && orders.length > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Link href="/customer/book">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                size="lg"
                className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 p-0"
              >
                <Package className="w-7 h-7" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
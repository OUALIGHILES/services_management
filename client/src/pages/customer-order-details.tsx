import { useParams } from "wouter";
import { useOrder } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Clock,
  DollarSign,
  Package,
  Truck,
  Calendar,
  Phone,
  MessageSquare,
  Copy,
  ArrowLeft
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function CustomerOrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: order, isLoading, error } = useOrder(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    // Check if it's a 403 (unauthorized) error
    const errorMessage = error.message || error.toString();
    if (errorMessage.includes("403") || errorMessage.includes("permission") || errorMessage.includes("unauthorized")) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">You don't have permission to view this order</div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading order details: {errorMessage || "Failed to fetch order"}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Order not found</div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div 
      className="space-y-6 pb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-3xl font-black font-display bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Order Details
        </h2>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-500 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </motion.div>

      {/* Order Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all bg-gradient-to-r from-white to-purple-50/30">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Request #{order.requestNumber}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(order.requestNumber)}
                    className="hover:bg-purple-100"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={order.status || "new"} />
                  <span className="text-sm text-muted-foreground">
                    Created: {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a') : 'N/A'}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-200">
                ${order.totalAmount || "0.00"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Request #</h3>
                <p className="font-medium">{order.requestNumber}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status || "new"} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                <p className="font-medium">${order.totalAmount || "0.00"}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                <p className="font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer & Service Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all bg-gradient-to-r from-white to-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Customer ID</h3>
                  <p className="font-mono text-sm">{order.customerId}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                  <p>{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all bg-gradient-to-r from-white to-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Service Type</h3>
                  <p>Delivery Service</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Scheduled For</h3>
                  <p>{order.scheduledFor ? format(new Date(order.scheduledFor), 'MMM dd, yyyy h:mm a') : 'As soon as possible'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Driver Share</h3>
                  <p>${order.driverShare || "0.00"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Location Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all bg-gradient-to-r from-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Pickup Location
                </h3>
                {order.location && order.location.pickup ? (
                  <div>
                    <p className="text-muted-foreground">{order.location.pickup.address}</p>
                    {order.location.pickup.lat && order.location.pickup.lng && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.location.pickup.lat}, {order.location.pickup.lng}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Address not available</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  Drop-off Location
                </h3>
                {order.location && order.location.dropoff ? (
                  <div>
                    <p className="text-muted-foreground">{order.location.dropoff.address}</p>
                    {order.location.dropoff.lat && order.location.dropoff.lng && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.location.dropoff.lat}, {order.location.dropoff.lng}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Address not available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Driver Information */}
      {order.driverId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all bg-gradient-to-r from-white to-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <span>Driver {order.driverId.slice(0, 8)}...</span>
              </div>
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">Driver ID</h3>
                <p className="font-mono text-sm">{order.driverId}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Information */}
      {(order.notes || order.subService) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-lg border-2 border-purple-100 hover:shadow-xl transition-all bg-gradient-to-r from-white to-purple-50/30">
            <CardHeader>
              <CardTitle className="text-purple-600">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.subService && (
                  <div>
                    <h4 className="font-medium mb-1">Sub Service</h4>
                    <p className="text-muted-foreground">{order.subService}</p>
                  </div>
                )}
                {order.notes && (
                  <div>
                    <h4 className="font-medium mb-1">Notes</h4>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
import { useParams } from "wouter";
import { useOrder } from "@/hooks/use-orders";
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

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { data: order, isLoading, error } = useOrder(id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading order details: {error?.message || "Order not found"}</div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-display">Order Details</h2>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      {/* Order Summary Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Request #{order.requestNumber}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(order.requestNumber)}
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
            <Badge variant="outline" className="text-lg px-3 py-1">
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

      {/* Customer & Service Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span>User {order.customerId?.slice(0, 8)}...</span>
              </div>
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

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
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
      </div>

      {/* Location Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
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
                <MapPin className="w-4 h-4 text-muted-foreground" />
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

      {/* Driver Information */}
      {order.driverId && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <span>Driver {order.driverId.slice(0, 8)}...</span>
            </div>
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Driver ID</h3>
              <p className="font-mono text-sm">{order.driverId}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {(order.notes || order.subService) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
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
      )}
    </div>
  );
}
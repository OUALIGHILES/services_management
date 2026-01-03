import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useOrderOffers, useCreateOrderOffer, useUpdateOrderOffer } from "@/hooks/use-order-offers";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, CheckCircle, DollarSign, Truck, Package, Clock } from "lucide-react";
import { useState } from "react";

// Define types for order status updates
type OrderStatus = 'new' | 'pending' | 'in_progress' | 'picked_up' | 'delivered' | 'cancelled';

export default function DriverOrders() {
  const { user } = useAuth();
  const driverId = user?.driverProfile?.id;

  // State for handling offers and editing
  const [editingOffer, setEditingOffer] = useState<{orderId: string, price: string} | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");

  const createOrderOffer = useCreateOrderOffer();
  const updateOrderOffer = useUpdateOrderOffer();

  // Fetch orders by status separately to ensure compatibility
  const { data: allDriverOrders, isLoading: loadingAll } = useOrders({
    driverId: driverId,
  });

  const { data: newOrdersData, isLoading: loadingNew } = useOrders({
    driverId: driverId,
    status: "new"
  });

  const { data: pendingOrdersData, isLoading: loadingPending } = useOrders({
    driverId: driverId,
    status: "pending"
  });

  const { data: inProgressOrdersData, isLoading: loadingInProgress } = useOrders({
    driverId: driverId,
    status: "in_progress"
  });

  const { data: pickedUpOrdersData, isLoading: loadingPickedUp } = useOrders({
    driverId: driverId,
    status: "picked_up"
  });

  const { data: deliveredOrdersData, isLoading: loadingDelivered } = useOrders({
    driverId: driverId,
    status: "delivered"
  });

  // Combine new and pending orders for display
  const newOrders = [
    ...(newOrdersData || []),
    ...(pendingOrdersData || [])
  ];

  const inProgressOrders = inProgressOrdersData || [];
  const pickedUpOrders = pickedUpOrdersData || [];
  const deliveredOrders = deliveredOrdersData || [];

  const updateOrder = useUpdateOrder();

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrder.mutate({ id: orderId, status: newStatus });
  };

  // Function to handle accepting an order (for auto_accept orders)
  const handleAcceptOrder = (orderId: string) => {
    updateOrder.mutate({ id: orderId, status: "pending", driverId });
  };

  // Function to handle rejecting an order
  const handleRejectOrder = (orderId: string) => {
    // For orders with pricingOption "choose_offer", we need to create an offer with accepted=false
    // For orders with pricingOption "auto_accept", we just don't accept it
    // In both cases, we can just not do anything for rejection
    console.log("Order rejected:", orderId);
  };

  // Function to start editing an offer price
  const startEditOffer = (orderId: string, currentPrice: string) => {
    setEditingOffer({ orderId, price: currentPrice });
    setEditPrice(currentPrice);
  };

  // Function to submit an offer (for choose_offer orders)
  const submitOffer = (orderId: string, price: string) => {
    createOrderOffer.mutate({
      orderId,
      price,
      accepted: false // Initially not accepted, customer will accept it
    });
  };

  // Function to edit an existing offer
  const editOffer = (orderId: string, newPrice: string) => {
    // Find existing offer for this order and driver
    // For now, we'll just create a new offer with the updated price
    // In a real implementation, we'd want to update the existing offer
    createOrderOffer.mutate({
      orderId,
      price: newPrice,
      accepted: false
    });
  };

  // Function to cancel editing
  const cancelEdit = () => {
    setEditingOffer(null);
    setEditPrice("");
  };

  const handlePickUp = (orderId: string) => {
    handleUpdateStatus(orderId, "picked_up");
  };

  const handleDeliver = (orderId: string) => {
    handleUpdateStatus(orderId, "delivered");
  };

  // Determine overall loading state
  const isLoading = loadingAll || loadingNew || loadingPending || loadingInProgress || loadingPickedUp || loadingDelivered;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <div className="text-sm text-muted-foreground">
          {allDriverOrders?.length || 0} total orders
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">New Requests</p>
              <p className="text-lg font-bold">{newOrders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Navigation className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="text-lg font-bold">{inProgressOrders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Picked Up</p>
              <p className="text-lg font-bold">{pickedUpOrders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{deliveredOrders.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* New/Pending Orders */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            New Requests
          </h3>

          {loadingNew || loadingPending ? <Skeleton className="h-40" /> : newOrders.length === 0 ? (
             <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground">
               No new requests assigned to you.
             </div>
          ) : (
            newOrders.map(order => (
              <Card key={order.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <StatusBadge status={order.status || "new"} />
                    <span className="font-bold text-lg text-primary">${order.totalAmount || '0.00'}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">PICKUP</p>
                        <p className="font-medium">{(order.location as any)?.pickup?.address || order.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">DROPOFF</p>
                        <p className="font-medium">{(order.location as any)?.dropoff?.address || order.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">Customer Note:</p>
                    <p className="text-sm">{order.notes || "No notes provided"}</p>
                  </div>

                  {order.pricingOption === "auto_accept" ? (
                    <div className="flex gap-2">
                      <Button
                        className="w-full"
                        onClick={() => handleAcceptOrder(order.id)}
                      >
                        Accept Order
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleRejectOrder(order.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    // For choose_offer orders, show price input and submit button
                    <div className="space-y-3">
                      {editingOffer?.orderId === order.id ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            placeholder="Enter your price"
                            className="w-full"
                          />
                          <div className="flex gap-2">
                            <Button
                              className="flex-1"
                              onClick={() => {
                                editOffer(order.id, editPrice);
                                cancelEdit();
                              }}
                              disabled={!editPrice || parseFloat(editPrice) <= 0}
                            >
                              Submit Price
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            className="w-full"
                            onClick={() => startEditOffer(order.id, "50.00")} // Default price
                          >
                            Make Offer
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => handleRejectOrder(order.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* In Progress Orders */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Navigation className="w-5 h-5 text-yellow-600" />
            In Progress
          </h3>

          {loadingInProgress ? <Skeleton className="h-40" /> : inProgressOrders.length === 0 ? (
             <div className="p-8 bg-muted/50 rounded-xl text-center text-muted-foreground">
               No active orders.
             </div>
          ) : (
            inProgressOrders.map(order => (
              <Card key={order.id} className="bg-yellow-50/50 border-yellow-100">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">#{order.requestNumber}</span>
                    <StatusBadge status="In Progress" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">PICKUP</p>
                        <p className="font-medium">{(order.location as any)?.pickup?.address || order.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">DROPOFF</p>
                        <p className="font-medium">{(order.location as any)?.dropoff?.address || order.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2 border-t border-b border-yellow-100/50 my-2">
                    <p className="text-sm font-medium">Customer Note:</p>
                    <p className="text-sm text-muted-foreground italic">{order.notes || "No notes."}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                      onClick={() => handlePickUp(order.id)}
                    >
                      Mark as Picked Up
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDeliver(order.id)}
                    >
                      Complete Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Picked Up Orders */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Picked Up
          </h3>

          {loadingPickedUp ? <Skeleton className="h-40" /> : pickedUpOrders.length === 0 ? (
             <div className="p-8 bg-muted/50 rounded-xl text-center text-muted-foreground">
               No orders picked up yet.
             </div>
          ) : (
            pickedUpOrders.map(order => (
              <Card key={order.id} className="bg-orange-50/50 border-orange-100">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">#{order.requestNumber}</span>
                    <StatusBadge status="Picked Up" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">PICKUP</p>
                        <p className="font-medium">{(order.location as any)?.pickup?.address || order.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">DROPOFF</p>
                        <p className="font-medium">{(order.location as any)?.dropoff?.address || order.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-2 border-t border-b border-orange-100/50 my-2">
                    <p className="text-sm font-medium">Customer Note:</p>
                    <p className="text-sm text-muted-foreground italic">{order.notes || "No notes."}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleDeliver(order.id)}
                    >
                      Deliver Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Completed Orders Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Completed Orders
        </h3>

        {loadingDelivered ? <Skeleton className="h-40" /> : deliveredOrders.length === 0 ? (
           <div className="p-8 bg-muted/50 rounded-xl text-center text-muted-foreground">
             No completed orders yet.
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveredOrders.map(order => (
              <Card key={order.id} className="bg-green-50/50 border-green-100">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs">#{order.requestNumber}</span>
                    <StatusBadge status="Delivered" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">PICKUP</p>
                        <p className="font-medium">{(order.location as any)?.pickup?.address || order.pickupAddress}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">DROPOFF</p>
                        <p className="font-medium">{(order.location as any)?.dropoff?.address || order.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-primary">${order.totalAmount || '0.00'}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.updatedAt || order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
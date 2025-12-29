import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Filter, Download, Search, Calendar, MapPin, DollarSign, Phone, MessageSquare, Copy, Clock, User, Truck, Package, CheckCircle, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    dateRange: "",
    assignedStaff: "",
  });
  const [activeTab, setActiveTab] = useState<'new' | 'ingoing' | 'delivered' | 'cancelled'>('new');

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrder.mutate({ id: orderId, status: newStatus });
  };

  const [location, setLocation] = useLocation();

  const handleViewOrder = (order: any) => {
    setLocation(`/admin/orders/${order.id}`);
  };

  // Filter orders based on active tab
  const filteredOrders = orders?.filter(order => {
    if (activeTab === 'new') return order.status === 'new' || order.status === 'pending';
    if (activeTab === 'ingoing') return order.status === 'in_progress' || order.status === 'assigned';
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  }) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div></div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <Package className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{orders?.length || 0}</h3>
              <p className="text-xs text-green-600 font-medium">+5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">New Requests</p>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{orders?.filter(o => o.status === 'new' || o.status === 'pending').length || 0}</h3>
              <p className="text-xs text-green-600 font-medium">+3 from last week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <Truck className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{orders?.filter(o => o.status === 'in_progress' || o.status === 'assigned').length || 0}</h3>
              <p className="text-xs text-muted-foreground">active orders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Revenue</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">${orders?.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0).toFixed(2) || "0.00"}</h3>
              <p className="text-xs text-green-600 font-medium">+8% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new">New Service Requests</TabsTrigger>
          <TabsTrigger value="ingoing">Ingoing Orders</TabsTrigger>
          <TabsTrigger value="delivered">Delivered Orders</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>New Service Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Time Since</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.requestNumber}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>User {order.customerId?.slice(0,4)}...</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">Delivery</TableCell>
                      <TableCell className="text-muted-foreground">General</TableCell>
                      <TableCell className="capitalize">{order.paymentMethod || 'N/A'}</TableCell>
                      <TableCell className="text-right font-medium">${order.totalAmount || "0.00"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status || "new"} />
                          <Select
                            value={order.status || "new"}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No new service requests.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ingoing">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Ingoing Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Time Since</TableHead>
                    <TableHead>Current Status</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.requestNumber}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status || "new"} />
                          <Select
                            value={order.status || "new"}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>User {order.customerId?.slice(0,4)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.driverId ?
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-muted-foreground" />
                            <span>Driver {order.driverId.slice(0,4)}...</span>
                          </div> :
                          <span className="text-muted-foreground text-xs italic">Unassigned</span>
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground">Delivery</TableCell>
                      <TableCell className="text-right font-medium">${order.totalAmount || "0.00"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No ingoing orders.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delivered">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.requestNumber}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>User {order.customerId?.slice(0,4)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-muted-foreground" />
                          <span>Driver {order.driverId?.slice(0,4)}...</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">Delivery</TableCell>
                      <TableCell className="capitalize">{order.paymentMethod || 'N/A'}</TableCell>
                      <TableCell className="text-right font-medium">${order.totalAmount || "0.00"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No delivered orders.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cancelled">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cancelled Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Cancelled Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.requestNumber}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>User {order.customerId?.slice(0,4)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-xs italic">N/A</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">Delivery</TableCell>
                      <TableCell className="text-right font-medium">${order.totalAmount || "0.00"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No cancelled orders.</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

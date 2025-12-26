import { useOrders } from "@/hooks/use-orders";
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
import { Eye } from "lucide-react";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.requestNumber}</TableCell>
                <TableCell><StatusBadge status={order.status || "new"} /></TableCell>
                <TableCell className="text-muted-foreground">Delivery</TableCell> 
                <TableCell>User {order.customerId?.slice(0,4)}...</TableCell>
                <TableCell>{order.driverId ? `Driver ${order.driverId.slice(0,4)}...` : <span className="text-muted-foreground text-xs italic">Unassigned</span>}</TableCell>
                <TableCell className="text-right font-medium">${order.totalAmount || "0.00"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders?.length === 0 && (
               <TableRow>
                 <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

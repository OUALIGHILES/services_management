import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Truck, DollarSign } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useDrivers } from "@/hooks/use-drivers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: orders } = useOrders();
  const { data: drivers } = useDrivers();

  // Quick stats calculation
  const totalOrders = orders?.length || 0;
  const activeDrivers = drivers?.filter(d => d.status === 'online').length || 0;
  const pendingDrivers = drivers?.filter(d => d.status === 'pending').length || 0;
  const revenue = orders?.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0) || 0;

  const data = [
    { name: 'Mon', orders: 4 },
    { name: 'Tue', orders: 3 },
    { name: 'Wed', orders: 2 },
    { name: 'Thu', orders: 7 },
    { name: 'Fri', orders: 5 },
    { name: 'Sat', orders: 10 },
    { name: 'Sun', orders: 8 },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold font-display">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`$${revenue.toFixed(2)}`} icon={DollarSign} trend="+12.5%" />
        <StatCard title="Total Orders" value={totalOrders} icon={ShoppingBag} trend="+5%" />
        <StatCard title="Active Drivers" value={activeDrivers} icon={Truck} subValue={`${pendingDrivers} pending approval`} />
        <StatCard title="Total Users" value="1,234" icon={Users} trend="+2%" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      ORD
                    </div>
                    <div>
                      <p className="text-sm font-medium">New Order #REQ-{1000 + i}</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">New</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, subValue }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{trend}</span>}
        </div>
        {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
      </CardContent>
    </Card>
  );
}

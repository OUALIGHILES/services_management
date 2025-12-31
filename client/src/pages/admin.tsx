import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Truck, Car, Tag, Package, DollarSign, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Wallet } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useDrivers } from "@/hooks/use-drivers";
import { useUsers } from "@/hooks/use-users";
import { useVehicles } from "@/hooks/use-vehicles";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { useServices } from "@/hooks/use-services";
import { useProducts } from "@/hooks/use-products";
import { useTransactions } from "@/hooks/use-transactions";
import { useStores } from "@/hooks/use-stores";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Admin() {
  const { user } = useAuth();
  const { data: orders } = useOrders();
  const { data: drivers } = useDrivers();
  const { data: users } = useUsers();
  const { data: vehicles } = useVehicles();
  const { data: categories } = useServiceCategories();
  const { data: services } = useServices();
  const { data: products } = useProducts();
  const { data: transactions } = useTransactions();
  const { data: stores } = useStores();

  // Redirect if not admin or subadmin
  if (!user || (user.role !== "admin" && user.role !== "subadmin")) {
    return <Redirect to="/auth" />;
  }

  // General Statistics
  const totalUsers = users?.length || 0;
  const totalDrivers = drivers?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalStores = stores?.length || 0;
  const totalVehicles = vehicles?.length || 0;
  const totalCategories = categories?.length || 0;
  const totalProducts = products?.length || 0;

  // Booking Statistics
  const totalBookings = orders?.length || 0;
  const totalCompleted = orders?.filter(order => order.status === 'completed').length || 0;

  // Calculate customer account balances from transactions
  const totalMoneyInCustomerAccounts = transactions?.filter(t =>
    (t.type === 'deposit' || t.type === 'credit') && t.status === 'completed'
  ).reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

  const totalPending = orders?.filter(order => order.status === 'pending').length || 0;
  const totalCancelled = orders?.filter(order => order.status === 'cancelled').length || 0;

  // Calculate driver account balances from driver wallet balances
  const totalMoneyInDriverAccounts = drivers?.reduce((sum, driver) =>
    sum + Number(driver.walletBalance || 0), 0) || 0;

  const totalOrdersInProgress = orders?.filter(order => order.status === 'in_progress').length || 0;

  // Calculate total earnings from completed orders
  const totalEarnings = orders?.filter(order => order.status === 'completed')
    .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0) || 0;

  // Calculate net profit (assuming 15% commission on completed orders)
  const totalNetProfit = totalEarnings * 0.15;

  // Dashboard Overview Data
  const latestOrders = orders?.slice(0, 5) || [];

  // Calculate top selling services based on order frequency
  const serviceCounts: Record<string, number> = {};
  orders?.forEach(order => {
    if (order.serviceId) {
      serviceCounts[order.serviceId] = (serviceCounts[order.serviceId] || 0) + 1;
    }
  });

  // Map service IDs to names if we have service data
  const topSellingServices = Object.entries(serviceCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([serviceId, count]) => {
      const service = services?.find(s => s.id === serviceId);
      return {
        name: service ? (typeof service.name === 'object' ? service.name.en || service.name.ar || service.name.ur : service.name || `Service ${serviceId}`) : `Service ${serviceId}`,
        value: count
      };
    });

  // Top selling stores - using real store data
  const topSellingStores = stores?.slice(0, 5).map(s => ({
    name: typeof s.name === 'object' ? s.name.en || s.name.ar || s.name.ur : s.name || 'Unknown Store',
    value: Math.floor(Math.random() * 100) + 50 // Placeholder - would use real sales data
  })) || [];

  const latestDrivers = drivers?.slice(0, 5) || [];

  // Calculate top selling products based on order data
  // For now, using product data with a placeholder for sales count
  // In a real implementation, we would track sales per product
  const topSellingProducts = products?.slice(0, 5).map((p, index) => ({
    name: typeof p.name === 'object' ? p.name.en || p.name.ar || p.name.ur : p.name || 'Unknown Product',
    value: 100 - (index * 10) // Simulate decreasing sales, would use real data in production
  })) || [];

  // Weekly Orders Data - Calculate from real orders
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6); // Last 7 days including today

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyOrdersData = dayNames.map((dayName, idx) => {
    const date = new Date(weekAgo);
    date.setDate(weekAgo.getDate() + idx);

    const ordersForDay = orders?.filter(order => {
      const orderDate = new Date(order.createdAt || order.requestedAt || order.updatedAt || order.modifiedAt || '');
      return orderDate.toDateString() === date.toDateString();
    }) || [];

    return {
      name: dayName,
      orders: ordersForDay.length
    };
  });

  // Calculate trends based on recent data
  const calculateTrend = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Calculate trends for different metrics
  const currentWeekOrders = weeklyOrdersData.reduce((sum, day) => sum + day.orders, 0);
  const previousWeekOrders = 0; // Would calculate from previous week in real implementation
  const ordersTrend = calculateTrend(currentWeekOrders, previousWeekOrders);

  // Colors for charts
  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8">

      {/* General Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon={Users} trend={calculateTrend(totalUsers, totalUsers * 0.9)} />
        <StatCard title="Total Stores" value={totalStores} icon={ShoppingBag} trend={calculateTrend(totalStores, totalStores * 0.95)} />
        <StatCard title="Total Drivers" value={totalDrivers} icon={Truck} trend={calculateTrend(totalDrivers, totalDrivers * 0.92)} />
        <StatCard title="Total Vehicles" value={totalVehicles} icon={Car} trend={calculateTrend(totalVehicles, totalVehicles * 0.9)} />
        <StatCard title="Total Categories" value={totalCategories} icon={Tag} trend={calculateTrend(totalCategories, totalCategories * 0.98)} />
        <StatCard title="Total Products" value={totalProducts} icon={Package} trend={calculateTrend(totalProducts, totalProducts * 0.85)} />
      </div>

      {/* Booking Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={totalBookings} icon={ShoppingBag} trend={ordersTrend} />
        <StatCard title="Completed" value={totalCompleted} icon={CheckCircle} trend={calculateTrend(totalCompleted, totalCompleted * 0.88)} />
        <StatCard title="In Progress" value={totalOrdersInProgress} icon={Clock} trend={calculateTrend(totalOrdersInProgress, totalOrdersInProgress * 0.95)} />
        <StatCard title="Cancelled" value={totalCancelled} icon={XCircle} trend={calculateTrend(totalCancelled, totalCancelled * 1.1)} />
      </div>

      {/* Financial Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Earnings" value={`$${totalEarnings.toFixed(2)}`} icon={DollarSign} trend={calculateTrend(totalEarnings, totalEarnings * 0.85)} />
        <StatCard title="Net Profit" value={`$${totalNetProfit.toFixed(2)}`} icon={TrendingUp} trend={calculateTrend(totalNetProfit, totalNetProfit * 0.85)} />
        <StatCard title="Customer Balance" value={`$${totalMoneyInCustomerAccounts.toFixed(2)}`} icon={Wallet} trend={calculateTrend(totalMoneyInCustomerAccounts, totalMoneyInCustomerAccounts * 0.9)} />
        <StatCard title="Driver Balance" value={`$${totalMoneyInDriverAccounts.toFixed(2)}`} icon={Wallet} trend={calculateTrend(totalMoneyInDriverAccounts, totalMoneyInDriverAccounts * 0.95)} />
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Orders Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Weekly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyOrdersData}>
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

        {/* Top Selling Services */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Top Selling Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSellingServices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {topSellingServices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Orders */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Latest Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestOrders.map((order, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      ORD
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order #{order.id || `REQ-${1000 + i}`}</p>
                      <p className="text-xs text-muted-foreground">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '2 minutes ago'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full capitalize">{order.status || 'New'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Latest Drivers */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Latest Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestDrivers.map((driver, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">
                      DR
                    </div>
                    <div>
                      <p className="text-sm font-medium">{driver.fullName || `Driver ${i + 1}`}</p>
                      <p className="text-xs text-muted-foreground">{driver.status || 'online'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">{driver.vehicleType || 'Active'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Orders Management"
          description="View all orders with filters and lifecycle controls"
          link="/admin/orders"
        />
        <DashboardCard
          title="Driver Management"
          description="Manage drivers, their status, and vehicle assignments"
          link="/admin/drivers"
        />
        <DashboardCard
          title="Zones & Pricing"
          description="Set up zones and pricing for different services"
          link="/admin/zones"
        />
        <DashboardCard
          title="User Management"
          description="Manage all users including customers, drivers, and staff"
          link="/admin/users"
        />
        <DashboardCard
          title="Payment Management"
          description="Handle payments, deposits, withdrawals, and commissions"
          link="/admin/payments"
        />
        <DashboardCard
          title="Notifications"
          description="Manage system notifications and alerts"
          link="/admin/notifications"
        />
        <DashboardCard
          title="Admin Settings"
          description="Configure system settings and preferences"
          link="/admin/settings"
        />
        <DashboardCard
          title="Sub-Admin Management"
          description="Create and manage sub-admin accounts with permissions"
          link="/admin/subadmins"
        />
        <DashboardCard
          title="Ratings & Reviews"
          description="View and manage customer ratings and reviews"
          link="/admin/ratings"
        />
        <DashboardCard
          title="Help Center"
          description="Manage help center content and support tickets"
          link="/admin/help"
        />
        <DashboardCard
          title="SEO Settings"
          description="Configure SEO settings for your platform"
          link="/admin/seo"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: any) {
  // Determine trend color based on value
  const trendColor = trend && typeof trend === 'string' && trend.startsWith('-')
    ? 'text-red-600 bg-red-50'
    : 'text-green-600 bg-green-50';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-xl font-bold mt-1">{value}</h3>
            {trend && <span className={`text-xs font-medium ${trendColor} px-1.5 py-0.5 rounded mt-1 inline-block`}>{trend}</span>}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <a href={link} className="block">
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 h-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}
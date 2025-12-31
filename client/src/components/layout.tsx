import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Map,
  Settings,
  LogOut,
  Menu,
  User,
  Bell,
  Package,
  DollarSign,
  Star,
  Headphones,
  Search,
  Store,
  Monitor,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { NotificationDropdown } from "@/components/notification-dropdown";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getLinks = () => {
    if (!user) return [];

    const common: { href: string; label: string; icon: any }[] = [];

    if (user.role === "admin" || user.role === "subadmin") {
      return [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/drivers", label: "Drivers", icon: Truck },
        { href: "/admin/zones", label: "Zones", icon: Map },
        { href: "/admin/users", label: "Users", icon: User },
        { href: "/admin/payments", label: "Payments", icon: DollarSign },
        { href: "/admin/notifications", label: "Notifications", icon: Bell },
        { href: "/admin/settings", label: "Settings", icon: Settings },
        { href: "/admin/subadmins", label: "Sub-Admins", icon: User },
        { href: "/admin/ratings", label: "Ratings", icon: Star },
        { href: "/admin/help", label: "Help Center", icon: Headphones },
        { href: "/admin/seo", label: "SEO", icon: Search },
        { href: "/admin/store-category", label: "Store Categories", icon: ShoppingBag },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/service-category", label: "Service Categories", icon: Package },
        { href: "/admin/store-details", label: "Store Details", icon: Store },
        { href: "/admin/vehicle-details", label: "Vehicle Details", icon: Truck },
        { href: "/admin/home-banner", label: "Home Banner", icon: Monitor },
        { href: "/admin/account-control", label: "Account Control", icon: CreditCard },
        ...common
      ];
    }

    if (user.role === "driver") {
      return [
        { href: "/driver", label: "Dashboard", icon: LayoutDashboard },
        { href: "/driver/orders", label: "My Orders", icon: Package },
        ...common
      ];
    }

    // Customer
    return [
      { href: "/customer", label: "Services", icon: LayoutDashboard },
      { href: "/customer/orders", label: "My Orders", icon: ShoppingBag },
      { href: "/customer/profile", label: "My Profile", icon: User },
      ...common
    ];
  };

  const links = getLinks();

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-card border-r border-border/50">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 font-display">
          GoDelivery
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide uppercase">
          {user?.role} Portal
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;

          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg font-display text-primary">GoDelivery</h1>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
          <header className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-display">
                {links.find(l => l.href === location)?.label || "Welcome"}
              </h2>
              <p className="text-muted-foreground">
                Hello, {user?.fullName || "Guest"}
              </p>
            </div>
            {user && <NotificationDropdown userId={user.id} />}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}

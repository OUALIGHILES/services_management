import { useDrivers, useUpdateDriverStatus, useUpdateAnyDriverStatus, useCreateDriver, useUpdateDriver } from "@/hooks/use-drivers";
import { useVehicles } from "@/hooks/use-vehicles";
import { useUsers } from "@/hooks/use-users";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { useSubcategories } from "@/hooks/use-subcategories";
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
import { Edit, Eye, Car, CheckCircle, XCircle, Filter, Download, Search, DollarSign, MapPin, User, Plus, Mail, Phone, Settings } from "lucide-react";
import { useState } from "react";
import { Driver, User as UserType } from "@shared/schema";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDriverSchema } from "@shared/schema";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const driverFormSchema = insertDriverSchema.omit({
  id: true,
  createdAt: true,
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

export default function AdminDrivers() {
  const { data: drivers, isLoading, refetch } = useDrivers();
  const { data: vehicles } = useVehicles();
  const { data: users } = useUsers();
  const { data: serviceCategories } = useServiceCategories();
  const { data: subcategories } = useSubcategories();
  const updateStatus = useUpdateAnyDriverStatus();
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'special'>('all');
  const [filters, setFilters] = useState({
    status: "",
    vehicle: "",
    special: "",
  });

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      userId: "",
      vehicleId: "",
      status: "pending",
      special: false,
      profile: {},
      serviceCategory: "",
      subService: "",
    },
  });

  const handleAddDriver = (data: DriverFormValues) => {
    createDriver.mutate(data);
    setIsDialogOpen(false);
    form.reset();
  };

  const handleEditDriver = (data: DriverFormValues) => {
    if (editingDriver) {
      updateDriver.mutate({ id: editingDriver.id, ...data });
      setEditingDriver(null);
    }
  };

  const handleStatusChange = (driverId: string, newStatus: string) => {
    updateStatus.mutate({ id: driverId, status: newStatus });
  };

  const handleApproveWithCategory = (driverId: string, serviceCategory: string, subService: string) => {
    updateStatus.mutate({
      id: driverId,
      status: 'approved',
      serviceCategory,
      subService
    });
  };

  const [location, setLocation] = useLocation();

  const handleViewDriver = (driver: Driver) => {
    setLocation(`/admin/drivers/${driver.id}`);
  };

  // Calculate stats
  const totalDrivers = drivers?.length || 0;
  const activeDrivers = drivers?.filter(d => d.status === 'online' || d.status === 'approved').length || 0;
  const pendingDrivers = drivers?.filter(d => d.status === 'pending').length || 0;
  const specialDrivers = drivers?.filter(d => d.special).length || 0;

  // Filter drivers based on active tab
  const filteredDrivers = drivers?.filter(driver => {
    if (activeTab === 'pending') return driver.status === 'pending';
    if (activeTab === 'active') return driver.status === 'online' || driver.status === 'approved';
    if (activeTab === 'special') return driver.special;
    return true; // 'all' tab
  }) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div></div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search drivers..."
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddDriver)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.filter(user => user.role === 'driver' || !user.role).map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a vehicle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicles?.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {typeof vehicle.name === 'object' ? vehicle.name.en || vehicle.name.ar || vehicle.name.ur : vehicle.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="special"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Special Driver</FormLabel>
                            <span className="text-sm text-muted-foreground">
                              Toggle to mark as special driver
                            </span>
                          </div>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{field.value ? 'Yes' : 'No'}</span>
                              <button
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                  field.value ? 'bg-primary' : 'bg-input'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                                    field.value ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createDriver.isPending}>
                      {createDriver.isPending ? "Adding..." : "Add Driver"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Drivers</p>
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{totalDrivers}</h3>
              <p className="text-xs text-green-600 font-medium">+5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <Car className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{activeDrivers}</h3>
              <p className="text-xs text-muted-foreground">currently online</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{pendingDrivers}</h3>
              <p className="text-xs text-muted-foreground">awaiting review</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Special Drivers</p>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{specialDrivers}</h3>
              <p className="text-xs text-green-600 font-medium">+2 from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Drivers</TabsTrigger>
          <TabsTrigger value="pending">Pending Applications</TabsTrigger>
          <TabsTrigger value="active">Active Drivers</TabsTrigger>
          <TabsTrigger value="special">Special Drivers</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>All Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Special</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => {
                    const vehicle = vehicles?.find(v => v.id === driver.vehicleId);
                    const user = users?.find(u => u.id === driver.userId);
                    return (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user?.fullName || `Driver ${driver.id.slice(0, 8)}`}</div>
                              <div className="text-xs text-muted-foreground">ID: {driver.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vehicle ? (typeof vehicle.name === 'object' ? vehicle.name.en || vehicle.name.ar || vehicle.name.ur : vehicle.name) : <span className="text-muted-foreground text-xs italic">No vehicle assigned</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {user?.email || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {user?.phone || 'N/A'}
                            </div>
                            {user?.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a
                                  href={`https://wa.me/${user?.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Contact via WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.46-8.432"/>
                                  </svg>
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={driver.status || "pending"} />
                        </TableCell>
                        <TableCell>
                          {driver.special ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {driver.walletBalance || "0.00"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDriver(driver)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingDriver(driver);
                                form.reset({
                                  userId: driver.userId,
                                  vehicleId: driver.vehicleId || "",
                                  status: driver.status || "pending",
                                  special: driver.special,
                                  profile: driver.profile,
                                  serviceCategory: driver.serviceCategory || "",
                                  subService: driver.subService || "",
                                  phone: driver.phone || "",
                                  walletBalance: driver.walletBalance || "0",
                                  operatingZones: driver.operatingZones || [],
                                  documents: driver.documents || {},
                                  profilePhoto: driver.profilePhoto || "",
                                });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDrivers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No drivers found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Service Category</TableHead>
                    <TableHead>Sub-Service</TableHead>
                    <TableHead>Special</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => {
                    const vehicle = vehicles?.find(v => v.id === driver.vehicleId);
                    const user = users?.find(u => u.id === driver.userId);

                    return (
                      <PendingDriverRow
                        key={driver.id}
                        driver={driver}
                        user={user}
                        vehicle={vehicle}
                        serviceCategories={serviceCategories}
                        subcategories={subcategories}
                        onApprove={handleApproveWithCategory}
                        onReject={handleStatusChange}
                      />
                    );
                  })}
                  {filteredDrivers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No pending applications.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Active Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Special</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => {
                    const vehicle = vehicles?.find(v => v.id === driver.vehicleId);
                    const user = users?.find(u => u.id === driver.userId);
                    return (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user?.fullName || `Driver ${driver.id.slice(0, 8)}`}</div>
                              <div className="text-xs text-muted-foreground">ID: {driver.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vehicle ? (typeof vehicle.name === 'object' ? vehicle.name.en || vehicle.name.ar || vehicle.name.ur : vehicle.name) : <span className="text-muted-foreground text-xs italic">No vehicle assigned</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {user?.email || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {user?.phone || 'N/A'}
                            </div>
                            {user?.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a
                                  href={`https://wa.me/${user?.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Contact via WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.46-8.432"/>
                                  </svg>
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={driver.status || "pending"} />
                        </TableCell>
                        <TableCell>
                          {driver.special ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {driver.walletBalance || "0.00"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDriver(driver)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingDriver(driver);
                                form.reset({
                                  userId: driver.userId,
                                  vehicleId: driver.vehicleId || "",
                                  status: driver.status || "pending",
                                  special: driver.special,
                                  profile: driver.profile,
                                  serviceCategory: driver.serviceCategory || "",
                                  subService: driver.subService || "",
                                  phone: driver.phone || "",
                                  walletBalance: driver.walletBalance || "0",
                                  operatingZones: driver.operatingZones || [],
                                  documents: driver.documents || {},
                                  profilePhoto: driver.profilePhoto || "",
                                });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDrivers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No active drivers.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="special">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Special Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Special</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => {
                    const vehicle = vehicles?.find(v => v.id === driver.vehicleId);
                    const user = users?.find(u => u.id === driver.userId);
                    return (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{user?.fullName || `Driver ${driver.id.slice(0, 8)}`}</div>
                              <div className="text-xs text-muted-foreground">ID: {driver.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {vehicle ? (typeof vehicle.name === 'object' ? vehicle.name.en || vehicle.name.ar || vehicle.name.ur : vehicle.name) : <span className="text-muted-foreground text-xs italic">No vehicle assigned</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {user?.email || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {user?.phone || 'N/A'}
                            </div>
                            {user?.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a
                                  href={`https://wa.me/${user?.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Contact via WhatsApp"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.46-8.432"/>
                                  </svg>
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={driver.status || "pending"} />
                        </TableCell>
                        <TableCell>
                          {driver.special ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {driver.walletBalance || "0.00"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDriver(driver)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingDriver(driver);
                                form.reset({
                                  userId: driver.userId,
                                  vehicleId: driver.vehicleId || "",
                                  status: driver.status || "pending",
                                  special: driver.special,
                                  profile: driver.profile,
                                  serviceCategory: driver.serviceCategory || "",
                                  subService: driver.subService || "",
                                  phone: driver.phone || "",
                                  walletBalance: driver.walletBalance || "0",
                                  operatingZones: driver.operatingZones || [],
                                  documents: driver.documents || {},
                                  profilePhoto: driver.profilePhoto || "",
                                });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredDrivers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No special drivers.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Driver Dialog */}
      {editingDriver && (
        <Dialog open={!!editingDriver} onOpenChange={(open) => !open && setEditingDriver(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditDriver)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.filter(user => user.role === 'driver' || !user.role).map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.fullName} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles?.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {typeof vehicle.name === 'object' ? vehicle.name.en || vehicle.name.ar || vehicle.name.ur : vehicle.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="special"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Special Driver</FormLabel>
                          <span className="text-sm text-muted-foreground">
                            Toggle to mark as special driver
                          </span>
                        </div>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{field.value ? 'Yes' : 'No'}</span>
                            <button
                              type="button"
                              onClick={() => field.onChange(!field.value)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                                field.value ? 'bg-primary' : 'bg-input'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                                  field.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingDriver(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateDriver.isPending}>
                    {updateDriver.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Component for pending driver row
function PendingDriverRow({
  driver,
  user,
  vehicle,
  serviceCategories,
  subcategories,
  onApprove,
  onReject
}: {
  driver: Driver;
  user: UserType | undefined;
  vehicle: any;
  serviceCategories: any[];
  subcategories: any[];
  onApprove: (driverId: string, serviceCategory: string, subService: string) => void;
  onReject: (driverId: string, newStatus: string) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState(driver.serviceCategory || "");
  const [selectedSubService, setSelectedSubService] = useState(driver.subService || "");

  // Filter subcategories based on selected category
  const filteredSubcategories = subcategories?.filter(
    sub => sub.categoryId === selectedCategory
  );

  // If the driver's service category doesn't exist in the system, add it as a custom option
  let serviceCategoryOptions = serviceCategories || [];
  if (driver.serviceCategory && !serviceCategories?.some((cat: any) => cat.id === driver.serviceCategory)) {
    serviceCategoryOptions = [...serviceCategoryOptions, {
      id: driver.serviceCategory,
      name: driver.serviceCategory
    }];
  }

  // If the driver's sub-service doesn't exist in the system, add it as a custom option
  let subServiceOptions = filteredSubcategories || [];
  if (driver.subService && !filteredSubcategories?.some((sub: any) => sub.id === driver.subService)) {
    subServiceOptions = [...subServiceOptions, {
      id: driver.subService,
      name: driver.subService
    }];
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{user?.fullName || `Driver ${driver.id.slice(0, 8)}`}</div>
            <div className="text-xs text-muted-foreground">ID: {driver.id.slice(0, 8)}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {vehicle ? (typeof vehicle.name === 'object' ? vehicle.name.en || vehicle.name.ar || vehicle.name.ur : vehicle.name) : <span className="text-muted-foreground text-xs italic">No vehicle assigned</span>}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Mail className="w-4 h-4 text-muted-foreground" />
          {user?.email || 'N/A'}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4 text-muted-foreground" />
            {user?.phone || 'N/A'}
          </div>
          {user?.phone && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 w-8 p-0"
            >
              <a
                href={`https://wa.me/${user?.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Contact via WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-500">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.46-8.432"/>
                </svg>
              </a>
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategoryOptions?.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {typeof category.name === 'object' ? category.name.en || category.name.ar || category.name.ur : category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={selectedSubService} onValueChange={setSelectedSubService}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select sub-service" />
          </SelectTrigger>
          <SelectContent>
            {subServiceOptions?.map((subcategory: any) => (
              <SelectItem key={subcategory.id} value={subcategory.id}>
                {typeof subcategory.name === 'object' ? subcategory.name.en || subcategory.name.ar || subcategory.name.ur : subcategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        {driver.special ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApprove(driver.id, selectedCategory, selectedSubService)}
            disabled={!selectedCategory || !selectedSubService}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(driver.id, 'offline')}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Reject
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
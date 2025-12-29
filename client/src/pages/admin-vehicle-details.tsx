import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  Image as ImageIcon,
  Car,
  DollarSign,
  Ruler
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define the vehicle type
interface Vehicle {
  id: string;
  name: {
    en: string;
    ar: string;
    ur: string;
  };
  image: string;
  capacity: number;
  baseFare: number;
  pricePerKm: number;
  status: 'active' | 'inactive';
  createdAt: string;
  modifiedAt: string;
}

// Form schema for validation
const vehicleSchema = z.object({
  nameEn: z.string().min(2, "English name must be at least 2 characters"),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters"),
  nameUr: z.string().min(2, "Urdu name must be at least 2 characters"),
  capacity: z.number().min(0, "Capacity must be a positive number"),
  baseFare: z.number().min(0, "Base fare must be a positive number"),
  pricePerKm: z.number().min(0, "Price per km must be a positive number"),
  status: z.enum(['active', 'inactive']),
});

export default function AdminVehicleDetails() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: "1",
      name: {
        en: "Water Tanker 5000L",
        ar: "صهريج ماء 5000 لتر",
        ur: "5000 لیٹر پانی ٹینکر"
      },
      image: "/placeholder-vehicle.jpg",
      capacity: 5000,
      baseFare: 25.00,
      pricePerKm: 2.50,
      status: "active",
      createdAt: "2023-01-15",
      modifiedAt: "2023-05-20"
    },
    {
      id: "2",
      name: {
        en: "Sand Transport 10T",
        ar: "نقل الرمل 10 طن",
        ur: "ریت ٹرانسپورٹ 10 ٹن"
      },
      image: "/placeholder-vehicle.jpg",
      capacity: 10000,
      baseFare: 30.00,
      pricePerKm: 3.00,
      status: "active",
      createdAt: "2023-02-10",
      modifiedAt: "2023-06-15"
    },
    {
      id: "3",
      name: {
        en: "Furniture Moving Truck",
        ar: "شاحنة نقل الأثاث",
        ur: "فرنیچر منتقلی ٹرک"
      },
      image: "/placeholder-vehicle.jpg",
      capacity: 2000,
      baseFare: 40.00,
      pricePerKm: 4.00,
      status: "inactive",
      createdAt: "2023-03-05",
      modifiedAt: "2023-07-10"
    },
    {
      id: "4",
      name: {
        en: "General Delivery Van",
        ar: "شاحنة التوصيل العامة",
        ur: "جنرل ڈیلیوری وین"
      },
      image: "/placeholder-vehicle.jpg",
      capacity: 500,
      baseFare: 15.00,
      pricePerKm: 1.50,
      status: "active",
      createdAt: "2023-04-12",
      modifiedAt: "2023-08-05"
    }
  ]);

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form setup
  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      nameEn: editingVehicle?.name.en || "",
      nameAr: editingVehicle?.name.ar || "",
      nameUr: editingVehicle?.name.ur || "",
      capacity: editingVehicle?.capacity || 0,
      baseFare: editingVehicle?.baseFare || 0,
      pricePerKm: editingVehicle?.pricePerKm || 0,
      status: editingVehicle?.status || "active",
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof vehicleSchema>) => {
    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(vehicles.map(veh => 
        veh.id === editingVehicle.id 
          ? {
              ...veh,
              name: {
                en: data.nameEn,
                ar: data.nameAr,
                ur: data.nameUr
              },
              capacity: data.capacity,
              baseFare: data.baseFare,
              pricePerKm: data.pricePerKm,
              status: data.status,
              modifiedAt: new Date().toISOString()
            }
          : veh
      ));
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: (vehicles.length + 1).toString(),
        name: {
          en: data.nameEn,
          ar: data.nameAr,
          ur: data.nameUr
        },
        image: "/placeholder-vehicle.jpg",
        capacity: data.capacity,
        baseFare: data.baseFare,
        pricePerKm: data.pricePerKm,
        status: data.status,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      };
      setVehicles([...vehicles, newVehicle]);
    }
    
    setIsDialogOpen(false);
    setEditingVehicle(null);
    form.reset();
  };

  // Handle edit action
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      nameEn: vehicle.name.en,
      nameAr: vehicle.name.ar,
      nameUr: vehicle.name.ur,
      capacity: vehicle.capacity,
      baseFare: vehicle.baseFare,
      pricePerKm: vehicle.pricePerKm,
      status: vehicle.status,
    });
    setIsDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setVehicles(vehicles.filter(veh => veh.id !== id));
    }
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(veh => 
    veh.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veh.name.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veh.name.ur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    veh.capacity.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Vehicle Details Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search vehicles..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="image">Vehicle Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Click to upload image</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nameEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter vehicle name in English" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم المركبة باللغة العربية" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="nameUr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Name (Urdu)</FormLabel>
                            <FormControl>
                              <Input placeholder="اردو میں گاڑی کا نام درج کریں" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="pl-8"
                              />
                              <Ruler className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="baseFare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Fare ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8"
                              />
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pricePerKm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Kilometer ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="pl-8"
                              />
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      setEditingVehicle(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vehicle List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Base Fare</TableHead>
                <TableHead>Price per Km</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-medium">{vehicle.name.en}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.name.ar}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.name.ur}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4 text-muted-foreground" />
                      <span>{vehicle.capacity}L</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{vehicle.baseFare.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{vehicle.pricePerKm.toFixed(2)}/km</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={vehicle.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(vehicle.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(vehicle)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredVehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
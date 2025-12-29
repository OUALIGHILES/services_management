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
  Store,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { ServiceCategory } from "@shared/schema";

// Define the store type
interface Store {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  description: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  modifiedAt: string;
}

// Form schema for validation
const storeSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
});

export default function AdminStoreDetails() {
  const [stores, setStores] = useState<Store[]>(() => {
    const savedStores = localStorage.getItem('adminStores');
    if (savedStores) {
      try {
        return JSON.parse(savedStores);
      } catch (error) {
        console.error('Error parsing stored stores:', error);
        // If parsing fails, return empty array to be populated with defaults
      }
    }
    // Return empty array if no stored data, so we don't duplicate defaults
    return [];
  });

  // Initialize with default stores only if no stores exist
  useEffect(() => {
    if (stores.length === 0) {
      const defaultStores = [
        {
          id: "1",
          name: "ABC Hardware Store",
          ownerName: "Ahmed Hassan",
          email: "ahmed@abchardware.com",
          phone: "+971501234567",
          address: "123 Main Street",
          city: "Dubai",
          country: "UAE",
          status: "active",
          category: "Hardware",
          description: "Leading hardware store in Dubai with wide range of construction materials.",
          rating: 4.5,
          totalReviews: 128,
          createdAt: "2023-01-15",
          modifiedAt: "2023-05-20"
        },
        {
          id: "2",
          name: "XYZ Water Supply",
          ownerName: "Mohammed Ali",
          email: "mohammed@xyzwater.com",
          phone: "+971509876543",
          address: "456 Water Road",
          city: "Abu Dhabi",
          country: "UAE",
          status: "active",
          category: "Water Supply",
          description: "Premium water delivery service with various bottle sizes.",
          rating: 4.7,
          totalReviews: 95,
          createdAt: "2023-02-10",
          modifiedAt: "2023-06-15"
        },
        {
          id: "3",
          name: "Quick Delivery Co.",
          ownerName: "Sara Khan",
          email: "sara@quickdelivery.com",
          phone: "+971505556677",
          address: "789 Logistics Ave",
          city: "Sharjah",
          country: "UAE",
          status: "pending",
          category: "Delivery",
          description: "Fast and reliable delivery services across UAE.",
          rating: 4.2,
          totalReviews: 76,
          createdAt: "2023-03-05",
          modifiedAt: "2023-07-10"
        },
        {
          id: "4",
          name: "Movers Inc.",
          ownerName: "Khalid Ahmed",
          email: "khalid@moversinc.com",
          phone: "+971508889900",
          address: "321 Moving St",
          city: "Ajman",
          country: "UAE",
          status: "inactive",
          category: "Moving",
          description: "Professional moving and relocation services.",
          rating: 4.8,
          totalReviews: 142,
          createdAt: "2023-04-12",
          modifiedAt: "2023-08-05"
        }
      ];
      setStores(defaultStores);
      localStorage.setItem('adminStores', JSON.stringify(defaultStores));
    }
  }, []); // Only run once on component mount

  const { data: serviceCategories, isLoading: categoriesLoading } = useServiceCategories();
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  // Form setup
  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      category: "",
      description: "",
      status: "active",
    },
  });

  // Update form when editingStore changes
  useEffect(() => {
    if (editingStore) {
      form.reset({
        name: editingStore.name,
        ownerName: editingStore.ownerName,
        email: editingStore.email,
        phone: editingStore.phone,
        address: editingStore.address,
        city: editingStore.city,
        country: editingStore.country,
        category: editingStore.category,
        description: editingStore.description || "",
        status: editingStore.status,
      });
    } else {
      form.reset({
        name: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        category: "",
        description: "",
        status: "active",
      });
    }
  }, [editingStore, form]);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof storeSchema>) => {
    // Validate that the selected category exists in service categories
    if (serviceCategories && !serviceCategories.some(cat => cat.name.en === data.category)) {
      form.setError('category', { message: 'Please select a valid category' });
      return;
    }

    if (editingStore) {
      // Update existing store
      const updatedStores = stores.map(store =>
        store.id === editingStore.id
          ? {
              ...store,
              name: data.name,
              ownerName: data.ownerName,
              email: data.email,
              phone: data.phone,
              address: data.address,
              city: data.city,
              country: data.country,
              category: data.category,
              description: data.description || "",
              status: data.status,
              modifiedAt: new Date().toISOString()
            }
          : store
      );
      setStores(updatedStores);
      localStorage.setItem('adminStores', JSON.stringify(updatedStores));
    } else {
      // Add new store
      const newStore: Store = {
        id: (stores.length + 1).toString(),
        name: data.name,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        status: data.status,
        category: data.category,
        description: data.description || "",
        rating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
      };
      const updatedStores = [...stores, newStore];
      setStores(updatedStores);
      localStorage.setItem('adminStores', JSON.stringify(updatedStores));
    }

    setIsDialogOpen(false);
    setEditingStore(null);
    form.reset();
  };

  // Handle edit action
  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setIsDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this store?")) {
      const updatedStores = stores.filter(store => store.id !== id);
      setStores(updatedStores);
      localStorage.setItem('adminStores', JSON.stringify(updatedStores));
    }
  };

  // Filter stores based on search term and status
  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = activeTab === 'all' ? true : store.status === activeTab;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Store Details Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search stores..."
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
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingStore ? "Edit Store" : "Add New Store"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter store name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter owner name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              value={field.value}
                              onChange={field.onChange}
                              disabled={categoriesLoading}
                            >
                              <option value="">Select a category</option>
                              {categoriesLoading ? (
                                <option value="">Loading categories...</option>
                              ) : (
                                serviceCategories?.map((category: ServiceCategory) => (
                                  <option key={category.id} value={category.name.en}>
                                    {category.name.en}
                                  </option>
                                ))
                              )}
                            </select>
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
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter store description" 
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      setEditingStore(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={categoriesLoading}>
                      {categoriesLoading ? "Loading..." : (editingStore ? "Update Store" : "Add Store")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Store Status */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('all')}
        >
          All Stores
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'inactive' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('inactive')}
        >
          Inactive
        </button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {store.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{store.ownerName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        {store.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {store.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {store.address}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {store.city}, {store.country}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{store.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={store.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{store.rating}</span>
                      <span className="text-xs text-muted-foreground">({store.totalReviews})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(store.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(store)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(store.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No stores found.
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
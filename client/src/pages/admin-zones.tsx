import { useZones, useCreateZone, useUpdateZone } from "@/hooks/use-zones";
import { usePricing, useCreatePricing, useUpdatePricing } from "@/hooks/use-pricing";
import { useServices } from "@/hooks/use-services";
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
import { Edit, Eye, MapPin, Plus, DollarSign, Filter, Download, Search } from "lucide-react";
import { useState } from "react";
import { Zone, Pricing, Service } from "@shared/schema";
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
import { insertZoneSchema, insertPricingSchema } from "@shared/schema";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminZones() {
  const { data: zones, isLoading: zonesLoading, refetch: refetchZones } = useZones();
  const { data: pricing, isLoading: pricingLoading, refetch: refetchPricing } = usePricing();
  const { data: services, isLoading: servicesLoading } = useServices();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const createPricing = useCreatePricing();
  const updatePricing = useUpdatePricing();

  const [activeTab, setActiveTab] = useState<'zones' | 'pricing' | 'facilities'>('zones');
  const [filters, setFilters] = useState({
    zone: "",
    service: "",
    dateRange: "",
  });
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [viewingZone, setViewingZone] = useState<Zone | null>(null);
  const [viewingPricing, setViewingPricing] = useState<Pricing | null>(null);
  const [editingPricing, setEditingPricing] = useState<Pricing | null>(null);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);

  // Zone form
  const zoneFormSchema = insertZoneSchema.omit({
    id: true,
    createdAt: true
  });

  const zoneForm = useForm<z.infer<typeof zoneFormSchema>>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: {
      name: "",
      address: "",
      avgPrice: "",
      fixedPrice: "",
      coords: { lat: 0, lng: 0 },
    },
  });

  // Pricing form
  const pricingFormSchema = insertPricingSchema.omit({
    id: true,
    createdAt: true
  });

  const pricingForm = useForm<z.infer<typeof pricingFormSchema>>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      serviceId: "",
      zoneId: "",
      priceType: "fixed",
      fixedPrice: "",
      averagePrice: "",
      commissionType: "percentage",
      commissionValue: "",
    },
  });

  const handleAddZone = (data: z.infer<typeof zoneFormSchema>) => {
    createZone.mutate(data);
    setIsZoneDialogOpen(false);
    zoneForm.reset();
  };

  const handleEditZone = (data: z.infer<typeof zoneFormSchema>) => {
    if (editingZone) {
      updateZone.mutate({ id: editingZone.id, ...data });
      setEditingZone(null);
    }
  };

  const handleAddPricing = (data: z.infer<typeof pricingFormSchema>) => {
    createPricing.mutate(data);
    setIsPricingDialogOpen(false);
    pricingForm.reset();
  };

  const handleEditPricing = (data: z.infer<typeof pricingFormSchema>) => {
    if (editingPricing) {
      updatePricing.mutate({ id: editingPricing.id, ...data });
      setEditingPricing(null);
    }
  };

  const handleViewZone = (zone: Zone) => {
    setViewingZone(zone);
  };

  const handleViewPricing = (pricing: Pricing) => {
    setViewingPricing(pricing);
  };

  // Calculate stats
  const totalZones = zones?.length || 0;
  const totalPricingRules = pricing?.length || 0;
  const totalServices = services?.length || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Zones & Pricing Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
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

      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'zones' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('zones')}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Zones
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'pricing' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('pricing')}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'facilities' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('facilities')}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Facility Details
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Total Zones</p>
              <MapPin className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{totalZones}</h3>
              <p className="text-xs text-green-600 font-medium">+3 from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Pricing Rules</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{totalPricingRules}</h3>
              <p className="text-xs text-muted-foreground">active rules</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Services</p>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold">{totalServices}</h3>
              <p className="text-xs text-muted-foreground">available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {activeTab === 'zones' && (
        <>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Zones</CardTitle>
              <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Zone
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Zone</DialogTitle>
                  </DialogHeader>
                  <Form {...zoneForm}>
                    <form onSubmit={zoneForm.handleSubmit(handleAddZone)} className="space-y-4">
                      <FormField
                        control={zoneForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Zone name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={zoneForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Zone address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={zoneForm.control}
                        name="fixedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Price</FormLabel>
                            <FormControl>
                              <Input placeholder="Fixed price" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={zoneForm.control}
                        name="avgPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Price</FormLabel>
                            <FormControl>
                              <Input placeholder="Average price" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsZoneDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createZone.isPending}>
                          {createZone.isPending ? "Adding..." : "Add Zone"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Avg. Price</TableHead>
                    <TableHead>Fixed Price</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zones?.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell className="text-muted-foreground">{zone.address}</TableCell>
                      <TableCell>${zone.avgPrice || "0.00"}</TableCell>
                      <TableCell>${zone.fixedPrice || "0.00"}</TableCell>
                      <TableCell>
                        {zone.coords ? (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {typeof zone.coords === 'object' && zone.coords ?
                              `Lat: ${(zone.coords as any).lat}, Lng: ${(zone.coords as any).lng}` :
                              "Coordinates"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs italic">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewZone(zone)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingZone(zone);
                              zoneForm.reset({
                                name: zone.name,
                                address: zone.address || "",
                                avgPrice: zone.avgPrice || "",
                                fixedPrice: zone.fixedPrice || "",
                                coords: zone.coords || { lat: 0, lng: 0 },
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!zones || zones.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No zones found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Zone Dialog */}
          {editingZone && (
            <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Zone</DialogTitle>
                </DialogHeader>
                <Form {...zoneForm}>
                  <form onSubmit={zoneForm.handleSubmit(handleEditZone)} className="space-y-4">
                    <FormField
                      control={zoneForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Zone name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={zoneForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Zone address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={zoneForm.control}
                      name="fixedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fixed Price</FormLabel>
                          <FormControl>
                            <Input placeholder="Fixed price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={zoneForm.control}
                      name="avgPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Price</FormLabel>
                          <FormControl>
                            <Input placeholder="Average price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setEditingZone(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateZone.isPending}>
                        {updateZone.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          {/* View Zone Dialog */}
          {viewingZone && (
            <Dialog open={!!viewingZone} onOpenChange={(open) => !open && setViewingZone(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Zone Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                    <p className="text-lg font-semibold">{viewingZone.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Address</h4>
                    <p>{viewingZone.address || "Not specified"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Fixed Price</h4>
                      <p>${viewingZone.fixedPrice || "0.00"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Avg. Price</h4>
                      <p>${viewingZone.avgPrice || "0.00"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Coordinates</h4>
                    {viewingZone.coords ? (
                      <p>
                        {typeof viewingZone.coords === 'object' && viewingZone.coords ?
                          `Lat: ${(viewingZone.coords as any).lat}, Lng: ${(viewingZone.coords as any).lng}` :
                          "Coordinates available"}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">Not set</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => setViewingZone(null)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {activeTab === 'pricing' && (
        <>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pricing Rules</CardTitle>
              <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pricing Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Pricing Rule</DialogTitle>
                  </DialogHeader>
                  <Form {...pricingForm}>
                    <form onSubmit={pricingForm.handleSubmit(handleAddPricing)} className="space-y-4">
                      <FormField
                        control={pricingForm.control}
                        name="serviceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <FormControl>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="">Select a service</option>
                                {services?.map((service) => (
                                  <option key={service.id} value={service.id}>
                                    {typeof service.name === 'object' ? service.name.en || service.name.ar || service.name.ur : service.name}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="zoneId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zone</FormLabel>
                            <FormControl>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="">Select a zone</option>
                                {zones?.map((zone) => (
                                  <option key={zone.id} value={zone.id}>
                                    {zone.name}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="priceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Type</FormLabel>
                            <FormControl>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="fixed">Fixed</option>
                                <option value="average">Average</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="fixedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fixed Price</FormLabel>
                            <FormControl>
                              <Input placeholder="Fixed price" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="averagePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Average Price</FormLabel>
                            <FormControl>
                              <Input placeholder="Average price" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="commissionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Type</FormLabel>
                            <FormControl>
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.value}
                                onChange={field.onChange}
                              >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingForm.control}
                        name="commissionValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Value</FormLabel>
                            <FormControl>
                              <Input placeholder="Commission value" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsPricingDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPricing.isPending}>
                          {createPricing.isPending ? "Adding..." : "Add Pricing Rule"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Price Type</TableHead>
                    <TableHead>Fixed Price</TableHead>
                    <TableHead>Avg. Price</TableHead>
                    <TableHead>Commission Type</TableHead>
                    <TableHead>Commission Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricing?.map((price) => {
                    const service = services?.find((s: Service) => s.id === price.serviceId);
                    const zone = zones?.find((z: Zone) => z.id === price.zoneId);

                    return (
                      <TableRow key={price.id}>
                        <TableCell className="font-medium">
                          {service ? service.name.en || service.name : 'Unknown Service'}
                        </TableCell>
                        <TableCell>
                          {zone ? zone.name : 'Unknown Zone'}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded capitalize">
                            {price.priceType || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {price.fixedPrice ? `$${price.fixedPrice}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {price.averagePrice ? `$${price.averagePrice}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded capitalize">
                            {price.commissionType || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {price.commissionValue ? `${price.commissionValue}${price.commissionType === 'percentage' ? '%' : ''}` : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPricing(price)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPricing(price);
                                pricingForm.reset({
                                  serviceId: price.serviceId,
                                  zoneId: price.zoneId,
                                  priceType: price.priceType || "fixed",
                                  fixedPrice: price.fixedPrice || "",
                                  averagePrice: price.averagePrice || "",
                                  commissionType: price.commissionType || "percentage",
                                  commissionValue: price.commissionValue || "",
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
                  {(!pricing || pricing.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No pricing rules found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Pricing Dialog */}
          {editingPricing && (
            <Dialog open={!!editingPricing} onOpenChange={(open) => !open && setEditingPricing(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Pricing Rule</DialogTitle>
                </DialogHeader>
                <Form {...pricingForm}>
                  <form onSubmit={pricingForm.handleSubmit(handleEditPricing)} className="space-y-4">
                    <FormField
                      control={pricingForm.control}
                      name="serviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="">Select a service</option>
                              {services?.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {typeof service.name === 'object' ? service.name.en || service.name.ar || service.name.ur : service.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pricingForm.control}
                      name="zoneId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="">Select a zone</option>
                              {zones?.map((zone) => (
                                <option key={zone.id} value={zone.id}>
                                  {zone.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pricingForm.control}
                      name="priceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Type</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="average">Average</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pricingForm.control}
                      name="fixedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fixed Price</FormLabel>
                          <FormControl>
                            <Input placeholder="Fixed price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pricingForm.control}
                      name="averagePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Price</FormLabel>
                          <FormControl>
                            <Input placeholder="Average price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pricingForm.control}
                      name="commissionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Type</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="percentage">Percentage</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={pricingForm.control}
                      name="commissionValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Value</FormLabel>
                          <FormControl>
                            <Input placeholder="Commission value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setEditingPricing(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updatePricing.isPending}>
                        {updatePricing.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          {/* View Pricing Dialog */}
          {viewingPricing && (
            <Dialog open={!!viewingPricing} onOpenChange={(open) => !open && setViewingPricing(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Pricing Rule Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Service</h4>
                    <p>
                      {services?.find(s => s.id === viewingPricing.serviceId)
                        ? (services.find(s => s.id === viewingPricing.serviceId)?.name as any).en ||
                          (services.find(s => s.id === viewingPricing.serviceId)?.name as any) ||
                          'Unknown Service'
                        : 'Unknown Service'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Zone</h4>
                    <p>
                      {zones?.find(z => z.id === viewingPricing.zoneId)
                        ? zones.find(z => z.id === viewingPricing.zoneId)?.name
                        : 'Unknown Zone'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Price Type</h4>
                      <p className="capitalize">{viewingPricing.priceType || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Fixed Price</h4>
                      <p>${viewingPricing.fixedPrice || '0.00'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Avg. Price</h4>
                      <p>${viewingPricing.averagePrice || '0.00'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Commission Type</h4>
                      <p className="capitalize">{viewingPricing.commissionType || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Commission Value</h4>
                    <p>
                      {viewingPricing.commissionValue}
                      {viewingPricing.commissionType === 'percentage' ? '%' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => setViewingPricing(null)}>
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {activeTab === 'facilities' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Facility Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Facility Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Facility Name</label>
                      <p className="font-medium">Main Delivery Hub</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Address</label>
                      <p className="font-medium">123 Delivery Street, Logistics City, LC 12345</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                      <p className="font-medium">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium">info@deliveryhub.com</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Operating Hours</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium">8:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Saturday</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Sunday</span>
                      <span className="font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-4">Services Available</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Water Tankers</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Sand Transport</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Furniture Moving</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">General Delivery</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Facility Map Location</h3>
                <div className="border rounded-lg h-64 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Map showing facility location</p>
                    <p className="text-sm mt-1">123 Delivery Street, Logistics City</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button>Edit Facility Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useZones } from "@/hooks/use-zones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Redirect } from "wouter";
import { Loader2, Camera, Upload, MapPin } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schemas for multi-step form
const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  profilePhoto: z.string().optional(),
});

const vehicleInfoSchema = z.object({
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleImage: z.string().optional(),
  baseFare: z.string().min(1, "Base fare is required"),
  pricePerKm: z.string().min(1, "Price per kilometer is required"),
});

const serviceInfoSchema = z.object({
  serviceCategory: z.string().min(1, "Service category is required"),
  subService: z.string().min(1, "Sub-service is required"),
});

const zoneInfoSchema = z.object({
  operatingZones: z.array(z.string()).min(1, "At least one operating zone is required"),
});

const documentInfoSchema = z.object({
  driverLicense: z.string().optional(),
  vehicleRegistration: z.string().optional(),
  nationalId: z.string().optional(),
  insurance: z.string().optional(),
});

export default function DriverRegisterPage() {
  const { user, registerMutation } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Personal Info Form
  const personalInfoForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      profilePhoto: "",
    },
  });

  // Vehicle Info Form
  const vehicleInfoForm = useForm({
    resolver: zodResolver(vehicleInfoSchema),
    defaultValues: {
      vehicleType: "",
      vehicleImage: "",
      baseFare: "",
      pricePerKm: "",
    },
  });

  // Service Info Form
  const serviceInfoForm = useForm({
    resolver: zodResolver(serviceInfoSchema),
    defaultValues: {
      serviceCategory: "",
      subService: "",
    },
  });

  // Zone Info Form
  const zoneInfoForm = useForm({
    resolver: zodResolver(zoneInfoSchema),
    defaultValues: {
      operatingZones: [],
    },
  });

  // Document Info Form
  const documentInfoForm = useForm({
    resolver: zodResolver(documentInfoSchema),
    defaultValues: {
      driverLicense: "",
      vehicleRegistration: "",
      nationalId: "",
      insurance: "",
    },
  });


  if (user) {
    if (user.role === "admin" || user.role === "subadmin") return <Redirect to="/admin" />;
    if (user.role === "driver") return <Redirect to="/driver" />;
    return <Redirect to="/customer" />;
  }

  const onSubmitPersonalInfo = (data: any) => {
    setCurrentStep(2);
  };

  const onSubmitVehicleInfo = (data: any) => {
    setCurrentStep(3);
  };

  const onSubmitServiceInfo = (data: any) => {
    setCurrentStep(4);
  };

  const onSubmitZoneInfo = (data: any) => {
    setCurrentStep(5);
  };

  const onSubmitDocuments = async (data: any) => {
    // Combine all form data for registration
    const { vehicleCapacity, vehicleName, ...vehicleData } = vehicleInfoForm.getValues();
    const registrationData = {
      ...personalInfoForm.getValues(),
      ...vehicleData,
      ...serviceInfoForm.getValues(),
      ...zoneInfoForm.getValues(),
      role: "driver",
    };

    try {
      // Register the user first
      const userData = await registerMutation.mutateAsync(registrationData);

      // After successful registration, upload documents if they exist
      const documents = documentInfoForm.getValues();
      const uploadPromises = [];

      if (documents.driverLicense instanceof File) {
        const formData = new FormData();
        formData.append('file', documents.driverLicense);
        formData.append('documentType', 'license');
        uploadPromises.push(fetch('/api/drivers/upload-document', {
          method: 'POST',
          body: formData,
        }));
      }

      if (documents.vehicleRegistration instanceof File) {
        const formData = new FormData();
        formData.append('file', documents.vehicleRegistration);
        formData.append('documentType', 'vehicle_registration');
        uploadPromises.push(fetch('/api/drivers/upload-document', {
          method: 'POST',
          body: formData,
        }));
      }

      if (documents.nationalId instanceof File) {
        const formData = new FormData();
        formData.append('file', documents.nationalId);
        formData.append('documentType', 'national_id');
        uploadPromises.push(fetch('/api/drivers/upload-document', {
          method: 'POST',
          body: formData,
        }));
      }

      if (documents.insurance instanceof File) {
        const formData = new FormData();
        formData.append('file', documents.insurance);
        formData.append('documentType', 'insurance');
        uploadPromises.push(fetch('/api/drivers/upload-document', {
          method: 'POST',
          body: formData,
        }));
      }

      // Execute all document uploads
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      // Registration complete
      alert("Registration completed successfully! Your application is pending approval.");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>

            <Form {...personalInfoForm}>
              <form onSubmit={personalInfoForm.handleSubmit(onSubmitPersonalInfo)} className="space-y-4">
                <FormField
                  control={personalInfoForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalInfoForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalInfoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={personalInfoForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center">
                      {personalInfoForm.getValues("profilePhoto") ? (
                        <img
                          src={personalInfoForm.getValues("profilePhoto")}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <Input
                      type="file"
                      className="hidden"
                      id="profile-photo"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            personalInfoForm.setValue("profilePhoto", reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="profile-photo">
                      <Button type="button" variant="outline" size="sm" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <div></div> {/* Empty div for spacing */}
                  <Button type="submit" className="w-32">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Vehicle Information</h2>
              <p className="text-muted-foreground">Tell us about your vehicle</p>
            </div>

            <Form {...vehicleInfoForm}>
              <form onSubmit={vehicleInfoForm.handleSubmit(onSubmitVehicleInfo)} className="space-y-4">
                <FormField
                  control={vehicleInfoForm.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vehicle type (e.g., Water Tanker, Delivery Van, etc.)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vehicleInfoForm.control}
                  name="baseFare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Fare</FormLabel>
                      <FormControl><Input placeholder="e.g., 50.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vehicleInfoForm.control}
                  name="pricePerKm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Kilometer</FormLabel>
                      <FormControl><Input placeholder="e.g., 5.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-24 rounded-md bg-gray-200 border-2 border-dashed flex items-center justify-center">
                      {vehicleInfoForm.getValues("vehicleImage") ? (
                        <img
                          src={vehicleInfoForm.getValues("vehicleImage")}
                          alt="Vehicle"
                          className="w-full h-full rounded-md object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <Input
                      type="file"
                      className="hidden"
                      id="vehicle-image"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            vehicleInfoForm.setValue("vehicleImage", reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="vehicle-image">
                      <Button type="button" variant="outline" size="sm" className="mt-2">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Vehicle Image
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="w-32">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );


      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Service & Category</h2>
              <p className="text-muted-foreground">Select your service categories</p>
            </div>

            <Form {...serviceInfoForm}>
              <form onSubmit={serviceInfoForm.handleSubmit(onSubmitServiceInfo)} className="space-y-4">
                <FormField
                  control={serviceInfoForm.control}
                  name="serviceCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Service Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select main service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="water_tanker">Water Tanker</SelectItem>
                          <SelectItem value="sand_transport">Sand Transport</SelectItem>
                          <SelectItem value="construction">Construction Materials</SelectItem>
                          <SelectItem value="delivery">General Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={serviceInfoForm.control}
                  name="subService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-Service</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sub-service" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="5000l">5,000L Tanker</SelectItem>
                          <SelectItem value="10000l">10,000L Tanker</SelectItem>
                          <SelectItem value="15000l">15,000L Tanker</SelectItem>
                          <SelectItem value="fine_sand">Fine Sand</SelectItem>
                          <SelectItem value="coarse_sand">Coarse Sand</SelectItem>
                          <SelectItem value="construction_sand">Construction Sand</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="w-32">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );


      case 4:
        const { data: zones, isLoading: zonesLoading, error: zonesError } = useZones();

        if (zonesLoading) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Operating Zones</h2>
                <p className="text-muted-foreground">Select where you operate</p>
              </div>

              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          );
        }

        if (zonesError) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Operating Zones</h2>
                <p className="text-muted-foreground">Select where you operate</p>
              </div>

              <div className="text-center py-8 text-red-500">
                Failed to load zones. Please try again later.
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Operating Zones</h2>
              <p className="text-muted-foreground">Select where you operate</p>
            </div>

            <Form {...zoneInfoForm}>
              <form onSubmit={zoneInfoForm.handleSubmit(onSubmitZoneInfo)} className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>Operating Zones</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {zones?.map((zone) => (
                      <Button
                        key={zone.id}
                        type="button"
                        variant={zoneInfoForm.getValues("operatingZones").includes(zone.id) ? "default" : "outline"}
                        onClick={() => {
                          const currentZones = zoneInfoForm.getValues("operatingZones");
                          if (currentZones.includes(zone.id)) {
                            zoneInfoForm.setValue("operatingZones", currentZones.filter(z => z !== zone.id));
                          } else {
                            zoneInfoForm.setValue("operatingZones", [...currentZones, zone.id]);
                          }
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {zone.name}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="w-32">
                    Continue
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Document Upload</h2>
              <p className="text-muted-foreground">Upload required documents</p>
            </div>

            <Form {...documentInfoForm}>
              <form onSubmit={documentInfoForm.handleSubmit(onSubmitDocuments)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Driver License</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          className="hidden"
                          id="driver-license"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              documentInfoForm.setValue("driverLicense", e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="driver-license">
                          <div className="border rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="ml-2 text-gray-600">Upload Driver License</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Vehicle Registration</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          className="hidden"
                          id="vehicle-registration"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              documentInfoForm.setValue("vehicleRegistration", e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="vehicle-registration">
                          <div className="border rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="ml-2 text-gray-600">Upload Vehicle Registration</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">National ID</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          className="hidden"
                          id="national-id"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              documentInfoForm.setValue("nationalId", e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="national-id">
                          <div className="border rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="ml-2 text-gray-600">Upload National ID</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Insurance Documents</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          className="hidden"
                          id="insurance"
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              documentInfoForm.setValue("insurance", e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="insurance">
                          <div className="border rounded-md p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="ml-2 text-gray-600">Upload Insurance Documents</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" className="w-32" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-none">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-display">Driver Registration</CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </div>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { useSubcategories } from "@/hooks/use-subcategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Redirect } from "wouter";
import { Loader2, Camera, Upload, Plus, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema for the consolidated form
const driverRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password confirmation is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  baseFare: z.string().min(1, "Base fare is required"),
  pricePerKm: z.string().min(1, "Price per kilometer is required"),
  serviceCategory: z.string().min(1, "Service category is required"),
  subService: z.string().min(1, "Sub-service is required"),
  profilePhoto: z.string().optional(),
  vehicleImage: z.string().optional(),
  newServiceCategory: z.string().optional(),
  newSubService: z.string().optional(),
});

export default function DriverRegisterPage() {
  const { user, registerMutation } = useAuth();
  const { data: serviceCategories, isLoading: categoriesLoading } = useServiceCategories();
  const { data: allSubcategories, isLoading: subcategoriesLoading } = useSubcategories();
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newSubServiceMode, setNewSubServiceMode] = useState(false);
  const [availableSubServices, setAvailableSubServices] = useState<string[]>([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Form setup
  const form = useForm({
    resolver: zodResolver(driverRegistrationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      vehicleType: "",
      baseFare: "",
      pricePerKm: "",
      serviceCategory: "",
      subService: "",
      profilePhoto: "",
      vehicleImage: "",
      newServiceCategory: "",
      newSubService: "",
    },
  });

  if (categoriesLoading || subcategoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-lg text-gray-600">Loading service categories...</p>
        </div>
      </div>
    );
  }

  // Update sub-services based on selected category
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "serviceCategory") {
        const selectedCategory = value.serviceCategory;
        if (selectedCategory && allSubcategories) {
          // Filter subcategories based on the selected category
          const filteredSubcategories = allSubcategories.filter(
            sub => sub.categoryId === selectedCategory
          );
          setAvailableSubServices(filteredSubcategories.map(sub => sub.id));
        } else {
          setAvailableSubServices([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [allSubcategories, form]);

  // Handle password confirmation validation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "password" || name === "confirmPassword") {
        const password = value.password;
        const confirmPassword = value.confirmPassword;

        if (password && confirmPassword && password !== confirmPassword) {
          form.setError("confirmPassword", {
            type: "manual",
            message: "Passwords do not match"
          });
        } else if (password && confirmPassword && password === confirmPassword) {
          form.clearErrors("confirmPassword");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Update sub-services based on selected category
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "serviceCategory") {
        const selectedCategory = value.serviceCategory;
        if (selectedCategory) {
          // Define sub-services based on category
          switch (selectedCategory) {
            case "water_tanker":
              setAvailableSubServices(["5000l", "10000l", "15000l", "20000l"]);
              break;
            case "sand_transport":
              setAvailableSubServices(["fine_sand", "coarse_sand", "construction_sand"]);
              break;
            case "construction":
              setAvailableSubServices(["cement", "steel", "bricks"]);
              break;
            case "delivery":
              setAvailableSubServices(["small", "medium", "large", "heavy"]);
              break;
            default:
              setAvailableSubServices([]);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  if (user) {
    if (user.role === "admin" || user.role === "subadmin") return <Redirect to="/admin" />;
    if (user.role === "driver") return <Redirect to="/driver" />;
    return <Redirect to="/customer" />;
  }

  const onSubmit = async (data: any) => {
    // Prepare registration data
    let serviceCategory = data.serviceCategory;
    let subService = data.subService;

    // If user selected "new" category mode, use the new category value
    if (newCategoryMode && data.newServiceCategory) {
      serviceCategory = data.newServiceCategory;
    }

    // If user selected "new" sub-service mode, use the new sub-service value
    if (newSubServiceMode && data.newSubService) {
      subService = data.newSubService;
    }

    const registrationData = {
      ...data,
      role: "driver",
      status: "pending", // Driver registration is pending admin approval
      serviceCategory,
      subService,
    };

    // Remove the temporary fields that were only for UI
    delete registrationData.newServiceCategory;
    delete registrationData.newSubService;

    try {
      // Register the user
      const userData = await registerMutation.mutateAsync(registrationData);

      // Set registration success state
      setRegistrationSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };

  // Handle image upload for profile photo
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("profilePhoto", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for vehicle photo
  const handleVehiclePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("vehicleImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show success message if registration was successful
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="overflow-hidden shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <p className="text-lg text-gray-700">
                  Your registration has been submitted successfully!
                </p>
                <p className="text-gray-600">
                  Please wait for approval from the administration. You will receive a notification once your account is approved.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-48 h-12 text-base border-2 border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => window.location.reload()}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-6">
            <CardTitle className="text-2xl font-bold">Driver Registration</CardTitle>
            <p className="text-purple-100">Complete your profile information</p>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              id="fullName"
                              placeholder="John Doe"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                            />
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
                          <FormLabel className="text-base">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              id="phone"
                              placeholder="+1234567890"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Email</FormLabel>
                          <FormControl>
                            <Input
                              id="email"
                              placeholder="john@example.com"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              id="password"
                              placeholder="••••••"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Confirm Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              id="confirmPassword"
                              placeholder="••••••"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center">
                        {form.getValues("profilePhoto") ? (
                          <img
                            src={form.getValues("profilePhoto")}
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
                        onChange={handleProfilePhotoUpload}
                      />
                      <label htmlFor="profile-photo">
                        <Button type="button" variant="outline" size="sm" className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Profile Photo
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Vehicle Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Vehicle Type</FormLabel>
                          <FormControl>
                            <Input
                              id="vehicleType"
                              placeholder="Enter vehicle type (e.g., Water Tanker, Delivery Van, etc.)"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                              autoCapitalize="off"
                              autoCorrect="off"
                              spellCheck="false"
                            />
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
                          <FormLabel className="text-base">Base Fare</FormLabel>
                          <FormControl>
                            <Input
                              id="baseFare"
                              placeholder="e.g., 50.00"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                              autoCapitalize="off"
                              autoCorrect="off"
                              spellCheck="false"
                            />
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
                          <FormLabel className="text-base">Price per Kilometer</FormLabel>
                          <FormControl>
                            <Input
                              id="pricePerKm"
                              placeholder="e.g., 5.00"
                              className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                              {...field}
                              autoComplete="off"
                              autoCapitalize="off"
                              autoCorrect="off"
                              spellCheck="false"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Vehicle Photo Upload */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-24 rounded-md bg-gray-200 border-2 border-dashed flex items-center justify-center">
                        {form.getValues("vehicleImage") ? (
                          <img
                            src={form.getValues("vehicleImage")}
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
                        onChange={handleVehiclePhotoUpload}
                      />
                      <label htmlFor="vehicle-image">
                        <Button type="button" variant="outline" size="sm" className="mt-2">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Vehicle Photo
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Service Category Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Service Category</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormLabel className="text-base">Main Service Category</FormLabel>
                      {!newCategoryMode ? (
                        <div className="flex gap-2 mt-2">
                          <FormField
                            control={form.control}
                            name="serviceCategory"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger
                                      id="serviceCategory"
                                      className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                                    >
                                      <SelectValue placeholder="Select main service" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {serviceCategories?.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {typeof category.name === 'object' ? category.name.en || category.name.ar || category.name.ur : category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewCategoryMode(true)}
                            className="h-12 mt-6"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            New
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <FormField
                            control={form.control}
                            name="newServiceCategory"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    id="newServiceCategory"
                                    placeholder="Enter new service category"
                                    className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                                    {...field}
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-1 mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewCategoryMode(false);
                                form.setValue("newServiceCategory", "");
                              }}
                              className="h-10"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => {
                                const newCategory = form.getValues("newServiceCategory");
                                if (newCategory) {
                                  form.setValue("serviceCategory", newCategory);
                                  setNewCategoryMode(false);
                                }
                              }}
                              className="h-10"
                            >
                              Use
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <FormLabel className="text-base">Sub-Service</FormLabel>
                      {!newSubServiceMode ? (
                        <div className="flex gap-2 mt-2">
                          <FormField
                            control={form.control}
                            name="subService"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger
                                      id="subService"
                                      className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                                    >
                                      <SelectValue placeholder="Select sub-service" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {allSubcategories
                                      ?.filter(sub => sub.categoryId === form.watch("serviceCategory"))
                                      .map((subcategory) => (
                                        <SelectItem key={subcategory.id} value={subcategory.id}>
                                          {typeof subcategory.name === 'object' ? subcategory.name.en || subcategory.name.ar || subcategory.name.ur : subcategory.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewSubServiceMode(true)}
                            className="h-12 mt-6"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            New
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <FormField
                            control={form.control}
                            name="newSubService"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    id="newSubService"
                                    placeholder="Enter new sub-service"
                                    className="h-12 text-base border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl shadow-sm"
                                    {...field}
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex gap-1 mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewSubServiceMode(false);
                                form.setValue("newSubService", "");
                              }}
                              className="h-10"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => {
                                const newSubService = form.getValues("newSubService");
                                if (newSubService) {
                                  form.setValue("subService", newSubService);
                                  setNewSubServiceMode(false);
                                }
                              }}
                              className="h-10"
                            >
                              Use
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-48 h-12 text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
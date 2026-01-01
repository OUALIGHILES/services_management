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
import { ImageUpload } from "@/components/image-upload";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  PlusCircle,
  MinusCircle,
  Globe,
  MessageCircle,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubcategoriesByCategory, useCreateSubcategory, useUpdateSubcategory, useDeleteSubcategory } from "@/hooks/use-subcategories";

// Define the service category type
interface ServiceCategory {
  id: string;
  name: {
    en: string;
    ar: string;
    ur: string;
  };
  description: {
    en: string;
    ar: string;
    ur: string;
  };
  priority: number;
  customerNotes: string;
  picture?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  modifiedAt: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  categoryId: string;
  name: {
    en: string;
    ar: string;
    ur: string;
  };
  description?: {
    en: string;
    ar: string;
    ur: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
}

// Form schema for validation
const serviceCategorySchema = z.object({
  nameEn: z.string().min(2, "English name must be at least 2 characters"),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters"),
  nameUr: z.string().min(2, "Urdu name must be at least 2 characters"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionUr: z.string().optional(),
  priority: z.number().min(1, "Priority must be at least 1"),
  customerNotes: z.string().optional(),
  picture: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

// Form schema for subcategories
const subcategorySchema = z.object({
  nameEn: z.string().min(2, "English name must be at least 2 characters"),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters"),
  nameUr: z.string().min(2, "Urdu name must be at least 2 characters"),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionUr: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

export default function AdminServiceCategory() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'disabled'>('active');

  // Subcategory state
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<SubCategory | null>(null);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);

  // Fetch categories from API on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await fetchCategoriesWithSubcategories();
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  // Function to fetch and update categories with subcategories
  const fetchCategoriesWithSubcategories = async () => {
    try {
      const response = await fetch('/api/service-categories');
      if (response.ok) {
        const apiCategories = await response.json();
        // Transform API response to match our component's expected format
        const transformedCategories = await Promise.all(apiCategories.map(async (cat: any) => {
          // Fetch subcategories for each category
          const subcategoryResponse = await fetch(`/api/categories/${cat.id}/subcategories`);
          let subCategories: SubCategory[] = [];
          if (subcategoryResponse.ok) {
            const apiSubcategories = await subcategoryResponse.json();
            subCategories = apiSubcategories.map((sub: any) => ({
              id: sub.id,
              categoryId: sub.categoryId,
              name: sub.name,
              description: sub.description || { en: "", ar: "", ur: "" },
              status: sub.active ? 'active' : 'inactive',
              createdAt: sub.createdAt || new Date().toISOString(),
            }));
          }

          return {
            id: cat.id,
            name: cat.name,
            description: cat.description || { en: "", ar: "", ur: "" },
            priority: cat.priority || 1,
            customerNotes: cat.customerNotes || "",
            picture: cat.picture || "",
            status: cat.active ? 'active' : 'inactive',
            createdAt: cat.createdAt || new Date().toISOString(),
            modifiedAt: cat.modifiedAt || new Date().toISOString(),
            subCategories
          };
        }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Subcategory hooks
  const { data: allSubcategories } = useSubcategoriesByCategory(selectedCategoryForSubcategory || '');
  const createSubcategoryMutation = useCreateSubcategory({
    onSuccess: (_: any, variables: any) => {
      // Refresh the categories to update subcategories
      fetchCategoriesWithSubcategories();
    }
  });
  const updateSubcategoryMutation = useUpdateSubcategory({
    onSuccess: () => {
      // Refresh the categories to update subcategories
      fetchCategoriesWithSubcategories();
    }
  });
  const deleteSubcategoryMutation = useDeleteSubcategory({
    onSuccess: (_: any, variables: any) => {
      // Refresh the categories to update subcategories
      fetchCategoriesWithSubcategories();
    }
  });

  // Form setup
  const form = useForm<z.infer<typeof serviceCategorySchema>>({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: {
      nameEn: editingCategory?.name.en || "",
      nameAr: editingCategory?.name.ar || "",
      nameUr: editingCategory?.name.ur || "",
      descriptionEn: editingCategory?.description.en || "",
      descriptionAr: editingCategory?.description.ar || "",
      descriptionUr: editingCategory?.description.ur || "",
      priority: editingCategory?.priority || 1,
      customerNotes: editingCategory?.customerNotes || "",
      picture: editingCategory?.picture || "",
      status: editingCategory?.status || "active",
    },
  });

  // Subcategory form setup
  const subcategoryForm = useForm<z.infer<typeof subcategorySchema>>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      nameEn: editingSubcategory?.name.en || "",
      nameAr: editingSubcategory?.name.ar || "",
      nameUr: editingSubcategory?.name.ur || "",
      descriptionEn: editingSubcategory?.description?.en || "",
      descriptionAr: editingSubcategory?.description?.ar || "",
      descriptionUr: editingSubcategory?.description?.ur || "",
      status: editingSubcategory?.status || "active",
    },
  });

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof serviceCategorySchema>) => {
    try {
      if (editingCategory) {
        // Update existing category via API
        const response = await fetch(`/api/service-categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: {
              en: data.nameEn,
              ar: data.nameAr,
              ur: data.nameUr
            },
            description: {
              en: data.descriptionEn || "",
              ar: data.descriptionAr || "",
              ur: data.descriptionUr || ""
            },
            picture: data.picture || null,
            active: data.status === 'active'
          }),
        });

        if (response.ok) {
          const updatedCategory = await response.json();
          // Update local state
          setCategories(categories.map(cat =>
            cat.id === editingCategory.id
              ? {
                  ...cat,
                  name: updatedCategory.name,
                  description: updatedCategory.description || { en: "", ar: "", ur: "" },
                  picture: updatedCategory.picture || "",
                  status: updatedCategory.active ? 'active' : 'inactive',
                  modifiedAt: updatedCategory.modifiedAt || new Date().toISOString()
                }
              : cat
          ));
        } else {
          let errorMessage = 'Failed to update category';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          console.error('Failed to update category:', errorMessage);
          alert(`Failed to update category: ${errorMessage}`);
          return;
        }
      } else {
        // Add new category via API
        const response = await fetch('/api/service-categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: {
              en: data.nameEn,
              ar: data.nameAr,
              ur: data.nameUr
            },
            description: {
              en: data.descriptionEn || "",
              ar: data.descriptionAr || "",
              ur: data.descriptionUr || ""
            },
            picture: data.picture || null,
            active: data.status === 'active'
          }),
        });

        if (response.ok) {
          const newCategory = await response.json();
          // Add to local state
          setCategories([...categories, {
            id: newCategory.id,
            name: newCategory.name,
            description: newCategory.description || { en: "", ar: "", ur: "" },
            priority: data.priority,
            customerNotes: data.customerNotes || "",
            picture: newCategory.picture || "",
            status: newCategory.active ? 'active' : 'inactive',
            createdAt: newCategory.createdAt || new Date().toISOString(),
            modifiedAt: newCategory.modifiedAt || new Date().toISOString(),
            subCategories: []
          }]);
        } else {
          let errorMessage = 'Failed to create category';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          console.error('Failed to create category:', errorMessage);
          alert(`Failed to create category: ${errorMessage}`);
          return;
        }
      }

      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
    } catch (error) {
      console.error('Error saving category:', error);
      // Check if it's an error with a message
      if (error instanceof Error) {
        alert(`An error occurred while saving the category: ${error.message}`);
      } else {
        alert('An error occurred while saving the category');
      }
    }
  };

  // Handle edit action
  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    form.reset({
      nameEn: category.name.en,
      nameAr: category.name.ar,
      nameUr: category.name.ur,
      descriptionEn: category.description.en,
      descriptionAr: category.description.ar,
      descriptionUr: category.description.ur,
      priority: category.priority,
      customerNotes: category.customerNotes,
      picture: category.picture || "",
      status: category.status,
    });
    setIsDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this service category? This will also delete all sub-categories.")) {
      try {
        const response = await fetch(`/api/service-categories/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from local state
          setCategories(categories.filter(cat => cat.id !== id));
        } else {
          console.error('Failed to delete category:', response.status);
          alert('Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('An error occurred while deleting the category');
      }
    }
  };

  // Handle subcategory form submission
  const handleSubcategorySubmit = async (data: z.infer<typeof subcategorySchema>) => {
    try {
      // Prepare the name object ensuring all required fields are present and have minimum length
      const nameObj = {
        en: (data.nameEn?.trim() || "").substring(0, 255), // Limit length and ensure it's a string
        ar: (data.nameAr?.trim() || "").substring(0, 255),
        ur: (data.nameUr?.trim() || "").substring(0, 255)
      };

      // Validate that required name fields are not empty and have minimum length
      if (!nameObj.en || nameObj.en.length < 2) {
        alert('English name is required and must be at least 2 characters long.');
        return;
      }
      if (!nameObj.ar || nameObj.ar.length < 2) {
        alert('Arabic name is required and must be at least 2 characters long.');
        return;
      }
      if (!nameObj.ur || nameObj.ur.length < 2) {
        alert('Urdu name is required and must be at least 2 characters long.');
        return;
      }

      // Prepare the description object
      const descriptionObj = {
        en: (data.descriptionEn?.trim() || "").substring(0, 1000),
        ar: (data.descriptionAr?.trim() || "").substring(0, 1000),
        ur: (data.descriptionUr?.trim() || "").substring(0, 1000)
      };

      // Log the data being sent for debugging
      console.log("Sending subcategory data:", {
        name: nameObj,
        description: descriptionObj,
        active: data.status === 'active'
      });

      if (editingSubcategory) {
        // Update existing subcategory
        console.log("Updating subcategory with ID:", editingSubcategory.id);
        await updateSubcategoryMutation.mutateAsync({
          id: editingSubcategory.id,
          name: nameObj,
          description: descriptionObj,
          active: data.status === 'active'
        });
      } else {
        // Create new subcategory
        if (!selectedCategoryForSubcategory) {
          alert('Please select a category first');
          return;
        }

        console.log("Creating new subcategory for category ID:", selectedCategoryForSubcategory);
        await createSubcategoryMutation.mutateAsync({
          categoryId: selectedCategoryForSubcategory,
          name: nameObj,
          description: descriptionObj,
          active: data.status === 'active'
        });
      }

      setIsSubcategoryDialogOpen(false);
      setEditingSubcategory(null);
      subcategoryForm.reset();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      // Check if it's an error from the mutation with a message
      if (error instanceof Error) {
        // Provide more specific error information
        const errorMessage = error.message;
        if (errorMessage.includes("Required")) {
          alert(`Validation Error: Please make sure all name fields (English, Arabic, Urdu) are filled with at least 2 characters each. Error: ${errorMessage}`);
        } else {
          alert(`An error occurred while saving the subcategory: ${errorMessage}`);
        }
      } else {
        alert('An error occurred while saving the subcategory');
      }
    }
  };

  // Handle subcategory edit
  const handleSubcategoryEdit = (subcategory: SubCategory) => {
    setEditingSubcategory(subcategory);
    subcategoryForm.reset({
      nameEn: subcategory.name.en,
      nameAr: subcategory.name.ar,
      nameUr: subcategory.name.ur,
      descriptionEn: subcategory.description?.en || "",
      descriptionAr: subcategory.description?.ar || "",
      descriptionUr: subcategory.description?.ur || "",
      status: subcategory.status,
    });
    setSelectedCategoryForSubcategory(subcategory.categoryId);
    setIsSubcategoryDialogOpen(true);
  };

  // Handle subcategory delete
  const handleSubcategoryDelete = async (subcategory: SubCategory) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        await deleteSubcategoryMutation.mutateAsync({
          id: subcategory.id,
          categoryId: subcategory.categoryId
        });
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        // Check if it's an error from the mutation with a message
        if (error instanceof Error) {
          alert(`An error occurred while deleting the subcategory: ${error.message}`);
        } else {
          alert('An error occurred while deleting the subcategory');
        }
      }
    }
  };

  // Handle adding a new subcategory to a category
  const handleAddSubcategory = (categoryId: string) => {
    setSelectedCategoryForSubcategory(categoryId);
    setEditingSubcategory(null);
    subcategoryForm.reset({
      nameEn: "",
      nameAr: "",
      nameUr: "",
      descriptionEn: "",
      descriptionAr: "",
      descriptionUr: "",
      status: "active",
    });
    setIsSubcategoryDialogOpen(true);
  };

  // Filter categories based on search term and status
  const filteredCategories = categories.filter(cat => {
    const matchesSearch =
      cat.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.name.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.name.ur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.en.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = activeTab === 'active' ? cat.status === 'active' : cat.status === 'inactive';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Service Category Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search categories..."
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
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Service Category" : "Add New Service Category"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nameEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter category name in English" {...field} />
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
                            <FormLabel>Category Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم الفئة باللغة العربية" {...field} />
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
                            <FormLabel>Category Name (Urdu)</FormLabel>
                            <FormControl>
                              <Input placeholder="اردو میں زمرہ کا نام درج کریں" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Priority</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter priority number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
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
                              onChange={(e) => field.onChange(e.target.value as 'active' | 'inactive')}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter description in English"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="أدخل الوصف باللغة العربية"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descriptionUr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Urdu)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="اردو میں تفصیل درج کریں"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter customer notes"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="picture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Picture</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            bucketName="categories"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCategory(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Subcategory Dialog */}
          <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}
                </DialogTitle>
              </DialogHeader>
              <Form {...subcategoryForm}>
                <form onSubmit={subcategoryForm.handleSubmit(handleSubcategorySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={subcategoryForm.control}
                        name="nameEn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory Name (English)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter subcategory name in English" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={subcategoryForm.control}
                        name="nameAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory Name (Arabic)</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم الفئة الفرعية باللغة العربية" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={subcategoryForm.control}
                        name="nameUr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory Name (Urdu)</FormLabel>
                            <FormControl>
                              <Input placeholder="اردو میں ذیلی زمرہ کا نام درج کریں" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={subcategoryForm.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value as 'active' | 'inactive')}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={subcategoryForm.control}
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter description in English"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={subcategoryForm.control}
                      name="descriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Arabic)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="أدخل الوصف باللغة العربية"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={subcategoryForm.control}
                      name="descriptionUr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Urdu)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="اردو میں تفصیل درج کریں"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsSubcategoryDialogOpen(false);
                        setEditingSubcategory(null);
                        subcategoryForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSubcategory ? "Update Subcategory" : "Add Subcategory"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Active and Disabled Categories */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('active')}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Active Categories
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'disabled' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('disabled')}
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Disabled Categories
          </div>
        </button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{activeTab === 'active' ? 'Active Service Categories' : 'Disabled Service Categories'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Picture</TableHead>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Customer Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sub-Categories</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.picture ? (
                        <img
                          src={category.picture}
                          alt={category.name.en}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-muted-foreground">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-medium">{category.name.en}</div>
                        <div className="text-sm text-muted-foreground">{category.name.ar}</div>
                        <div className="text-sm text-muted-foreground">{category.name.ur}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        <div className="text-sm">{category.description.en}</div>
                        <div className="text-xs text-muted-foreground">{category.description.ar}</div>
                        <div className="text-xs text-muted-foreground">{category.description.ur}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{category.customerNotes.substring(0, 20)}{category.customerNotes.length > 20 ? '...' : ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={category.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{category.subCategories.length}</span>
                        <PlusCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                      {category.subCategories.length > 0 && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="text-muted-foreground cursor-pointer">View subcategories</summary>
                            <div className="mt-2 space-y-1">
                              {category.subCategories.map((subcat) => (
                                <div key={subcat.id} className="flex justify-between items-center p-2 bg-muted rounded">
                                  <span>{subcat.name.en}</span>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubcategoryEdit(subcat);
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubcategoryDelete(subcat);
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddSubcategory(category.id)}
                        >
                          <PlusCircle className="w-4 h-4 mr-1" />
                          Add Sub
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No {activeTab} service categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
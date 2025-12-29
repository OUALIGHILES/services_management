import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
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
  Globe
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServiceCategories, useCreateServiceCategory, useUpdateServiceCategory, useDeleteServiceCategory } from "@/hooks/use-service-categories";
import { ServiceCategory } from "@shared/schema";

// Form schema for validation
const storeCategorySchema = z.object({
  nameEn: z.string().min(2, "English name must be at least 2 characters"),
  nameAr: z.string().min(2, "Arabic name must be at least 2 characters"),
  nameUr: z.string().min(2, "Urdu name must be at least 2 characters"),
  status: z.boolean(),
});

export default function AdminStoreCategory() {
  const { data: categories, isLoading, refetch } = useServiceCategories();
  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();
  
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form setup
  const form = useForm<z.infer<typeof storeCategorySchema>>({
    resolver: zodResolver(storeCategorySchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      nameUr: "",
      status: false,
    },
  });

  // Update form when editing category changes
  useEffect(() => {
    if (editingCategory) {
      form.reset({
        nameEn: editingCategory.name.en || "",
        nameAr: editingCategory.name.ar || "",
        nameUr: editingCategory.name.ur || "",
        status: editingCategory.active || false,
      });
    }
  }, [editingCategory, form]);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof storeCategorySchema>) => {
    if (editingCategory) {
      // Update existing category
      updateCategory.mutate({
        id: editingCategory.id,
        name: {
          en: data.nameEn,
          ar: data.nameAr,
          ur: data.nameUr
        },
        active: data.status,
      });
    } else {
      // Add new category
      createCategory.mutate({
        name: {
          en: data.nameEn,
          ar: data.nameAr,
          ur: data.nameUr
        },
        active: data.status,
      });
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  // Handle edit action
  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategory.mutate(id);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories?.filter(cat =>
    cat.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.name.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.name.ur?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Store Category Management</h2>
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
            <DialogContent className="max-w-2xl" aria-describedby={editingCategory ? "edit-category-description" : "add-category-description"}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                <p id={editingCategory ? "edit-category-description" : "add-category-description"} className="sr-only">
                  {editingCategory
                    ? "Edit store category form with fields for name in English, Arabic, and Urdu"
                    : "Add new store category form with fields for name in English, Arabic, and Urdu"}
                </p>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="image">Category Image</Label>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Click to upload image</p>
                          <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Status</FormLabel>
                              <span className="text-sm text-muted-foreground">
                                Toggle to activate or deactivate this category
                              </span>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

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
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      setEditingCategory(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
                      {createCategory.isPending || updateCategory.isPending ? "Saving..." : (editingCategory ? "Update Category" : "Add Category")}
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
          <CardTitle>Store Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading categories...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Modified Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="font-medium">{category.name.en}</div>
                        <div className="text-sm text-muted-foreground">{category.name.ar}</div>
                        <div className="text-sm text-muted-foreground">{category.name.ur}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={category.active ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell>
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {category.updatedAt ? new Date(category.updatedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(category.id)}
                          disabled={deleteCategory.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No store categories found.
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
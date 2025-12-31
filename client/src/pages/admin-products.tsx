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
  Package,
  Tag,
  DollarSign
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { useSubcategoriesByCategory } from "@/hooks/use-subcategories";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { useUploadProductImage } from "@/hooks/use-upload-product-image";

import { Product as ProductType } from "@shared/schema";

// Form schema for validation
const productSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional(),
  name: z.string().min(2, "Product name must be at least 2 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  discountedPrice: z.number().optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export default function AdminProducts() {
  const { data: serviceCategories, isLoading: categoriesLoading } = useServiceCategories();
  const { data: products, isLoading: productsLoading, refetch } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadProductImage = useUploadProductImage();

  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get subcategories for the selected category
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategoriesByCategory(selectedCategoryId || "");

  // Form setup
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      price: 0,
      discountedPrice: undefined,
      color: "",
      brand: "",
      unit: "",
      size: "",
      description: "",
      images: [],
    },
  });

  // Update form when editing product changes
  useEffect(() => {
    if (editingProduct) {
      form.reset({
        categoryId: editingProduct.categoryId,
        subcategoryId: editingProduct.subcategoryId || "", // Assuming there's a subcategoryId field
        name: editingProduct.name,
        price: typeof editingProduct.price === 'string' ? parseFloat(editingProduct.price) : editingProduct.price,
        discountedPrice: editingProduct.discountedPrice ?
          (typeof editingProduct.discountedPrice === 'string' ? parseFloat(editingProduct.discountedPrice) : editingProduct.discountedPrice)
          : undefined,
        color: editingProduct.color || "",
        brand: editingProduct.brand || "",
        unit: editingProduct.unit || "",
        size: editingProduct.size || "",
        description: editingProduct.description || "",
        images: editingProduct.images || [],
      });
      // Set the selected category to load subcategories
      setSelectedCategoryId(editingProduct.categoryId);

      // Set images for editing
      const productImages = editingProduct.images || [];
      setUploadedImages(productImages);

      // Create previews for existing images
      const previews = [null, null, null]; // Reset previews
      productImages.forEach((img, index) => {
        if (index < 3) {
          previews[index] = img; // Use the actual image URL for preview
        }
      });
      setImagePreviews([...previews]); // Create new array reference
    } else {
      form.reset({
        categoryId: "",
        subcategoryId: "",
        name: "",
        price: 0,
        discountedPrice: undefined,
        color: "",
        brand: "",
        unit: "",
        size: "",
        description: "",
        images: [],
      });
      setSelectedCategoryId(null);
      setUploadedImages([]);
      setImagePreviews([null, null, null]);
    }
  }, [editingProduct, form]);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image/jpeg|image/png|image/jpg|image/gif')) {
      alert('Please upload a valid image file (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    const newPreviews = [...imagePreviews];
    newPreviews[index] = previewUrl;
    setImagePreviews([...newPreviews]); // Create new array reference to ensure re-render

    try {
      const result = await uploadProductImage.mutateAsync({ image: file });
      if (result.success && result.url) {
        const newUploadedImages = [...uploadedImages];
        newUploadedImages[index] = result.url;
        setUploadedImages([...newUploadedImages.filter(url => url)]); // Create new array reference
      } else {
        alert(result.error || 'Failed to upload image');
        // Revert preview
        newPreviews[index] = null;
        setImagePreviews([...newPreviews]); // Create new array reference
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      alert(error.message || 'Failed to upload image');
      // Revert preview
      newPreviews[index] = null;
      setImagePreviews([...newPreviews]); // Create new array reference
    } finally {
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(previewUrl);
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof productSchema>) => {
    // Prepare images array - use uploaded images or default if none uploaded
    const imagesToSave = uploadedImages.length > 0 ? uploadedImages : ["/placeholder-product.jpg"];

    if (editingProduct) {
      // Update existing product
      updateProduct.mutate({
        id: editingProduct.id,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null, // Include subcategory ID when updating
        name: data.name,
        price: data.price.toString(), // Convert to string for backend
        discountedPrice: data.discountedPrice?.toString(), // Convert to string for backend
        color: data.color || "",
        brand: data.brand || "",
        unit: data.unit || "",
        size: data.size || "",
        images: imagesToSave,
        description: data.description || "",
        modifiedBy: "Admin User", // In a real app, this would be the current user
      });
    } else {
      // Add new product
      createProduct.mutate({
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null, // Include subcategory ID when creating
        name: data.name,
        price: data.price.toString(), // Convert to string for backend
        discountedPrice: data.discountedPrice?.toString(), // Convert to string for backend
        color: data.color || "",
        brand: data.brand || "",
        unit: data.unit || "",
        size: data.size || "",
        images: imagesToSave,
        description: data.description || "",
        modifiedBy: "Admin User", // In a real app, this would be the current user
      });
    }

    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  // Handle edit action
  const handleEdit = (product: ProductType) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  // Handle delete action
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(id);
    }
  };

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter(prod => {
      const category = serviceCategories?.find(cat => cat.id === prod.categoryId);
      const categoryName = category ? (typeof category.name === 'object' ? category.name.en || '' : category.name) : "";
      return (
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prod.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [products, serviceCategories, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold font-display">Admin Products Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
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
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {editingProduct
                    ? "Update product details and save changes"
                    : "Fill in the product information to add a new product to your catalog"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Product Images Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-800">Product Images</h3>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center cursor-pointer hover:bg-blue-50 transition-colors relative group"
                            onClick={() => {
                              if (fileInputRef.current) {
                                // Store the index in a data attribute
                                fileInputRef.current.dataset.index = index.toString();
                                fileInputRef.current.click();
                              }
                            }}
                          >
                            {imagePreviews[index] ? (
                              <div className="relative">
                                <img
                                  src={imagePreviews[index] || undefined}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Remove the image
                                    const newPreviews = [...imagePreviews];
                                    newPreviews[index] = null;
                                    setImagePreviews([...newPreviews]); // Create new array reference

                                    const newUploadedImages = [...uploadedImages];
                                    newUploadedImages[index] = undefined as any;
                                    setUploadedImages([...newUploadedImages.filter(url => url)]); // Create new array reference
                                  }}
                                >
                                  ×
                                </button>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-md transition-all"></div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-6">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-2">
                                  <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-600 font-medium">Image {index + 1}</p>
                                <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3 text-center">Upload up to 3 images (JPG, PNG up to 2MB each)</p>
                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const index = parseInt(fileInputRef.current?.dataset.index || "0");
                          handleImageUpload(e, index);
                        }}
                      />
                    </div>
                  </div>

                  {/* Basic Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Product Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product name"
                                className="h-12 text-lg"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Category *</FormLabel>
                            {categoriesLoading ? (
                              <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-muted-foreground h-12 flex items-center">
                                Loading categories...
                              </div>
                            ) : (
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 h-12 text-base"
                                value={field.value ?? ''}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSelectedCategoryId(e.target.value);
                                }}
                              >
                                <option value="">Select a category</option>
                                {serviceCategories?.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {typeof category.name === 'object' ?
                                      (category.name.en || category.name.ar || category.name.ur || 'Unnamed Category') :
                                      category.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subcategoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Subcategory</FormLabel>
                            {subcategoriesLoading ? (
                              <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-muted-foreground h-12 flex items-center">
                                Loading subcategories...
                              </div>
                            ) : (
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 h-12 text-base"
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                disabled={!selectedCategoryId || !subcategories || subcategories.length === 0}
                              >
                                <option value="">Select a subcategory (optional)</option>
                                {subcategories?.map((subcategory) => (
                                  <option key={subcategory.id} value={subcategory.id}>
                                    {typeof subcategory.name === 'object' ?
                                      (subcategory.name.en || subcategory.name.ar || subcategory.name.ur || 'Unnamed Subcategory') :
                                      subcategory.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="h-12"
                                  {...field}
                                  value={field.value || 0}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="discountedPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium">Discounted Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="h-12"
                                  {...field}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-800">Additional Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Color</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product color" className="h-12" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product brand" className="h-12" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Unit of Measurement</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., kg, piece, liter" className="h-12" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Size</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product size" className="h-12" {...field} value={field.value ?? ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Product Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter detailed product description"
                                rows={4}
                                className="text-base"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-6 py-3 text-base"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingProduct(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="px-6 py-3 text-base bg-primary hover:bg-primary/90"
                      disabled={createProduct.isPending || updateProduct.isPending || uploadProductImage.isPending}
                    >
                      {(createProduct.isPending || updateProduct.isPending || uploadProductImage.isPending) ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                          Saving...
                        </span>
                      ) : (
                        <span>{editingProduct ? "Update Product" : "Add Product"}</span>
                      )}
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
          <CardTitle>Products List</CardTitle>
        </CardHeader>
        <CardContent>
          {(categoriesLoading || productsLoading) ? (
            <div className="py-8 text-center text-muted-foreground">Loading products and categories...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified By</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const category = serviceCategories?.find(cat => cat.id === product.categoryId);
                  const categoryName = category ? (typeof category.name === 'object' ? category.name.en || 'Unknown Category' : category.name) : "Unknown Category";
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <button
                          className="flex items-center gap-3 text-left hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors"
                          onClick={() => window.location.hash = `#/admin/products/${product.id}`}
                        >
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{typeof product.name === 'object' ? product.name.en || product.name.ar || product.name.ur : product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.description?.substring(0, 30)}{product.description && product.description?.length > 30 ? '...' : ''}</div>
                          </div>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{categoryName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">${parseFloat(product.price || '0').toFixed(2)}</span>
                          {product.discountedPrice && (
                            <span className="text-sm text-destructive line-through">${parseFloat(product.discountedPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.brand || ''}</TableCell>
                      <TableCell>{product.color || ''}</TableCell>
                      <TableCell>{product.size || ''}</TableCell>
                      <TableCell>{product.modifiedBy || ''}</TableCell>
                      <TableCell>
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No products found.
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
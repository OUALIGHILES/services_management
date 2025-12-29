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
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { useSubcategoriesByCategory } from "@/hooks/use-subcategories";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";

// Define the product type
interface Product {
  id: string;
  categoryId: string;
  subcategoryId?: string; // Optional field for subcategory association
  categoryName: string;
  name: string;
  price: number;
  discountedPrice?: number;
  color: string;
  brand: string;
  unit: string;
  size: string;
  images: string[];
  description: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
}

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
});

export default function AdminProducts() {
  const { data: serviceCategories, isLoading: categoriesLoading } = useServiceCategories();
  const { data: products, isLoading: productsLoading, refetch } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

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
      });
      // Set the selected category to load subcategories
      setSelectedCategoryId(editingProduct.categoryId);
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
      });
      setSelectedCategoryId(null);
    }
  }, [editingProduct, form]);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof productSchema>) => {
    if (editingProduct) {
      // Update existing product
      updateProduct.mutate({
        id: editingProduct.id,
        categoryId: data.categoryId,
        // Note: Since the products table doesn't have a subcategoryId field in the schema,
        // we're not including it in the mutation. If needed, the schema would need to be updated.
        name: data.name,
        price: data.price.toString(), // Convert to string for backend
        discountedPrice: data.discountedPrice?.toString(), // Convert to string for backend
        color: data.color || "",
        brand: data.brand || "",
        unit: data.unit || "",
        size: data.size || "",
        description: data.description || "",
        modifiedBy: "Admin User", // In a real app, this would be the current user
      });
    } else {
      // Add new product
      createProduct.mutate({
        categoryId: data.categoryId,
        // Note: Since the products table doesn't have a subcategoryId field in the schema,
        // we're not including it in the mutation. If needed, the schema would need to be updated.
        name: data.name,
        price: data.price.toString(), // Convert to string for backend
        discountedPrice: data.discountedPrice?.toString(), // Convert to string for backend
        color: data.color || "",
        brand: data.brand || "",
        unit: data.unit || "",
        size: data.size || "",
        images: ["/placeholder-product.jpg"], // Default image
        description: data.description || "",
        modifiedBy: "Admin User", // In a real app, this would be the current user
      });
    }

    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  // Handle edit action
  const handleEdit = (product: Product) => {
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
  const filteredProducts = products?.filter(prod => {
    const categoryName = serviceCategories?.find(cat => cat.id === prod.categoryId)?.name.en || "";
    return (
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

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
            <DialogContent className="max-w-3xl" aria-describedby={editingProduct ? "edit-product-description" : "add-product-description"}>
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <p id={editingProduct ? "edit-product-description" : "add-product-description"} className="sr-only">
                  {editingProduct
                    ? "Edit product form with fields for name, category, price, and other product details"
                    : "Add new product form with fields for name, category, price, and other product details"}
                </p>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Product Images</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                              <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                              <p className="mt-1 text-xs text-muted-foreground">Image {index}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Upload up to 3 images (JPG, PNG up to 2MB each)</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            {categoriesLoading ? (
                              <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-muted-foreground">
                                Loading categories...
                              </div>
                            ) : (
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setSelectedCategoryId(e.target.value);
                                }}
                              >
                                <option value="">Select a category</option>
                                {serviceCategories?.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name.en}
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
                            <FormLabel>Subcategory</FormLabel>
                            {subcategoriesLoading ? (
                              <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-muted-foreground">
                                Loading subcategories...
                              </div>
                            ) : (
                              <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={field.value}
                                onChange={field.onChange}
                                disabled={!selectedCategoryId || !subcategories || subcategories.length === 0}
                              >
                                <option value="">Select a subcategory (optional)</option>
                                {subcategories?.map((subcategory) => (
                                  <option key={subcategory.id} value={subcategory.id}>
                                    {subcategory.name.en}
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
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
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
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...field}
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
                              <FormLabel>Discounted Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product color" {...field} />
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
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product brand" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit of Measurement</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., kg, piece, liter" {...field} />
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
                            <FormLabel>Size</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product size" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                            placeholder="Enter product description"
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
                      setEditingProduct(null);
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                      {createProduct.isPending || updateProduct.isPending ? "Saving..." : (editingProduct ? "Update Product" : "Add Product")}
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
                  const categoryName = serviceCategories?.find(cat => cat.id === product.categoryId)?.name.en || "Unknown Category";
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.description?.substring(0, 30)}{product.description && product.description.length > 30 ? '...' : ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{categoryName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">${parseFloat(product.price).toFixed(2)}</span>
                          {product.discountedPrice && (
                            <span className="text-sm text-destructive line-through">${parseFloat(product.discountedPrice).toFixed(2)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{product.color}</TableCell>
                      <TableCell>{product.size}</TableCell>
                      <TableCell>{product.modifiedBy}</TableCell>
                      <TableCell>
                        {new Date(product.createdAt).toLocaleDateString()}
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
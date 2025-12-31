import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Product, InsertProduct } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<Product[]>;
    },
  });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['products-by-category', categoryId],
    queryFn: async () => {
      console.log('Fetching products for category:', categoryId);
      const res = await fetch(`/api/categories/${categoryId}/products`);
      console.log('Response status:', res.status);
      if (!res.ok) throw new Error("Failed to fetch products by category");
      const data = await res.json();
      console.log('Fetched products:', data);
      return data as Promise<Product[]>;
    },
    enabled: !!categoryId,
  });
}

export function useProductsBySubcategory(subcategoryId: string) {
  return useQuery({
    queryKey: ['products-by-subcategory', subcategoryId],
    queryFn: async () => {
      console.log('Fetching products for subcategory:', subcategoryId);
      const res = await fetch(`/api/subcategories/${subcategoryId}/products`);
      console.log('Response status:', res.status);
      if (!res.ok) throw new Error("Failed to fetch products by subcategory");
      const data = await res.json();
      console.log('Fetched products:', data);
      return data as Promise<Product[]>;
    },
    enabled: !!subcategoryId,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [api.products.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.products.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to fetch product:', errorData);
        throw new Error(errorData.message || "Failed to fetch product");
      }
      return res.json() as Promise<Product>;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: Omit<InsertProduct, 'id' | 'createdAt' | 'modifiedAt'>) => {
      const res = await fetch(api.products.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Product Created", description: "The product has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<InsertProduct, 'id' | 'createdAt' | 'modifiedAt'>>) => {
      const url = buildUrl(api.products.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Product Updated", description: "The product has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.products.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete product");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      toast({ title: "Product Deleted", description: "The product has been deleted successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
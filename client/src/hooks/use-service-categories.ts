import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { ServiceCategory, InsertServiceCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useServiceCategories() {
  return useQuery({
    queryKey: [api.services.listCategories.path],
    queryFn: async () => {
      const res = await fetch(api.services.listCategories.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch service categories");
      return res.json() as Promise<ServiceCategory[]>;
    },
  });
}

export function useServiceCategory(id: string) {
  return useQuery({
    queryKey: [api.services.listCategories.path, id],
    queryFn: async () => {
      const res = await fetch(`${api.services.listCategories.path}/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch service category");
      return res.json() as Promise<ServiceCategory>;
    },
    enabled: !!id,
  });
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryData: Omit<InsertServiceCategory, 'id' | 'createdAt'>) => {
      const res = await fetch(api.services.listCategories.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create service category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.listCategories.path] });
      toast({ title: "Category Created", description: "The service category has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<InsertServiceCategory, 'id' | 'createdAt'>>) => {
      const url = buildUrl(api.services.updateCategory.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update service category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.listCategories.path] });
      toast({ title: "Category Updated", description: "The service category has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.services.deleteCategory.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete service category");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.services.listCategories.path] });
      toast({ title: "Category Deleted", description: "The service category has been deleted successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
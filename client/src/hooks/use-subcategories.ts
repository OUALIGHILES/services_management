import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Subcategory, InsertSubcategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSubcategories() {
  return useQuery({
    queryKey: [api.subcategories.list.path],
    queryFn: async () => {
      const res = await fetch(api.subcategories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      return res.json() as Promise<Subcategory[]>;
    },
  });
}

export function useSubcategoriesByCategory(categoryId: string) {
  return useQuery({
    queryKey: [api.subcategories.listByCategory.path, categoryId],
    queryFn: async () => {
      const url = buildUrl(api.subcategories.listByCategory.path, { categoryId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subcategories for category");
      return res.json() as Promise<Subcategory[]>;
    },
    enabled: !!categoryId,
  });
}

export function useCreateSubcategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ categoryId, ...subcategoryData }: Omit<InsertSubcategory, 'id' | 'createdAt'> & { categoryId: string }) => {
      const url = buildUrl(api.subcategories.create.path, { categoryId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subcategoryData),
        credentials: "include",
      });
      if (!res.ok) {
        let errorMessage = "Failed to create subcategory";
        let errorDetails = null;
        try {
          errorDetails = await res.json();
          // Make sure we get the full error message
          errorMessage = errorDetails.message || errorDetails.error || JSON.stringify(errorDetails) || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = res.statusText || errorMessage;
          errorDetails = { statusText: res.statusText, status: res.status };
        }
        console.error("Subcategory creation error details:", {
          status: res.status,
          statusText: res.statusText,
          errorMessage,
          errorDetails,
          url: res.url
        });
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.subcategories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.subcategories.listByCategory.path, variables.categoryId] });
      toast({ title: "Subcategory Created", description: "The subcategory has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateSubcategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<InsertSubcategory, 'id' | 'createdAt'>>) => {
      const url = buildUrl(api.subcategories.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        let errorMessage = "Failed to update subcategory";
        let errorDetails = null;
        try {
          errorDetails = await res.json();
          // Make sure we get the full error message
          errorMessage = errorDetails.message || errorDetails.error || JSON.stringify(errorDetails) || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = res.statusText || errorMessage;
          errorDetails = { statusText: res.statusText, status: res.status };
        }
        console.error("Subcategory update error details:", {
          status: res.status,
          statusText: res.statusText,
          errorMessage,
          errorDetails,
          url: res.url
        });
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subcategories.list.path] });
      // We don't know the category ID here, so we can't invalidate the specific category's subcategories
      // The user would need to refresh the page or we'd need to pass the categoryId
      toast({ title: "Subcategory Updated", description: "The subcategory has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteSubcategory() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, categoryId }: { id: string; categoryId: string }) => {
      const url = buildUrl(api.subcategories.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        let errorMessage = "Failed to delete subcategory";
        let errorDetails = null;
        try {
          errorDetails = await res.json();
          // Make sure we get the full error message
          errorMessage = errorDetails.message || errorDetails.error || JSON.stringify(errorDetails) || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = res.statusText || errorMessage;
          errorDetails = { statusText: res.statusText, status: res.status };
        }
        console.error("Subcategory delete error details:", {
          status: res.status,
          statusText: res.statusText,
          errorMessage,
          errorDetails,
          url: res.url
        });
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.subcategories.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.subcategories.listByCategory.path, variables.categoryId] });
      toast({ title: "Subcategory Deleted", description: "The subcategory has been deleted successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { OrderOffer, InsertOrderOffer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useOrderOffers(filters?: { orderId?: string; driverId?: string }) {
  const queryKey = [api.orderOffers.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = filters
        ? `${api.orderOffers.list.path}?${new URLSearchParams(filters as any).toString()}`
        : api.orderOffers.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order offers");
      return res.json() as Promise<OrderOffer[]>;
    },
  });
}

export function useOrderOffer(id: string) {
  return useQuery({
    queryKey: [api.orderOffers.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.orderOffers.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order offer");
      return res.json() as Promise<OrderOffer>;
    },
    enabled: !!id,
  });
}

export function useCreateOrderOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.orderOffers.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create order offer" }));
        throw new Error(errorData.message || "Failed to create order offer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orderOffers.list.path] });
      toast({ title: "Offer Created", description: "Your offer has been submitted." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateOrderOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InsertOrderOffer>) => {
      const url = buildUrl(api.orderOffers.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update order offer" }));
        throw new Error(errorData.message || "Failed to update order offer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orderOffers.list.path] });
      toast({ title: "Offer Updated", description: "Changes saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteOrderOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.orderOffers.delete.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete order offer");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orderOffers.list.path] });
      toast({ title: "Offer Deleted", description: "Offer has been removed." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
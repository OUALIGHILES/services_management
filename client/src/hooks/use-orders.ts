import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Order, InsertOrder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useOrders(filters?: { status?: string; driverId?: string; customerId?: string }) {
  const queryKey = [api.orders.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = filters 
        ? `${api.orders.list.path}?${new URLSearchParams(filters as any).toString()}` 
        : api.orders.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json() as Promise<Order[]>;
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [api.orders.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json() as Promise<Order>;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // NOTE: Frontend usually sends partial data, schema expects full InsertOrder.
      // We assume backend handles defaults or valid transformation.
      const res = await fetch(api.orders.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: (_, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
    onError: (err: Error, variables, context) => {
      // Error handling will be done in the component where this hook is used
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InsertOrder>) => {
      const url = buildUrl(api.orders.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: (_, variables, context) => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
    },
    onError: (err: Error, variables, context) => {
      // Error handling will be done in the component where this hook is used
    },
  });
}

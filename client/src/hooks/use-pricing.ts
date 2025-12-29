import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Pricing, InsertPricing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function usePricing(filters?: { serviceId?: string; zoneId?: string }) {
  const queryKey = [api.pricing.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.serviceId) params.append('serviceId', filters.serviceId);
      if (filters?.zoneId) params.append('zoneId', filters.zoneId);

      const queryString = params.toString();
      const url = `${api.pricing.list.path}${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pricing");
      return res.json() as Promise<Pricing[]>;
    },
  });
}

export function usePricingById(id: string) {
  return useQuery({
    queryKey: [api.pricing.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.pricing.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pricing");
      return res.json() as Promise<Pricing>;
    },
    enabled: !!id,
  });
}

export function useCreatePricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPricing) => {
      const res = await fetch(api.pricing.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create pricing");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pricing.list.path] });
      toast({ title: "Pricing Created", description: "The pricing has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdatePricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InsertPricing>) => {
      const url = buildUrl(api.pricing.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update pricing");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.pricing.list.path] });
      toast({ title: "Pricing Updated", description: "Changes saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Rating, InsertRating } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useRatings(filters?: { orderId?: string; raterId?: string; ratedId?: string }) {
  const queryKey = [api.ratings?.list?.path || '/api/ratings', filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Since ratings aren't defined in the API routes, we'll use a mock endpoint
      const params = new URLSearchParams();
      if (filters?.orderId) params.append('orderId', filters.orderId);
      if (filters?.raterId) params.append('raterId', filters.raterId);
      if (filters?.ratedId) params.append('ratedId', filters.ratedId);
      
      const queryString = params.toString();
      const url = `/api/ratings${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ratings");
      return res.json() as Promise<Rating[]>;
    },
  });
}

export function useRating(id: string) {
  return useQuery({
    queryKey: ['/api/ratings', id],
    queryFn: async () => {
      const url = `/api/ratings/${id}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch rating");
      return res.json() as Promise<Rating>;
    },
    enabled: !!id,
  });
}

export function useCreateRating() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertRating) => {
      const res = await fetch('/api/ratings', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create rating");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ratings'] });
      toast({ title: "Rating Created", description: "The rating has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateRating() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InsertRating>) => {
      const res = await fetch(`/api/ratings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update rating");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ratings'] });
      toast({ title: "Rating Updated", description: "Changes saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
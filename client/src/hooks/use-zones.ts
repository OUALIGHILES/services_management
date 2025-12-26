import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Zone, InsertZone } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useZones() {
  return useQuery({
    queryKey: [api.zones.list.path],
    queryFn: async () => {
      const res = await fetch(api.zones.list.path);
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json() as Promise<Zone[]>;
    },
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertZone) => {
      const res = await fetch(api.zones.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create zone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.zones.list.path] });
      toast({ title: "Zone Created", description: "New delivery zone added." });
    },
  });
}

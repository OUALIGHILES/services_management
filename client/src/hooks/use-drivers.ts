import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Driver } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDrivers() {
  return useQuery({
    queryKey: [api.drivers.list.path],
    queryFn: async () => {
      const res = await fetch(api.drivers.list.path);
      if (!res.ok) throw new Error("Failed to fetch drivers");
      return res.json() as Promise<Driver[]>;
    },
  });
}

export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const url = buildUrl(api.drivers.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });
      toast({ title: "Status Updated", description: "Driver status changed successfully." });
    },
  });
}

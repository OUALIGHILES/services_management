import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Driver, InsertDriver } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useDrivers() {
  return useQuery({
    queryKey: [api.drivers.list.path],
    queryFn: async () => {
      const res = await fetch(api.drivers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch drivers");
      return res.json() as Promise<Driver[]>;
    },
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: [api.drivers.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.drivers.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch driver");
      return res.json() as Promise<Driver>;
    },
    enabled: !!id,
  });
}

// For drivers to update their own status
export function useUpdateDriverStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ status, serviceCategory, subService }: { status: string; serviceCategory?: string; subService?: string }) => {
      // Use the new endpoint that checks wallet balance
      const res = await fetch(api.drivers.updateDriverStatus.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, serviceCategory, subService }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Invalidate user profile to update status in UI

      let message = "Driver status changed successfully.";
      if (variables.status === "approved") {
        message = "Driver approved successfully!";
      } else if (variables.status === "offline") {
        message = "Driver rejected successfully!";
      }

      toast({ title: "Status Updated", description: message });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Status",
        description: error.message,
        variant: "destructive"
      });
    },
  });
}

// For admins to update any driver's status
export function useUpdateAnyDriverStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, serviceCategory, subService }: { id: string; status: string; serviceCategory?: string; subService?: string }) => {
      const url = buildUrl(api.drivers.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, serviceCategory, subService }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });

      let message = "Driver status changed successfully.";
      if (variables.status === "approved") {
        message = "Driver approved successfully!";
      } else if (variables.status === "offline") {
        message = "Driver rejected successfully!";
      }

      toast({ title: "Status Updated", description: message });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Updating Status",
        description: error.message,
        variant: "destructive"
      });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<InsertDriver, 'id' | 'createdAt'>>) => {
      const url = buildUrl(api.drivers.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update driver");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });
      toast({ title: "Driver Updated", description: "The driver has been updated successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (driverData: Omit<InsertDriver, 'id' | 'createdAt' | 'walletBalance'>) => {
      const res = await fetch(api.drivers.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverData),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create driver");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });
      toast({ title: "Driver Created", description: "The driver has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

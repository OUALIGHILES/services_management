import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { User, InsertUser, Permission } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useSubAdmins() {
  return useQuery({
    queryKey: [api.users.list.path, { role: 'subadmin' }],
    queryFn: async () => {
      const res = await fetch(`${api.users.list.path}?role=subadmin`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sub-admins");
      return res.json() as Promise<User[]>;
    },
  });
}

export function useCreateSubAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userData: Omit<InsertUser, 'role'>) => {
      const res = await fetch(api.users.list.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, role: "subadmin" }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create sub-admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "Sub-Admin Created", description: "The sub-admin account has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateSubAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<InsertUser, 'role'>>) => {
      const url = buildUrl(api.users.get.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update sub-admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "Sub-Admin Updated", description: "Changes saved successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteSubAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.users.get.path, { id });
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete sub-admin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "Sub-Admin Deleted", description: "The sub-admin account has been deleted." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

// New hooks for permissions management
export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const res = await fetch('/api/permissions', { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch permissions");
      return res.json() as Promise<Permission[]>;
    },
  });
}

export function useSubAdminPermissions(userId: string) {
  return useQuery({
    queryKey: ['subadmin-permissions', userId],
    queryFn: async () => {
      const res = await fetch(`/api/subadmin-permissions/${userId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sub-admin permissions");
      return res.json() as Promise<Permission[]>;
    },
    enabled: !!userId,
  });
}

export function useAssignPermission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      const res = await fetch('/api/subadmin-permissions', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permissionId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to assign permission");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subadmin-permissions'] });
      toast({ title: "Permission Assigned", description: "Permission has been assigned successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useRemovePermission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, permissionId }: { userId: string; permissionId: string }) => {
      const res = await fetch('/api/subadmin-permissions', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, permissionId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove permission");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subadmin-permissions'] });
      toast({ title: "Permission Removed", description: "Permission has been removed successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
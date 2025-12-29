import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { ServiceCategory, Service } from "@shared/schema";

export function useServiceCategories() {
  return useQuery({
    queryKey: [api.services.listCategories.path],
    queryFn: async () => {
      const res = await fetch(api.services.listCategories.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json() as Promise<ServiceCategory[]>;
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: [api.services.list.path],
    queryFn: async () => {
      const res = await fetch(api.services.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json() as Promise<Service[]>;
    },
  });
}

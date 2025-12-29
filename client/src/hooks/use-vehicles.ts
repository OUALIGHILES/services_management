import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Vehicle } from "@shared/schema";

export function useVehicles() {
  return useQuery({
    queryKey: [api.vehicles.list.path],
    queryFn: async () => {
      const res = await fetch(api.vehicles.list.path);
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json() as Promise<Vehicle[]>;
    },
  });
}
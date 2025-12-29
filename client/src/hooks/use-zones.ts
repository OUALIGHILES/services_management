import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Zone {
  id: string;
  name: string;
  address?: string;
  coords?: any;
  avgPrice?: string;
  fixedPrice?: string;
  createdAt: string;
}

export function useZones() {
  return useQuery<Zone[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      const response = await fetch("/api/zones");
      if (!response.ok) {
        throw new Error("Failed to fetch zones");
      }
      return response.json();
    },
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newZone: Omit<Zone, 'id' | 'createdAt'>) => {
      const response = await fetch("/api/zones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newZone),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create zone");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedZone: Zone) => {
      const response = await fetch(`/api/zones/${updatedZone.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedZone),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update zone");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
    },
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InsertMessage, Message } from "@shared/schema";

export function useMessages(orderId?: string) {
  return useQuery({
    queryKey: ["messages", orderId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/messages${orderId ? `?orderId=${orderId}` : ''}`);
      return res.json() as Promise<Message[]>;
    },
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: InsertMessage) => {
      const res = await apiRequest("POST", "/api/messages", message);
      return res.json() as Promise<Message>;
    },
    onSuccess: (data) => {
      // Invalidate messages for the specific order
      queryClient.invalidateQueries({ queryKey: ["messages", data.orderId] });
    },
  });
}
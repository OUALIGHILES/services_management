import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { HelpMessage, InsertHelpMessage } from "@shared/schema";

export function useHelpMessages(ticketId?: string) {
  return useQuery({
    queryKey: ["help-messages", ticketId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/help/tickets/${ticketId}/messages`);
      return res.json() as Promise<HelpMessage[]>;
    },
    enabled: !!ticketId, // Only run query if ticketId is provided
  });
}

export function useCreateHelpMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: InsertHelpMessage) => {
      const res = await apiRequest("POST", "/api/help/messages", message);
      return res.json() as Promise<HelpMessage>;
    },
    onSuccess: (data) => {
      // Invalidate messages for the specific ticket
      queryClient.invalidateQueries({ queryKey: ["help-messages", data.ticketId] });
    },
  });
}

export function useUpdateHelpMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertHelpMessage> }) => {
      const res = await apiRequest("PATCH", `/api/help/messages/${id}`, updates);
      return res.json() as Promise<HelpMessage>;
    },
    onSuccess: (data) => {
      // Invalidate messages for the ticket associated with this message
      queryClient.invalidateQueries({ queryKey: ["help-messages", data.ticketId] });
    },
  });
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { HelpTicket, HelpArticle, InsertHelpTicket, InsertHelpArticle, HelpMessage, InsertHelpMessage } from "@shared/schema";

export function useHelpTickets() {
  return useQuery({
    queryKey: ["help-tickets"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/help/tickets");
      return res.json() as Promise<HelpTicket[]>;
    },
  });
}

export function useHelpArticles() {
  return useQuery({
    queryKey: ["help-articles"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/help/articles");
      return res.json() as Promise<HelpArticle[]>;
    },
  });
}

export function useCreateHelpTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticket: InsertHelpTicket) => {
      const res = await apiRequest("POST", "/api/help/tickets", ticket);
      return res.json() as Promise<HelpTicket>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-tickets"] });
    },
  });
}

export function useUpdateHelpTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertHelpTicket> }) => {
      const res = await apiRequest("PATCH", `/api/help/tickets/${id}`, updates);
      return res.json() as Promise<HelpTicket>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-tickets"] });
    },
  });
}

export function useCreateHelpArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (article: InsertHelpArticle) => {
      const res = await apiRequest("POST", "/api/help/articles", article);
      return res.json() as Promise<HelpArticle>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-articles"] });
    },
  });
}

export function useUpdateHelpArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertHelpArticle> }) => {
      const res = await apiRequest("PATCH", `/api/help/articles/${id}`, updates);
      return res.json() as Promise<HelpArticle>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-articles"] });
    },
  });
}

export function usePublishHelpArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/help/articles/${id}/publish`);
      return res.json() as Promise<HelpArticle>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["help-articles"] });
    },
  });
}

export function useHelpMessages(ticketId: string) {
  return useQuery({
    queryKey: ["help-messages", ticketId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/help/tickets/${ticketId}/messages`);
      return res.json() as Promise<HelpMessage[]>;
    },
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
      // Invalidate the messages query for the specific ticket
      queryClient.invalidateQueries({ queryKey: ["help-messages", data.ticketId] });
      // Also invalidate tickets to update unread counts if needed
      queryClient.invalidateQueries({ queryKey: ["help-tickets"] });
    },
  });
}
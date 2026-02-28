import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// Helper to log Zod parsing errors
function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    // Try to return data anyway casted to T to prevent complete UI crash if schema is slightly off
    return data as T;
  }
  return result.data;
}

export function useTickets() {
  return useQuery({
    queryKey: [api.tickets.list.path],
    queryFn: async () => {
      const res = await fetch(api.tickets.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      return parseWithLogging(api.tickets.list.responses[200], data, "tickets.list");
    },
  });
}

export function useTicket(id: number | null) {
  return useQuery({
    queryKey: [api.tickets.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.tickets.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch ticket");
      const data = await res.json();
      return parseWithLogging(api.tickets.get.responses[200], data, "tickets.get");
    },
    enabled: id !== null,
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<z.infer<typeof api.tickets.update.input>>) => {
      const validated = api.tickets.update.input.parse(updates);
      const url = buildUrl(api.tickets.update.path, { id });
      const res = await fetch(url, {
        method: api.tickets.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400 || res.status === 404) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update ticket");
        }
        throw new Error("Failed to update ticket");
      }
      return parseWithLogging(api.tickets.update.responses[200], await res.json(), "tickets.update");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.tickets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.tickets.get.path, data.id] });
      toast({
        title: "Ticket Updated",
        description: `Ticket status changed to ${data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating ticket",
        description: error.message,
      });
    }
  });
}

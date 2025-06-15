
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event, Batch } from "@/types";

export function useCheckoutQueries(eventId: string | null, batchId?: string | null) {
  const eventQuery = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId,
  });

  const batchQuery = useQuery({
    queryKey: ["batch", batchId],
    queryFn: async () => {
      if (!batchId) return null;

      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("id", batchId)
        .single();

      if (error) throw error;
      return data as Batch;
    },
    enabled: !!batchId,
  });

  // Fallback para buscar lote ativo se não especificado
  const activeBatchQuery = useQuery({
    queryKey: ["active-batch", eventId],
    queryFn: async () => {
      if (!eventId || batchId) return null; // Só busca se não tiver batchId específico

      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_visible", true)
        .gte("end_date", new Date().toISOString())
        .order("order_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Batch | null;
    },
    enabled: !!eventId && !batchId,
  });

  return {
    event: eventQuery.data,
    batch: batchQuery.data || activeBatchQuery.data,
    isLoading: eventQuery.isLoading || batchQuery.isLoading || activeBatchQuery.isLoading,
    error: eventQuery.error || batchQuery.error || activeBatchQuery.error,
  };
}

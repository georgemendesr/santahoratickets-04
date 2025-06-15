
import { supabase } from "@/integrations/supabase/client";
import { Event, TicketData, BatchData, ValidatorProfile } from "@/types/checkin.types";

export const checkinService = {
  async fetchEvent(eventId: string): Promise<Event> {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, date, location")
      .eq("id", eventId)
      .single();

    if (error) throw error;
    return data;
  },

  async fetchTickets(eventId: string): Promise<TicketData[]> {
    const { data, error } = await supabase
      .from("tickets")
      .select(`
        id,
        participant_name,
        participant_email,
        used,
        check_in_time,
        checked_in_by
      `)
      .eq("event_id", eventId);

    if (error) throw error;
    return data || [];
  },

  async fetchBatches(eventId: string): Promise<BatchData[]> {
    const { data, error } = await supabase
      .from("batches")
      .select("id, title")
      .eq("event_id", eventId);

    if (error) throw error;
    return data || [];
  },

  async fetchValidatorProfiles(validatorIds: string[]): Promise<ValidatorProfile[]> {
    if (validatorIds.length === 0) return [];

    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, name")
      .in("id", validatorIds);

    if (error) {
      console.error("Error fetching validator profiles:", error);
      return [];
    }

    return data || [];
  }
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Event, 
  CheckinStats, 
  Participant, 
  CheckinByHour, 
  CheckinByBatch 
} from "@/types/checkin.types";
import { checkinService } from "@/services/checkinService";
import { checkinCalculations } from "@/utils/checkinCalculations";
import { exportCheckins } from "@/utils/checkinExport";

export const useEventCheckins = (eventId: string | undefined) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [checkinStats, setCheckinStats] = useState<CheckinStats>({
    totalTickets: 0,
    checkedIn: 0,
    pending: 0,
    attendanceRate: 0
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [checkinsByHour, setCheckinsByHour] = useState<CheckinByHour[]>([]);
  const [checkinsByBatch, setCheckinsByBatch] = useState<CheckinByBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchEventData = async () => {
      try {
        // Fetch all data in parallel
        const [eventData, ticketsData, batchesData] = await Promise.all([
          checkinService.fetchEvent(eventId),
          checkinService.fetchTickets(eventId),
          checkinService.fetchBatches(eventId)
        ]);

        setEvent(eventData);

        // Fetch validator profiles
        const validatorIds = ticketsData
          .filter(ticket => ticket.checked_in_by)
          .map(ticket => ticket.checked_in_by!);

        const validatorProfiles = await checkinService.fetchValidatorProfiles(validatorIds);

        // Process data
        const formattedParticipants = checkinCalculations.formatParticipants(
          ticketsData,
          batchesData,
          validatorProfiles
        );

        const stats = checkinCalculations.calculateStats(formattedParticipants);
        const hourlyCheckins = checkinCalculations.calculateCheckinsByHour(formattedParticipants);
        const batchCheckins = checkinCalculations.calculateCheckinsByBatch(formattedParticipants);

        // Update state
        setParticipants(formattedParticipants);
        setCheckinStats(stats);
        setCheckinsByHour(hourlyCheckins);
        setCheckinsByBatch(batchCheckins);

      } catch (error: any) {
        console.error("Error fetching event check-in data:", error);
        toast.error("Erro ao carregar dados de check-in");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();

    // Set up real-time subscription for ticket updates
    const channel = supabase
      .channel('checkin-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          // Refresh data when tickets are updated
          fetchEventData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const handleExportCheckins = () => exportCheckins(participants, event);

  return {
    event,
    checkinStats,
    participants,
    checkinsByHour,
    checkinsByBatch,
    loading,
    exportCheckins: handleExportCheckins
  };
};

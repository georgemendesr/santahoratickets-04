
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface CheckinStats {
  totalTickets: number;
  checkedIn: number;
  pending: number;
  attendanceRate: number;
}

interface Participant {
  id: string;
  participant_name: string;
  participant_email: string;
  batch_title: string;
  batch_id: string;
  checked_in: boolean;
  check_in_time: string | null;
  checked_in_by: string | null;
  validator_name: string | null;
}

interface CheckinByHour {
  hour: string;
  count: number;
}

interface CheckinByBatch {
  batch_id: string;
  batch_name: string;
  total: number;
  checked_in: number;
  percentage: number;
}

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
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("id, title, date, location")
          .eq("id", eventId)
          .single();

        if (eventError) throw eventError;
        setEvent(eventData);

        // Fetch participants with check-in data
        const { data: ticketsData, error: ticketsError } = await supabase
          .from("tickets")
          .select(`
            id,
            participant_name,
            participant_email,
            used as checked_in,
            check_in_time,
            checked_in_by,
            batches!inner(
              id,
              title
            ),
            validator:user_profiles!tickets_checked_in_by_fkey(
              name
            )
          `)
          .eq("event_id", eventId);

        if (ticketsError) throw ticketsError;

        const formattedParticipants: Participant[] = ticketsData.map(ticket => ({
          id: ticket.id,
          participant_name: ticket.participant_name || "Nome não informado",
          participant_email: ticket.participant_email || "Email não informado",
          batch_title: ticket.batches?.title || "Lote não identificado",
          batch_id: ticket.batches?.id || "",
          checked_in: ticket.checked_in,
          check_in_time: ticket.check_in_time,
          checked_in_by: ticket.checked_in_by,
          validator_name: ticket.validator?.name || null
        }));

        setParticipants(formattedParticipants);

        // Calculate stats
        const totalTickets = formattedParticipants.length;
        const checkedIn = formattedParticipants.filter(p => p.checked_in).length;
        const pending = totalTickets - checkedIn;
        const attendanceRate = totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0;

        setCheckinStats({
          totalTickets,
          checkedIn,
          pending,
          attendanceRate
        });

        // Calculate check-ins by hour
        const checkinsByHourMap = new Map<string, number>();
        formattedParticipants
          .filter(p => p.check_in_time)
          .forEach(p => {
            const hour = new Date(p.check_in_time!).getHours();
            const hourKey = `${hour}:00`;
            checkinsByHourMap.set(hourKey, (checkinsByHourMap.get(hourKey) || 0) + 1);
          });

        const checkinsByHourArray: CheckinByHour[] = Array.from(checkinsByHourMap.entries())
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => a.hour.localeCompare(b.hour));

        setCheckinsByHour(checkinsByHourArray);

        // Calculate check-ins by batch
        const batchMap = new Map<string, { name: string; total: number; checked_in: number }>();
        formattedParticipants.forEach(p => {
          const existing = batchMap.get(p.batch_id) || { 
            name: p.batch_title, 
            total: 0, 
            checked_in: 0 
          };
          existing.total++;
          if (p.checked_in) existing.checked_in++;
          batchMap.set(p.batch_id, existing);
        });

        const checkinsByBatchArray: CheckinByBatch[] = Array.from(batchMap.entries())
          .map(([batch_id, data]) => ({
            batch_id,
            batch_name: data.name,
            total: data.total,
            checked_in: data.checked_in,
            percentage: data.total > 0 ? Math.round((data.checked_in / data.total) * 100) : 0
          }));

        setCheckinsByBatch(checkinsByBatchArray);

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

  const exportCheckins = async () => {
    try {
      const csvContent = [
        'Nome,Email,Lote,Status,Data Check-in,Operador',
        ...participants.map(p => [
          p.participant_name,
          p.participant_email,
          p.batch_title,
          p.checked_in ? 'Realizado' : 'Pendente',
          p.check_in_time ? new Date(p.check_in_time).toLocaleString() : '',
          p.validator_name || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `checkin-${event?.title}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting check-ins:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  return {
    event,
    checkinStats,
    participants,
    checkinsByHour,
    checkinsByBatch,
    loading,
    exportCheckins
  };
};

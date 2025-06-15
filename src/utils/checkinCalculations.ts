
import { 
  Participant, 
  CheckinStats, 
  CheckinByHour, 
  CheckinByBatch,
  TicketData,
  BatchData,
  ValidatorProfile
} from "@/types/checkin.types";

export const checkinCalculations = {
  formatParticipants(
    ticketsData: TicketData[],
    batchesData: BatchData[],
    validatorProfiles: ValidatorProfile[]
  ): Participant[] {
    const validatorMap = new Map(validatorProfiles.map(profile => [profile.id, profile.name]));
    const defaultBatch = batchesData[0];

    return ticketsData.map(ticket => ({
      id: ticket.id,
      participant_name: ticket.participant_name || "Nome não informado",
      participant_email: ticket.participant_email || "Email não informado",
      batch_title: defaultBatch?.title || "Lote não identificado",
      batch_id: defaultBatch?.id || "",
      checked_in: ticket.used,
      check_in_time: ticket.check_in_time,
      checked_in_by: ticket.checked_in_by,
      validator_name: ticket.checked_in_by ? validatorMap.get(ticket.checked_in_by) || null : null
    }));
  },

  calculateStats(participants: Participant[]): CheckinStats {
    const totalTickets = participants.length;
    const checkedIn = participants.filter(p => p.checked_in).length;
    const pending = totalTickets - checkedIn;
    const attendanceRate = totalTickets > 0 ? Math.round((checkedIn / totalTickets) * 100) : 0;

    return {
      totalTickets,
      checkedIn,
      pending,
      attendanceRate
    };
  },

  calculateCheckinsByHour(participants: Participant[]): CheckinByHour[] {
    const checkinsByHourMap = new Map<string, number>();
    
    participants
      .filter(p => p.check_in_time)
      .forEach(p => {
        const hour = new Date(p.check_in_time!).getHours();
        const hourKey = `${hour}:00`;
        checkinsByHourMap.set(hourKey, (checkinsByHourMap.get(hourKey) || 0) + 1);
      });

    return Array.from(checkinsByHourMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  },

  calculateCheckinsByBatch(participants: Participant[]): CheckinByBatch[] {
    const batchStatsMap = new Map<string, { name: string; total: number; checked_in: number }>();
    
    participants.forEach(p => {
      const existing = batchStatsMap.get(p.batch_id) || { 
        name: p.batch_title, 
        total: 0, 
        checked_in: 0 
      };
      existing.total++;
      if (p.checked_in) existing.checked_in++;
      batchStatsMap.set(p.batch_id, existing);
    });

    return Array.from(batchStatsMap.entries())
      .map(([batch_id, data]) => ({
        batch_id,
        batch_name: data.name,
        total: data.total,
        checked_in: data.checked_in,
        percentage: data.total > 0 ? Math.round((data.checked_in / data.total) * 100) : 0
      }));
  }
};

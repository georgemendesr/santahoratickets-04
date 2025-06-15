
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export interface CheckinStats {
  totalTickets: number;
  checkedIn: number;
  pending: number;
  attendanceRate: number;
}

export interface Participant {
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

export interface CheckinByHour {
  hour: string;
  count: number;
}

export interface CheckinByBatch {
  batch_id: string;
  batch_name: string;
  total: number;
  checked_in: number;
  percentage: number;
}

export interface TicketData {
  id: string;
  participant_name: string | null;
  participant_email: string | null;
  used: boolean;
  check_in_time: string | null;
  checked_in_by: string | null;
}

export interface BatchData {
  id: string;
  title: string;
}

export interface ValidatorProfile {
  id: string;
  name: string;
}

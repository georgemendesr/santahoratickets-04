
export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  purchase_date: string;
  qr_code: string;
  used: boolean;
  created_at?: string;
  qr_code_background?: string;
  qr_code_foreground?: string;
  qr_code_logo?: string;
  qr_code_logo_size?: number;
  check_in_time?: string;
  checked_in_by?: string;
}

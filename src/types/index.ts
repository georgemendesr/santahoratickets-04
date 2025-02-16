
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  available_tickets: number;
  status?: 'published' | 'draft' | 'ended';
  created_at?: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  purchase_date: string;
  qr_code: string;
  used: boolean;
  created_at?: string;
}

export interface PaymentPreference {
  id: string;
  init_point: string;
  ticket_quantity: number;
  total_amount: number;
  event_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'created_at'>;
        Update: Partial<Omit<Ticket, 'id' | 'created_at'>>;
      };
      payment_preferences: {
        Row: PaymentPreference;
        Insert: Omit<PaymentPreference, 'id' | 'created_at'>;
        Update: Partial<Omit<PaymentPreference, 'id' | 'created_at'>>;
      };
    };
  };
}

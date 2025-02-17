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
  gross_revenue?: number;
  net_revenue?: number;
  average_ticket_price?: number;
  pending_orders?: number;
  view_count?: number;
  promo_codes_count?: number;
  pdv_count?: number;
  form_fields_count?: number;
  staff_count?: number;
  checked_in_count?: number;
  total_checkins?: number;
  approved_tickets?: number;
  pending_tickets?: number;
  refunded_tickets?: number;
}

export interface Batch {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  price: number;
  available_tickets: number;
  total_tickets: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'ended' | 'sold_out';
  created_at?: string;
  order_number: number;
  visibility: 'public' | 'guest_only' | 'internal_pdv';
  is_visible: boolean;
  min_purchase: number;
  max_purchase?: number;
  batch_group?: string;
}

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
  attempts?: number;
  card_token?: string;
  error_message?: string;
  external_id?: string;
  installments?: number;
  last_attempt_at?: string;
  payment_type?: string;
  payment_method_id?: string;
  qr_code?: string;
  qr_code_base64?: string;
}

export interface UserProfile {
  id: string;
  cpf: string;
  birth_date: string;
  loyalty_points: number;
  created_at?: string;
}

export interface LoyaltyPointsHistory {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  event_id?: string;
  created_at?: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  code: string;
  event_id: string;
  used_count: number;
  created_at?: string;
}

export interface ReferralUse {
  id: string;
  referral_id: string;
  user_id: string;
  event_id: string;
  created_at?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  active: boolean;
  image?: string;
  created_at?: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'admin' | 'user';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
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
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at'>;
        Update: Partial<Omit<UserProfile, 'created_at'>>;
      };
      loyalty_points_history: {
        Row: LoyaltyPointsHistory;
        Insert: Omit<LoyaltyPointsHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<LoyaltyPointsHistory, 'id' | 'created_at'>>;
      };
      referrals: {
        Row: Referral;
        Insert: Omit<Referral, 'id' | 'created_at'>;
        Update: Partial<Omit<Referral, 'id' | 'created_at'>>;
      };
      referral_uses: {
        Row: ReferralUse;
        Insert: Omit<ReferralUse, 'id' | 'created_at'>;
        Update: Partial<Omit<ReferralUse, 'id' | 'created_at'>>;
      };
      rewards: {
        Row: Reward;
        Insert: Omit<Reward, 'id' | 'created_at'>;
        Update: Partial<Omit<Reward, 'id' | 'created_at'>>;
      };
      reward_redemptions: {
        Row: RewardRedemption;
        Insert: Omit<RewardRedemption, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RewardRedemption, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_roles: {
        Row: UserRoleData;
        Insert: Omit<UserRoleData, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRoleData, 'id' | 'created_at'>>;
      };
    };
  };
}

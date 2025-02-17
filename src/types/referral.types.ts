
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

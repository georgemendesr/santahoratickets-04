
export interface Referral {
  id: string;
  event_id: string;
  referrer_id: string;
  code: string;
  used_count: number;
  created_at: string;
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

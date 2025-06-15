
export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id?: string;
  invite_code: string;
  invited_email?: string;
  created_at: string;
  status: 'pending' | 'completed';
}

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

// Tipo para a tabela existente no banco (será usado internamente)
export interface ExistingReferral {
  id: string;
  event_id: string;
  referrer_id: string;
  code: string;
  used_count: number;
  created_at: string;
}

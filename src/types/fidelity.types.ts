
export interface FidelityPoint {
  id: string;
  user_id: string;
  points: number;
  source: 'purchase' | 'referral' | 'manual' | 'bonus';
  reference_id?: string;
  description?: string;
  created_at: string;
}

export interface FidelityReward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  available_units?: number;
  total_units?: number;
  icon?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FidelityRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_used: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  reward?: FidelityReward;
}

export interface UserPointsBalance {
  total_points: number;
  used_points: number;
  available_points: number;
}

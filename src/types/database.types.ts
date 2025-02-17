
import type { Event } from './event.types';
import type { Ticket } from './ticket.types';
import type { PaymentPreference } from './payment.types';
import type { UserProfile, UserRoleData } from './user.types';
import type { LoyaltyPointsHistory, Reward, RewardRedemption } from './loyalty.types';
import type { Referral, ReferralUse } from './referral.types';

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

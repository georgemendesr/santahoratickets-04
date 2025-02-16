
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { toast } from 'sonner';

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const createProfile = async (cpf: string, birthDate: string) => {
    if (!userId) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            cpf,
            birth_date: birthDate,
            loyalty_points: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Perfil criado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Erro ao criar perfil');
      return null;
    }
  };

  const getLoyaltyPoints = async () => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('loyalty_points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      return [];
    }
  };

  const createReferral = async (eventId: string) => {
    if (!userId || !profile) {
      toast.error('Usuário não autenticado ou sem perfil');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([
          {
            referrer_id: userId,
            event_id: eventId,
            code: await generateReferralCode(),
            used_count: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      toast.success('Link de indicação gerado com sucesso!');
      return data;
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Erro ao gerar link de indicação');
      return null;
    }
  };

  const generateReferralCode = async () => {
    const { data, error } = await supabase.rpc('generate_unique_referral_code');
    if (error) throw error;
    return data;
  };

  return {
    profile,
    loading,
    createProfile,
    getLoyaltyPoints,
    createReferral,
  };
};


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface EventReferral {
  id: string;
  referrer_id: string;
  event_id: string;
  code: string;
  used_count: number;
  created_at: string;
}

interface ReferralUse {
  id: string;
  referral_id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

interface ReferralStats {
  totalReferrals: number;
  totalUses: number;
  totalPointsEarned: number;
}

export function useReferralSystem(eventId: string) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Buscar referral do usuário para este evento
  const { data: userReferral, isLoading: referralLoading } = useQuery({
    queryKey: ["event-referral", session?.user.id, eventId],
    queryFn: async (): Promise<EventReferral | null> => {
      if (!session?.user.id) return null;

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', session.user.id)
        .eq('event_id', eventId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching user referral:", error);
        throw error;
      }

      return data || null;
    },
    enabled: !!session?.user.id && !!eventId,
  });

  // Buscar estatísticas gerais do usuário
  const { data: stats } = useQuery({
    queryKey: ["referral-stats", session?.user.id],
    queryFn: async (): Promise<ReferralStats> => {
      if (!session?.user.id) return {
        totalReferrals: 0,
        totalUses: 0,
        totalPointsEarned: 0
      };

      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', session.user.id);

      const { data: uses } = await supabase
        .from('referral_uses')
        .select('*')
        .in('referral_id', referrals?.map(r => r.id) || []);

      const { data: points } = await supabase
        .from('fidelity_points')
        .select('points')
        .eq('user_id', session.user.id)
        .eq('source', 'referral_reward');

      const totalReferrals = referrals?.length || 0;
      const totalUses = uses?.length || 0;
      const totalPointsEarned = points?.reduce((sum, p) => sum + p.points, 0) || 0;

      return {
        totalReferrals,
        totalUses,
        totalPointsEarned
      };
    },
    enabled: !!session?.user.id,
  });

  // Mutation para criar referral
  const createReferralMutation = useMutation({
    mutationFn: async (): Promise<EventReferral> => {
      if (!session?.access_token) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase.functions.invoke('referrals/create-referral', {
        body: { eventId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      toast.success("Código de convite criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["event-referral"] });
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
    },
    onError: (error: any) => {
      console.error("Error creating referral:", error);
      toast.error(error.message || "Erro ao criar código de convite");
    },
  });

  // Mutation para processar uso de referral
  const processReferralMutation = useMutation({
    mutationFn: async ({ referralCode }: { referralCode: string }) => {
      if (!session?.access_token) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase.functions.invoke('referrals/process-referral', {
        body: { referralCode, eventId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      toast.success("Código de convite aplicado com sucesso! Você ganhou pontos de bônus!");
    },
    onError: (error: any) => {
      console.error("Error processing referral:", error);
      toast.error(error.message || "Erro ao aplicar código de convite");
    },
  });

  return {
    // Dados
    userReferral,
    stats,
    
    // Estados de loading
    isLoading: referralLoading,
    
    // Funções
    createReferral: createReferralMutation.mutate,
    isCreatingReferral: createReferralMutation.isPending,
    processReferral: processReferralMutation.mutate,
    isProcessingReferral: processReferralMutation.isPending,
  };
}


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Referral, ReferralStats } from "@/types/referral.types";

export function useReferrals() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Como estamos usando a nova tabela criada via SQL, vamos fazer queries diretas
  const { data: referrals, isLoading } = useQuery({
    queryKey: ["user-referrals", session?.user.id],
    queryFn: async (): Promise<Referral[]> => {
      if (!session?.user.id) return [];

      // Query direta para a nova tabela que criamos
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching referrals:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!session?.user.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["referral-stats", session?.user.id],
    queryFn: async (): Promise<ReferralStats> => {
      if (!session?.user.id) return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalPointsEarned: 0
      };

      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', session.user.id);

      const { data: points } = await supabase
        .from('fidelity_points')
        .select('points')
        .eq('user_id', session.user.id)
        .eq('source', 'referral_reward');

      const totalReferrals = referrals?.length || 0;
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const totalPointsEarned = points?.reduce((sum, p) => sum + p.points, 0) || 0;

      return {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalPointsEarned
      };
    },
    enabled: !!session?.user.id,
  });

  const createReferralMutation = useMutation({
    mutationFn: async (): Promise<Referral> => {
      if (!session?.user.id) {
        throw new Error("Usuário não autenticado");
      }

      // Usar a função que criamos no SQL
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_invite_code');

      if (codeError || !codeData) {
        throw new Error("Erro ao gerar código de convite");
      }

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: session.user.id,
          invite_code: codeData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Código de indicação criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["user-referrals"] });
      queryClient.invalidateQueries({ queryKey: ["referral-stats"] });
    },
    onError: (error: any) => {
      console.error("Error creating referral:", error);
      toast.error("Erro ao criar código de indicação");
    },
  });

  const registerReferralUseMutation = useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      if (!session?.user.id) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar o referral pelo código
      const { data: referral, error: referralError } = await supabase
        .from('referrals')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (referralError || !referral) {
        throw new Error("Código de convite inválido");
      }

      // Verificar se não é o próprio usuário
      if (referral.referrer_user_id === session.user.id) {
        throw new Error("Você não pode usar seu próprio código de convite");
      }

      // Atualizar o referral com o usuário indicado
      const { error: updateError } = await supabase
        .from('referrals')
        .update({
          referred_user_id: session.user.id
        })
        .eq('id', referral.id);

      if (updateError) {
        throw updateError;
      }

      return referral;
    },
    onSuccess: () => {
      toast.success("Indicação registrada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error registering referral:", error);
      toast.error(error.message || "Erro ao registrar indicação");
    },
  });

  return {
    referrals: referrals || [],
    stats,
    isLoading,
    createReferral: createReferralMutation.mutate,
    isCreatingReferral: createReferralMutation.isPending,
    registerReferralUse: registerReferralUseMutation.mutate,
    isRegisteringReferral: registerReferralUseMutation.isPending,
  };
}

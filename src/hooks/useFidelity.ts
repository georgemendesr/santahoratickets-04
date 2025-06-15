
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FidelityPoint, FidelityReward, FidelityRedemption } from "@/types/fidelity.types";

export const useFidelity = () => {
  const queryClient = useQueryClient();

  // Buscar pontos do usuário
  const { data: userPoints = [], isLoading: loadingPoints } = useQuery({
    queryKey: ["user-fidelity-points"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não logado");

      const { data, error } = await supabase
        .from("fidelity_points")
        .select("*")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FidelityPoint[];
    }
  });

  // Buscar saldo de pontos
  const { data: pointsBalance = 0, isLoading: loadingBalance } = useQuery({
    queryKey: ["user-points-balance"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não logado");

      const { data, error } = await supabase.rpc("get_user_points_balance", {
        user_id_param: user.user.id
      });

      if (error) throw error;
      return data as number;
    }
  });

  // Buscar recompensas disponíveis
  const { data: rewards = [], isLoading: loadingRewards } = useQuery({
    queryKey: ["fidelity-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fidelity_rewards")
        .select("*")
        .eq("active", true)
        .order("points_required", { ascending: true });

      if (error) throw error;
      return data as FidelityReward[];
    }
  });

  // Buscar resgates do usuário
  const { data: redemptions = [], isLoading: loadingRedemptions } = useQuery({
    queryKey: ["user-redemptions"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não logado");

      const { data, error } = await supabase
        .from("fidelity_redemptions")
        .select(`
          *,
          reward:fidelity_rewards(*)
        `)
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FidelityRedemption[];
    }
  });

  // Resgatar recompensa
  const redeemReward = useMutation({
    mutationFn: async ({ rewardId, pointsRequired }: { rewardId: string; pointsRequired: number }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Usuário não logado");

      // Verificar se tem pontos suficientes
      if (pointsBalance < pointsRequired) {
        throw new Error("Pontos insuficientes para este resgate");
      }

      const { data, error } = await supabase
        .from("fidelity_redemptions")
        .insert({
          user_id: user.user.id,
          reward_id: rewardId,
          points_used: pointsRequired,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      // Deduzir pontos criando entrada negativa
      const { error: pointsError } = await supabase
        .from("fidelity_points")
        .insert({
          user_id: user.user.id,
          points: -pointsRequired,
          source: "manual",
          reference_id: data.id,
          description: "Resgate de recompensa"
        });

      if (pointsError) throw pointsError;

      return data;
    },
    onSuccess: () => {
      toast.success("Recompensa resgatada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["user-points-balance"] });
      queryClient.invalidateQueries({ queryKey: ["user-fidelity-points"] });
      queryClient.invalidateQueries({ queryKey: ["user-redemptions"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao resgatar recompensa");
    }
  });

  return {
    userPoints,
    pointsBalance,
    rewards,
    redemptions,
    loadingPoints,
    loadingBalance,
    loadingRewards,
    loadingRedemptions,
    redeemReward: redeemReward.mutate,
    isRedeeming: redeemReward.isPending
  };
};


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface FidelityData {
  balance: number;
  pointsHistory: any[];
  redemptions: any[];
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  available_units: number | null;
  icon: string;
  active: boolean;
}

export function useFidelitySystem() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Buscar dados de fidelidade do usuário
  const { data: fidelityData, isLoading: fidelityLoading, error, refetch } = useQuery({
    queryKey: ["fidelity-data", session?.user.id],
    queryFn: async (): Promise<FidelityData> => {
      if (!session?.access_token) {
        throw new Error("No session available");
      }

      const { data, error } = await supabase.functions.invoke('fidelity/get-user-balance', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("[useFidelitySystem] Error:", error);
        throw error;
      }

      return data.data;
    },
    enabled: !!session?.user.id,
  });

  // Buscar recompensas disponíveis
  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ["fidelity-rewards"],
    queryFn: async (): Promise<Reward[]> => {
      const { data, error } = await supabase.functions.invoke('fidelity/list-rewards');

      if (error) {
        console.error("[useFidelitySystem] Rewards error:", error);
        throw error;
      }

      return data.data || [];
    },
  });

  // Mutation para resgatar recompensa
  const redeemMutation = useMutation({
    mutationFn: async ({ rewardId }: { rewardId: string }) => {
      if (!session?.access_token) {
        throw new Error("No session available");
      }

      const { data, error } = await supabase.functions.invoke('fidelity/redeem-reward', {
        body: { rewardId },
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
      toast.success("Recompensa resgatada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["fidelity-data"] });
      queryClient.invalidateQueries({ queryKey: ["fidelity-rewards"] });
    },
    onError: (error: any) => {
      console.error("Error redeeming reward:", error);
      toast.error(error.message || "Erro ao resgatar recompensa");
    },
  });

  return {
    // Dados
    balance: fidelityData?.balance || 0,
    pointsHistory: fidelityData?.pointsHistory || [],
    redemptions: fidelityData?.redemptions || [],
    rewards: rewards || [],
    
    // Estados de loading
    isLoading: fidelityLoading,
    isRewardsLoading: rewardsLoading,
    
    // Funções
    refetch,
    redeemReward: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
    
    // Error
    error,
  };
}

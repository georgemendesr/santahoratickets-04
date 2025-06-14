
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface FidelityData {
  balance: number;
  pointsHistory: any[];
  redemptions: any[];
}

export function useFidelity() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["fidelity-data", session?.user.id],
    queryFn: async (): Promise<FidelityData> => {
      if (!session?.access_token) {
        throw new Error("No session available");
      }

      console.log("[useFidelity] Fetching fidelity data");

      const { data, error } = await supabase.functions.invoke('fidelity/get-user-balance', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("[useFidelity] Error:", error);
        throw error;
      }

      console.log("[useFidelity] Data received:", data);
      return data.data;
    },
    enabled: !!session?.user.id,
  });

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
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: (error: any) => {
      console.error("Error redeeming reward:", error);
      toast.error(error.message || "Erro ao resgatar recompensa");
    },
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    redeemReward: redeemMutation.mutate,
    isRedeeming: redeemMutation.isPending,
  };
}

export function useRewards() {
  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      console.log("[useRewards] Fetching rewards");

      const { data, error } = await supabase.functions.invoke('fidelity/list-rewards');

      if (error) {
        console.error("[useRewards] Error:", error);
        throw error;
      }

      console.log("[useRewards] Rewards received:", data);
      return data.data;
    },
  });

  return {
    rewards: rewards || [],
    isLoading,
  };
}

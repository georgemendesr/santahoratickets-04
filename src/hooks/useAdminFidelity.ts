
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FidelityReward, FidelityRedemption } from "@/types/fidelity.types";

export const useAdminFidelity = () => {
  const queryClient = useQueryClient();

  // Buscar todas as recompensas (admin)
  const { data: allRewards = [], isLoading: loadingRewards } = useQuery({
    queryKey: ["admin-fidelity-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fidelity_rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FidelityReward[];
    }
  });

  // Buscar todos os resgates (admin)
  const { data: allRedemptions = [], isLoading: loadingRedemptions } = useQuery({
    queryKey: ["admin-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fidelity_redemptions")
        .select(`
          *,
          reward:fidelity_rewards(*),
          user:user_profiles(name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Criar/editar recompensa
  const saveReward = useMutation({
    mutationFn: async (reward: Partial<FidelityReward>) => {
      if (reward.id) {
        const { data, error } = await supabase
          .from("fidelity_rewards")
          .update(reward)
          .eq("id", reward.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("fidelity_rewards")
          .insert(reward)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast.success("Recompensa salva com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-fidelity-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["fidelity-rewards"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao salvar recompensa: " + error.message);
    }
  });

  // Atualizar status do resgate
  const updateRedemptionStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data, error } = await supabase
        .from("fidelity_redemptions")
        .update({ status, notes })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Status do resgate atualizado!");
      queryClient.invalidateQueries({ queryKey: ["admin-redemptions"] });
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar resgate: " + error.message);
    }
  });

  return {
    allRewards,
    allRedemptions,
    loadingRewards,
    loadingRedemptions,
    saveReward: saveReward.mutate,
    isSaving: saveReward.isPending,
    updateRedemptionStatus: updateRedemptionStatus.mutate,
    isUpdating: updateRedemptionStatus.isPending
  };
};


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useAdminRewards() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("No session available");
      }

      const { data, error } = await supabase.functions.invoke('admin/manage-rewards', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    enabled: !!session?.access_token,
  });

  const createMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      if (!session?.access_token) {
        throw new Error("No session available");
      }

      const { data, error } = await supabase.functions.invoke('admin/manage-rewards', {
        body: rewardData,
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
      toast.success("Recompensa criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: (error: any) => {
      console.error("Error creating reward:", error);
      toast.error(error.message || "Erro ao criar recompensa");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      if (!session?.access_token) {
        throw new Error("No session available");
      }

      const { data, error } = await supabase.functions.invoke('admin/manage-rewards', {
        body: rewardData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw error;
      }

      return data.data;
    },
    onSuccess: () => {
      toast.success("Recompensa atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: (error: any) => {
      console.error("Error updating reward:", error);
      toast.error(error.message || "Erro ao atualizar recompensa");
    },
  });

  return {
    rewards,
    isLoading,
    createReward: createMutation.mutate,
    updateReward: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}


import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event, Batch } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export const useEventDetails = (eventId: string | undefined) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { profile, createProfile, createReferral } = useProfile(session?.user.id);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(() => searchParams.get('ref'));
  const [referrer, setReferrer] = useState<{ name: string } | null>(null);

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("ID do evento não fornecido");
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Erro ao buscar evento:", error);
        throw error;
      }
      
      console.log("Evento encontrado:", data);
      return data as Event;
    },
    enabled: !!eventId,
  });

  const { data: batches, isLoading: isLoadingBatches, refetch: refetchBatches } = useQuery({
    queryKey: ["batches", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("ID do evento não fornecido");

      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("event_id", eventId)
        .eq("is_visible", true)
        .order("order_number", { ascending: true });

      if (error) {
        console.error("Erro ao buscar lotes:", error);
        throw error;
      }

      console.log("Lotes encontrados:", data);
      return data as Batch[];
    },
    enabled: !!eventId,
  });

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const result = await createProfile(cpf, birthDate, phone);
      if (!result) throw new Error("Erro ao criar perfil");
      return result;
    },
    onSuccess: () => {
      setShowProfileDialog(false);
      toast.success("Perfil criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar perfil. Por favor, tente novamente.");
      console.error("Erro:", error);
    },
  });

  const createReferralMutation = useMutation({
    mutationFn: async () => {
      if (!eventId) throw new Error("ID do evento não encontrado");
      const result = await createReferral(eventId);
      if (!result) throw new Error("Erro ao gerar link de indicação");
      return result;
    },
    onSuccess: (data) => {
      setReferralCode(data.code);
      toast.success("Link de indicação gerado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar link de indicação");
      console.error("Erro:", error);
    },
  });

  const purchaseTicketMutation = useMutation({
    mutationFn: async ({ batchId, quantity }: { batchId: string; quantity: number }) => {
      if (!session?.user.id) throw new Error("Usuário não autenticado");

      // Buscar o lote para calcular o valor total
      const { data: batch, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("id", batchId)
        .single();

      if (batchError || !batch) throw new Error("Lote não encontrado");

      // Validar quantidade disponível
      if (batch.available_tickets < quantity) {
        throw new Error("Quantidade solicitada não disponível");
      }

      // Validar quantidade mínima e máxima
      if (quantity < batch.min_purchase) {
        throw new Error(`Quantidade mínima: ${batch.min_purchase}`);
      }

      if (batch.max_purchase && quantity > batch.max_purchase) {
        throw new Error(`Quantidade máxima: ${batch.max_purchase}`);
      }

      const totalAmount = batch.price * quantity;

      // Criar preferência de pagamento
      const { data, error } = await supabase
        .from("payment_preferences")
        .insert([
          {
            user_id: session.user.id,
            event_id: eventId!,
            ticket_quantity: quantity,
            total_amount: totalAmount,
            init_point: `checkout-${batchId}-${Date.now()}`,
            status: "pending"
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Atualizar quantidade disponível no lote
      const { error: updateError } = await supabase
        .from("batches")
        .update({ 
          available_tickets: batch.available_tickets - quantity 
        })
        .eq("id", batchId);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: (data) => {
      toast.success("Compra realizada com sucesso!");
      refetchBatches(); // Atualizar dados dos lotes
      navigate(`/checkout/finish?payment=${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao processar compra");
      console.error("Erro na compra:", error);
    },
  });

  const handlePurchase = (batchId: string, quantity: number) => {
    if (!session) {
      toast.error("Faça login para comprar ingressos");
      navigate('/auth');
      return;
    }

    if (!profile) {
      setShowProfileDialog(true);
      return;
    }

    purchaseTicketMutation.mutate({ batchId, quantity });
  };

  return {
    event,
    batches,
    profile,
    referrer,
    referralCode,
    showProfileDialog,
    setShowProfileDialog,
    cpf,
    setCpf,
    birthDate,
    setBirthDate,
    phone,
    setPhone,
    createProfileMutation,
    createReferralMutation,
    handlePurchase,
    isPurchasing: purchaseTicketMutation.isPending,
    isLoading: isLoadingEvent || isLoadingBatches
  };
};

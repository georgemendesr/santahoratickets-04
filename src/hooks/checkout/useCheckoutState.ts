
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { useProfileForm } from "./useProfileForm";
import { createPaymentPreference } from "./usePaymentPreference";

export function useCheckoutState(
  session: Session | null,
  eventId: string | null,
  batch: any
) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    name,
    setName,
    cpf,
    setCpf,
    phone,
    setPhone,
    email,
    setEmail,
    showPaymentForm,
    handleSubmitProfile,
  } = useProfileForm(session);

  const handlePayment = async (paymentData: {
    token?: string;
    installments?: number;
    paymentMethodId: string;
    paymentType: "credit_card" | "pix";
  }) => {
    if (!session?.user || !batch || !eventId) {
      toast.error("Dados inválidos para processamento");
      return;
    }

    setIsLoading(true);
    let toastId = toast.loading("Processando pagamento...");

    try {
      // Criar preferência de pagamento
      const preference = await createPaymentPreference(
        eventId,
        session,
        batch,
        paymentData.paymentType,
        paymentData.paymentMethodId,
        paymentData.token,
        paymentData.installments
      );

      console.log("Chamando create-payment com:", {
        preferenceId: preference.id,
        eventId,
        batchId: batch.id,
        paymentType: paymentData.paymentType,
        paymentMethodId: paymentData.paymentMethodId
      });

      // Chamar Edge Function para processar pagamento real
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          preferenceId: preference.id,
          eventId,
          batchId: batch.id,
          quantity: 1,
          paymentType: paymentData.paymentType,
          paymentMethodId: paymentData.paymentMethodId,
          ...(paymentData.paymentType === "credit_card" ? {
            cardToken: paymentData.token,
            installments: paymentData.installments,
          } : {}),
        }
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        throw new Error(error.message || "Erro ao processar pagamento");
      }

      if (!data) {
        console.error("Resposta vazia da Edge Function");
        throw new Error("Resposta vazia do servidor");
      }

      console.log("Resposta do processamento:", data);

      const { status, payment_id, qr_code, qr_code_base64, message } = data;

      toast.dismiss(toastId);
      
      // Mostrar mensagem de sucesso específica
      if (paymentData.paymentType === "pix" && status === "pending") {
        toast.success("PIX gerado com sucesso! Escaneie o QR Code para pagar.");
      } else if (status === "approved") {
        toast.success("Pagamento aprovado! Redirecionando...");
      } else if (status === "pending") {
        toast.info("Pagamento em análise. Você será notificado quando aprovado.");
      } else if (status === "rejected") {
        toast.error("Pagamento não aprovado. Tente novamente com outro cartão.");
        return;
      }

      // Redirecionar para página de status
      const externalReference = `${eventId}|${preference.id}`;
      navigate(`/payment-status?status=${status}&payment_id=${payment_id}&external_reference=${externalReference}`);

    } catch (error: any) {
      console.error("Erro detalhado ao processar pagamento:", {
        error,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      });
      
      toast.dismiss(toastId);
      
      // Tratamento específico de erros
      let errorMessage = "Erro ao processar pagamento. Tente novamente.";
      
      if (error.message?.includes('Token do Mercado Pago')) {
        errorMessage = "Erro de configuração. Entre em contato com o suporte.";
      } else if (error.message?.includes('Dados do cartão')) {
        errorMessage = "Dados do cartão inválidos. Verifique e tente novamente.";
      } else if (error.message?.includes('Quantidade não disponível')) {
        errorMessage = "Ingressos esgotados. Recarregue a página e tente novamente.";
      } else if (error.message?.includes('não encontrado')) {
        errorMessage = "Evento ou lote não encontrado. Recarregue a página.";
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        action: {
          label: "Tentar Novamente",
          onClick: () => handlePayment(paymentData)
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    setName,
    cpf,
    setCpf,
    phone,
    setPhone,
    email,
    setEmail,
    isLoading,
    showPaymentForm,
    handleSubmitProfile,
    handlePayment,
  };
}

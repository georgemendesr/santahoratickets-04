
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
        paymentType: paymentData.paymentType
      });

      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          preferenceId: preference.id,
          eventId,
          batchId: batch.id,
          quantity: 1,
          paymentType: paymentData.paymentType,
          ...(paymentData.paymentType === "credit_card" ? {
            cardToken: paymentData.token,
            installments: paymentData.installments,
            paymentMethodId: paymentData.paymentMethodId,
          } : {
            paymentMethodId: "pix"
          }),
        }
      });

      if (error) {
        console.error("Erro na resposta da Edge Function:", error);
        throw error;
      }

      if (!data) {
        console.error("Resposta vazia da Edge Function");
        throw new Error("Resposta vazia do servidor");
      }

      console.log("Resposta do processamento:", data);

      const { status, payment_id } = data;

      toast.dismiss(toastId);
      
      if (status === "rejected") {
        toast.error("Pagamento não aprovado. Por favor, tente novamente.");
        return;
      }

      navigate(`/payment-status?status=${status}&payment_id=${payment_id}&external_reference=${eventId}|${preference.id}`);
    } catch (error: any) {
      console.error("Erro detalhado ao processar pagamento:", {
        error,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      });
      toast.dismiss(toastId);
      toast.error(
        error.message || "Erro ao processar seu pagamento. Tente novamente.",
        {
          duration: 5000,
          action: {
            label: "Tentar Novamente",
            onClick: () => handlePayment(paymentData)
          }
        }
      );
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

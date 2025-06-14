
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { useProfileForm } from "./useProfileForm";

export function useCheckoutPro(
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

  const handlePayment = async () => {
    if (!session?.user || !batch || !eventId) {
      toast.error("Dados inválidos para processamento");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Criando preferência de pagamento...");

    try {
      // Criar preferência no Mercado Pago
      const { data, error } = await supabase.functions.invoke("create-payment-preference", {
        body: {
          eventId,
          batchId: batch.id,
          quantity: 1,
          userId: session.user.id
        }
      });

      if (error) {
        console.error("Erro na Edge Function:", error);
        throw new Error(error.message || "Erro ao criar preferência de pagamento");
      }

      if (!data?.init_point) {
        throw new Error("URL de pagamento não foi gerada");
      }

      toast.dismiss(toastId);
      toast.success("Redirecionando para o pagamento...");

      // Redirecionar para o Mercado Pago
      window.location.href = data.init_point;

    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      toast.dismiss(toastId);
      toast.error(error.message || "Erro ao processar pagamento. Tente novamente.");
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


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { validateCPF, validatePhone } from "@/utils/validation";

export function useCheckoutState(
  session: Session | null,
  eventId: string | null,
  batch: any
) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Você precisa estar logado para continuar");
      return;
    }

    if (!name || !cpf || !phone || !email) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!validateCPF(cpf)) {
      toast.error("CPF inválido");
      return;
    }

    if (!validatePhone(phone)) {
      toast.error("Telefone inválido");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("E-mail inválido");
      return;
    }

    setIsLoading(true);

    try {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: session.user.id,
          name,
          cpf,
          phone,
          email
        })
        .select()
        .single();

      if (profileError) throw profileError;

      setShowPaymentForm(true);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar seu perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentPreference = async (
    paymentType: string,
    paymentMethodId: string,
    cardToken?: string,
    installments?: number
  ) => {
    const { data: preference, error } = await supabase
      .from("payment_preferences")
      .insert({
        event_id: eventId,
        user_id: session!.user.id,
        ticket_quantity: 1,
        total_amount: batch.price,
        payment_type: paymentType,
        payment_method_id: paymentMethodId,
        card_token: cardToken,
        installments,
        status: "pending",
        attempts: 0,
        last_attempt_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return preference;
  };

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
        paymentData.paymentType,
        paymentData.paymentMethodId,
        paymentData.token,
        paymentData.installments
      );

      // Processar pagamento
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

      if (error) throw error;
      if (!data) throw new Error("Resposta vazia do servidor");

      const { status, payment_id, qr_code, qr_code_base64 } = data;

      toast.dismiss(toastId);
      
      if (status === "rejected") {
        toast.error("Pagamento não aprovado. Por favor, tente novamente.");
        return;
      }

      navigate(`/payment/${status}?payment_id=${payment_id}`);
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
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

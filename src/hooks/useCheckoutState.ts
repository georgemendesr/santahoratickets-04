
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
      // Primeiro, forçar um refresh do cache do schema
      await supabase.schema('public').forceSchemaReload();

      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          name,
          cpf,
          phone,
          email
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      setShowPaymentForm(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar seu perfil. Tente novamente.");
      setIsLoading(false);
    }
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

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
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
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao processar pagamento");
      }

      const { status, payment_id } = await response.json();
      navigate(`/payment/${status}?payment_id=${payment_id}`);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast.error("Erro ao processar seu pagamento. Tente novamente.");
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

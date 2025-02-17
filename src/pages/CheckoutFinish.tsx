
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CreditCardForm } from "@/components/checkout/CreditCardForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CustomerForm } from "@/components/checkout/CustomerForm";
import { useCheckoutQueries } from "@/hooks/useCheckoutQueries";
import { supabase } from "@/integrations/supabase/client";

const CheckoutFinish = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const eventId = searchParams.get("event");
  const quantity = Number(searchParams.get("quantity")) || 1;

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { event, batch } = useCheckoutQueries(eventId);

  useEffect(() => {
    if (!session) {
      toast.error(
        "É necessário fazer login para finalizar a compra",
        {
          description: "Você será redirecionado para a página de login",
          action: {
            label: "Fazer Login",
            onClick: () => navigate("/auth", { 
              state: { 
                redirect: `/checkout/finish?event=${eventId}&quantity=${quantity}` 
              } 
            })
          },
          duration: 5000
        }
      );
      navigate("/auth", { 
        state: { 
          redirect: `/checkout/finish?event=${eventId}&quantity=${quantity}` 
        } 
      });
    }
  }, [session, navigate, eventId, quantity]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Você precisa estar logado para continuar");
      return;
    }

    if (!name || !cpf || !phone) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          name,
          cpf,
          phone,
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
    token: string;
    installments: number;
    paymentMethodId: string;
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
            quantity,
            cardToken: paymentData.token,
            installments: paymentData.installments,
            paymentMethodId: paymentData.paymentMethodId,
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

  if (!event || !batch) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Home
          </Button>
          <p className="text-center text-lg">Informações não encontradas</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Finalizar Compra - {event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <OrderSummary 
                  event={event}
                  batch={batch}
                  quantity={quantity}
                />

                {!showPaymentForm ? (
                  <CustomerForm
                    name={name}
                    cpf={cpf}
                    phone={phone}
                    isLoading={isLoading}
                    onNameChange={setName}
                    onCpfChange={setCpf}
                    onPhoneChange={setPhone}
                    onSubmit={handleSubmitProfile}
                  />
                ) : (
                  <div className="pt-4 border-t">
                    <CreditCardForm
                      amount={batch.price * quantity}
                      onSubmit={handlePayment}
                      isSubmitting={isLoading}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFinish;

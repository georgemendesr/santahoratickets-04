
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCheckoutQueries } from "@/hooks/useCheckoutQueries";
import { useCheckoutState } from "@/hooks/useCheckoutState";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";

const CheckoutFinish = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const eventId = searchParams.get("event");
  const quantity = Number(searchParams.get("quantity")) || 1;

  const { event, batch } = useCheckoutQueries(eventId);
  const {
    name,
    setName,
    cpf,
    setCpf,
    phone,
    setPhone,
    isLoading,
    showPaymentForm,
    handleSubmitProfile,
    handlePayment,
  } = useCheckoutState(session, eventId, batch);

  if (!event || !batch) {
    return (
      <CheckoutLayout onBackClick={() => navigate("/")}>
        <p className="text-center text-lg">Informações não encontradas</p>
      </CheckoutLayout>
    );
  }

  // Só mostra o aviso de login quando o usuário tentar fazer o pagamento
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitProfile(e);
  };

  // Verificar login apenas quando for fazer o pagamento
  const handlePaymentSubmit = (paymentData: { token: string; installments: number; paymentMethodId: string }) => {
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
      return;
    }
    handlePayment(paymentData);
  };

  return (
    <CheckoutLayout>
      <CheckoutContent
        event={event}
        batch={batch}
        quantity={quantity}
        name={name}
        cpf={cpf}
        phone={phone}
        isLoading={isLoading}
        showPaymentForm={showPaymentForm}
        onNameChange={setName}
        onCpfChange={setCpf}
        onPhoneChange={setPhone}
        onSubmitProfile={handleProfileSubmit}
        onSubmitPayment={handlePaymentSubmit}
      />
    </CheckoutLayout>
  );
};

export default CheckoutFinish;


import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
    email,
    setEmail,
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

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitProfile(e);
  };

  const handlePaymentSubmit = () => {
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
    handlePayment();
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
        email={email}
        isLoading={isLoading}
        showPaymentForm={showPaymentForm}
        onNameChange={setName}
        onCpfChange={setCpf}
        onPhoneChange={setPhone}
        onEmailChange={setEmail}
        onSubmitProfile={handleProfileSubmit}
        onSubmitPayment={handlePaymentSubmit}
      />
    </CheckoutLayout>
  );
};

export default CheckoutFinish;

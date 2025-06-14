
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCheckoutQueries } from "@/hooks/useCheckoutQueries";
import { useCheckoutState } from "@/hooks/useCheckoutState";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi } from "lucide-react";
import { useEffect } from "react";

const CheckoutFinish = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const eventId = searchParams.get("event");
  const quantity = Number(searchParams.get("quantity")) || 1;

  const { event, batch, isLoading, error } = useCheckoutQueries(eventId);
  const {
    name,
    setName,
    cpf,
    setCpf,
    phone,
    setPhone,
    email,
    setEmail,
    isLoading: isProcessingCheckout,
    showPaymentForm,
    handleSubmitProfile,
    handlePayment,
  } = useCheckoutState(session, eventId, batch);

  // Retry logic for failed requests
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        window.location.reload();
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [error]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Por favor, preencha seu nome completo");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error("Por favor, preencha um email válido");
      return;
    }
    if (!cpf.trim()) {
      toast.error("Por favor, preencha seu CPF");
      return;
    }
    if (!phone.trim()) {
      toast.error("Por favor, preencha seu telefone");
      return;
    }

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

    if (!event || !batch) {
      toast.error("Informações do evento não encontradas. Tente novamente.");
      return;
    }

    handlePayment();
  };

  if (isLoading) {
    return (
      <CheckoutLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </CheckoutLayout>
    );
  }

  if (error) {
    return (
      <CheckoutLayout>
        <Alert variant="destructive">
          <Wifi className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>Erro ao carregar informações do checkout. Verifique sua conexão.</p>
            <p className="text-xs">A página será recarregada automaticamente em 5 segundos...</p>
          </AlertDescription>
        </Alert>
      </CheckoutLayout>
    );
  }

  if (!event || !batch) {
    return (
      <CheckoutLayout onBackClick={() => navigate("/")}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Informações do evento não encontradas. Verifique o link e tente novamente.
          </AlertDescription>
        </Alert>
      </CheckoutLayout>
    );
  }

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
        isLoading={isProcessingCheckout}
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


import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCheckoutQueries } from "@/hooks/useCheckoutQueries";
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { CheckoutContent } from "@/components/checkout/CheckoutContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const CheckoutFinish = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const eventId = searchParams.get("event");
  const batchId = searchParams.get("batch");
  const quantity = Number(searchParams.get("quantity")) || 1;

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const { event, batch, isLoading: isLoadingData, error } = useCheckoutQueries(eventId, batchId);

  // Retry logic for failed requests
  useEffect(() => {
    if (error) {
      const retryTimer = setTimeout(() => {
        window.location.reload();
      }, 5000);

      return () => clearTimeout(retryTimer);
    }
  }, [error]);

  // Load user profile data if logged in
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setName(profile.name || "");
          setEmail(profile.email || session.user.email || "");
          setCpf(profile.cpf || "");
          setPhone(profile.phone || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadUserProfile();
  }, [session]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);

    try {
      // Update or create user profile
      if (session?.user?.id) {
        const { error: profileError } = await supabase
          .from("user_profiles")
          .upsert({
            id: session.user.id,
            name: name.trim(),
            email: email.trim(),
            cpf: cpf.trim(),
            phone: phone.trim(),
          });

        if (profileError) throw profileError;
      }

      setShowPaymentForm(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!session) {
      toast.error(
        "É necessário fazer login para finalizar a compra",
        {
          description: "Você será redirecionado para a página de login",
          action: {
            label: "Fazer Login",
            onClick: () => navigate("/auth", { 
              state: { 
                redirect: `/checkout/finish?event=${eventId}&batch=${batchId}&quantity=${quantity}` 
              } 
            })
          },
          duration: 5000
        }
      );
      navigate("/auth", { 
        state: { 
          redirect: `/checkout/finish?event=${eventId}&batch=${batchId}&quantity=${quantity}` 
        } 
      });
      return;
    }

    if (!event || !batch) {
      toast.error("Informações do evento não encontradas. Tente novamente.");
      return;
    }

    setIsLoading(true);

    try {
      // Criar preferência de pagamento usando o sistema de lotes
      const { data, error } = await supabase.functions.invoke("create-payment-preference", {
        body: {
          eventId: event.id,
          batchId: batch.id,
          quantity,
          totalAmount: batch.price * quantity,
        },
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("Link de pagamento não gerado");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
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
            Informações do evento ou lote não encontradas. Verifique o link e tente novamente.
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


import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Event, Batch } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { EventHeader } from "@/components/event-details/EventHeader";
import { EventInfo } from "@/components/event-details/EventInfo";
import { EventActions } from "@/components/event-details/EventActions";
import { ProfileDialog } from "@/components/event-details/ProfileDialog";
import { BatchesTable } from "@/components/event-details/BatchesTable";
import { EventLayout } from "@/components/event-details/EventLayout";
import { EventImage } from "@/components/event-details/EventImage";
import { LoyaltyCard } from "@/components/event-details/LoyaltyCard";
import { ReferralCard } from "@/components/event-details/ReferralCard";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const { profile, createProfile, createReferral } = useProfile(session?.user.id);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(() => searchParams.get('ref'));
  const [referrer, setReferrer] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if (!session) {
      toast.error(
        "É necessário fazer login para acessar os detalhes do evento",
        {
          description: "Você será redirecionado para a página de login",
          action: {
            label: "Fazer Login",
            onClick: () => navigate("/auth", { state: { redirect: `/event/${id}` } })
          },
          duration: 5000
        }
      );
      navigate("/auth", { state: { redirect: `/event/${id}` } });
    }
  }, [session, navigate, id]);

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do evento não fornecido");
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  const { data: batches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ["batches", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do evento não fornecido");

      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("event_id", id)
        .order("order_number", { ascending: true });

      if (error) throw error;
      return data as Batch[];
    },
    enabled: !!id,
  });

  useEffect(() => {
    const fetchReferrer = async () => {
      if (!referralCode) return;

      try {
        const { data, error } = await supabase
          .from("referrals")
          .select(`
            *,
            user_profiles (
              id,
              cpf
            )
          `)
          .eq("code", referralCode)
          .single();

        if (error) throw error;
        if (data) {
          setReferrer({ name: `CPF: ${data.user_profiles.cpf.slice(-4)}` });
        }
      } catch (error) {
        console.error("Erro ao buscar informações do indicador:", error);
      }
    };

    fetchReferrer();
  }, [referralCode]);

  const createProfileMutation = useMutation({
    mutationFn: async () => {
      const result = await createProfile(cpf, birthDate, phone);
      if (!result) throw new Error("Erro ao criar perfil");
      return result;
    },
    onSuccess: () => {
      setShowProfileDialog(false);
      toast.success("Perfil criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar perfil. Por favor, tente novamente.");
      console.error("Erro:", error);
    },
  });

  const createReferralMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID do evento não encontrado");
      const result = await createReferral(id);
      if (!result) throw new Error("Erro ao gerar link de indicação");
      return result;
    },
    onSuccess: (data) => {
      setReferralCode(data.code);
      toast.success("Link de indicação gerado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar link de indicação");
      console.error("Erro:", error);
    },
  });

  const createPaymentPreference = useMutation({
    mutationFn: async () => {
      if (!session?.user.id || !event) return null;

      const { data, error } = await supabase
        .from("payment_preferences")
        .insert([
          {
            user_id: session.user.id,
            event_id: event.id,
            ticket_quantity: 1,
            total_amount: event.price,
            init_point: "URL_DO_CHECKOUT",
            status: "pending"
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        toast.success("Pedido criado com sucesso!");
        navigate("/");
      }
    },
    onError: (error) => {
      console.error("Erro ao criar preferência de pagamento:", error);
      toast.error("Erro ao processar pedido. Por favor, tente novamente.");
    }
  });

  const handleShare = async () => {
    if (!session) {
      toast.error("Faça login para compartilhar o evento");
      return;
    }

    if (!profile) {
      setShowProfileDialog(true);
      return;
    }

    createReferralMutation.mutate();
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfileMutation.mutate();
  };

  const handlePurchase = () => {
    if (!session) {
      toast.error(
        "É necessário fazer login para comprar pulseiras",
        {
          description: "Você será redirecionado para a página de login",
          action: {
            label: "Fazer Login",
            onClick: () => navigate("/auth")
          },
          duration: 5000
        }
      );
      return;
    }

    createPaymentPreference.mutate();
  };

  const getLowStockAlert = (availableTickets: number) => {
    if (availableTickets <= 5 && availableTickets > 0) {
      return (
        <p className="text-sm text-yellow-600 font-medium">
          Últimas unidades disponíveis!
        </p>
      );
    }
    if (availableTickets === 0) {
      return (
        <p className="text-sm text-red-600 font-medium">
          Ingressos esgotados
        </p>
      );
    }
    return null;
  };

  const isLoading = isLoadingEvent || isLoadingBatches;

  if (!session) {
    return null;
  }

  if (isLoading) {
    return (
      <EventLayout onBack={() => navigate(-1)}>
        <p>Carregando...</p>
      </EventLayout>
    );
  }

  if (!event) {
    return (
      <EventLayout onBack={() => navigate(-1)}>
        <p>Evento não encontrado</p>
      </EventLayout>
    );
  }

  return (
    <EventLayout onBack={() => navigate(-1)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <EventImage src={event?.image} alt={event?.title} />

        <div className="space-y-6">
          {event && <EventHeader event={event} />}

          {referrer && (
            <Alert>
              <AlertDescription className="text-sm">
                Você está comprando através da indicação de usuário final {referrer.name}
              </AlertDescription>
            </Alert>
          )}

          {event && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <EventInfo event={event} getLowStockAlert={getLowStockAlert} />

                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p className="font-medium">{event.location}</p>
                </div>

                {getLowStockAlert(event.available_tickets)}

                <EventActions
                  event={event}
                  isAdmin={isAdmin}
                  onPurchase={handlePurchase}
                  onShare={handleShare}
                  onEdit={() => navigate(`/edit/${event.id}`)}
                />
              </CardContent>
            </Card>
          )}

          <BatchesTable batches={batches || []} />

          {profile && <LoyaltyCard points={profile.loyalty_points} />}

          {referralCode && <ReferralCard code={referralCode} />}
        </div>
      </div>

      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        cpf={cpf}
        birthDate={birthDate}
        phone={phone}
        onCpfChange={setCpf}
        onBirthDateChange={setBirthDate}
        onPhoneChange={setPhone}
        onSubmit={handleProfileSubmit}
        isPending={createProfileMutation.isPending}
      />
    </EventLayout>
  );
};

export default EventDetails;

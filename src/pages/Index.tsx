
import { useQuery, useMutation } from "@tanstack/react-query";
import { Event } from "@/types";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ProfileDialog } from "@/components/event-details/ProfileDialog";
import { useState } from "react";
import { EventHeader } from "@/components/home/EventHeader";
import { EventCard } from "@/components/home/EventCard";
import { BenefitsSection } from "@/components/home/BenefitsSection";

export default function Index() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { profile, createProfile } = useProfile(session?.user.id);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const currentEvent = events?.[0];

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

    if (!profile?.cpf) {
      setShowProfileDialog(true);
      return;
    }

    createPaymentPreference.mutate();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = await createProfile(cpf, birthDate, phone);
    if (profile) {
      setShowProfileDialog(false);
      createPaymentPreference.mutate();
    }
  };

  const createPaymentPreference = useMutation({
    mutationFn: async () => {
      if (!session?.user.id || !currentEvent) return null;

      const { data: batch, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("event_id", currentEvent.id)
        .eq("status", "active")
        .order("order_number", { ascending: true })
        .limit(1)
        .single();

      if (batchError) throw batchError;

      const { data, error } = await supabase
        .from("payment_preferences")
        .insert([
          {
            user_id: session.user.id,
            event_id: currentEvent.id,
            ticket_quantity: 1,
            total_amount: batch.price,
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
        toast.success("Pedido criado com sucesso!", {
          description: "Você será redirecionado para o checkout",
        });
        navigate(`/checkout/${data.id}`);
      }
    },
    onError: (error) => {
      console.error("Erro ao criar preferência de pagamento:", error);
      toast.error("Erro ao processar pedido. Por favor, tente novamente.");
    }
  });

  const getBatchInfo = (event: Event) => {
    const today = new Date();
    const eventDate = new Date(event.date);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysUntilEvent > 30) {
      return { name: "1º Lote", class: "text-green-600" };
    } else if (daysUntilEvent > 15) {
      return { name: "2º Lote", class: "text-yellow-600" };
    }
    return { name: "3º Lote", class: "text-red-600" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto">
          <div className="text-center">
            <p>Carregando evento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto">
          <div className="text-center mt-8">
            <p className="text-lg text-muted-foreground">
              Nenhum evento disponível no momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const batchInfo = getBatchInfo(currentEvent);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <EventHeader />

        {/* Main Content */}
        <div className="max-w-5xl mx-auto space-y-12">
          <EventCard 
            event={currentEvent}
            batchInfo={batchInfo}
            onPurchase={handlePurchase}
            isPending={createPaymentPreference.isPending}
          />

          <BenefitsSection />
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
        isPending={createPaymentPreference.isPending}
      />
    </div>
  );
}

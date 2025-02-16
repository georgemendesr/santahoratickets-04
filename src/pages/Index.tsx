import { useQuery, useMutation } from "@tanstack/react-query";
import { Event } from "@/types";
import { supabase } from "@/lib/supabase";
import { EventCard } from "@/components/ui/event-card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, Gift, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const navigate = useNavigate();
  const { session } = useAuth();
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

    // Criar preferência de pagamento
    createPaymentPreference.mutate();
  };

  const createPaymentPreference = useMutation({
    mutationFn: async () => {
      if (!session?.user.id || !currentEvent) return null;

      const { data, error } = await supabase
        .from("payment_preferences")
        .insert([
          {
            user_id: session.user.id,
            event_id: currentEvent.id,
            ticket_quantity: 1,
            total_amount: currentEvent.price,
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
          Pulseiras esgotadas
        </p>
      );
    }
    return null;
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto p-8">
        <header className="text-center mb-12">
          <img 
            src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
            alt="Logo Santinha" 
            className="h-32 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold mb-4">Vem pro Santinha, Vem!</h1>
        </header>

        <div className="max-w-5xl mx-auto space-y-12">
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[400px] relative overflow-hidden">
                <img
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-bold">{currentEvent.title}</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/event/${currentEvent.id}`)}
                    >
                      Ver detalhes
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{currentEvent.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-5 w-5" />
                      <span>{currentEvent.date} - {currentEvent.time}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-5 w-5" />
                      <span>{currentEvent.location}</span>
                    </div>
                  </div>
                  
                  {getLowStockAlert(currentEvent.available_tickets)}
                </div>

                <div className="space-y-4">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(currentEvent.price)}
                  </div>
                  
                  <Button 
                    size="lg"
                    className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold shadow-lg"
                    onClick={handlePurchase}
                    disabled={currentEvent.available_tickets === 0 || createPaymentPreference.isPending}
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    {createPaymentPreference.isPending ? "Processando..." : "Comprar Pulseira"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Sistema de Pontos
                </CardTitle>
                <CardDescription>
                  Acumule pontos e ganhe benefícios exclusivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <p>Ganhe 1 ponto para cada pulseira comprada</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <p>Ganhe pontos extras ao indicar amigos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <p>Acumule pontos e troque por brindes exclusivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Benefícios
                </CardTitle>
                <CardDescription>
                  Vantagens exclusivas para membros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <p>Acesso antecipado às vendas de pulseiras</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <p>Descontos exclusivos em eventos especiais</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <p>Brindes e experiências VIP</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

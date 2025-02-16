
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";
import { supabase } from "@/lib/supabase";
import { EventCard } from "@/components/ui/event-card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-8">
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
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-8">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto p-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Próximo Evento</h1>
          <p className="text-xl text-muted-foreground">
            Não perca esta experiência única
          </p>
        </header>

        <div className="max-w-5xl mx-auto">
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
                  <h2 className="text-3xl font-bold">{currentEvent.title}</h2>
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
                    className="w-full"
                    onClick={() => navigate(`/event/${currentEvent.id}`)}
                    disabled={currentEvent.available_tickets === 0}
                  >
                    <Ticket className="mr-2 h-5 w-5" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

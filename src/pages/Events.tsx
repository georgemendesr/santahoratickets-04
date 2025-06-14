
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Plus, Users } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Events() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;
        return data as Event[];
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
        throw error;
      }
    },
  });

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleCreateEvent = () => {
    if (!session) {
      navigate("/auth");
      return;
    }
    navigate("/eventos/criar");
  };

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <p className="text-lg text-red-600">Erro ao carregar eventos. Por favor, tente novamente mais tarde.</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
              <p className="text-muted-foreground">
                Descubra e participe dos melhores eventos
              </p>
            </div>
            {isAdmin && (
              <Button onClick={handleCreateEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Evento
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {format(new Date(event.date), "PPP", { locale: ptBR })} às {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {event.available_tickets} ingressos disponíveis
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-lg font-semibold">
                        A partir de R$ {event.price?.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum evento disponível</h3>
              <p className="text-muted-foreground mb-6">
                Não há eventos cadastrados no momento.
              </p>
              {isAdmin && (
                <Button onClick={handleCreateEvent}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Evento
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

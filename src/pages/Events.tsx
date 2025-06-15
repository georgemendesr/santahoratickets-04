
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { EventCard } from "@/components/ui/event-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Event } from "@/types";

const Events = () => {
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Eventos</h1>
            <p className="text-muted-foreground mt-2">
              Descubra os melhores eventos da região
            </p>
          </div>
          
          {isAdmin && (
            <Button asChild>
              <Link to="/eventos/criar">
                <Plus className="mr-2 h-4 w-4" />
                Criar Evento
              </Link>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Nenhum evento encontrado</h2>
            <p className="text-muted-foreground mb-6">
              Ainda não há eventos publicados. Volte em breve!
            </p>
            {isAdmin && (
              <Button asChild>
                <Link to="/eventos/criar">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Evento
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                showAdminActions={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Events;


import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";
import { supabase } from "@/lib/supabase";
import { EventCard } from "@/components/ui/event-card";

export default function Index() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-8">
        <div className="container mx-auto">
          <div className="text-center">
            <p>Carregando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-8">
      <div className="container mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Eventos Disponíveis</h1>
          <p className="text-xl text-muted-foreground">
            Encontre os melhores eventos e garanta seu ingresso
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {events?.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-lg text-muted-foreground">
              Nenhum evento disponível no momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Calendar, Clock, Ticket } from "lucide-react";

export function EventHeader() {
  const navigate = useNavigate();

  const { data: event } = useQuery({
    queryKey: ["next-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data as Event;
    },
  });

  const handlePurchase = () => {
    if (event) {
      navigate(`/evento/${event.id}`);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background com overlay */}
      <div className="absolute inset-0">
        <div className="relative h-full w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-background z-10" />
          <div className="absolute inset-0">
            <img 
              src="/lovable-uploads/3932db3c-50e4-470f-b6df-55c45faf431c.png"
              alt="Ambiente do evento"
              className="w-full h-full object-cover animate-fade-in"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative z-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo */}
          <div className="relative group animate-fade-in mb-12">
            <img 
              src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
              alt="Logo Santinha" 
              className="h-48 mx-auto hover:scale-105 transition-transform duration-300 filter drop-shadow-xl"
            />
          </div>

          {/* Informações do Evento */}
          {event && (
            <div className="space-y-6 text-white">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                {event.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(event.date), "PPPP", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>

              <Button 
                size="lg"
                onClick={handlePurchase}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Ticket className="mr-2 h-5 w-5" />
                Comprar Pulseira
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/70 rounded-full" />
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

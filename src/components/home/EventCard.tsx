
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, Users, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface EventCardProps {
  event: Event;
  batchInfo: { name: string; class: string; };
  onPurchase: () => void;
  isPending: boolean;
}

export function EventCard({ 
  event, 
  batchInfo, 
  onPurchase,
  isPending 
}: EventCardProps) {
  const navigate = useNavigate();
  
  const { data } = supabase.storage
    .from('event-images')
    .getPublicUrl(event.image);

  const imageUrl = data?.publicUrl;
  const placeholderUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-all duration-300">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[400px] relative overflow-hidden group">
          <img
            src={imageUrl || placeholderUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = placeholderUrl;
            }}
          />
          <div className="absolute top-4 right-4">
            <span className={`px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm font-bold shadow-lg ${batchInfo.class}`}>
              {batchInfo.name}
            </span>
          </div>
          {event.view_count !== undefined && (
            <div className="absolute bottom-4 right-4">
              <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-sm">
                <Users className="inline-block w-4 h-4 mr-1" />
                {event.view_count} visualizações
              </span>
            </div>
          )}
        </div>
        
        <div className="p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {event.title}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/event/${event.id}`)}
                className="hover:bg-purple-50"
              >
                Ver detalhes
              </Button>
            </div>
            
            <p className="text-gray-600">{event.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                <span>
                  {format(new Date(event.date), "dd/MM/yyyy")} - {event.time}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-2 h-5 w-5 text-purple-500" />
                <span>{event.location}</span>
              </div>

              {/* Estatísticas do evento */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center text-gray-600">
                  <Ticket className="mr-2 h-5 w-5 text-purple-500" />
                  <span>{event.available_tickets} disponíveis</span>
                </div>
                {event.approved_tickets !== undefined && (
                  <div className="flex items-center text-gray-600">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    <span>{event.approved_tickets} vendidos</span>
                  </div>
                )}
                {event.pending_tickets !== undefined && event.pending_tickets > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                    <span>{event.pending_tickets} pendentes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(event.price)}
              </div>
              {event.gross_revenue !== undefined && event.gross_revenue > 0 && (
                <div className="text-sm text-gray-600 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-green-500" />
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(event.gross_revenue)}
                </div>
              )}
            </div>
            
            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-300"
              onClick={onPurchase}
              disabled={isPending}
            >
              <Ticket className="mr-2 h-5 w-5" />
              {isPending ? "Processando..." : "Comprar Pulseira"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

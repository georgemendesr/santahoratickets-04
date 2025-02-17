
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const formattedDate = format(new Date(event.date), "dd 'de' MMMM", { locale: ptBR });
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-purple-100 hover:shadow-xl transition-all duration-300">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[400px] relative overflow-hidden group">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm font-bold shadow-lg ${batchInfo.class}`}>
              {batchInfo.name}
            </span>
          </div>
        </div>
        
        <div className="p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {event.title}
            </h2>
            
            <p className="text-gray-600">{event.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                <span>
                  {formattedDate} - {event.time}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-2 h-5 w-5 text-purple-500" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(event.price)}
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
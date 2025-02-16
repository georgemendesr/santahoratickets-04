
import { Event } from "@/types";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: Event;
  batchInfo: { name: string; class: string; };
  getLowStockAlert: (availableTickets: number) => JSX.Element | null;
  onPurchase: () => void;
  isPending: boolean;
}

export function EventCard({ 
  event, 
  batchInfo, 
  getLowStockAlert, 
  onPurchase,
  isPending 
}: EventCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-[400px] relative overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-4 py-2 rounded-full bg-white font-bold ${batchInfo.class}`}>
              {batchInfo.name}
            </span>
          </div>
        </div>
        <div className="p-8 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold">{event.title}</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                Ver detalhes
              </Button>
            </div>
            <p className="text-muted-foreground">{event.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-5 w-5" />
                <span>{event.date} - {event.time}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                <span>{event.location}</span>
              </div>
            </div>
            
            {getLowStockAlert(event.available_tickets)}
          </div>

          <div className="space-y-4">
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(event.price)}
            </div>
            
            <Button 
              size="lg"
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold shadow-lg"
              onClick={onPurchase}
              disabled={event.available_tickets === 0 || isPending}
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

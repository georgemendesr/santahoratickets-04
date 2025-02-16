
import { Button } from "@/components/ui/button";
import { Edit, Share2, Ticket } from "lucide-react";
import { Event } from "@/types";

interface EventActionsProps {
  event: Event;
  isAdmin: boolean;
  onPurchase: () => void;
  onShare: () => void;
  onEdit: () => void;
}

export function EventActions({ 
  event, 
  isAdmin, 
  onPurchase, 
  onShare, 
  onEdit 
}: EventActionsProps) {
  return (
    <div className="flex gap-4">
      <Button 
        className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold shadow-lg" 
        onClick={onPurchase}
        disabled={event.available_tickets === 0}
      >
        <Ticket className="mr-2 h-4 w-4" />
        Comprar Pulseira
      </Button>
      <Button variant="outline" onClick={onShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Indicar
      </Button>
      {isAdmin && (
        <Button
          variant="outline"
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      )}
    </div>
  );
}

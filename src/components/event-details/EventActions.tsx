
import { Button } from "@/components/ui/button";
import { Edit, Share2, Ticket, Plus, Minus } from "lucide-react";
import { Event } from "@/types";
import { useState } from "react";

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
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleDecrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-medium text-lg w-8 text-center">{quantity}</span>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleIncrement}
          disabled={quantity >= 10}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

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
    </div>
  );
}

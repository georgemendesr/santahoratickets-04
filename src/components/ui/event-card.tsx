import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { EventInfo } from "../event-details/EventInfo";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/integrations/supabase/utils";
import { Event } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Pencil, Copy, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface EventCardProps {
  event: Event;
  isAdmin?: boolean;
}

const getLowStockAlert = (availableTickets: number) => {
  if (availableTickets <= 5 && availableTickets > 0) {
    return (
      <Badge variant="destructive">
        Últimos ingressos! ({availableTickets} restantes)
      </Badge>
    );
  }

  if (availableTickets === 0) {
    return <Badge variant="destructive">Esgotado</Badge>;
  }

  return null;
};

export function EventCard({ event, isAdmin = false }: EventCardProps) {
  const navigate = useNavigate();
  const { publicUrl } = getImageUrl(event.image);

  return (
    <Card className="overflow-hidden group">
      <AspectRatio ratio={16 / 9}>
        <img
          src={publicUrl}
          alt={event.title}
          className="object-cover w-full h-full transition-transform group-hover:scale-105"
        />
      </AspectRatio>
      <CardContent className="space-y-4 p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description}
            </CardDescription>
          </div>
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/edit/${event.id}`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/duplicate/${event.id}`)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <EventInfo event={event} getLowStockAlert={getLowStockAlert} />
        
        <Button 
          className="w-full" 
          onClick={() => navigate(`/event/${event.id}`)}
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, Edit, Settings } from "lucide-react";
import { Event } from "@/types";
import { Link } from "react-router-dom";

interface EventCardProps {
  event: Event;
  showAdminActions?: boolean;
}

export function EventCard({ event, showAdminActions = false }: EventCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // Remove seconds
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="relative">
        {event.image && (
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        {showAdminActions && (
          <div className="absolute top-2 right-2 flex gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              asChild
            >
              <Link to={`/eventos/${event.id}/editar`}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Link>
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              asChild
            >
              <Link to={`/admin/lotes?event=${event.id}`}>
                <Settings className="h-4 w-4 mr-1" />
                Lotes
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      <CardHeader>
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <CalendarDays className="w-3 h-3 mr-1" />
            {formatDate(event.date)} - {formatTime(event.time)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            {event.location}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {event.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              R$ {event.price.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {event.available_tickets} disponíveis
            </p>
          </div>
          
          <Button asChild>
            <Link to={`/eventos/${event.id}`}>
              Ver Detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

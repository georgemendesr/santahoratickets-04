
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Event } from "@/types";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="card-hover overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="text-sm">{event.date} - {event.time}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Ticket className="mr-2 h-4 w-4" />
            <span className="text-sm">{event.available_tickets} tickets available</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">R$ {event.price.toFixed(2)}</span>
          <Button onClick={() => navigate(`/event/${event.id}`)}>
            Buy Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

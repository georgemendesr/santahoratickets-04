
import { Event } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventDetailsHeaderProps {
  event: Event;
}

export function EventDetailsHeader({ event }: EventDetailsHeaderProps) {
  const eventDate = new Date(event.date);
  const now = new Date();
  const isEventPast = eventDate < now;

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {event.title}
      </h1>
      
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        <Badge variant="secondary" className="text-base px-4 py-2">
          <CalendarDays className="h-5 w-5 mr-2" />
          {format(eventDate, 'PPPP', { locale: ptBR })}
        </Badge>
        
        <Badge variant="secondary" className="text-base px-4 py-2">
          <Clock className="h-5 w-5 mr-2" />
          {event.time}
        </Badge>
        
        <Badge variant="secondary" className="text-base px-4 py-2">
          <MapPin className="h-5 w-5 mr-2" />
          {event.location}
        </Badge>
      </div>

      {isEventPast && (
        <Badge variant="outline" className="text-lg px-6 py-2 border-red-500 text-red-600">
          Evento encerrado em {format(eventDate, 'dd/MM/yyyy', { locale: ptBR })}
        </Badge>
      )}
    </div>
  );
}

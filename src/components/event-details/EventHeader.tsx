
import { Event } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground">
          {format(new Date(event.date), "PPPP", { locale: ptBR })} às {event.time}
        </p>
        <p className="text-muted-foreground">{event.location}</p>
      </div>
      <p className="text-sm">{event.description}</p>
    </div>
  );
}


import { Event } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
      <p className="text-lg text-muted-foreground">
        {event.description}
      </p>
    </div>
  );
}

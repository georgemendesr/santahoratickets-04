
import { Event } from "@/types";

interface EventInfoProps {
  event: Event;
  getLowStockAlert: (availableTickets: number) => React.ReactNode;
}

export function EventInfo({ event, getLowStockAlert }: EventInfoProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-muted-foreground">{event.description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{event.date}</span>
          <span>•</span>
          <span>{event.time}</span>
          <span>•</span>
          <span>{event.location}</span>
        </div>
        {getLowStockAlert(event.available_tickets)}
      </div>
    </div>
  );
}


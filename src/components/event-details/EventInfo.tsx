
import { Event } from "@/types";

interface EventInfoProps {
  event: Event;
  getLowStockAlert: (availableTickets: number) => React.ReactNode;
}

export function EventInfo({ event, getLowStockAlert }: EventInfoProps) {
  return (
    <div className="space-y-2">
      {getLowStockAlert(event.available_tickets)}
    </div>
  );
}


import { Event } from "@/types";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventInfoProps {
  event: Event;
  getLowStockAlert: (availableTickets: number) => React.ReactNode;
}

export function EventInfo({ event, getLowStockAlert }: EventInfoProps) {
  // Combina a data e hora em um único objeto Date
  const eventDateTime = parse(
    `${event.date} ${event.time}`,
    'yyyy-MM-dd HH:mm:ss',
    new Date()
  );

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm text-muted-foreground">Data</p>
        <p className="font-medium">
          {format(eventDateTime, "PPP", { locale: ptBR })}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Horário</p>
        <p className="font-medium">
          {format(eventDateTime, "p", { locale: ptBR })}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Local</p>
        <p className="font-medium">{event.location}</p>
      </div>

      {getLowStockAlert(event.available_tickets)}
    </div>
  );
}

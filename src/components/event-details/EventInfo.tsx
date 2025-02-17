
import { Event } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventInfoProps {
  event: Event;
  getLowStockAlert: (availableTickets: number) => React.ReactNode;
}

export function EventInfo({ event, getLowStockAlert }: EventInfoProps) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm text-muted-foreground">Data</p>
        <p className="font-medium">
          {format(new Date(event.start_date), "PPP", { locale: ptBR })}
          {event.end_date && (
            <> até {format(new Date(event.end_date), "PPP", { locale: ptBR })}</>
          )}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Horário</p>
        <p className="font-medium">
          {format(new Date(event.start_date), "p", { locale: ptBR })}
          {event.end_date && (
            <> até {format(new Date(event.end_date), "p", { locale: ptBR })}</>
          )}
        </p>
      </div>
    </div>
  );
}

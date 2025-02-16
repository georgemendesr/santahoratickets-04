
import { Event } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventInfoProps {
  event: Event;
  getLowStockAlert: (availableTickets: number) => JSX.Element | null;
}

export function EventInfo({ event, getLowStockAlert }: EventInfoProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Data</p>
        <p className="font-medium">
          {format(new Date(event.date), "PPP", { locale: ptBR })}
        </p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Horário</p>
        <p className="font-medium">{event.time}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Preço</p>
        <p className="font-medium">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(event.price)}
        </p>
      </div>
    </div>
  );
}

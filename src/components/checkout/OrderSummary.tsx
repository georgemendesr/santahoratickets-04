
import { Batch, Event } from "@/types";

interface OrderSummaryProps {
  event: Event;
  batch: Batch;
  quantity: number;
}

export function OrderSummary({ event, batch, quantity }: OrderSummaryProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Lote</p>
        <p className="font-medium">{batch.title}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Quantidade</p>
        <p className="font-medium">{quantity} ingresso(s)</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Valor Total</p>
        <p className="font-medium">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(batch.price * quantity)}
        </p>
      </div>
    </div>
  );
}

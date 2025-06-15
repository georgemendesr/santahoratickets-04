
import { Batch } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, AlertCircle } from "lucide-react";
import { BatchesTable } from "./BatchesTable";
import { Participant } from "@/components/checkout/ParticipantForm";

interface TicketAvailabilityProps {
  batches: Batch[];
  onPurchase: (batchId: string, quantity: number, participants: Participant[]) => void;
  isPurchasing?: boolean;
}

export function TicketAvailability({ batches, onPurchase, isPurchasing = false }: TicketAvailabilityProps) {
  const hasAvailableBatches = batches.length > 0;
  const allSoldOut = batches.length > 0 && batches.every(batch => batch.available_tickets === 0);

  if (!hasAvailableBatches) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Nenhum ingresso disponível
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Não há lotes de ingressos cadastrados para este evento no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (allSoldOut) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2 text-red-600">
            Ingressos Esgotados
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Todos os ingressos para este evento foram vendidos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-6 w-6" />
          Ingressos Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BatchesTable 
          batches={batches} 
          onPurchase={onPurchase}
          isLoading={isPurchasing}
        />
      </CardContent>
    </Card>
  );
}

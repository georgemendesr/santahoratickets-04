
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RedemptionHistoryProps {
  redemptions: any[];
}

const statusLabels = {
  pending: "Pendente",
  approved: "Aprovado",
  delivered: "Entregue",
  cancelled: "Cancelado"
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

export function RedemptionHistory({ redemptions }: RedemptionHistoryProps) {
  if (!redemptions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum resgate realizado ainda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {redemptions.map((redemption) => (
        <Card key={redemption.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{redemption.fidelity_rewards?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {redemption.fidelity_rewards?.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(redemption.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">
                  -{redemption.points_used} pontos
                </p>
                <Badge 
                  variant="secondary"
                  className={statusColors[redemption.status as keyof typeof statusColors]}
                >
                  {statusLabels[redemption.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Minus } from "lucide-react";

interface PointsHistoryProps {
  history: any[];
}

const sourceLabels = {
  purchase: "Compra",
  referral: "Indicação",
  manual: "Manual",
  bonus: "Bônus"
};

const sourceColors = {
  purchase: "bg-green-100 text-green-800",
  referral: "bg-blue-100 text-blue-800",
  manual: "bg-purple-100 text-purple-800",
  bonus: "bg-yellow-100 text-yellow-800"
};

export function PointsHistory({ history }: PointsHistoryProps) {
  if (!history.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum histórico de pontos encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${entry.points > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {entry.points > 0 ? (
                    <Plus className="h-4 w-4 text-green-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {entry.description || sourceLabels[entry.source as keyof typeof sourceLabels]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(entry.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.points > 0 ? '+' : ''}{entry.points} pontos
                </p>
                <Badge 
                  variant="secondary" 
                  className={sourceColors[entry.source as keyof typeof sourceColors]}
                >
                  {sourceLabels[entry.source as keyof typeof sourceLabels]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

interface FidelityBalanceProps {
  balance: number;
  isLoading: boolean;
}

export function FidelityBalance({ balance, isLoading }: FidelityBalanceProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6" />
            Seus Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-6 w-6" />
          Seus Pontos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-primary">{balance}</span>
          <Badge variant="secondary">pontos</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Disponível para resgatar
        </p>
      </CardContent>
    </Card>
  );
}

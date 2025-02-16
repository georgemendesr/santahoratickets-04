
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gift } from "lucide-react";

interface LoyaltyCardProps {
  points: number;
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Programa de Fidelidade
        </CardTitle>
        <CardDescription>
          Você tem {points} pontos acumulados
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

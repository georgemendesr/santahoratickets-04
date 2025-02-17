
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

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
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Use seus pontos para resgatar recompensas exclusivas e aproveitar benefícios especiais.
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="outline">
          <Link to="/tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Minhas Pulseiras
          </Link>
        </Button>
        <Button asChild>
          <Link to="/rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Trocar Pontos
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

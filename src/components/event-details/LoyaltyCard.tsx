
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Ticket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface LoyaltyCardProps {
  points: number;
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  const navigate = useNavigate();

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
        <Button 
          variant="outline"
          onClick={() => navigate('/meus-vouchers')}
          className="flex items-center gap-2"
        >
          <Ticket className="h-4 w-4" />
          Meus Vouchers
        </Button>
        <Button
          onClick={() => navigate('/recompensas')}
          className="flex items-center gap-2"
        >
          <Gift className="h-4 w-4" />
          Trocar Pontos
        </Button>
      </CardFooter>
    </Card>
  );
}

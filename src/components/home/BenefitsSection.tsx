
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Star, User } from "lucide-react";
import { Link } from "react-router-dom";

export function BenefitsSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Área do Usuário</h2>
        <Button asChild variant="outline">
          <Link to="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Minha Conta
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Sistema de Pontos
            </CardTitle>
            <CardDescription>
              Acumule pontos e ganhe benefícios exclusivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p>Ganhe 1 ponto para cada pulseira comprada</p>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p>Pontos extras por indicar amigos</p>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p>Troque seus pontos por brindes exclusivos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Vantagens Exclusivas
            </CardTitle>
            <CardDescription>
              Benefícios especiais para membros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p>Acesso antecipado à venda de pulseiras</p>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p>Descontos exclusivos em eventos</p>
              </div>
              <div className="flex items-start gap-2">
                <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p>Experiências VIP e brindes especiais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

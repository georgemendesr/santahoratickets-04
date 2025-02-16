
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Star } from "lucide-react";

export function BenefitsSection() {
  return (
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
              <p>Ganhe pontos extras ao indicar amigos</p>
            </div>
            <div className="flex items-start gap-2">
              <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
              <p>Acumule pontos e troque por brindes exclusivos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Benefícios
          </CardTitle>
          <CardDescription>
            Vantagens exclusivas para membros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
              <p>Acesso antecipado às vendas de pulseiras</p>
            </div>
            <div className="flex items-start gap-2">
              <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
              <p>Descontos exclusivos em eventos especiais</p>
            </div>
            <div className="flex items-start gap-2">
              <Star className="h-5 w-5 text-primary shrink-0 mt-1" />
              <p>Brindes e experiências VIP</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

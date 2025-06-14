
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFidelity } from "@/hooks/useFidelity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gift, History, Trophy } from "lucide-react";
import { RewardCard } from "@/components/fidelity/RewardCard";
import { PointsHistory } from "@/components/fidelity/PointsHistory";
import { RedemptionHistory } from "@/components/fidelity/RedemptionHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Fidelity = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: fidelityData, isLoading, refetch } = useFidelity();
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  if (!session) {
    navigate("/auth");
    return null;
  }

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (!fidelityData || fidelityData.balance < pointsRequired) {
      toast.error("Pontos insuficientes para este resgate");
      return;
    }

    setIsRedeeming(rewardId);
    
    try {
      const response = await fetch('/api/fidelity/redeem-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ rewardId })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Recompensa resgatada com sucesso!");
        refetch();
      } else {
        toast.error(result.error || "Erro ao resgatar recompensa");
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsRedeeming(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        {/* Header com saldo de pontos */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Programa de Fidelidade
            </CardTitle>
            <CardDescription>
              Acumule pontos e troque por recompensas exclusivas
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
              <Gift className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {fidelityData?.balance || 0}
              </span>
              <span className="text-sm text-muted-foreground">pontos</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Ganhe 1 ponto a cada R$ 5,00 em compras
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="redemptions">Meus Resgates</TabsTrigger>
          </TabsList>

          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Recompensas Disponíveis</CardTitle>
                <CardDescription>
                  Escolha suas recompensas favoritas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RewardCard
                  userBalance={fidelityData?.balance || 0}
                  onRedeem={handleRedeemReward}
                  isRedeeming={isRedeeming}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pontos</CardTitle>
                <CardDescription>
                  Veja como você ganhou seus pontos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PointsHistory history={fidelityData?.pointsHistory || []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions">
            <Card>
              <CardHeader>
                <CardTitle>Meus Resgates</CardTitle>
                <CardDescription>
                  Acompanhe o status dos seus resgates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RedemptionHistory redemptions={fidelityData?.redemptions || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Fidelity;

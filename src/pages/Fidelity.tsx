
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFidelitySystem } from "@/hooks/useFidelitySystem";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FidelityBalance } from "@/components/fidelity/FidelityBalance";
import { RewardsGrid } from "@/components/fidelity/RewardsGrid";
import { PointsHistory } from "@/components/fidelity/PointsHistory";
import { RedemptionHistory } from "@/components/fidelity/RedemptionHistory";

const Fidelity = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);
  
  const {
    balance,
    pointsHistory,
    redemptions,
    rewards,
    isLoading,
    isRewardsLoading,
    redeemReward,
    isRedeeming,
    error
  } = useFidelitySystem();

  if (!session) {
    navigate('/auth');
    return null;
  }

  const handleRedeemReward = (rewardId: string, pointsRequired: number) => {
    if (balance < pointsRequired) {
      return;
    }
    
    setRedeemingRewardId(rewardId);
    redeemReward({ rewardId });
  };

  // Reset redeeming state when mutation completes
  React.useEffect(() => {
    if (!isRedeeming) {
      setRedeemingRewardId(null);
    }
  }, [isRedeeming]);

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Erro ao carregar dados de fidelidade.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Programa de Fidelidade</h1>
          <p className="text-muted-foreground">
            Acumule pontos e troque por recompensas exclusivas
          </p>
        </div>

        {/* Card de Saldo */}
        <div className="mb-8">
          <FidelityBalance balance={balance} isLoading={isLoading} />
        </div>

        {/* Tabs para diferentes seções */}
        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
            <TabsTrigger value="history">Histórico de Pontos</TabsTrigger>
            <TabsTrigger value="redemptions">Meus Resgates</TabsTrigger>
          </TabsList>

          {/* Tab de Recompensas */}
          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Recompensas Disponíveis</CardTitle>
                <CardDescription>
                  Troque seus pontos por recompensas exclusivas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RewardsGrid
                  rewards={rewards}
                  userBalance={balance}
                  onRedeem={handleRedeemReward}
                  isRedeeming={redeemingRewardId}
                  isLoading={isRewardsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Histórico de Pontos */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pontos</CardTitle>
                <CardDescription>
                  Acompanhe como você ganhou seus pontos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PointsHistory history={pointsHistory} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Resgates */}
          <TabsContent value="redemptions">
            <Card>
              <CardHeader>
                <CardTitle>Meus Resgates</CardTitle>
                <CardDescription>
                  Histórico das suas recompensas resgatadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RedemptionHistory redemptions={redemptions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informações sobre como ganhar pontos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Ganhar Pontos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎫</span>
                </div>
                <h3 className="font-semibold mb-2">Compre Ingressos</h3>
                <p className="text-sm text-muted-foreground">
                  Ganhe 1 ponto para cada R$ 5,00 gastos
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="font-semibold mb-2">Indique Amigos</h3>
                <p className="text-sm text-muted-foreground">
                  Ganhe 100 pontos por indicação bem-sucedida
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="font-semibold mb-2">Compareça aos Eventos</h3>
                <p className="text-sm text-muted-foreground">
                  Pontos extras por check-in nos eventos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Fidelity;

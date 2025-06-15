
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Gift, Star, Award, BadgePercent } from "lucide-react";
import { useFidelity } from "@/hooks/useFidelity";
import { MainLayout } from "@/components/layout/MainLayout";

const iconMap = {
  gift: Gift,
  star: Star,
  award: Award,
  'badge-percent': BadgePercent,
};

const Rewards = () => {
  const { rewards, pointsBalance, redeemReward, isRedeeming, loadingRewards, loadingBalance } = useFidelity();
  const [selectedReward, setSelectedReward] = useState<any>(null);

  const handleRedeem = (reward: any) => {
    redeemReward({
      rewardId: reward.id,
      pointsRequired: reward.points_required
    });
    setSelectedReward(null);
  };

  if (loadingRewards || loadingBalance) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Recompensas
          </h1>
          <p className="text-muted-foreground">
            Troque seus pontos por recompensas incríveis
          </p>
        </div>

        {/* Saldo de Pontos */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-800">Seus Pontos</h2>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{pointsBalance}</div>
                <div className="text-sm text-blue-500">pontos disponíveis</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Recompensas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const IconComponent = iconMap[reward.icon as keyof typeof iconMap] || Gift;
            const canRedeem = pointsBalance >= reward.points_required;
            const isAvailable = !reward.available_units || reward.available_units > 0;

            return (
              <Card key={reward.id} className={`transition-all duration-200 ${canRedeem && isAvailable ? 'hover:shadow-lg' : 'opacity-60'}`}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{reward.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{reward.points_required}</div>
                      <div className="text-sm text-muted-foreground">pontos necessários</div>
                    </div>

                    {reward.available_units && (
                      <div className="text-center">
                        <Badge variant="outline">
                          {reward.available_units} restantes
                        </Badge>
                      </div>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          disabled={!canRedeem || !isAvailable || isRedeeming}
                          onClick={() => setSelectedReward(reward)}
                        >
                          {!isAvailable ? 'Esgotado' : 
                           !canRedeem ? 'Pontos Insuficientes' : 
                           'Resgatar'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Resgate</AlertDialogTitle>
                          <AlertDialogDescription>
                            Você deseja resgatar <strong>{selectedReward?.name}</strong> por <strong>{selectedReward?.points_required} pontos</strong>?
                            <br /><br />
                            Após o resgate, nossa equipe entrará em contato para a entrega.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => selectedReward && handleRedeem(selectedReward)}>
                            Confirmar Resgate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {rewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma recompensa disponível</h3>
            <p className="text-muted-foreground">
              As recompensas aparecerão aqui quando estiverem disponíveis.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Rewards;

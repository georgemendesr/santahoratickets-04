
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Star, Award } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  available_units: number | null;
  icon: string;
  active: boolean;
}

interface RewardsGridProps {
  rewards: Reward[];
  userBalance: number;
  onRedeem: (rewardId: string, pointsRequired: number) => void;
  isRedeeming: string | null;
  isLoading: boolean;
}

const iconMap = {
  gift: Gift,
  star: Star,
  award: Award,
};

export function RewardsGrid({ rewards, userBalance, onRedeem, isRedeeming, isLoading }: RewardsGridProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const handleRedeem = () => {
    if (selectedReward) {
      onRedeem(selectedReward.id, selectedReward.points_required);
      setSelectedReward(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!rewards.length) {
    return (
      <div className="text-center py-12">
        <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma recompensa disponível no momento</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => {
          const IconComponent = iconMap[reward.icon as keyof typeof iconMap] || Gift;
          const canRedeem = userBalance >= reward.points_required;
          const isOutOfStock = reward.available_units !== null && reward.available_units <= 0;
          const isCurrentlyRedeeming = isRedeeming === reward.id;

          return (
            <Card key={reward.id} className={`relative ${!canRedeem || isOutOfStock ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <IconComponent className="h-8 w-8 text-primary" />
                  <Badge variant={canRedeem ? "default" : "secondary"}>
                    {reward.points_required} pts
                  </Badge>
                </div>
                <CardTitle className="text-lg">{reward.name}</CardTitle>
                <CardDescription className="text-sm">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {reward.available_units !== null && (
                    <div className="text-xs text-muted-foreground">
                      {reward.available_units > 0 
                        ? `${reward.available_units} unidades disponíveis`
                        : "Esgotado"
                      }
                    </div>
                  )}
                  
                  <Button
                    onClick={() => setSelectedReward(reward)}
                    disabled={!canRedeem || isOutOfStock || isCurrentlyRedeeming}
                    className="w-full"
                    size="sm"
                  >
                    {isCurrentlyRedeeming ? "Resgatando..." : 
                     isOutOfStock ? "Esgotado" :
                     !canRedeem ? "Pontos insuficientes" : "Resgatar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Resgate</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja resgatar <strong>{selectedReward?.name}</strong> por{" "}
              <strong>{selectedReward?.points_required} pontos</strong>?
              <br />
              <br />
              Após o resgate, você ficará com{" "}
              <strong>{userBalance - (selectedReward?.points_required || 0)} pontos</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedeem}>
              Confirmar Resgate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

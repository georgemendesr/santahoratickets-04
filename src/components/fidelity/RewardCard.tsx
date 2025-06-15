
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFidelity } from "@/hooks/useFidelity";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Star, Award, BadgePercent } from "lucide-react";

interface RewardCardProps {
  userBalance: number;
  onRedeem: (rewardId: string, pointsRequired: number) => void;
  isRedeeming: string | null;
}

const iconMap = {
  gift: Gift,
  star: Star,
  award: Award,
  'badge-percent': BadgePercent,
};

export function RewardCard({ userBalance, onRedeem, isRedeeming }: RewardCardProps) {
  const { rewards, loadingRewards } = useFidelity();

  if (loadingRewards) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!rewards.length) {
    return (
      <div className="text-center py-8">
        <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma recompensa disponível no momento</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rewards.map((reward: any) => {
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
                  {reward.points_required} pontos
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
                  onClick={() => onRedeem(reward.id, reward.points_required)}
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
  );
}

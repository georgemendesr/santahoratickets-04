
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Reward, RewardRedemption } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Star, ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Rewards() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { profile, getAvailableRewards, getMyRedemptions, redeemReward } = useProfile(session?.user.id);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [rewardsData, redemptionsData] = await Promise.all([
        getAvailableRewards(),
        getMyRedemptions()
      ]);
      setRewards(rewardsData);
      setRedemptions(redemptionsData);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (!profile) return;

    await redeemReward(reward.id, reward.points_required);
    // Recarregar os dados após o resgate
    const [rewardsData, redemptionsData] = await Promise.all([
      getAvailableRewards(),
      getMyRedemptions()
    ]);
    setRewards(rewardsData);
    setRedemptions(redemptionsData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-8">
        <div className="container mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto p-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-5xl mx-auto space-y-8">
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  Seus Pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{profile.loyalty_points} pontos</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recompensas Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                    <CardTitle>{reward.title}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <span>{reward.points_required} pontos</span>
                    </div>
                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={!profile || profile.loyalty_points < reward.points_required}
                      className="w-full"
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Resgatar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {redemptions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Histórico de Resgates</h2>
              <div className="space-y-4">
                {redemptions.map((redemption) => (
                  <Card key={redemption.id}>
                    <CardHeader>
                      <CardTitle>{(redemption as any).rewards.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(redemption.created_at!), "PPP 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-primary" />
                          <span>{redemption.points_spent} pontos</span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10">
                          {redemption.status === 'pending' && 'Pendente'}
                          {redemption.status === 'approved' && 'Aprovado'}
                          {redemption.status === 'rejected' && 'Rejeitado'}
                          {redemption.status === 'delivered' && 'Entregue'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

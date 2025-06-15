
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Star, History, Trophy } from "lucide-react";
import { useFidelity } from "@/hooks/useFidelity";
import { MainLayout } from "@/components/layout/MainLayout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Fidelity = () => {
  const { userPoints, pointsBalance, redemptions, loadingPoints, loadingBalance, loadingRedemptions } = useFidelity();

  if (loadingPoints || loadingBalance || loadingRedemptions) {
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
            <Trophy className="h-8 w-8 text-yellow-500" />
            Programa de Fidelidade
          </h1>
          <p className="text-muted-foreground">
            Acumule pontos comprando ingressos e indicando amigos
          </p>
        </div>

        {/* Saldo de Pontos */}
        <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-800">Seus Pontos</h2>
                <p className="text-yellow-600">Disponível para resgate</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-yellow-600">{pointsBalance}</div>
                <div className="text-sm text-yellow-500">pontos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico de Pontos
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Meus Resgates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                {userPoints.length > 0 ? (
                  <div className="space-y-4">
                    {userPoints.map((point) => (
                      <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${point.points > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium">{point.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(point.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={point.points > 0 ? "default" : "destructive"}>
                          {point.points > 0 ? '+' : ''}{point.points} pontos
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum ponto ainda</h3>
                    <p className="text-muted-foreground">
                      Compre ingressos e indique amigos para acumular pontos!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions">
            <Card>
              <CardHeader>
                <CardTitle>Meus Resgates</CardTitle>
              </CardHeader>
              <CardContent>
                {redemptions.length > 0 ? (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => (
                      <div key={redemption.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Gift className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{redemption.reward?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(redemption.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            redemption.status === 'delivered' ? 'default' :
                            redemption.status === 'approved' ? 'secondary' :
                            redemption.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {redemption.status === 'pending' && 'Pendente'}
                            {redemption.status === 'approved' && 'Aprovado'}
                            {redemption.status === 'delivered' && 'Entregue'}
                            {redemption.status === 'cancelled' && 'Cancelado'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            -{redemption.points_used} pontos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum resgate ainda</h3>
                    <p className="text-muted-foreground">
                      Vá para a página de recompensas para resgatar seus pontos!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Fidelity;

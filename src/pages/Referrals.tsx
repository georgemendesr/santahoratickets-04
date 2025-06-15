
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useReferrals } from "@/hooks/useReferrals";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Share2, Copy, Users, Gift, Trophy, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const Referrals = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { referrals, stats, createReferral, isCreatingReferral } = useReferrals();
  const [shareMethod, setShareMethod] = useState<string>("");

  if (!session) {
    navigate('/auth');
    return null;
  }

  const userReferralCode = referrals.find(r => r.referrer_user_id === session.user.id)?.invite_code;
  const referralLink = `${window.location.origin}?ref=${userReferralCode}`;

  const handleCreateReferral = () => {
    createReferral();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleWhatsAppShare = () => {
    const message = `Olá! 🎉 Eu estou usando esta plataforma incrível para eventos e quero te convidar! Use meu código de convite ${userReferralCode} e ganhe pontos de bônus. Acesse: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = "Convite especial para você!";
    const body = `Olá!\n\nEu estou usando esta plataforma incrível para eventos e quero te convidar!\n\nUse meu código de convite: ${userReferralCode}\n\nAcesse: ${referralLink}\n\nVocê vai ganhar pontos de bônus ao se cadastrar!\n\nEspero te ver por lá! 🎉`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Indique e Ganhe</h1>
          <p className="text-muted-foreground">
            Convide seus amigos e ganhe pontos a cada indicação bem-sucedida!
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                  <p className="text-sm text-muted-foreground">Total de Indicações</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.completedReferrals || 0}</p>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingReferrals || 0}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats?.totalPointsEarned || 0}</p>
                  <p className="text-sm text-muted-foreground">Pontos Ganhos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Código de Convite */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Seu Código de Convite
            </CardTitle>
            <CardDescription>
              Compartilhe este código com seus amigos para ganhar pontos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userReferralCode ? (
              <>
                <div className="flex gap-2">
                  <Input
                    value={userReferralCode}
                    readOnly
                    className="font-mono text-lg text-center"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="text-sm"
                  />
                  <Button onClick={handleCopyLink} variant="outline">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <Button 
                    onClick={handleWhatsAppShare} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  
                  <Button onClick={handleEmailShare} variant="outline">
                    Email
                  </Button>
                  
                  <Button onClick={handleCopyLink} variant="outline">
                    Copiar Link
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem um código de convite
                </p>
                <Button 
                  onClick={handleCreateReferral} 
                  disabled={isCreatingReferral}
                >
                  {isCreatingReferral ? "Criando..." : "Criar Código de Convite"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Compartilhe</h3>
                <p className="text-sm text-muted-foreground">
                  Envie seu código de convite para amigos via WhatsApp, email ou redes sociais
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Amigo se Cadastra</h3>
                <p className="text-sm text-muted-foreground">
                  Quando seu amigo usar seu código e se cadastrar, a indicação fica pendente
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Ganhe Pontos</h3>
                <p className="text-sm text-muted-foreground">
                  Quando seu amigo compra o primeiro ingresso, vocês dois ganham pontos!
                </p>
              </div>
            </div>

            <Separator />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">🎁 Recompensas</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Você ganha:</strong> 100 pontos por cada amigo que comprar</li>
                <li>• <strong>Seu amigo ganha:</strong> 50 pontos de bônus ao comprar</li>
                <li>• <strong>Sem limite:</strong> Convide quantos amigos quiser!</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Indicações */}
        {referrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Suas Indicações</CardTitle>
              <CardDescription>
                Acompanhe o status das suas indicações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Código: {referral.invite_code}</p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      {referral.invited_email && (
                        <p className="text-sm text-muted-foreground">
                          Email convidado: {referral.invited_email}
                        </p>
                      )}
                    </div>
                    <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                      {referral.status === 'completed' ? 'Concluída' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Referrals;

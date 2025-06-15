
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
import { Share2, Copy, Users, Gift, Trophy, MessageCircle, Mail, Smartphone } from "lucide-react";
import { toast } from "sonner";

const Indique = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { referrals, stats, createReferral, isCreatingReferral } = useReferrals();

  if (!session) {
    navigate('/auth');
    return null;
  }

  const userReferralCode = referrals.find(r => r.referrer_id === session.user.id)?.code;
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

  const handleSMSShare = () => {
    const message = `Olá! Use meu código ${userReferralCode} nesta plataforma de eventos e ganhe pontos: ${referralLink}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Indique e Ganhe
          </h1>
          <p className="text-muted-foreground text-lg">
            Convide seus amigos e ganhe pontos a cada indicação bem-sucedida!
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalReferrals || 0}</p>
              <p className="text-sm text-muted-foreground">Total de Indicações</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">{stats?.completedReferrals || 0}</p>
              <p className="text-sm text-muted-foreground">Utilizadas</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600">{stats?.pendingReferrals || 0}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats?.totalPointsEarned || 0}</p>
              <p className="text-sm text-muted-foreground">Pontos Ganhos</p>
            </CardContent>
          </Card>
        </div>

        {/* Código de Convite */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Share2 className="h-6 w-6" />
              Seu Código de Convite
            </CardTitle>
            <CardDescription className="text-purple-600">
              Compartilhe este código com seus amigos para ganhar pontos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {userReferralCode ? (
              <>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <p className="text-sm text-muted-foreground mb-3">Seu código pessoal:</p>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={userReferralCode}
                      readOnly
                      className="font-mono text-2xl text-center font-bold"
                    />
                    <Button onClick={handleCopyLink} variant="outline" size="lg">
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">Link completo:</p>
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
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4 text-center">Compartilhar via:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button 
                      onClick={handleWhatsAppShare} 
                      className="bg-green-600 hover:bg-green-700 h-16 flex-col gap-1"
                    >
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-xs">WhatsApp</span>
                    </Button>
                    
                    <Button 
                      onClick={handleEmailShare} 
                      variant="outline"
                      className="h-16 flex-col gap-1"
                    >
                      <Mail className="h-6 w-6" />
                      <span className="text-xs">Email</span>
                    </Button>

                    <Button 
                      onClick={handleSMSShare} 
                      variant="outline"
                      className="h-16 flex-col gap-1"
                    >
                      <Smartphone className="h-6 w-6" />
                      <span className="text-xs">SMS</span>
                    </Button>
                    
                    <Button 
                      onClick={handleCopyLink} 
                      variant="outline"
                      className="h-16 flex-col gap-1"
                    >
                      <Copy className="h-6 w-6" />
                      <span className="text-xs">Copiar</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Gift className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <p className="text-muted-foreground mb-6 text-lg">
                  Você ainda não tem um código de convite
                </p>
                <Button 
                  onClick={handleCreateReferral} 
                  disabled={isCreatingReferral}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isCreatingReferral ? "Criando..." : "Criar Meu Código"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎯 Como Funciona o Sistema de Indicações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-3 text-blue-800">1. Compartilhe</h3>
                <p className="text-sm text-blue-700">
                  Envie seu código ou link para amigos via WhatsApp, email ou redes sociais
                </p>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-3 text-green-800">2. Amigo Compra</h3>
                <p className="text-sm text-green-700">
                  Quando seu amigo comprar ingresso usando seu código, a indicação é registrada
                </p>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-3 text-purple-800">3. Ganhem Pontos</h3>
                <p className="text-sm text-purple-700">
                  Você ganha 100 pontos e seu amigo ganha 50 pontos de bônus!
                </p>
              </div>
            </div>

            <Separator />

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
              <h4 className="font-semibold mb-4 text-orange-800 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recompensas por Indicação
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span><strong>Você ganha:</strong> 100 pontos por cada compra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span><strong>Seu amigo ganha:</strong> 50 pontos de bônus</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span><strong>Sem limite:</strong> Convide quantos quiser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span><strong>Automático:</strong> Pontos creditados instantaneamente</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Indicações */}
        {referrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Histórico de Indicações</CardTitle>
              <CardDescription>
                Acompanhe o desempenho das suas indicações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                    <div className="space-y-1">
                      <p className="font-medium">Código: <span className="font-mono text-lg">{referral.code}</span></p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(referral.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Utilizações: <strong className="text-primary">{referral.used_count}</strong>
                        </span>
                        <span className="text-muted-foreground">
                          Pontos ganhos: <strong className="text-green-600">{referral.used_count * 100}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={referral.used_count > 0 ? 'default' : 'secondary'} className="mb-2">
                        {referral.used_count > 0 ? 'Utilizada' : 'Pendente'}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {referral.used_count > 0 ? 'Gerando pontos!' : 'Aguardando uso'}
                      </div>
                    </div>
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

export default Indique;

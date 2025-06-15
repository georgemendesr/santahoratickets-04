
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Users } from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { toast } from "sonner";

interface EventReferralCardProps {
  eventId: string;
  eventTitle: string;
}

export function EventReferralCard({ eventId, eventTitle }: EventReferralCardProps) {
  const { referrals, createReferral, isCreatingReferral } = useReferrals();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Encontrar referral para este evento específico
  const eventReferral = referrals.find(r => r.event_id === eventId);
  
  const handleCreateReferral = () => {
    createReferral();
    setShowCreateForm(false);
  };

  const handleCopyLink = () => {
    if (eventReferral) {
      const referralLink = `${window.location.origin}?ref=${eventReferral.code}`;
      navigator.clipboard.writeText(referralLink);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handleWhatsAppShare = () => {
    if (eventReferral) {
      const referralLink = `${window.location.origin}?ref=${eventReferral.code}`;
      const message = `Olá! 🎉 Vou neste evento incrível: "${eventTitle}". Use meu código de convite ${eventReferral.code} e ganhe pontos de bônus! ${referralLink}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Share2 className="h-5 w-5" />
          Indique e Ganhe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {eventReferral ? (
          <>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Seu código para este evento:</p>
              <div className="flex gap-2">
                <Input
                  value={eventReferral.code}
                  readOnly
                  className="font-mono text-lg text-center"
                />
                <Button onClick={handleCopyLink} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleWhatsAppShare} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                WhatsApp
              </Button>
              <Button onClick={handleCopyLink} variant="outline" className="flex-1" size="sm">
                Copiar Link
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-purple-600">
              <Users className="h-4 w-4" />
              <span>{eventReferral.used_count} pessoas usaram seu código</span>
            </div>

            <div className="text-xs text-purple-600 bg-purple-100 p-3 rounded">
              💡 <strong>Como funciona:</strong> Compartilhe este código e ganhe 100 pontos quando alguém comprar ingresso usando ele. Seu amigo também ganha 50 pontos!
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            {!showCreateForm ? (
              <>
                <p className="text-muted-foreground mb-4">
                  Crie um código de convite para este evento e ganhe pontos pelas indicações!
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Criar Código de Convite
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  Confirma a criação do seu código de convite para este evento?
                </p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    onClick={handleCreateReferral}
                    disabled={isCreatingReferral}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isCreatingReferral ? "Criando..." : "Sim, Criar"}
                  </Button>
                  <Button 
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

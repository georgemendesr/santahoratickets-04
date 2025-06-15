
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Share2, MessageCircle, Mail, Copy } from "lucide-react";
import { useReferralSystem } from "@/hooks/useReferralSystem";

interface EventReferralCardProps {
  eventId: string;
  eventTitle: string;
}

export function EventReferralCard({ eventId, eventTitle }: EventReferralCardProps) {
  const { userReferral, createReferral, isCreatingReferral } = useReferralSystem(eventId);

  const referralLink = userReferral 
    ? `${window.location.origin}/events/${eventId}?ref=${userReferral.code}`
    : '';

  const handleCreateReferral = () => {
    createReferral();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado!");
  };

  const handleWhatsAppShare = () => {
    const message = `Olá! 🎉 Te convido para este evento incrível: "${eventTitle}"! Use meu código ${userReferral?.code} e ganhe pontos de bônus. Acesse: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = `Convite para: ${eventTitle}`;
    const body = `Olá!\n\nTe convido para este evento incrível: "${eventTitle}"!\n\nUse meu código de convite: ${userReferral?.code}\n\nAcesse: ${referralLink}\n\nVocê vai ganhar pontos de bônus ao comprar!\n\nEspero te ver por lá! 🎉`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl);
  };

  if (!userReferral) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Indique e Ganhe
          </CardTitle>
          <CardDescription>
            Compartilhe este evento e ganhe pontos quando seus amigos comprarem ingressos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreateReferral} 
            disabled={isCreatingReferral}
            className="w-full"
          >
            {isCreatingReferral ? "Criando..." : "Criar Código de Convite"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Seu Código de Convite
        </CardTitle>
        <CardDescription>
          Compartilhe este código e ganhe 100 pontos para cada pessoa que comprar ingressos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={userReferral.code}
            readOnly
            className="font-mono text-center text-lg font-bold"
          />
          <Button onClick={handleCopy} variant="outline">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={referralLink}
            readOnly
            className="text-sm"
          />
          <Button onClick={handleCopy} variant="outline">
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button 
            onClick={handleWhatsAppShare} 
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          
          <Button onClick={handleEmailShare} variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          
          <Button onClick={handleCopy} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </div>

        {userReferral.used_count > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-semibold">
              🎉 Parabéns! {userReferral.used_count} pessoa(s) já usaram seu código!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

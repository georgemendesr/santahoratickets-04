
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Share2, MessageCircle } from "lucide-react";

interface ReferralCardProps {
  code: string;
}

export function ReferralCard({ code }: ReferralCardProps) {
  const referralLink = `${window.location.origin}?ref=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado!");
  };

  const handleWhatsAppShare = () => {
    const message = `Olá! 🎉 Te convido para este evento incrível! Use meu código ${code} e ganhe pontos de bônus. Acesse: ${referralLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Link de Indicação
        </CardTitle>
        <CardDescription>
          Compartilhe este código com seus amigos e ganhe pontos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={code}
            readOnly
            className="font-mono text-center"
          />
          <Button onClick={handleCopy}>
            Copiar
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={referralLink}
            readOnly
            className="text-sm"
          />
          <Button onClick={handleCopy} variant="outline">
            Copiar Link
          </Button>
        </div>

        <Button 
          onClick={handleWhatsAppShare} 
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Compartilhar no WhatsApp
        </Button>
      </CardContent>
    </Card>
  );
}

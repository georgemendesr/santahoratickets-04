
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, X } from "lucide-react";
import { useReferralSystem } from "@/hooks/useReferralSystem";
import { useAuth } from "@/hooks/useAuth";

interface ReferralBannerProps {
  eventId: string;
}

export function ReferralBanner({ eventId }: ReferralBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const { session } = useAuth();
  const { processReferral, isProcessingReferral } = useReferralSystem(eventId);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && session?.user.id) {
      setReferralCode(refCode);
      setInputCode(refCode);
      setShowBanner(true);
    }
  }, [session]);

  const handleApplyCode = () => {
    if (inputCode.trim()) {
      processReferral({ referralCode: inputCode.trim() });
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remove o parâmetro ref da URL
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  };

  if (!showBanner || !session?.user.id) return null;

  return (
    <Alert className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <Gift className="h-4 w-4 text-purple-600" />
      <AlertDescription className="space-y-3">
        <div className="flex items-center justify-between">
          <span>
            🎉 Você foi convidado por um amigo! Use o código de convite e ganhe <strong>50 pontos de bônus</strong> na sua compra!
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-auto p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Digite o código de convite"
            className="flex-1"
          />
          <Button 
            onClick={handleApplyCode}
            disabled={isProcessingReferral || !inputCode.trim()}
          >
            {isProcessingReferral ? "Aplicando..." : "Aplicar"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

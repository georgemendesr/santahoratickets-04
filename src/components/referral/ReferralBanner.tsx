
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Gift, X } from "lucide-react";

export function ReferralBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [referrerName, setReferrerName] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      setShowBanner(true);
      // Aqui você poderia buscar o nome do usuário que fez a indicação
      // Por enquanto, vou mostrar apenas que é uma indicação
      setReferrerName("um amigo");
    }
  }, []);

  if (!showBanner) return null;

  return (
    <Alert className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <Gift className="h-4 w-4 text-purple-600" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          🎉 Você foi convidado por <strong>{referrerName}</strong>! 
          Cadastre-se e ganhe <strong>50 pontos de bônus</strong> na sua primeira compra!
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBanner(false)}
          className="h-auto p-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}

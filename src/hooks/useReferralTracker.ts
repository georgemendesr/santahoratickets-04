
import { useEffect } from 'react';
import { useReferralSystem } from './useReferralSystem';
import { useAuth } from './useAuth';

export function useReferralTracker(eventId: string) {
  const { session } = useAuth();
  const { processReferral } = useReferralSystem(eventId);

  useEffect(() => {
    // Verificar se existe código de referral na URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && session?.user.id) {
      // Armazenar no localStorage para processar após a compra
      localStorage.setItem(`referral_code_${eventId}`, refCode);
    }
  }, [session, eventId]);

  // Função para processar referral armazenado após compra
  const processStoredReferral = () => {
    const storedCode = localStorage.getItem(`referral_code_${eventId}`);
    if (storedCode && session?.user.id) {
      processReferral({ referralCode: storedCode });
      localStorage.removeItem(`referral_code_${eventId}`);
    }
  };

  return {
    processStoredReferral
  };
}

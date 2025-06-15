
import { useEffect } from 'react';
import { useReferrals } from './useReferrals';
import { useAuth } from './useAuth';

export function useReferralTracking() {
  const { session } = useAuth();
  const { registerReferralUse } = useReferrals();

  useEffect(() => {
    // Verificar se há código de referência na URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      // Armazenar no localStorage para usar depois do cadastro
      localStorage.setItem('referral_code', refCode);
      
      // Se o usuário já está logado, registrar a indicação imediatamente
      if (session?.user.id) {
        const storedCode = localStorage.getItem('referral_code');
        if (storedCode) {
          registerReferralUse({ inviteCode: storedCode });
          localStorage.removeItem('referral_code');
        }
      }
    }
  }, [session, registerReferralUse]);

  // Função para registrar indicação após cadastro
  const processStoredReferral = () => {
    const storedCode = localStorage.getItem('referral_code');
    if (storedCode && session?.user.id) {
      registerReferralUse({ inviteCode: storedCode });
      localStorage.removeItem('referral_code');
    }
  };

  return {
    processStoredReferral
  };
}

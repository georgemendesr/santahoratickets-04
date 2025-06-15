
import { useEffect } from 'react';
import { useReferrals } from './useReferrals';
import { useAuth } from './useAuth';

export function useReferralTracking() {
  const { session } = useAuth();
  const { registerReferralUse } = useReferrals();

  useEffect(() => {
    // Check if there's a referral code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      // Store in localStorage to use after signup
      localStorage.setItem('referral_code', refCode);
      
      // If user is already logged in, register the referral immediately
      if (session?.user.id) {
        const storedCode = localStorage.getItem('referral_code');
        if (storedCode) {
          registerReferralUse({ inviteCode: storedCode });
          localStorage.removeItem('referral_code');
        }
      }
    }
  }, [session, registerReferralUse]);

  // Function to register referral after signup
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

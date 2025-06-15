
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useReferralSystem = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processReferral = async (referralCode: string, eventId: string) => {
    setIsProcessing(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuário não logado');
      }

      const { data, error } = await supabase.functions.invoke('referrals/process-referral', {
        body: {
          referral_code: referralCode,
          user_id: user.user.id,
          event_id: eventId
        }
      });

      if (error) {
        console.error('Error processing referral:', error);
        toast.error('Erro ao processar código de indicação');
        return { success: false };
      }

      if (data.success) {
        toast.success(`${data.message} Você ganhou ${data.points_earned} pontos!`);
        return { success: true, points_earned: data.points_earned };
      } else {
        toast.error(data.error);
        return { success: false };
      }

    } catch (error: any) {
      console.error('Error in processReferral:', error);
      toast.error('Erro ao processar indicação');
      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processReferral,
    isProcessing
  };
};


import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ValidatedTicket {
  id: string;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    status: string;
  };
  user: {
    name: string;
    email: string;
  };
  check_in_time: string;
  status: 'validated' | 'used';
}

interface ValidationResult {
  success: boolean;
  message?: string;
  error?: string;
  ticket?: ValidatedTicket;
}

export const useTicketValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidatedTicket, setLastValidatedTicket] = useState<ValidatedTicket | null>(null);

  const validateTicket = async (qrCode: string): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      console.log('Validating ticket with QR code:', qrCode);
      
      const { data, error } = await supabase.functions.invoke('validate-ticket', {
        body: { 
          qr_code: qrCode,
          validator_user_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        console.error('Error calling validate-ticket function:', error);
        toast.error('Erro ao validar ingresso');
        return { success: false, error: error.message };
      }

      if (data.success) {
        setLastValidatedTicket(data.ticket);
        toast.success(data.message);
        return { success: true, message: data.message, ticket: data.ticket };
      } else {
        toast.error(data.error);
        if (data.ticket) {
          setLastValidatedTicket(data.ticket);
        }
        return { success: false, error: data.error, ticket: data.ticket };
      }

    } catch (error: any) {
      console.error('Error in validateTicket:', error);
      toast.error('Erro ao validar ingresso');
      return { success: false, error: error.message };
    } finally {
      setIsValidating(false);
    }
  };

  const clearLastValidation = () => {
    setLastValidatedTicket(null);
  };

  return {
    validateTicket,
    isValidating,
    lastValidatedTicket,
    clearLastValidation
  };
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsePaymentPollingProps {
  preferenceId: string | undefined;
  payment_id: string | null;
  reference: string | null;
  status: string | null;
  navigate: (path: string) => void;
}

export const usePaymentPolling = ({
  preferenceId,
  payment_id,
  reference,
  status,
  navigate
}: UsePaymentPollingProps) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);

  useEffect(() => {
    const fetchPixData = async () => {
      if (preferenceId) {
        console.log("Buscando dados do PIX para preferenceId:", preferenceId);
        
        const { data: preference, error } = await supabase
          .from("payment_preferences")
          .select("*")
          .eq("id", preferenceId)
          .single();

        if (error) {
          console.error("Erro ao buscar preferência:", error);
          toast.error("Erro ao carregar dados do PIX");
          return;
        }

        console.log("Dados da preferência encontrados:", preference);

        if (preference?.payment_type === "pix") {
          console.log("QR Code encontrado:", {
            qr_code: preference.qr_code,
            qr_code_base64: preference.qr_code_base64,
            status: preference.status
          });
          
          setQrCode(preference.qr_code || null);
          setQrCodeBase64(preference.qr_code_base64 || null);

          if (preference.status !== "pending") {
            handleStatusChange(preference.status);
          }
        }
      }
    };

    fetchPixData();

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('payment_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payment_preferences',
          filter: `id=eq.${preferenceId}`
        },
        (payload) => {
          console.log("Atualização em tempo real recebida:", payload);
          const newStatus = payload.new.status;
          
          if (newStatus !== "pending") {
            handleStatusChange(newStatus);
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      console.log("Limpando inscrição de tempo real");
      supabase.removeChannel(channel);
    };
  }, [preferenceId]);

  const handleStatusChange = (newStatus: string) => {
    console.log("Mudança de status detectada:", newStatus);
    
    if (newStatus === "approved") {
      toast.success("Pagamento aprovado!");
      navigate(`/payment/status?status=approved&payment_id=${payment_id}&external_reference=${reference}`);
    } else if (newStatus === "rejected") {
      toast.error("Pagamento rejeitado");
      navigate(`/payment/status?status=rejected&payment_id=${payment_id}&external_reference=${reference}`);
    }
  };

  return {
    qrCode,
    qrCodeBase64
  };
};

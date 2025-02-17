
import { useState, useEffect, useCallback } from "react";
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
  status: initialStatus,
  navigate
}: UsePaymentPollingProps) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const handleStatusChange = useCallback((newStatus: string) => {
    console.log("Mudança de status detectada:", newStatus, "Status atual:", currentStatus);
    
    if (newStatus === currentStatus) {
      console.log("Status já está atualizado, ignorando");
      return;
    }

    setCurrentStatus(newStatus);
    
    if (newStatus === "approved") {
      toast.success("Pagamento aprovado!");
      window.location.href = `/payment-status?status=approved&payment_id=${payment_id}&external_reference=${reference}`;
    } else if (newStatus === "rejected") {
      toast.error("Pagamento rejeitado");
      window.location.href = `/payment-status?status=rejected&payment_id=${payment_id}&external_reference=${reference}`;
    }
  }, [payment_id, reference, currentStatus]);

  useEffect(() => {
    let channel: any;

    const fetchPixData = async () => {
      if (!preferenceId) return;

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

        if (preference.status !== "pending" && preference.status !== currentStatus) {
          handleStatusChange(preference.status);
        }
      }
    };

    const setupRealtimeSubscription = () => {
      console.log("Configurando inscrição em tempo real para:", preferenceId);
      
      channel = supabase
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
        .subscribe((status) => {
          console.log("Status da inscrição:", status);
        });
    };

    fetchPixData();
    setupRealtimeSubscription();

    // Configurar polling manual como backup
    const pollingInterval = setInterval(() => {
      console.log("Executando polling manual...");
      fetchPixData();
    }, 5000); // A cada 5 segundos

    return () => {
      if (channel) {
        console.log("Limpando inscrição de tempo real");
        supabase.removeChannel(channel);
      }
      clearInterval(pollingInterval);
    };
  }, [preferenceId, handleStatusChange, currentStatus]);

  return {
    qrCode,
    qrCodeBase64
  };
};

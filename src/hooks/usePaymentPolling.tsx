
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
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    const fetchPixData = async () => {
      if (status === "pending" && preferenceId) {
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
            qr_code_base64: preference.qr_code_base64
          });
          
          setQrCode(preference.qr_code || null);
          setQrCodeBase64(preference.qr_code_base64 || null);

          if (preference.status === "pending" && !isPolling) {
            setIsPolling(true);
            startPolling(preferenceId);
          }
        }
      }
    };

    fetchPixData();
  }, [status, preferenceId, isPolling]);

  const startPolling = async (prefId: string) => {
    const pollInterval = setInterval(async () => {
      const { data: preference, error } = await supabase
        .from("payment_preferences")
        .select("status")
        .eq("id", prefId)
        .single();

      if (error) {
        console.error("Erro ao verificar status:", error);
        clearInterval(pollInterval);
        return;
      }

      if (preference?.status === "approved") {
        clearInterval(pollInterval);
        toast.success("Pagamento aprovado!");
        navigate(`/payment/status?status=approved&payment_id=${payment_id}&external_reference=${reference}`);
      } else if (preference?.status === "rejected") {
        clearInterval(pollInterval);
        toast.error("Pagamento rejeitado");
        navigate(`/payment/status?status=rejected&payment_id=${payment_id}&external_reference=${reference}`);
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
    }, 300000);

    return () => clearInterval(pollInterval);
  };

  return {
    qrCode,
    qrCodeBase64
  };
};

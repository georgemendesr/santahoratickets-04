
import { useEffect, useState } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  status: string;
  secure_thumbnail: string;
  thumbnail: string;
  deferred_capture: string;
}

interface InstallmentOption {
  installments: number;
  installment_amount: number;
  installment_rate: number;
  total_amount: number;
}

export function useMercadoPago(amount: number, cardNumber: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [availableInstallments, setAvailableInstallments] = useState<InstallmentOption[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      const mp = new window.MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
      setIsLoading(false);

      // Buscar opções de parcelamento
      mp.getInstallments({
        amount: String(amount),
        locale: "pt-BR",
      }).then((installments: any) => {
        if (installments[0]) {
          setAvailableInstallments(installments[0].payer_costs);
        }
      });

      // Identificar bandeira do cartão
      if (cardNumber.length >= 6) {
        mp.getPaymentMethods({ bin: cardNumber.substring(0, 6) }).then((paymentMethods: any) => {
          if (paymentMethods.results[0]) {
            setPaymentMethodId(paymentMethods.results[0].id);
          }
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [amount, cardNumber]);

  return {
    isLoading,
    availableInstallments,
    paymentMethodId,
  };
}

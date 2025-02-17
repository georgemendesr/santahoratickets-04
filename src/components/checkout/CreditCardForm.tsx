
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CardNumberInput } from "./credit-card/CardNumberInput";
import { CardholderInput } from "./credit-card/CardholderInput";
import { ExpirationInputs } from "./credit-card/ExpirationInputs";
import { InstallmentsSelect } from "./credit-card/InstallmentsSelect";
import { useMercadoPago } from "@/hooks/useMercadoPago";

declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CreditCardFormProps {
  amount: number;
  onSubmit: (paymentData: {
    token: string;
    installments: number;
    paymentMethodId: string;
  }) => void;
  isSubmitting: boolean;
}

export function CreditCardForm({ amount, onSubmit, isSubmitting }: CreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expirationMonth, setExpirationMonth] = useState("");
  const [expirationYear, setExpirationYear] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [identificationType] = useState("CPF");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [installments, setInstallments] = useState("1");

  const { isLoading, availableInstallments, paymentMethodId } = useMercadoPago(amount, cardNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.MercadoPago) {
      toast.error("Erro ao carregar MercadoPago SDK");
      return;
    }

    try {
      const mp = new window.MercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);
      const cardToken = await mp.createCardToken({
        cardNumber,
        cardholderName,
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: expirationYear,
        securityCode,
        identificationType,
        identificationNumber,
      });

      if (cardToken.error) {
        throw new Error(cardToken.error);
      }

      onSubmit({
        token: cardToken.id,
        installments: Number(installments),
        paymentMethodId,
      });
    } catch (error) {
      console.error("Erro ao processar cartão:", error);
      toast.error("Erro ao processar cartão. Verifique os dados e tente novamente.");
    }
  };

  if (isLoading) {
    return <div>Carregando formulário de pagamento...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardNumberInput value={cardNumber} onChange={setCardNumber} />
      <CardholderInput value={cardholderName} onChange={setCardholderName} />
      <ExpirationInputs
        month={expirationMonth}
        year={expirationYear}
        onMonthChange={setExpirationMonth}
        onYearChange={setExpirationYear}
      />

      <div>
        <Label htmlFor="securityCode">Código de Segurança</Label>
        <Input
          id="securityCode"
          value={securityCode}
          onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, ""))}
          maxLength={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="identificationNumber">CPF</Label>
        <Input
          id="identificationNumber"
          value={identificationNumber}
          onChange={(e) => setIdentificationNumber(e.target.value.replace(/\D/g, ""))}
          maxLength={11}
          required
        />
      </div>

      <InstallmentsSelect
        value={installments}
        options={availableInstallments}
        onChange={setInstallments}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Processando..." : "Pagar"}
      </Button>
    </form>
  );
}

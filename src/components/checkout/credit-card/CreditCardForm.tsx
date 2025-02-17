
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CardNumberInput } from "./CardNumberInput";
import { CardholderInput } from "./CardholderInput";
import { ExpirationInputs } from "./ExpirationInputs";
import { InstallmentsSelect } from "./InstallmentsSelect";
import { useMercadoPago } from "@/hooks/useMercadoPago";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard } from "lucide-react";

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
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");
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
        installments: cardType === "debit" ? 1 : Number(installments),
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
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Tabs value={cardType} onValueChange={(value) => setCardType(value as "credit" | "debit")}>
          <TabsList className="w-full">
            <TabsTrigger value="credit" className="flex-1">
              <CreditCard className="w-4 h-4 mr-2" />
              Cartão de Crédito
            </TabsTrigger>
            <TabsTrigger value="debit" className="flex-1">
              <CreditCard className="w-4 h-4 mr-2" />
              Cartão de Débito
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex justify-center space-x-4 py-4">
          <img src="https://www.mercadopago.com/org-img/MP3/API/logos/visa.gif" alt="Visa" className="h-8" />
          <img src="https://www.mercadopago.com/org-img/MP3/API/logos/master.gif" alt="Mastercard" className="h-8" />
          <img src="https://www.mercadopago.com/org-img/MP3/API/logos/amex.gif" alt="American Express" className="h-8" />
          <img src="https://www.mercadopago.com/org-img/MP3/API/logos/elo.gif" alt="Elo" className="h-8" />
        </div>
      </div>

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

        {cardType === "credit" && (
          <InstallmentsSelect
            value={installments}
            options={availableInstallments}
            onChange={setInstallments}
          />
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processando..." : "Pagar"}
        </Button>

        <div className="flex justify-center mt-4">
          <img 
            src="https://www.mercadopago.com/org-img/MP3/API/logos/powered_by_mercadopago.gif" 
            alt="Powered by MercadoPago" 
            className="h-8"
          />
        </div>
      </form>
    </div>
  );
}

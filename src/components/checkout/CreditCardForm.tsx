
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  const [identificationType, setIdentificationType] = useState("CPF");
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [installments, setInstallments] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [availableInstallments, setAvailableInstallments] = useState<any[]>([]);
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
      mp.getPaymentMethods({ bin: cardNumber.substring(0, 6) }).then((paymentMethods: any) => {
        if (paymentMethods.results[0]) {
          setPaymentMethodId(paymentMethods.results[0].id);
        }
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [amount, cardNumber]);

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
      <div>
        <Label htmlFor="cardNumber">Número do Cartão</Label>
        <Input
          id="cardNumber"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ""))}
          maxLength={16}
          required
        />
      </div>

      <div>
        <Label htmlFor="cardholderName">Nome no Cartão</Label>
        <Input
          id="cardholderName"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expirationMonth">Mês</Label>
          <Input
            id="expirationMonth"
            value={expirationMonth}
            onChange={(e) => setExpirationMonth(e.target.value.replace(/\D/g, ""))}
            maxLength={2}
            required
          />
        </div>
        <div>
          <Label htmlFor="expirationYear">Ano</Label>
          <Input
            id="expirationYear"
            value={expirationYear}
            onChange={(e) => setExpirationYear(e.target.value.replace(/\D/g, ""))}
            maxLength={2}
            required
          />
        </div>
      </div>

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

      <div>
        <Label htmlFor="installments">Parcelas</Label>
        <Select value={installments} onValueChange={setInstallments}>
          <SelectTrigger id="installments">
            <SelectValue placeholder="Selecione o número de parcelas" />
          </SelectTrigger>
          <SelectContent>
            {availableInstallments.map((option) => (
              <SelectItem key={option.installments} value={String(option.installments)}>
                {option.installments}x de {" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(option.installment_amount)}
                {option.installments > 1 && option.installment_rate === 0 && " sem juros"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Processando..." : "Pagar"}
      </Button>
    </form>
  );
}

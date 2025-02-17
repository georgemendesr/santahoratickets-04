
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, Batch } from "@/types";
import { OrderSummary } from "./OrderSummary";
import { CustomerForm } from "./CustomerForm";
import { CreditCardForm } from "./CreditCardForm";

interface CheckoutContentProps {
  event: Event;
  batch: Batch;
  quantity: number;
  name: string;
  cpf: string;
  phone: string;
  isLoading: boolean;
  showPaymentForm: boolean;
  onNameChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmitProfile: (e: React.FormEvent) => void;
  onSubmitPayment: (paymentData: {
    token: string;
    installments: number;
    paymentMethodId: string;
  }) => void;
}

export function CheckoutContent({
  event,
  batch,
  quantity,
  name,
  cpf,
  phone,
  isLoading,
  showPaymentForm,
  onNameChange,
  onCpfChange,
  onPhoneChange,
  onSubmitProfile,
  onSubmitPayment,
}: CheckoutContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Compra - {event.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <OrderSummary 
            event={event}
            batch={batch}
            quantity={quantity}
          />

          {!showPaymentForm ? (
            <CustomerForm
              name={name}
              cpf={cpf}
              phone={phone}
              isLoading={isLoading}
              onNameChange={onNameChange}
              onCpfChange={onCpfChange}
              onPhoneChange={onPhoneChange}
              onSubmit={onSubmitProfile}
            />
          ) : (
            <div className="pt-4 border-t">
              <CreditCardForm
                amount={batch.price * quantity}
                onSubmit={onSubmitPayment}
                isSubmitting={isLoading}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

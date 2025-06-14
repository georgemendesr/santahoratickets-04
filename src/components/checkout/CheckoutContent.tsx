
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, Batch } from "@/types";
import { OrderSummary } from "./OrderSummary";
import { CustomerForm } from "./CustomerForm";
import { CheckoutProForm } from "./CheckoutProForm";

interface CheckoutContentProps {
  event: Event;
  batch: Batch;
  quantity: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  isLoading: boolean;
  showPaymentForm: boolean;
  onNameChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmitProfile: (e: React.FormEvent) => void;
  onSubmitPayment: () => void;
}

export function CheckoutContent({
  event,
  batch,
  quantity,
  name,
  cpf,
  phone,
  email,
  isLoading,
  showPaymentForm,
  onNameChange,
  onCpfChange,
  onPhoneChange,
  onEmailChange,
  onSubmitProfile,
  onSubmitPayment,
}: CheckoutContentProps) {
  return (
    <Card className="glass-card shadow-2xl">
      <CardHeader className="border-b border-border/50 pb-6">
        <CardTitle className="text-2xl md:text-3xl font-medium tracking-tight">
          Finalizar Compra - {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8 py-4">
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
              email={email}
              isLoading={isLoading}
              onNameChange={onNameChange}
              onCpfChange={onCpfChange}
              onPhoneChange={onPhoneChange}
              onEmailChange={onEmailChange}
              onSubmit={onSubmitProfile}
            />
          ) : (
            <div className="pt-6 border-t border-border/50">
              <CheckoutProForm
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

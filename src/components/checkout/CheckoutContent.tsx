
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, Batch } from "@/types";
import { OrderSummary } from "./OrderSummary";
import { CustomerForm } from "./CustomerForm";
import { CreditCardForm } from "./credit-card/CreditCardForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PIXForm } from "./payment/PIXForm";

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
  onSubmitPayment: (paymentData: {
    token?: string;
    installments?: number;
    paymentMethodId: string;
    paymentType: "credit_card" | "pix";
  }) => void;
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
              email={email}
              isLoading={isLoading}
              onNameChange={onNameChange}
              onCpfChange={onCpfChange}
              onPhoneChange={onPhoneChange}
              onEmailChange={onEmailChange}
              onSubmit={onSubmitProfile}
            />
          ) : (
            <div className="pt-4 border-t">
              <Tabs defaultValue="credit_card" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="credit_card">Cartão de Crédito</TabsTrigger>
                  <TabsTrigger value="pix">PIX</TabsTrigger>
                </TabsList>
                <TabsContent value="credit_card">
                  <CreditCardForm
                    amount={batch.price * quantity}
                    onSubmit={(data) => onSubmitPayment({ ...data, paymentType: "credit_card" })}
                    isSubmitting={isLoading}
                  />
                </TabsContent>
                <TabsContent value="pix">
                  <PIXForm
                    amount={batch.price * quantity}
                    onSubmit={() => onSubmitPayment({ paymentMethodId: "pix", paymentType: "pix" })}
                    isSubmitting={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

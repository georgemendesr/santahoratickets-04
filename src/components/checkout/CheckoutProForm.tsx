
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Smartphone, QrCode } from "lucide-react";

interface CheckoutProFormProps {
  amount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CheckoutProForm({ amount, onSubmit, isSubmitting }: CheckoutProFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Finalizar Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-lg font-medium">Total a pagar:</p>
          <p className="text-3xl font-bold text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(amount)}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Métodos de pagamento disponíveis:</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <span className="text-sm">Cartão de Crédito</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <QrCode className="w-8 h-8 text-green-600" />
                <span className="text-sm">PIX</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Smartphone className="w-8 h-8 text-purple-600" />
                <span className="text-sm">Boleto</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Você será redirecionado para o ambiente seguro do Mercado Pago</p>
            <p>• Parcelamento em até 12x sem juros no cartão</p>
            <p>• PIX com aprovação instantânea</p>
          </div>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-12 text-lg"
        >
          {isSubmitting ? "Preparando pagamento..." : "Ir para o pagamento"}
        </Button>

        <div className="flex justify-center">
          <img 
            src="https://www.mercadopago.com/org-img/MP3/API/logos/powered_by_mercadopago.gif" 
            alt="Powered by MercadoPago" 
            className="h-8"
          />
        </div>
      </CardContent>
    </Card>
  );
}

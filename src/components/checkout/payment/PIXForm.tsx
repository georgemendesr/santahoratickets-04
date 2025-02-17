
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PIXFormProps {
  amount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PIXForm({ amount, onSubmit, isSubmitting }: PIXFormProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-lg font-medium">Total a pagar:</p>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(amount)}
          </p>
        </div>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>Ao clicar em "Gerar PIX", você receberá um código PIX para pagamento.</p>
          <p>O pagamento será confirmado automaticamente após a transferência.</p>
        </div>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Gerando PIX..." : "Gerar PIX"}
        </Button>
      </div>
    </Card>
  );
}

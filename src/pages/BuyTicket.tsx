
import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Ticket, AlertCircle } from "lucide-react";
import { Event } from "@/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function BuyTicket() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const navigate = useNavigate();
  const { session } = useAuth();
  const [quantity, setQuantity] = useState("1");

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  const createPaymentPreference = useMutation({
    mutationFn: async () => {
      if (!session?.user.id || !event) return null;

      const { data, error } = await supabase
        .from("payment_preferences")
        .insert([
          {
            user_id: session.user.id,
            event_id: event.id,
            ticket_quantity: parseInt(quantity),
            total_amount: event.price * parseInt(quantity),
            init_point: "URL_DO_CHECKOUT", // Aqui você integraria com sua solução de pagamento
            status: "pending"
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        // Por enquanto, vamos apenas mostrar uma mensagem de sucesso
        // Em uma implementação real, redirecionaríamos para a URL de checkout
        toast.success("Pedido criado com sucesso!");
        navigate("/");
      }
    },
    onError: (error) => {
      console.error("Erro ao criar preferência de pagamento:", error);
      toast.error("Erro ao processar pedido. Por favor, tente novamente.");
    }
  });

  const handlePurchase = () => {
    if (!session) {
      toast.error("Faça login para continuar com a compra");
      return;
    }

    createPaymentPreference.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-8">
        <div className="container mx-auto">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-8">
        <div className="container mx-auto">
          <p>Evento não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto p-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription>
                Confira os detalhes do seu pedido abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-muted-foreground">
                  {format(new Date(event.date), "PPP", { locale: ptBR })} às {event.time}
                </p>
                <p className="text-muted-foreground">{event.location}</p>
              </div>

              {referralCode && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Código de indicação aplicado
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Quantidade de Ingressos
                </label>
                <Select
                  value={quantity}
                  onValueChange={(value) => setQuantity(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a quantidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.min(5, event.available_tickets) }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "ingresso" : "ingressos"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(event.price * parseInt(quantity))}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handlePurchase}
                disabled={createPaymentPreference.isPending || !session}
              >
                <Ticket className="mr-2 h-4 w-4" />
                {createPaymentPreference.isPending
                  ? "Processando..."
                  : "Finalizar Compra"}
              </Button>
            </CardFooter>
          </Card>

          {!session && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Faça login para continuar com a compra
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

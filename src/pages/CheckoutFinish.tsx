import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import { Event, Batch } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const CheckoutFinish = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const batchId = searchParams.get("batch");
  const quantity = Number(searchParams.get("quantity")) || 1;

  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const { data: event } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Event | null;
    },
    enabled: !!id,
  });

  const { data: batch } = useQuery({
    queryKey: ["batch", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("id", batchId)
        .maybeSingle();

      if (error) throw error;
      return data as Batch | null;
    },
    enabled: !!batchId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Você precisa estar logado para continuar");
      return;
    }

    if (!name || !cpf || !phone) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          name,
          cpf,
          phone,
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      if (batch) {
        const { error: paymentError } = await supabase
          .from("payment_preferences")
          .insert({
            event_id: id,
            user_id: session.user.id,
            ticket_quantity: quantity,
            total_amount: batch.price * quantity,
            init_point: "mercadopago_url_placeholder",
            status: "pending",
          });

        if (paymentError) throw paymentError;
      }

      toast.success("Perfil atualizado com sucesso!");
      navigate(`/event/${id}`);
    } catch (error) {
      console.error("Erro ao processar checkout:", error);
      toast.error("Erro ao processar seu pedido. Tente novamente.");
    }
  };

  if (!event || !batch) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Home
          </Button>
          <p className="text-center text-lg">Informações não encontradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Finalizar Compra - {event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lote</p>
                    <p className="font-medium">{batch.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantidade</p>
                    <p className="font-medium">{quantity} ingresso(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(batch.price * quantity)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                  >
                    Pagar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFinish;

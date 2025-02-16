import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event, Batch } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const { data: event, isLoading: isLoadingEvent } = useQuery({
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

  const { data: batches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ["batches", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("batches")
        .select("*")
        .eq("event_id", id)
        .eq("status", "active")
        .order("order_number", { ascending: true });

      if (error) throw error;
      return data as Batch[];
    },
    enabled: !!id && !!event,
  });

  const isLoading = isLoadingEvent || isLoadingBatches;

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (num > 0 && num <= 10) {
      setQuantity(num);
    }
  };

  const handleContinue = () => {
    if (!selectedBatch) {
      toast.error("Selecione um lote");
      return;
    }

    const selectedBatchData = batches?.find(b => b.id === selectedBatch);
    if (!selectedBatchData) {
      toast.error("Lote não encontrado");
      return;
    }

    if (quantity > selectedBatchData.available_tickets) {
      toast.error("Quantidade indisponível para este lote");
      return;
    }

    navigate(`/checkout/${id}/finish?batch=${selectedBatch}&quantity=${quantity}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!event) {
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
          <p className="text-center text-lg">Evento não encontrado</p>
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
              <CardTitle>Comprar Ingressos - {event?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Evento</p>
                    <p className="font-medium">{event?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">{event?.date} às {event?.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{event?.location}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="batch">Selecione o Lote</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger id="batch">
                        <SelectValue placeholder="Selecione um lote" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem 
                            key={batch.id} 
                            value={batch.id}
                            disabled={batch.available_tickets < 1}
                          >
                            {batch.title} - {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(batch.price)} ({batch.available_tickets} disponíveis)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">Máximo de 10 ingressos por pedido</p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleContinue}
                    disabled={!selectedBatch || quantity < 1}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

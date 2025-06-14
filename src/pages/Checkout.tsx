
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event, Batch } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: event, isLoading: isLoadingEvent, error: eventError } = useQuery({
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
    retry: 3,
    retryDelay: 1000,
  });

  const { data: batches, isLoading: isLoadingBatches, error: batchesError } = useQuery({
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
    retry: 3,
    retryDelay: 1000,
  });

  const isLoading = isLoadingEvent || isLoadingBatches;

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (num > 0 && num <= 10) {
      setQuantity(num);
    }
  };

  const handleContinue = async () => {
    if (!selectedBatch) {
      toast.error("Por favor, selecione um lote para continuar");
      return;
    }

    const selectedBatchData = batches?.find(b => b.id === selectedBatch);
    if (!selectedBatchData) {
      toast.error("Lote selecionado não encontrado. Tente novamente.");
      return;
    }

    if (quantity > selectedBatchData.available_tickets) {
      toast.error(`Apenas ${selectedBatchData.available_tickets} ingressos disponíveis neste lote`);
      return;
    }

    setIsProcessing(true);
    
    try {
      navigate(`/checkout/${id}/finish?batch=${selectedBatch}&quantity=${quantity}`);
    } catch (error) {
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (eventError || batchesError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Home
          </Button>
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar informações do evento. Verifique sua conexão e tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Home
          </Button>
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Evento não encontrado. Verifique o link e tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-4 sm:py-8">
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
              <CardTitle className="text-lg sm:text-xl">
                Comprar Ingressos - {event?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Event Information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Evento</p>
                      <p className="font-medium text-sm sm:text-base">{event?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data e Hora</p>
                      <p className="font-medium text-sm sm:text-base">{event?.date} às {event?.time}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium text-sm sm:text-base">{event?.location}</p>
                  </div>
                </div>

                {/* Batch and Quantity Selection */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="batch">Selecione o Lote</Label>
                    <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                      <SelectTrigger id="batch">
                        <SelectValue placeholder="Selecione um lote" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches?.map((batch) => (
                          <SelectItem 
                            key={batch.id} 
                            value={batch.id}
                            disabled={batch.available_tickets < 1}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{batch.title}</span>
                              <span className="text-sm text-muted-foreground">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(batch.price)} • {batch.available_tickets} disponíveis
                              </span>
                            </div>
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
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo de 10 ingressos por pedido
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleContinue}
                    disabled={!selectedBatch || quantity < 1 || isProcessing}
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Continuar"
                    )}
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

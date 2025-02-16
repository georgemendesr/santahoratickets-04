
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { type Ticket } from "@/types";

const ValidateTicket = () => {
  const navigate = useNavigate();
  const [scannedTicketId, setScannedTicketId] = useState<string | null>(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', scannedTicketId],
    queryFn: async () => {
      if (!scannedTicketId) return null;
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          events (
            title,
            date,
            time,
            location
          )
        `)
        .eq('id', scannedTicketId)
        .single();
      
      if (error) throw error;
      return data as Ticket & { events: any };
    },
    enabled: !!scannedTicketId,
  });

  const handleValidateTicket = async () => {
    if (!ticket || !scannedTicketId) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ used: true })
        .eq('id', scannedTicketId);

      if (error) throw error;

      toast.success("Ingresso validado com sucesso!");
    } catch (error) {
      toast.error("Erro ao validar ingresso");
      console.error('Erro:', error);
    }
  };

  const handleScan = (result: string | null) => {
    if (result) {
      setScannedTicketId(result);
    }
  };

  const handleError = (error: any) => {
    console.error("Erro no scanner:", error);
    toast.error("Erro ao ler QR Code. Tente novamente.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Validar Ingresso</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-4 border">
              <h2 className="text-xl font-semibold mb-4">Scanner QR Code</h2>
              <div className="aspect-square relative rounded-lg overflow-hidden">
                <QrScanner
                  onDecode={handleScan}
                  onError={handleError}
                  containerStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-card rounded-lg p-6 border">
                <p className="text-center">Carregando informações do ingresso...</p>
              </div>
            ) : ticket ? (
              <div className="bg-card rounded-lg p-6 border">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold">{ticket.events.title}</h2>
                  {ticket.used ? (
                    <XCircle className="h-6 w-6 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                </div>

                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>Data: {ticket.events.date} às {ticket.events.time}</p>
                  <p>Local: {ticket.events.location}</p>
                  <p>Status: {ticket.used ? "Já utilizado" : "Válido"}</p>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={handleValidateTicket}
                  disabled={ticket.used}
                >
                  {ticket.used ? "Ingresso já utilizado" : "Validar Ingresso"}
                </Button>
              </div>
            ) : (
              <div className="bg-card rounded-lg p-6 border">
                <p className="text-center text-muted-foreground">
                  Aproxime um QR Code para validar o ingresso
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateTicket;

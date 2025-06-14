
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoucherCard } from "@/components/voucher/VoucherCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Vouchers = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ["tickets", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar tickets primeiro
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      if (!ticketsData || ticketsData.length === 0) {
        return [];
      }

      // Buscar eventos separadamente
      const eventIds = [...new Set(ticketsData.map(ticket => ticket.event_id))];
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, date, time')
        .in('id', eventIds);

      if (eventsError) throw eventsError;

      // Combinar os dados
      const ticketsWithEvents = ticketsData.map(ticket => {
        const event = eventsData?.find(e => e.id === ticket.event_id);
        return {
          ...ticket,
          events: event || { 
            title: 'Evento não encontrado', 
            date: new Date().toISOString().split('T')[0], 
            time: '00:00' 
          }
        };
      });

      return ticketsWithEvents;
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: 1000,
  });

  if (!session) {
    navigate("/auth");
    return null;
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      ))}
    </div>
  );

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Ticket className="h-5 w-5" />
              Meus Vouchers
            </CardTitle>
            <CardDescription className="text-sm">
              Visualize seus vouchers e códigos promocionais. Apresente o QR Code na entrada do evento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Erro ao carregar seus vouchers. Verifique sua conexão e tente novamente.
                </AlertDescription>
              </Alert>
            ) : !tickets || tickets.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum voucher encontrado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você ainda não possui nenhum voucher. Compre ingressos para eventos e eles aparecerão aqui.
                </p>
                <Button onClick={() => navigate("/")} variant="outline">
                  Explorar Eventos
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {tickets.length} voucher{tickets.length !== 1 ? 's' : ''} encontrado{tickets.length !== 1 ? 's' : ''}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-center">
                      <VoucherCard
                        ticket={ticket}
                        eventTitle={ticket.events.title}
                        eventDate={format(new Date(ticket.events.date), "PPPP", { locale: ptBR })}
                        eventTime={ticket.events.time}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vouchers;

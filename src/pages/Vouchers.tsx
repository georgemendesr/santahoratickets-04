
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VoucherCard } from "@/components/voucher/VoucherCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Vouchers = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", session?.user?.id],
    queryFn: async () => {
      // Buscar tickets primeiro
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', session?.user?.id)
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
          events: event || { title: 'Evento não encontrado', date: new Date().toISOString().split('T')[0], time: '00:00' }
        };
      });

      return ticketsWithEvents;
    },
    enabled: !!session?.user?.id
  });

  if (!session) {
    navigate("/auth");
    return null;
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

        <Card>
          <CardHeader>
            <CardTitle>Meus Vouchers</CardTitle>
            <CardDescription>
              Visualize seus vouchers e códigos promocionais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Carregando vouchers...
              </p>
            ) : !tickets || tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Você ainda não possui nenhum voucher.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                  <VoucherCard
                    key={ticket.id}
                    ticket={ticket}
                    eventTitle={ticket.events.title}
                    eventDate={format(new Date(ticket.events.date), "PPPP", { locale: ptBR })}
                    eventTime={ticket.events.time}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vouchers;

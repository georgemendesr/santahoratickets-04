
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchesTable } from "@/components/admin/BatchesTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Batch, Event } from "@/types/event.types";
import { BackButton } from "@/components/common/BackButton";

const AdminBatches = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("ID do evento não fornecido");
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId
  });

  const { data: batches = [], isLoading: batchesLoading, refetch } = useQuery({
    queryKey: ['batches', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('event_id', eventId)
        .order('order_number');

      if (error) throw error;
      return data as Batch[];
    },
    enabled: !!eventId
  });

  if (!eventId) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
          <div className="container mx-auto px-4 py-8">
            <BackButton to="/admin" className="mb-6" />
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Erro</h1>
              <p className="text-muted-foreground">ID do evento não fornecido na URL.</p>
              <Button 
                onClick={() => navigate("/admin")} 
                className="mt-4"
              >
                Voltar ao Admin
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const isLoading = eventLoading || batchesLoading;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <BackButton to="/admin" className="mb-6" />

          <div className="flex items-center gap-3 mb-8">
            <Ticket className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tipos de Ingressos (Lotes)</h1>
              {event && (
                <p className="text-muted-foreground">
                  Configurando lotes para: <span className="font-medium">{event.title}</span>
                </p>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Lotes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando lotes...</p>
                </div>
              ) : (
                <BatchesTable
                  batches={batches}
                  eventId={eventId}
                  eventTitle={event?.title}
                  onBatchesChange={refetch}
                  isAdmin={isAdmin}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminBatches;

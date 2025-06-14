
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchesTable } from "@/components/admin/BatchesTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Batch } from "@/types/event.types";

const AdminBatches = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  // Por enquanto, usando um eventId fixo. Depois você pode pegar da URL ou contexto
  const eventId = "sample-event-id";

  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['batches', eventId],
    queryFn: async () => {
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

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <Ticket className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tipos de Ingressos (Lotes)</h1>
              <p className="text-muted-foreground">
                Configure os diferentes tipos de ingressos para seus eventos
              </p>
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

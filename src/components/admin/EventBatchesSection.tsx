
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Plus } from "lucide-react";
import { BatchFormDialog } from "./BatchFormDialog";
import { Batch } from "@/types/event.types";

interface EventBatchesSectionProps {
  eventId: string;
  eventTitle: string;
  isAdmin: boolean;
}

export function EventBatchesSection({ eventId, eventTitle, isAdmin }: EventBatchesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ['event-batches', eventId],
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

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setIsDialogOpen(true);
  };

  const handleDelete = async (batchId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lote?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Erro ao excluir lote:', error);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBatch(null);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (batch: Batch) => {
    const now = new Date();
    const startDate = new Date(batch.start_date);
    const endDate = batch.end_date ? new Date(batch.end_date) : null;

    if (batch.available_tickets === 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Esgotado</span>;
    }

    if (now < startDate) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Aguardando</span>;
    }

    if (endDate && now > endDate) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Encerrado</span>;
    }

    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>;
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <CardTitle>Tipos de Ingressos (Lotes)</CardTitle>
            </div>
            <Button 
              size="sm" 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Lote
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando lotes...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum lote cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Configure os tipos de ingressos para este evento
              </p>
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Lote
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map((batch) => (
                  <div key={batch.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{batch.title}</h4>
                        {getStatusBadge(batch)}
                      </div>
                      <span className="text-sm font-medium">
                        R$ {batch.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {batch.available_tickets}/{batch.total_tickets} disponíveis
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Vendas: {formatDateTime(batch.start_date)} 
                      {batch.end_date && ` até ${formatDateTime(batch.end_date)}`}
                    </p>
                    {batch.description && (
                      <p className="text-xs text-muted-foreground mb-3">{batch.description}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(batch)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(batch.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <BatchFormDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSuccess={() => {
          refetch();
          handleDialogClose();
        }}
        editingBatch={editingBatch}
        eventId={eventId}
      />
    </>
  );
}

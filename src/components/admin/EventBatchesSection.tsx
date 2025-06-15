
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Plus } from "lucide-react";
import { BatchesTable } from "./BatchesTable";
import { Batch } from "@/types/event.types";

interface EventBatchesSectionProps {
  eventId: string;
  eventTitle: string;
  isAdmin: boolean;
}

export function EventBatchesSection({ eventId, eventTitle, isAdmin }: EventBatchesSectionProps) {
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

  if (!isAdmin) {
    return null;
  }

  return (
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
            onClick={() => window.open(`/admin/lotes?event=${eventId}`, '_blank')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Gerenciar Lotes
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
              onClick={() => window.open(`/admin/lotes?event=${eventId}`, '_blank')}
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
                    <h4 className="font-medium">{batch.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      R$ {batch.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {batch.available_tickets}/{batch.total_tickets} disponíveis
                  </p>
                  {batch.description && (
                    <p className="text-xs text-muted-foreground">{batch.description}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(`/admin/lotes?event=${eventId}`, '_blank')}
              >
                <Ticket className="mr-2 h-4 w-4" />
                Gerenciar Todos os Lotes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

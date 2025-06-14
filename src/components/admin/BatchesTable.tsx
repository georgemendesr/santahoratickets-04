
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Batch } from "@/types/event.types";
import { BatchFormDialog } from "./BatchFormDialog";

interface BatchesTableProps {
  batches: Batch[];
  eventId: string;
  onBatchesChange: () => void;
  isAdmin: boolean;
}

export function BatchesTable({ batches, eventId, onBatchesChange, isAdmin }: BatchesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setIsDialogOpen(true);
  };

  const handleDelete = async (batchId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lote?")) {
      return;
    }

    setIsDeleting(batchId);
    try {
      const { error } = await supabase
        .from('batches')
        .delete()
        .eq('id', batchId);

      if (error) throw error;

      toast.success("Lote excluído com sucesso!");
      onBatchesChange();
    } catch (error) {
      console.error('Erro ao excluir lote:', error);
      toast.error("Erro ao excluir lote");
    } finally {
      setIsDeleting(null);
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
      return <Badge variant="secondary">Esgotado</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Aguardando</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge variant="secondary">Encerrado</Badge>;
    }

    return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
  };

  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum lote cadastrado</h3>
        <p className="text-muted-foreground mb-6">
          Comece criando o primeiro tipo de ingresso para este evento
        </p>
        {isAdmin && (
          <Button onClick={() => setIsDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Lote
          </Button>
        )}

        <BatchFormDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSuccess={onBatchesChange}
          eventId={eventId}
        />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <div className="p-4 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tipos de Ingressos</h3>
            {isAdmin && (
              <Button 
                onClick={() => setIsDialogOpen(true)}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Tipo de Ingresso
              </Button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Disponível/Total</TableHead>
              <TableHead>Período de Venda</TableHead>
              <TableHead>Visibilidade</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{batch.title}</div>
                    {batch.description && (
                      <div className="text-sm text-muted-foreground">{batch.description}</div>
                    )}
                    {batch.batch_group && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {batch.batch_group}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>R$ {batch.price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={batch.available_tickets === 0 ? "text-red-600 font-medium" : ""}>
                    {batch.available_tickets}/{batch.total_tickets}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Início: {formatDateTime(batch.start_date)}</div>
                    {batch.end_date && (
                      <div>Fim: {formatDateTime(batch.end_date)}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      {batch.visibility === 'public' ? 'Público' : 
                       batch.visibility === 'guest_only' ? 'Convidados' : 'PDV Interno'}
                    </Badge>
                    {!batch.is_visible && (
                      <div>
                        <Badge variant="secondary" className="text-xs">Oculto</Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(batch)}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(batch)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(batch.id)}
                        disabled={isDeleting === batch.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BatchFormDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSuccess={onBatchesChange}
        editingBatch={editingBatch}
        eventId={eventId}
      />
    </>
  );
}

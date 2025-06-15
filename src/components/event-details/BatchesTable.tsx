
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Batch } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Minus, Plus, Users } from "lucide-react";
import { ParticipantForm, Participant } from "@/components/checkout/ParticipantForm";
import { useParticipants } from "@/hooks/useParticipants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BatchesTableProps {
  batches: Batch[];
  onPurchase: (batchId: string, quantity: number, participants: Participant[]) => void;
  isLoading?: boolean;
}

export function BatchesTable({ batches, onPurchase, isLoading = false }: BatchesTableProps) {
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: string]: number }>({});
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const { participants, updateParticipants, resetParticipants } = useParticipants(
    selectedQuantities[selectedBatch?.id || ""] || 1
  );

  const updateQuantity = (batchId: string, newQuantity: number, batch: Batch) => {
    const min = batch.min_purchase || 1;
    const max = Math.min(batch.max_purchase || batch.available_tickets, batch.available_tickets);
    
    const quantity = Math.max(min, Math.min(max, newQuantity));
    setSelectedQuantities(prev => ({ ...prev, [batchId]: quantity }));
  };

  const handlePurchaseClick = (batch: Batch) => {
    const quantity = selectedQuantities[batch.id] || batch.min_purchase || 1;
    setSelectedBatch(batch);
    resetParticipants();
    setShowParticipantForm(true);
  };

  const handleParticipantSubmit = () => {
    if (selectedBatch) {
      const quantity = selectedQuantities[selectedBatch.id] || selectedBatch.min_purchase || 1;
      onPurchase(selectedBatch.id, quantity, participants);
      setShowParticipantForm(false);
      setSelectedBatch(null);
    }
  };

  const getStatusBadge = (batch: Batch) => {
    const now = new Date();
    const startDate = new Date(batch.start_date);
    const endDate = batch.end_date ? new Date(batch.end_date) : null;

    if (batch.available_tickets === 0) {
      return <Badge variant="destructive">Esgotado</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="secondary">Em breve</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge variant="outline">Expirado</Badge>;
    }

    if (batch.available_tickets <= 5) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Últimas unidades</Badge>;
    }

    return <Badge variant="default">Disponível</Badge>;
  };

  const canPurchase = (batch: Batch) => {
    const now = new Date();
    const startDate = new Date(batch.start_date);
    const endDate = batch.end_date ? new Date(batch.end_date) : null;

    return batch.available_tickets > 0 && 
           now >= startDate && 
           (!endDate || now <= endDate);
  };

  const formatDateRange = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate).toLocaleDateString('pt-BR');
    if (!endDate) return `A partir de ${start}`;
    const end = new Date(endDate).toLocaleDateString('pt-BR');
    return `${start} até ${end}`;
  };

  if (!batches.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Nenhum lote disponível no momento</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {batches.map((batch) => {
          const quantity = selectedQuantities[batch.id] || batch.min_purchase || 1;
          const canBuy = canPurchase(batch);

          return (
            <div key={batch.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{batch.title}</h4>
                    {getStatusBadge(batch)}
                  </div>
                  {batch.description && (
                    <p className="text-sm text-muted-foreground">{batch.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Válido: {formatDateRange(batch.start_date, batch.end_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(batch.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {batch.available_tickets} disponível(is)
                  </p>
                </div>
              </div>

              {canBuy && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(batch.id, quantity - 1, batch)}
                      disabled={quantity <= (batch.min_purchase || 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => updateQuantity(batch.id, parseInt(e.target.value) || 1, batch)}
                      className="w-20 text-center"
                      min={batch.min_purchase || 1}
                      max={Math.min(batch.max_purchase || batch.available_tickets, batch.available_tickets)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(batch.id, quantity + 1, batch)}
                      disabled={quantity >= Math.min(batch.max_purchase || batch.available_tickets, batch.available_tickets)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      Total: {formatCurrency(batch.price * quantity)}
                    </span>
                  </div>

                  <Button
                    onClick={() => handlePurchaseClick(batch)}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isLoading ? "Processando..." : "Comprar"}
                  </Button>
                </div>
              )}

              {!canBuy && batch.available_tickets > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Vendas não disponíveis no momento
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={showParticipantForm} onOpenChange={setShowParticipantForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dados dos Participantes</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <ParticipantForm
              quantity={selectedQuantities[selectedBatch.id] || selectedBatch.min_purchase || 1}
              participants={participants}
              onParticipantsChange={updateParticipants}
              onSubmit={handleParticipantSubmit}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

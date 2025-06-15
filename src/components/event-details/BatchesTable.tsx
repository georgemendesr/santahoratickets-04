
import { Batch } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

interface BatchesTableProps {
  batches: Batch[];
  onPurchase?: (batchId: string, quantity: number) => void;
  isLoading?: boolean;
}

export function BatchesTable({ batches, onPurchase, isLoading }: BatchesTableProps) {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Atualiza o estado 'now' a cada minuto
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleIncrement = (batchId: string, maxPurchase?: number) => {
    const currentQuantity = selectedQuantities[batchId] || 0;
    const maxAllowed = maxPurchase || 10;
    setSelectedQuantities(prev => ({
      ...prev,
      [batchId]: Math.min(currentQuantity + 1, maxAllowed)
    }));
  };

  const handleDecrement = (batchId: string, minPurchase: number) => {
    const currentQuantity = selectedQuantities[batchId] || 0;
    setSelectedQuantities(prev => ({
      ...prev,
      [batchId]: Math.max(currentQuantity - 1, 0)
    }));
  };

  const handlePurchase = (batchId: string) => {
    const quantity = selectedQuantities[batchId] || 0;
    if (quantity > 0 && onPurchase) {
      onPurchase(batchId, quantity);
      // Reset quantity after purchase
      setSelectedQuantities(prev => ({
        ...prev,
        [batchId]: 0
      }));
    }
  };

  const getBatchStatus = (batch: Batch) => {
    const startDate = new Date(batch.start_date);
    const endDate = batch.end_date ? new Date(batch.end_date) : null;

    if (batch.available_tickets === 0) {
      return <Badge variant="destructive">Esgotado</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Aguardando Início</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge variant="secondary">Encerrado</Badge>;
    }

    return <Badge className="bg-green-500">Disponível</Badge>;
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    
    if (now > end) return "Encerrado";

    const days = differenceInDays(end, now);
    const hours = differenceInHours(end, now) % 24;
    const minutes = differenceInMinutes(end, now) % 60;

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const isAvailableForPurchase = (batch: Batch) => {
    const startDate = new Date(batch.start_date);
    const endDate = batch.end_date ? new Date(batch.end_date) : null;
    
    return batch.is_visible && 
           batch.available_tickets > 0 && 
           now >= startDate && 
           (!endDate || now <= endDate) &&
           batch.visibility === 'public'; // Por enquanto só público
  };

  const getAvailableStock = (batch: Batch) => {
    if (batch.available_tickets <= 5 && batch.available_tickets > 0) {
      return (
        <span className="text-yellow-600 font-medium">
          {batch.available_tickets} restantes
        </span>
      );
    }
    return <span>{batch.available_tickets} disponíveis</span>;
  };

  // Filtrar apenas lotes visíveis e válidos para exibição
  const visibleBatches = batches.filter(batch => 
    batch.is_visible && batch.visibility === 'public'
  );

  // Agrupar lotes por grupo
  const groupedBatches = visibleBatches.reduce((groups, batch) => {
    const group = batch.batch_group || 'default';
    return {
      ...groups,
      [group]: [...(groups[group] || []), batch]
    };
  }, {} as Record<string, Batch[]>);

  if (visibleBatches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum ingresso disponível no momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedBatches).map(([group, batchesInGroup]) => (
        <div key={group} className="rounded-md border">
          {group !== 'default' && (
            <div className="p-4 border-b bg-muted/50">
              <h3 className="font-semibold">{group}</h3>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Ingresso</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Disponibilidade</TableHead>
                <TableHead>Encerra em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchesInGroup.map((batch) => {
                const isAvailable = isAvailableForPurchase(batch);
                const selectedQty = selectedQuantities[batch.id] || 0;
                const canPurchase = selectedQty >= batch.min_purchase && selectedQty > 0;

                return (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{batch.title}</p>
                        {batch.description && (
                          <p className="text-sm text-muted-foreground">{batch.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Mín: {batch.min_purchase} {batch.max_purchase && `| Máx: ${batch.max_purchase}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-lg">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(batch.price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getAvailableStock(batch)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {batch.end_date ? getTimeRemaining(batch.end_date) : "Sem prazo"}
                      </span>
                    </TableCell>
                    <TableCell>{getBatchStatus(batch)}</TableCell>
                    <TableCell>
                      {isAvailable ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDecrement(batch.id, batch.min_purchase)}
                            disabled={selectedQty <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium text-lg w-8 text-center">
                            {selectedQty}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleIncrement(batch.id, batch.max_purchase)}
                            disabled={selectedQty >= (batch.max_purchase || 10) || selectedQty >= batch.available_tickets}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Indisponível</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isAvailable && (
                        <div className="space-y-2">
                          <Button
                            onClick={() => handlePurchase(batch.id)}
                            disabled={!canPurchase || isLoading}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            size="sm"
                          >
                            {isLoading ? "Processando..." : "Comprar"}
                          </Button>
                          {selectedQty > 0 && (
                            <p className="text-sm text-muted-foreground text-center">
                              Total: {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(batch.price * selectedQty)}
                            </p>
                          )}
                          {selectedQty > 0 && selectedQty < batch.min_purchase && (
                            <p className="text-xs text-red-600 text-center">
                              Mínimo: {batch.min_purchase} ingressos
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

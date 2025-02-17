
import { Batch } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

interface BatchesTableProps {
  batches: Batch[];
}

export function BatchesTable({ batches }: BatchesTableProps) {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Atualiza o estado 'now' a cada minuto
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleIncrement = (batchId: string) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [batchId]: Math.min((prev[batchId] || 0) + 1, 10)
    }));
  };

  const handleDecrement = (batchId: string) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [batchId]: Math.max((prev[batchId] || 0) - 1, 0)
    }));
  };

  const getBatchStatus = (batch: Batch) => {
    switch (batch.status) {
      case 'active':
        return <Badge className="bg-green-500">Disponível</Badge>;
      case 'ended':
        return <Badge variant="secondary">Encerrado</Badge>;
      case 'sold_out':
        return <Badge variant="destructive">Esgotado</Badge>;
      default:
        return null;
    }
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

  // Agrupar lotes por grupo
  const groupedBatches = batches.reduce((groups, batch) => {
    const group = batch.batch_group || 'default';
    return {
      ...groups,
      [group]: [...(groups[group] || []), batch]
    };
  }, {} as Record<string, Batch[]>);

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
                <TableHead>Lote</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Encerra em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchesInGroup.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{batch.title}</p>
                      {batch.description && (
                        <p className="text-sm text-muted-foreground">{batch.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(batch.price)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {batch.end_date ? getTimeRemaining(batch.end_date) : "-"}
                    </span>
                  </TableCell>
                  <TableCell>{getBatchStatus(batch)}</TableCell>
                  <TableCell>
                    {batch.status === 'active' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDecrement(batch.id)}
                            disabled={(selectedQuantities[batch.id] || 0) <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium text-lg w-8 text-center">
                            {selectedQuantities[batch.id] || 0}
                          </span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleIncrement(batch.id)}
                            disabled={(selectedQuantities[batch.id] || 0) >= 10}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {selectedQuantities[batch.id] > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Você pagará: {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(batch.price * (selectedQuantities[batch.id] || 0))}
                          </p>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

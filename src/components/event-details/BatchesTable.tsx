
import { Batch } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, EyeOff, Users, ShoppingBag, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BatchesTableProps {
  batches: Batch[];
}

export function BatchesTable({ batches }: BatchesTableProps) {
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

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
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'ended':
        return <Badge variant="secondary">Encerrado</Badge>;
      case 'sold_out':
        return <Badge variant="destructive">Esgotado</Badge>;
      default:
        return null;
    }
  };

  const getVisibilityBadge = (batch: Batch) => {
    if (!batch.is_visible) {
      return <Badge variant="outline" className="gap-1"><EyeOff className="w-3 h-3" /> Oculto</Badge>;
    }

    switch (batch.visibility) {
      case 'public':
        return <Badge variant="outline" className="gap-1"><Eye className="w-3 h-3" /> Público</Badge>;
      case 'guest_only':
        return <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" /> Apenas Convidados</Badge>;
      case 'internal_pdv':
        return <Badge variant="outline" className="gap-1"><ShoppingBag className="w-3 h-3" /> PDV Interno</Badge>;
      default:
        return null;
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
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibilidade</TableHead>
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
                    <div className="text-sm">
                      <p>Início: {format(new Date(batch.start_date), "PPP", { locale: ptBR })}</p>
                      {batch.end_date && (
                        <p>Fim: {format(new Date(batch.end_date), "PPP", { locale: ptBR })}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getBatchStatus(batch)}</TableCell>
                  <TableCell>{getVisibilityBadge(batch)}</TableCell>
                  <TableCell>
                    {batch.status === 'active' && (
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

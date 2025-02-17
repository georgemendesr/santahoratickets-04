
import { Batch } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, EyeOff, Users, ShoppingBag } from "lucide-react";

interface BatchesTableProps {
  batches: Batch[];
}

export function BatchesTable({ batches }: BatchesTableProps) {
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

  const getPurchaseLimits = (batch: Batch) => {
    if (batch.min_purchase === 1 && !batch.max_purchase) {
      return null;
    }

    if (batch.min_purchase === batch.max_purchase) {
      return `Exatamente ${batch.min_purchase} ${batch.min_purchase === 1 ? 'ingresso' : 'ingressos'}`;
    }

    if (batch.min_purchase && batch.max_purchase) {
      return `${batch.min_purchase} a ${batch.max_purchase} ingressos`;
    }

    if (batch.min_purchase > 1) {
      return `Mínimo ${batch.min_purchase} ingressos`;
    }

    if (batch.max_purchase) {
      return `Máximo ${batch.max_purchase} ingressos`;
    }

    return null;
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
                <TableHead>Ingressos</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibilidade</TableHead>
                <TableHead>Limites</TableHead>
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
                    {batch.available_tickets} / {batch.total_tickets}
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
                    <span className="text-sm text-muted-foreground">
                      {getPurchaseLimits(batch)}
                    </span>
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

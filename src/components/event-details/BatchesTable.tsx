
import { Batch } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lote</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Ingressos</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="font-medium">{batch.title}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

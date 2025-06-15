
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Ticket, DollarSign } from "lucide-react";
import { EventFinancialReport } from "@/types/reports.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventsReportTableProps {
  reports: EventFinancialReport[];
  onViewDetails: (eventId: string) => void;
  isLoading?: boolean;
}

export function EventsReportTable({ reports, onViewDetails, isLoading }: EventsReportTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório por Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Carregando relatórios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reports.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório por Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum evento encontrado no período selecionado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Relatório por Evento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-center">Ingressos Vendidos</TableHead>
                <TableHead className="text-center">Disponíveis</TableHead>
                <TableHead className="text-right">Receita Bruta</TableHead>
                <TableHead className="text-right">Receita Líquida</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.event_id}>
                  <TableCell className="font-medium">
                    <div className="max-w-48 truncate">
                      {report.event_title}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(report.event_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                      <Ticket className="h-3 w-3" />
                      {report.total_tickets_sold}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-muted-foreground">{report.available_tickets}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    R$ {report.gross_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {report.net_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {report.average_ticket_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(report.event_id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

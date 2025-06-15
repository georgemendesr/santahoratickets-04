
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { ReportFilters } from "@/types/reports.types";

interface ReportsHeaderProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  onExport: () => void;
  summary?: {
    total_revenue_30d: number;
    active_events: number;
    tickets_sold_30d: number;
    average_ticket_price: number;
  };
}

export function ReportsHeader({ filters, onFiltersChange, onExport, summary }: ReportsHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios de Vendas</h1>
          <p className="text-muted-foreground">Análise financeira e operacional dos eventos</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={filters.period}
            onValueChange={(value: '7d' | '30d' | 'current_month') =>
              onFiltersChange({ ...filters, period: value })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="current_month">Mês atual</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Receita Total</h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {summary.total_revenue_30d.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Eventos Ativos</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{summary.active_events}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Ingressos Vendidos</h3>
              </div>
              <p className="text-2xl font-bold text-purple-600">{summary.tickets_sold_30d}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-medium text-muted-foreground">Ticket Médio</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                R$ {summary.average_ticket_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

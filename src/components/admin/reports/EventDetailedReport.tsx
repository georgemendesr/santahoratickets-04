
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ArrowLeft, BarChart3, Users, DollarSign, Ticket } from "lucide-react";
import { EventFinancialReport } from "@/types/reports.types";
import { exportEventDetailToCSV } from "@/utils/exportReports";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface EventDetailedReportProps {
  report: EventFinancialReport;
  onBack: () => void;
}

const COLORS = ['#8B5CF6', '#6366F1', '#10B981', '#F59E0B', '#EF4444'];

export function EventDetailedReport({ report, onBack }: EventDetailedReportProps) {
  const handleExport = () => {
    exportEventDetailToCSV(report);
  };

  const chartData = report.tickets_by_batch.map(batch => ({
    name: batch.batch_title,
    vendidos: batch.tickets_sold,
    disponíveis: batch.available_tickets,
    receita: batch.revenue
  }));

  const pieData = report.tickets_by_batch.map(batch => ({
    name: batch.batch_title,
    value: batch.tickets_sold,
    revenue: batch.revenue
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{report.event_title}</h2>
            <p className="text-muted-foreground">
              {format(new Date(report.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Resumo do Evento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Ticket className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-muted-foreground">Ingressos Vendidos</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">{report.total_tickets_sold}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-medium text-muted-foreground">Participantes</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{report.total_participants}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-medium text-muted-foreground">Receita Bruta</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              R$ {report.gross_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <h3 className="text-sm font-medium text-muted-foreground">Ticket Médio</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              R$ {report.average_ticket_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Vendas por Lote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vendidos" name="Vendidos" fill="#8B5CF6" />
                  <Bar dataKey="disponíveis" name="Disponíveis" fill="#E5E7EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receita por Lote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} ingressos`, 
                      `Receita: R$ ${pieData.find(p => p.name === name)?.revenue?.toFixed(2) || '0,00'}`
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Lotes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Lote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Lote</th>
                  <th className="text-center p-2">Vendidos</th>
                  <th className="text-center p-2">Disponíveis</th>
                  <th className="text-right p-2">Preço</th>
                  <th className="text-right p-2">Receita</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.tickets_by_batch.map((batch) => (
                  <tr key={batch.batch_id} className="border-b">
                    <td className="p-2 font-medium">{batch.batch_title}</td>
                    <td className="p-2 text-center">{batch.tickets_sold}</td>
                    <td className="p-2 text-center">{batch.available_tickets}</td>
                    <td className="p-2 text-right">
                      R$ {batch.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-right font-medium">
                      R$ {batch.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={batch.available_tickets > 0 ? "default" : "secondary"}>
                        {batch.available_tickets > 0 ? "Disponível" : "Esgotado"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

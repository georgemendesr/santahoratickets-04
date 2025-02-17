
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#8B5CF6', '#4F46E5', '#6366F1', '#7C3AED', '#6D28D9'];

export function FinancialDashboard() {
  // Dados gerais financeiros
  const { data: financialMetrics } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from("events")
        .select("id, title, date, gross_revenue, net_revenue, approved_tickets")
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;
      console.log("Financial metrics:", events);
      return events;
    },
  });

  // Vendas por forma de pagamento
  const { data: paymentMethodMetrics } = useQuery({
    queryKey: ["payment-method-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_preferences")
        .select("payment_type, status")
        .eq("status", "approved");

      if (error) throw error;

      const metrics = data.reduce((acc: any, curr) => {
        const type = curr.payment_type || "outros";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(metrics).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  // Vendas diárias dos últimos 30 dias
  const { data: dailySales } = useQuery({
    queryKey: ["daily-sales"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("payment_preferences")
        .select("created_at, total_amount")
        .eq("status", "approved")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (error) throw error;

      const salesByDay = data.reduce((acc: any, curr) => {
        const date = format(new Date(curr.created_at), "dd/MM", { locale: ptBR });
        acc[date] = (acc[date] || 0) + Number(curr.total_amount);
        return acc;
      }, {});

      return Object.entries(salesByDay).map(([date, amount]) => ({
        date,
        amount,
      }));
    },
  });

  const totalRevenue = financialMetrics?.reduce((acc, event) => acc + (event.gross_revenue || 0), 0) || 0;
  const totalTickets = financialMetrics?.reduce((acc, event) => acc + (event.approved_tickets || 0), 0) || 0;
  const averageTicketPrice = totalTickets ? totalRevenue / totalTickets : 0;

  return (
    <div className="space-y-8">
      {/* Cards com métricas principais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Receita Total</CardTitle>
            <CardDescription>Últimos 10 eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingressos Vendidos</CardTitle>
            <CardDescription>Últimos 10 eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTickets}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Médio</CardTitle>
            <CardDescription>Por ingresso</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              R$ {averageTicketPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de receita por evento */}
      <Card>
        <CardHeader>
          <CardTitle>Receita por Evento</CardTitle>
          <CardDescription>Últimos 10 eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="title" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="gross_revenue" name="Receita Bruta" fill="#8B5CF6" />
                <Bar dataKey="net_revenue" name="Receita Líquida" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de vendas diárias */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Diárias</CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Valor"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de métodos de pagamento */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>Distribuição das vendas aprovadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodMetrics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodMetrics?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

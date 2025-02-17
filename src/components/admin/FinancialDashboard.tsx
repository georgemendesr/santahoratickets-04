
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
} from "recharts";

export function FinancialDashboard() {
  const { data: financialMetrics } = useQuery({
    queryKey: ["financial-metrics"],
    queryFn: async () => {
      // Buscar eventos e suas métricas financeiras
      const { data: events, error } = await supabase
        .from("events")
        .select("title, gross_revenue, net_revenue, approved_tickets")
        .order("date", { ascending: false })
        .limit(5);

      if (error) throw error;
      return events;
    },
  });

  const totalRevenue = financialMetrics?.reduce((acc, event) => acc + (event.gross_revenue || 0), 0) || 0;
  const totalTickets = financialMetrics?.reduce((acc, event) => acc + (event.approved_tickets || 0), 0) || 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Receita Total</CardTitle>
            <CardDescription>Últimos 5 eventos</CardDescription>
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
            <CardDescription>Últimos 5 eventos</CardDescription>
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
              R$ {totalTickets ? (totalRevenue / totalTickets).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita por Evento</CardTitle>
          <CardDescription>Últimos 5 eventos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="gross_revenue" name="Receita Bruta" fill="#8B5CF6" />
                <Bar dataKey="net_revenue" name="Receita Líquida" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

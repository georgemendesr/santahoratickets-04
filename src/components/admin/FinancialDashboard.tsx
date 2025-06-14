
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
import {
  useAdminFinancialMetrics,
  useAdminPaymentMetrics,
  useAdminDailySales,
} from "@/hooks/useAdminQueries";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, DollarSign, Users } from "lucide-react";

const COLORS = ['#8B5CF6', '#4F46E5', '#6366F1', '#7C3AED', '#6D28D9'];

export function FinancialDashboard() {
  const { data: financialMetrics, isLoading: loadingFinancial, error: financialError } = useAdminFinancialMetrics();
  const { data: paymentMethodMetrics, isLoading: loadingPayments, error: paymentsError } = useAdminPaymentMetrics();
  const { data: dailySales, isLoading: loadingSales, error: salesError } = useAdminDailySales();

  const totalRevenue = financialMetrics?.reduce((acc, event) => acc + (event.gross_revenue || 0), 0) || 0;
  const totalTickets = financialMetrics?.reduce((acc, event) => acc + (event.approved_tickets || 0), 0) || 0;
  const averageTicketPrice = totalTickets ? totalRevenue / totalTickets : 0;

  const MetricCard = ({ title, value, description, icon: Icon, isLoading }: {
    title: string;
    value: string;
    description: string;
    icon: any;
    isLoading: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-xl sm:text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  const ChartContainer = ({ title, description, isLoading, error, children }: {
    title: string;
    description: string;
    isLoading: boolean;
    error: any;
    children: React.ReactNode;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Erro ao carregar dados do gráfico. Tente recarregar a página.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="h-[250px] sm:h-[300px]">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cards com métricas principais */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Receita Total"
          value={`R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          description="Últimos 10 eventos"
          icon={DollarSign}
          isLoading={loadingFinancial}
        />

        <MetricCard
          title="Ingressos Vendidos"
          value={totalTickets.toString()}
          description="Últimos 10 eventos"
          icon={Users}
          isLoading={loadingFinancial}
        />

        <MetricCard
          title="Ticket Médio"
          value={`R$ ${averageTicketPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          description="Por ingresso"
          icon={TrendingUp}
          isLoading={loadingFinancial}
        />
      </div>

      {/* Error handling for overall dashboard */}
      {(financialError || paymentsError || salesError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Alguns dados podem não estar atualizados devido a problemas de conexão. 
            Verifique sua internet e tente recarregar a página.
          </AlertDescription>
        </Alert>
      )}

      {/* Gráfico de receita por evento */}
      {(financialMetrics && financialMetrics.length > 0) || loadingFinancial ? (
        <ChartContainer
          title="Receita por Evento"
          description="Últimos 10 eventos"
          isLoading={loadingFinancial}
          error={financialError}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialMetrics} margin={{ top: 5, right: 5, left: 5, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="title" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'gross_revenue' ? 'Receita Bruta' : 'Receita Líquida'
                ]}
              />
              <Bar dataKey="gross_revenue" name="Receita Bruta" fill="#8B5CF6" />
              <Bar dataKey="net_revenue" name="Receita Líquida" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : null}

      {/* Gráfico de vendas diárias */}
      {(dailySales && dailySales.length > 0) || loadingSales ? (
        <ChartContainer
          title="Vendas Diárias"
          description="Últimos 30 dias"
          isLoading={loadingSales}
          error={salesError}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySales} margin={{ top: 5, right: 5, left: 5, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={60}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={(value: any) => [
                  `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  'Valor'
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="Valor"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : null}

      {/* Gráfico de métodos de pagamento */}
      {(paymentMethodMetrics && paymentMethodMetrics.length > 0) || loadingPayments ? (
        <ChartContainer
          title="Métodos de Pagamento"
          description="Distribuição das vendas aprovadas"
          isLoading={loadingPayments}
          error={paymentsError}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMethodMetrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={window.innerWidth < 640 ? 80 : 100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodMetrics?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: string) => [
                  Number(value).toLocaleString(),
                  'Vendas'
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : null}
    </div>
  );
}

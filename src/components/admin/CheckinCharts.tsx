
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface CheckinByHour {
  hour: string;
  count: number;
}

interface CheckinByBatch {
  batch_id: string;
  batch_name: string;
  total: number;
  checked_in: number;
  percentage: number;
}

interface CheckinChartsProps {
  checkinsByHour: CheckinByHour[];
  checkinsByBatch: CheckinByBatch[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const CheckinCharts = ({ checkinsByHour, checkinsByBatch }: CheckinChartsProps) => {
  const pieData = checkinsByBatch.map((batch, index) => ({
    name: batch.batch_name,
    value: batch.checked_in,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Check-ins by Hour */}
      <Card>
        <CardHeader>
          <CardTitle>Check-ins por Horário</CardTitle>
        </CardHeader>
        <CardContent>
          {checkinsByHour.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={checkinsByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Check-ins by Batch */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Lote</CardTitle>
        </CardHeader>
        <CardContent>
          {checkinsByBatch.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {checkinsByBatch.map((batch, index) => (
                  <div key={batch.batch_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{batch.batch_name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {batch.checked_in}/{batch.total} ({batch.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

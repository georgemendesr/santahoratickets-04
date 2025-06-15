
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

interface CheckinStats {
  totalTickets: number;
  checkedIn: number;
  pending: number;
  attendanceRate: number;
}

interface RecentCheckin {
  id: string;
  participant_name: string;
  check_in_time: string | null;
  batch_title: string;
}

interface CheckinStatsProps {
  stats: CheckinStats;
  recentCheckins: RecentCheckin[];
}

export const CheckinStats = ({ stats, recentCheckins }: CheckinStatsProps) => {
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.totalTickets}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Check-in</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.checkedIn}</p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Pendentes</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Taxa</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-purple-900">{stats.attendanceRate}%</p>
                <Badge variant={stats.attendanceRate > 70 ? "default" : "secondary"}>
                  {stats.attendanceRate > 70 ? "Boa" : "Baixa"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.attendanceRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {stats.checkedIn} de {stats.totalTickets} participantes fizeram check-in
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Últimos Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCheckins.length > 0 ? (
            <div className="space-y-3">
              {recentCheckins.map((checkin) => (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{checkin.participant_name}</p>
                    <p className="text-sm text-muted-foreground">{checkin.batch_title}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {formatTime(checkin.check_in_time)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum check-in realizado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

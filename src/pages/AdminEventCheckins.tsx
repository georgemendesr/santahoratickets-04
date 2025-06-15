
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckinStats } from "@/components/admin/CheckinStats";
import { CheckinTable } from "@/components/admin/CheckinTable";
import { CheckinCharts } from "@/components/admin/CheckinCharts";
import { useEventCheckins } from "@/hooks/useEventCheckins";
import { ArrowLeft, Download, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";

const AdminEventCheckins = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const {
    event,
    checkinStats,
    participants,
    checkinsByHour,
    checkinsByBatch,
    loading,
    exportCheckins
  } = useEventCheckins(eventId);

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando dados de check-in...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">Evento não encontrado</h1>
            <Button onClick={() => navigate("/admin")} className="mt-4">
              Voltar ao Admin
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground">
                Controle de Check-ins - {new Date(event.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button onClick={() => exportCheckins()} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Ingressos</p>
                  <p className="text-2xl font-bold">{checkinStats.totalTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Check-ins Realizados</p>
                  <p className="text-2xl font-bold">{checkinStats.checkedIn}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{checkinStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Presença</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{checkinStats.attendanceRate}%</p>
                    <Badge variant={checkinStats.attendanceRate > 70 ? "default" : "secondary"}>
                      {checkinStats.attendanceRate > 70 ? "Boa" : "Baixa"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="participants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="checked_in">Check-in Realizado</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={batchFilter} onValueChange={setBatchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lote" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Lotes</SelectItem>
                      {checkinsByBatch.map((batch) => (
                        <SelectItem key={batch.batch_id} value={batch.batch_id}>
                          {batch.batch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <CheckinTable
              participants={participants}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              batchFilter={batchFilter}
            />
          </TabsContent>

          <TabsContent value="stats">
            <CheckinStats
              stats={checkinStats}
              recentCheckins={participants.filter(p => p.checked_in).slice(0, 10)}
            />
          </TabsContent>

          <TabsContent value="charts">
            <CheckinCharts
              checkinsByHour={checkinsByHour}
              checkinsByBatch={checkinsByBatch}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminEventCheckins;

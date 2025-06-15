
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackButton } from "@/components/common/BackButton";

const AdminParticipants = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole(session);

  // Show loading state while checking authentication
  if (loading || roleLoading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-4 px-4 sm:py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session || !isAdmin) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-4 px-4 sm:py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você não tem permissão para acessar esta página. Apenas administradores podem visualizar os participantes.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-4 px-4 sm:py-8">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <BackButton to="/admin" className="mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold">Participantes</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie participantes e visualize relatórios de vendas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admin/participants/list" className="block">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Listar Participantes</CardTitle>
                      <CardDescription className="text-sm">
                        Visualize todos os participantes cadastrados
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Acessar Lista
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/participants/sales" className="block">
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Relatório de Vendas</CardTitle>
                      <CardDescription className="text-sm">
                        Acompanhe métricas e vendas em tempo real
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Ver Relatórios
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminParticipants;


import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

const Admin = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  // Redirecionar se não for admin
  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Button 
            onClick={() => navigate("/criar-evento")}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Criar Evento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card de Eventos */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos</CardTitle>
              <CardDescription>Gerenciar eventos e ingressos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/eventos")}
              >
                Ver Eventos
              </Button>
            </CardContent>
          </Card>

          {/* Card de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>Gerenciar usuários e permissões</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/usuarios")}
              >
                Ver Usuários
              </Button>
            </CardContent>
          </Card>

          {/* Card de Recompensas */}
          <Card>
            <CardHeader>
              <CardTitle>Recompensas</CardTitle>
              <CardDescription>Gerenciar programa de fidelidade</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/recompensas")}
              >
                Ver Recompensas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Admin;

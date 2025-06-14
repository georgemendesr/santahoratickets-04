
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  if (!session || !isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/eventos")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Eventos
          </Button>

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Criar Evento</h1>
                <p className="text-muted-foreground">
                  Configure um novo evento para sua plataforma
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Formulário de Criação</CardTitle>
                <CardDescription>
                  Esta funcionalidade será implementada em breve. Por enquanto, você pode gerenciar eventos através do painel administrativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                  <p className="text-muted-foreground mb-6">
                    O formulário de criação de eventos está sendo desenvolvido.
                  </p>
                  <div className="space-x-4">
                    <Button onClick={() => navigate("/admin")} variant="outline">
                      Ir para Dashboard Admin
                    </Button>
                    <Button onClick={() => navigate("/eventos")}>
                      Ver Eventos Existentes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

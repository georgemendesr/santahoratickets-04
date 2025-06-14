
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Ticket, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";

const MyTickets = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  if (!session) {
    navigate("/auth");
    return null;
  }

  // Se for admin, redireciona para vouchers
  if (isAdmin) {
    navigate("/vouchers");
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Ticket className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Meus Ingressos</CardTitle>
                  <CardDescription>
                    Visualize e gerencie seus ingressos comprados
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum ingresso encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Você ainda não possui ingressos. Explore nossos eventos e adquira o seu!
                </p>
                <div className="space-x-4">
                  <Button onClick={() => navigate("/eventos")}>
                    Explorar Eventos
                  </Button>
                  <Button onClick={() => navigate("/vouchers")} variant="outline">
                    Ver Vouchers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyTickets;

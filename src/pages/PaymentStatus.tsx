
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const eventId = searchParams.get("external_reference")?.split("|")[0];

  useEffect(() => {
    // Redirecionar para home se não houver status
    if (!status) {
      navigate("/");
    }
  }, [status, navigate]);

  const getStatusInfo = () => {
    switch (status) {
      case "success":
        return {
          title: "Pagamento Aprovado!",
          description: "Seu ingresso foi gerado com sucesso.",
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
          buttonText: "Ver Meus Ingressos",
          buttonAction: () => navigate("/tickets"),
        };
      case "pending":
        return {
          title: "Pagamento Pendente",
          description: "Aguardando confirmação do pagamento.",
          icon: <Clock className="w-12 h-12 text-yellow-500" />,
          buttonText: "Voltar para o Evento",
          buttonAction: () => navigate(`/event/${eventId}`),
        };
      case "failure":
        return {
          title: "Pagamento não Aprovado",
          description: "Houve um problema com seu pagamento.",
          icon: <AlertCircle className="w-12 h-12 text-red-500" />,
          buttonText: "Tentar Novamente",
          buttonAction: () => navigate(`/event/${eventId}`),
        };
      default:
        return {
          title: "Status Desconhecido",
          description: "Não foi possível determinar o status do pagamento.",
          icon: <AlertCircle className="w-12 h-12 text-gray-500" />,
          buttonText: "Voltar para Home",
          buttonAction: () => navigate("/"),
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                {statusInfo.icon}
                <CardTitle className="text-center">{statusInfo.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-6">
                {statusInfo.description}
              </p>
              <Button 
                className="w-full" 
                onClick={statusInfo.buttonAction}
              >
                {statusInfo.buttonText}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;

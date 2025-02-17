
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const payment_id = searchParams.get("payment_id");
  const eventId = searchParams.get("external_reference")?.split("|")[0];

  useEffect(() => {
    // Redirecionar para home se não houver status
    if (!status || !payment_id) {
      navigate("/");
    }
  }, [status, payment_id, navigate]);

  const getStatusInfo = () => {
    switch (status) {
      case "approved":
        return {
          title: "Pagamento Aprovado!",
          description: "Seus ingressos foram gerados com sucesso.",
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
          buttonText: "Ver Meus Ingressos",
          buttonAction: () => navigate("/tickets"),
          alert: {
            description: "Você receberá um e-mail com seus ingressos em breve.",
            className: "bg-green-50 border-green-200 text-green-800"
          }
        };
      case "pending":
        return {
          title: "Pagamento em Processamento",
          description: "Aguardando confirmação do pagamento.",
          icon: <Clock className="w-12 h-12 text-yellow-500" />,
          buttonText: "Voltar para o Evento",
          buttonAction: () => navigate(`/event/${eventId}`),
          alert: {
            description: "Assim que o pagamento for confirmado, seus ingressos serão gerados automaticamente.",
            className: "bg-yellow-50 border-yellow-200 text-yellow-800"
          }
        };
      case "rejected":
        return {
          title: "Pagamento não Aprovado",
          description: "Houve um problema com seu pagamento.",
          icon: <AlertCircle className="w-12 h-12 text-red-500" />,
          buttonText: "Tentar Novamente",
          buttonAction: () => navigate(`/event/${eventId}`),
          alert: {
            description: "Por favor, verifique os dados do cartão e tente novamente.",
            className: "bg-red-50 border-red-200 text-red-800"
          }
        };
      default:
        return {
          title: "Status Desconhecido",
          description: "Não foi possível determinar o status do pagamento.",
          icon: <AlertCircle className="w-12 h-12 text-gray-500" />,
          buttonText: "Voltar para Home",
          buttonAction: () => navigate("/"),
          alert: {
            description: "Se você tiver dúvidas, entre em contato com nosso suporte.",
            className: "bg-gray-50 border-gray-200 text-gray-800"
          }
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16">
        <Button 
          variant="ghost" 
          className="mb-8" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Home
        </Button>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-4">
                {statusInfo.icon}
                <CardTitle className="text-center text-2xl">{statusInfo.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                {statusInfo.description}
              </p>

              <Alert className={statusInfo.alert.className}>
                <AlertDescription>
                  {statusInfo.alert.description}
                </AlertDescription>
              </Alert>

              {payment_id && (
                <p className="text-center text-sm text-muted-foreground">
                  ID do Pagamento: {payment_id}
                </p>
              )}

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

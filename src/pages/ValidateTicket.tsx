
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Scan, Type } from "lucide-react";
import { toast } from "sonner";
import { useTicketValidation } from "@/hooks/useTicketValidation";
import { TicketValidationCard } from "@/components/TicketValidationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ValidateTicket = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(false);
  const { validateTicket, isValidating, lastValidatedTicket, clearLastValidation } = useTicketValidation();

  const handleScan = async (result: string | null) => {
    if (result && !isValidating) {
      console.log('QR Code scanned:', result);
      setScannerEnabled(false);
      await validateTicket(result);
    }
  };

  const handleManualValidation = async () => {
    if (!manualCode.trim()) {
      toast.error("Digite o código do ingresso");
      return;
    }
    await validateTicket(manualCode.trim());
    setManualCode("");
  };

  const handleError = (error: any) => {
    console.error("Erro no scanner:", error);
    toast.error("Erro ao ler QR Code. Tente novamente.");
  };

  const startNewValidation = () => {
    clearLastValidation();
    setScannerEnabled(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 touch-manipulation"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Validar Ingresso</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Escaneie o QR Code ou digite o código manualmente
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Scanner e Entrada Manual */}
          <div className="space-y-6">
            <Tabs defaultValue="scanner" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="scanner" className="flex items-center gap-2 text-sm sm:text-base py-3">
                  <Scan className="h-4 w-4" />
                  <span className="hidden sm:inline">Scanner</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2 text-sm sm:text-base py-3">
                  <Type className="h-4 w-4" />
                  <span className="hidden sm:inline">Manual</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="scanner">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Scan className="h-5 w-5" />
                      Scanner QR Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!scannerEnabled ? (
                      <Button 
                        onClick={() => setScannerEnabled(true)}
                        className="w-full py-4 text-base touch-manipulation"
                        size="lg"
                      >
                        Ativar Scanner
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="aspect-square relative rounded-lg overflow-hidden border max-w-sm mx-auto">
                          <QrScanner
                            onDecode={handleScan}
                            onError={handleError}
                            containerStyle={{
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => setScannerEnabled(false)}
                          className="w-full py-3 touch-manipulation"
                        >
                          Parar Scanner
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Type className="h-5 w-5" />
                      Código Manual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Digite o código do ingresso"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualValidation();
                        }
                      }}
                      className="text-base py-3"
                    />
                    <Button
                      onClick={handleManualValidation}
                      disabled={isValidating || !manualCode.trim()}
                      className="w-full py-4 text-base touch-manipulation"
                      size="lg"
                    >
                      {isValidating ? "Validando..." : "Validar Ingresso"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Resultado da Validação */}
          <div className="space-y-6">
            {lastValidatedTicket ? (
              <div className="space-y-4">
                <TicketValidationCard 
                  ticket={lastValidatedTicket}
                  isSuccess={lastValidatedTicket.status === 'validated'}
                />
                <Button 
                  onClick={startNewValidation}
                  variant="outline"
                  className="w-full py-3 touch-manipulation"
                >
                  Validar Outro Ingresso
                </Button>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="space-y-3">
                    <Scan className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto" />
                    <h3 className="text-lg sm:text-xl font-semibold">Aguardando Validação</h3>
                    <p className="text-sm sm:text-base text-muted-foreground px-4">
                      Escaneie um QR Code ou digite o código para validar o ingresso
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateTicket;

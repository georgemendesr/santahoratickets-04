
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckSquare, Bug, TestTube } from "lucide-react";

export function TestingAccessButton() {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-700">
          <TestTube className="h-5 w-5" />
          Painel de Testes
        </CardTitle>
        <CardDescription>
          Validação manual de funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckSquare className="h-4 w-4 text-green-600" />
            <span>Checklist completo de testes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Bug className="h-4 w-4 text-red-600" />
            <span>Relatório de bugs e problemas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TestTube className="h-4 w-4 text-blue-600" />
            <span>Progresso de validação</span>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/testing')}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Acessar Painel de Testes
        </Button>
      </CardContent>
    </Card>
  );
}

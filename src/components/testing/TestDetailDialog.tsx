
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TestCase, TestStatus } from "@/types/testing.types";
import { useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface TestDetailDialogProps {
  test: TestCase;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (testId: string, status: TestStatus, comments?: string) => void;
}

export function TestDetailDialog({ test, isOpen, onClose, onUpdateStatus }: TestDetailDialogProps) {
  const [comments, setComments] = useState(test.comments || '');
  const [currentStatus, setCurrentStatus] = useState<TestStatus>(test.status);

  const handleSave = (status: TestStatus) => {
    onUpdateStatus(test.id, status, comments);
    setCurrentStatus(status);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {test.title}
            <Badge variant="outline" className="ml-auto">
              {test.category}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">Descrição</h4>
            <p className="text-sm text-muted-foreground">
              {test.description}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3">Passos para testar</h4>
            <ol className="space-y-2">
              {test.steps.map((step, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-2">Observações</h4>
            <Textarea
              placeholder="Adicione observações sobre o teste (opcional)..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => handleSave('success')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Funcionando
            </Button>
            
            <Button
              onClick={() => handleSave('in_progress')}
              variant="outline"
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Em Teste
            </Button>
            
            <Button
              onClick={() => handleSave('error')}
              variant="outline"
              className="flex-1 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Com Erro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

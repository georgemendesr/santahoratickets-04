
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestCase, TestStatus } from "@/types/testing.types";
import { TestStatusBadge } from "./TestStatusBadge";
import { CheckCircle, XCircle, Clock, Play } from "lucide-react";
import { useState } from "react";
import { TestDetailDialog } from "./TestDetailDialog";

interface TestCardProps {
  test: TestCase;
  onUpdateStatus: (testId: string, status: TestStatus, comments?: string) => void;
}

export function TestCard({ test, onUpdateStatus }: TestCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleQuickStatus = (status: TestStatus) => {
    if (status === 'error') {
      setShowDetail(true);
    } else {
      onUpdateStatus(test.id, status);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(test.status)}
              <CardTitle className="text-sm font-medium">
                {test.title}
              </CardTitle>
            </div>
            <TestStatusBadge status={test.status} />
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {test.description}
          </p>
          
          {test.comments && (
            <div className="mb-4 p-2 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Observação:</strong> {test.comments}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetail(true)}
              className="flex-1"
            >
              Testar
            </Button>
            
            {test.status !== 'success' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickStatus('success')}
                className="text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            {test.status !== 'error' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickStatus('error')}
                className="text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TestDetailDialog
        test={test}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onUpdateStatus={onUpdateStatus}
      />
    </>
  );
}

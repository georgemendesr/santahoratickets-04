
import { Badge } from "@/components/ui/badge";
import { TestStatus } from "@/types/testing.types";

interface TestStatusBadgeProps {
  status: TestStatus;
}

export function TestStatusBadge({ status }: TestStatusBadgeProps) {
  const statusConfig = {
    not_tested: {
      label: 'Não testado',
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-600'
    },
    in_progress: {
      label: 'Em teste',
      variant: 'outline' as const,
      className: 'bg-yellow-100 text-yellow-700'
    },
    success: {
      label: 'Sucesso',
      variant: 'outline' as const,
      className: 'bg-green-100 text-green-700'
    },
    error: {
      label: 'Erro',
      variant: 'outline' as const,
      className: 'bg-red-100 text-red-700'
    }
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

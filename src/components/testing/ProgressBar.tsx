
import { Progress } from "@/components/ui/progress";
import { TestProgress } from "@/types/testing.types";

interface ProgressBarProps {
  progress: TestProgress;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const percentage = progress.total > 0 ? (progress.tested / progress.total) * 100 : 0;
  const successPercentage = progress.total > 0 ? (progress.success / progress.total) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Progresso dos Testes</h3>
        <span className="text-sm text-muted-foreground">
          {progress.tested}/{progress.total} testados
        </span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-600">{progress.total}</div>
          <div className="text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-green-600">{progress.success}</div>
          <div className="text-gray-500">Sucessos</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-red-600">{progress.errors}</div>
          <div className="text-gray-500">Erros</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-600">{progress.notTested}</div>
          <div className="text-gray-500">Pendentes</div>
        </div>
      </div>
      
      {percentage > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {percentage.toFixed(1)}% concluído ({successPercentage.toFixed(1)}% com sucesso)
        </div>
      )}
    </div>
  );
}

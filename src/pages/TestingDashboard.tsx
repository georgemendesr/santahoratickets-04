
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTestProgress } from "@/hooks/useTestProgress";
import { ProgressBar } from "@/components/testing/ProgressBar";
import { TestCard } from "@/components/testing/TestCard";
import { CategoryFilter } from "@/components/testing/CategoryFilter";
import { testCategories } from "@/data/testCases";
import { TestStatus } from "@/types/testing.types";
import { Download, RotateCcw } from "lucide-react";

const TestingDashboard = () => {
  const { tests, progress, updateTestStatus, getTestsByCategory, exportResults } = useTestProgress();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TestStatus | null>(null);

  const filteredTests = tests.filter(test => {
    if (selectedCategory && test.category !== selectedCategory) return false;
    if (selectedStatus && test.status !== selectedStatus) return false;
    return true;
  });

  const resetAllTests = () => {
    if (confirm('Tem certeza que deseja resetar todos os testes? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('testResults');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Checklist de Testes - MVP</h1>
              <p className="text-muted-foreground">
                Validação manual de todas as funcionalidades do app
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" onClick={resetAllTests}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          <ProgressBar progress={progress} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
                <CardDescription>
                  Filtre os testes por categoria ou status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  selectedStatus={selectedStatus}
                  onCategoryChange={setSelectedCategory}
                  onStatusChange={setSelectedStatus}
                />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testCategories.map((category) => {
                    const categoryTests = getTestsByCategory(category.id);
                    const tested = categoryTests.filter(t => t.status !== 'not_tested').length;
                    const total = categoryTests.length;
                    const percentage = total > 0 ? (tested / total) * 100 : 0;

                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{tested}/{total}</div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Funcionalidades para testar
                {selectedCategory && (
                  <Badge variant="outline" className="ml-2">
                    {testCategories.find(c => c.id === selectedCategory)?.name}
                  </Badge>
                )}
                {selectedStatus && (
                  <Badge variant="outline" className="ml-2">
                    {selectedStatus}
                  </Badge>
                )}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredTests.length} teste{filteredTests.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onUpdateStatus={updateTestStatus}
                />
              ))}
            </div>

            {filteredTests.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum teste encontrado com os filtros selecionados
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestingDashboard;

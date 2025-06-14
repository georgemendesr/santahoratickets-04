
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { testCategories } from "@/data/testCases";
import { TestStatus } from "@/types/testing.types";

interface CategoryFilterProps {
  selectedCategory: string | null;
  selectedStatus: TestStatus | null;
  onCategoryChange: (category: string | null) => void;
  onStatusChange: (status: TestStatus | null) => void;
}

export function CategoryFilter({
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange
}: CategoryFilterProps) {
  const statusOptions: { value: TestStatus | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: 'not_tested', label: 'Não testados' },
    { value: 'in_progress', label: 'Em teste' },
    { value: 'success', label: 'Sucessos' },
    { value: 'error', label: 'Erros' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Filtrar por categoria</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(null)}
          >
            Todas
          </Button>
          {testCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="gap-1"
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Filtrar por status</h4>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value || 'all'}
              variant={selectedStatus === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

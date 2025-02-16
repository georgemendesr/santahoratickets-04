
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EventLayoutProps {
  children: React.ReactNode;
  onBack: () => void;
}

export function EventLayout({ children, onBack }: EventLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        {children}
      </div>
    </div>
  );
}

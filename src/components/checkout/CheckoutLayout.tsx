
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CheckoutLayoutProps {
  children: React.ReactNode;
  onBackClick?: () => void;
}

export function CheckoutLayout({ children, onBackClick }: CheckoutLayoutProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBackClick || (() => navigate(-1))}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

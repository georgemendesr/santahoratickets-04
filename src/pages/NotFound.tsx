
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground mb-4">
          Oops! Página não encontrada
        </p>
        <Button variant="default" asChild>
          <a href="/" className="inline-flex items-center gap-2">
            <Home className="h-4 w-4" />
            Voltar para Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

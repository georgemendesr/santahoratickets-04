
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function MainHeader() {
  const { session } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-16 items-center">
        <Link to="/" className="mr-6 flex items-center">
          <img 
            src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
            alt="Logo Santinha"
            className="h-8"
          />
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <Button 
              variant="outline" 
              onClick={() => navigate('/perfil')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Minha Conta
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

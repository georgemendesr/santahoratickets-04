
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

export function MainHeader() {
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
            alt="Logo Santinha"
            className="h-7"
          />
        </Link>

        <Button 
          variant="ghost" 
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          {session ? (
            <span className="text-sm">{session.user.email}</span>
          ) : (
            'Entrar'
          )}
        </Button>
      </div>
    </header>
  );
}

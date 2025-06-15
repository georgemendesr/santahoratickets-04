
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Ticket, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export function MainHeader() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          EventManager
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/eventos" className="text-muted-foreground hover:text-foreground">
            Eventos
          </Link>
          <Link to="/fidelidade" className="text-muted-foreground hover:text-foreground">
            Fidelidade
          </Link>
          <Link to="/recompensas" className="text-muted-foreground hover:text-foreground">
            Recompensas
          </Link>
          <Link to="/indique" className="text-muted-foreground hover:text-foreground">
            Indique Amigos
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/meus-ingressos">
                  <Ticket className="h-4 w-4 mr-2" />
                  Meus Ingressos
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/perfil">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

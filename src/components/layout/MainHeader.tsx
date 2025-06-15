
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Ticket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { MobileNavigation } from "./MobileNavigation";

export function MainHeader() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileNavigation />
          <Link to="/" className="text-xl font-bold text-primary">
            EventManager
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/eventos" className="text-muted-foreground hover:text-foreground transition-colors">
            Eventos
          </Link>
          <Link to="/fidelidade" className="text-muted-foreground hover:text-foreground transition-colors">
            Fidelidade
          </Link>
          <Link to="/recompensas" className="text-muted-foreground hover:text-foreground transition-colors">
            Recompensas
          </Link>
          <Link to="/indique" className="text-muted-foreground hover:text-foreground transition-colors">
            Indique Amigos
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex touch-manipulation">
                <Link to="/meus-ingressos">
                  <Ticket className="h-4 w-4 mr-2" />
                  Meus Ingressos
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex touch-manipulation">
                <Link to="/perfil">
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:flex touch-manipulation">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Button asChild className="touch-manipulation">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

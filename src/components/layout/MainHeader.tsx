import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function MainHeader() {
  const { session, signOut } = useAuth();

  return (
    <header className="bg-background border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="font-bold text-2xl">
          EventFlow
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/events">Eventos</Link>
          </Button>
          {session && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/my-tickets">Meus Ingressos</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/fidelity">Fidelidade</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/referrals">Indique e Ganhe</Link>
              </Button>
            </>
          )}
          {!session ? (
            <Button asChild>
              <Link to="/auth">Entrar / Cadastrar</Link>
            </Button>
          ) : (
            <Button variant="destructive" onClick={signOut}>
              Sair
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

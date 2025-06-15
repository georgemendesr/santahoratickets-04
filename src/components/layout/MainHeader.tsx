
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

export function MainHeader() {
  const { session, signOut } = useAuth();
  const { isAdmin, role, loading } = useRole(session);

  console.log("[MainHeader] Current state:", { 
    hasSession: !!session, 
    isAdmin, 
    role, 
    loading,
    userId: session?.user?.id 
  });

  return (
    <header className="bg-background border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link to="/" className="font-bold text-2xl">
          EventFlow
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/eventos">Eventos</Link>
          </Button>
          {session && (
            <>
              {isAdmin ? (
                // Menu para administradores
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/admin">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/admin/usuarios">Usuários</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/admin/financeiro">Financeiro</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/admin/vouchers">Vouchers</Link>
                  </Button>
                </>
              ) : (
                // Menu para usuários comuns
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/meus-ingressos">Meus Ingressos</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/fidelidade">Fidelidade</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/referrals">Indique e Ganhe</Link>
                  </Button>
                </>
              )}
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

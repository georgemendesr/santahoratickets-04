import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Gift, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

export function MainHeader() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { isAdmin } = useRole(session);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              EventPlatform
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Eventos
            </Link>
            {session && (
              <>
                <Link
                  to="/meus-ingressos"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Meus Ingressos
                </Link>
                <Link
                  to="/vouchers"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Vouchers
                </Link>
                <Link
                  to="/fidelidade"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Fidelidade
                </Link>
              </>
            )}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Admin <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/financeiro")}>
                    Financeiro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/participantes")}>
                    Participantes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/usuarios")}>
                    Usuários
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/vouchers")}>
                    Vouchers
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/recompensas")}>
                    Recompensas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-avatar.png" alt="Avatar" />
                    <AvatarFallback>
                      {session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isAdmin ? "Administrador" : "Usuário"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/fidelidade")}>
                  <Gift className="mr-2 h-4 w-4" />
                  <span>Programa de Fidelidade</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

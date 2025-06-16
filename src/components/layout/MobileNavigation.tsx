
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Menu, Home, Calendar, Star, Gift, Users, LogOut, User, Ticket, Settings, BarChart3, DollarSign } from "lucide-react";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const { isAdmin } = useRole(session);
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  // Navegação para usuários comuns
  const userNavItems = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/eventos", icon: Calendar, label: "Eventos" },
    { to: "/fidelidade", icon: Star, label: "Fidelidade" },
    { to: "/recompensas", icon: Gift, label: "Recompensas" },
    { to: "/indique", icon: Users, label: "Indique Amigos" },
  ];

  // Navegação para administradores
  const adminNavItems = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/admin", icon: Settings, label: "Dashboard Admin" },
    { to: "/eventos", icon: Calendar, label: "Gerenciar Eventos" },
    { to: "/admin/usuarios", icon: Users, label: "Usuários" },
    { to: "/admin/relatorios", icon: BarChart3, label: "Relatórios" },
    { to: "/admin/financeiro", icon: DollarSign, label: "Financeiro" },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const userItems = session && !isAdmin ? [
    { to: "/meus-ingressos", icon: Ticket, label: "Meus Ingressos" },
    { to: "/perfil", icon: User, label: "Perfil" },
  ] : session && isAdmin ? [
    { to: "/perfil", icon: User, label: "Perfil" },
  ] : [];

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="touch-manipulation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link 
                to="/" 
                className="flex items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <img 
                  src="/lovable-uploads/0791f14f-3770-44d6-8ff3-1e714a1d1243.png"
                  alt="Santa Hora"
                  className="h-8"
                />
              </Link>
              {isAdmin && (
                <p className="text-xs text-muted-foreground mt-2">Painel Administrativo</p>
              )}
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation ${
                    location.pathname === item.to || (item.to === '/admin' && location.pathname.startsWith('/admin'))
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              
              {userItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors touch-manipulation ${
                    location.pathname === item.to
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              {session ? (
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 px-4 py-3 touch-manipulation"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </Button>
              ) : (
                <Button asChild className="w-full touch-manipulation">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

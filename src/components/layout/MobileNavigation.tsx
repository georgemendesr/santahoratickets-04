
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Home, Calendar, Star, Gift, Users, LogOut, User, Ticket } from "lucide-react";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const navItems = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/eventos", icon: Calendar, label: "Eventos" },
    { to: "/fidelidade", icon: Star, label: "Fidelidade" },
    { to: "/recompensas", icon: Gift, label: "Recompensas" },
    { to: "/indique", icon: Users, label: "Indique Amigos" },
  ];

  const userItems = session ? [
    { to: "/meus-ingressos", icon: Ticket, label: "Meus Ingressos" },
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
                className="text-xl font-bold text-primary"
                onClick={() => setOpen(false)}
              >
                EventManager
              </Link>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
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

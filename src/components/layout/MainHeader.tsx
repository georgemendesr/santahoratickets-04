
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Ticket, LayoutTemplate, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function MainHeader() {
  const { session, signOut } = useAuth();
  const { isAdmin } = useRole(session);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Início
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {isAdmin && (
              <>
                <NavigationMenuItem>
                  <Link to="/admin">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Admin
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/admin/vouchers">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Vouchers
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/admin/participants">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Participantes
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/admin/participants/list">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Listar Participantes
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/admin/participants/sales">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Vendas
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <Button
                variant="ghost"
                onClick={() => signOut()}
              >
                Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button>Entrar</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

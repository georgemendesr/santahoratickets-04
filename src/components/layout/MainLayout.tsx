
import { MainHeader } from "./MainHeader";
import { MainFooter } from "./MainFooter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const [currentTab, setCurrentTab] = useState("/");

  console.log("MainLayout Render:", {
    session,
    isAdmin,
    currentTab,
    pathname: location.pathname
  });

  useEffect(() => {
    // Atualiza a tab baseado na rota atual
    if (location.pathname === "/") setCurrentTab("/");
    else if (location.pathname === "/meus-vouchers") setCurrentTab("/meus-vouchers");
    else if (location.pathname === "/recompensas") setCurrentTab("/recompensas");
    else if (location.pathname === "/admin") setCurrentTab("/admin");
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
      <MainHeader />
      
      {/* Menu de navegação - só mostra se estiver logado */}
      {session && (
        <div className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4">
            <Tabs value={currentTab} className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger 
                  value="/" 
                  onClick={() => navigate("/")}
                  className="data-[state=active]:bg-primary/10"
                >
                  Eventos
                </TabsTrigger>
                {session && (
                  <>
                    <TabsTrigger 
                      value="/meus-vouchers" 
                      onClick={() => navigate("/meus-vouchers")}
                      className="data-[state=active]:bg-primary/10"
                    >
                      Meus Vouchers
                    </TabsTrigger>
                    <TabsTrigger 
                      value="/recompensas" 
                      onClick={() => navigate("/recompensas")}
                      className="data-[state=active]:bg-primary/10"
                    >
                      Recompensas
                    </TabsTrigger>
                    {isAdmin && (
                      <TabsTrigger 
                        value="/admin" 
                        onClick={() => navigate("/admin")}
                        className="data-[state=active]:bg-primary/10"
                      >
                        Admin
                      </TabsTrigger>
                    )}
                  </>
                )}
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>
      <MainFooter />
    </div>
  );
}


import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { MainLayout } from "@/components/layout/MainLayout";

const Profile = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const { profile } = useProfile(session?.user?.id);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  if (!session) {
    navigate("/auth");
    return null;
  }

  return (
    <MainLayout>
      <div className="container max-w-xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle>Meu Perfil</CardTitle>
              {isAdmin && (
                <Badge variant="secondary">Administrador</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>

            {profile && (
              <>
                <div>
                  <p className="text-sm font-medium">CPF</p>
                  <p className="text-sm text-muted-foreground">{profile.cpf || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{profile.phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Pontos de Fidelidade</p>
                  <p className="text-sm text-muted-foreground">{profile.loyalty_points} pontos</p>
                </div>
              </>
            )}

            <div className="pt-4">
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;

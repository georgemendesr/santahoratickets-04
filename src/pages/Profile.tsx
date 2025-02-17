
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gift, LogOut, ShoppingBag, Ticket } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações e preferências
              </CardDescription>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/tickets')}
                  className="flex items-center gap-2"
                >
                  <Ticket className="h-4 w-4" />
                  Meus Ingressos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/vouchers')}
                  className="flex items-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Meus Vouchers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/rewards')}
                  className="flex items-center gap-2"
                >
                  <Gift className="h-4 w-4" />
                  Recompensas
                </Button>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

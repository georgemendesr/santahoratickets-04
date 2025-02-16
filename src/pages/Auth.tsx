import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, UserPlus, Mail, CheckCircle2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (session) {
    navigate("/");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error("Erro ao fazer login: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setSignUpSuccess(true);
      e.currentTarget.reset();
      
    } catch (error: any) {
      toast.error("Erro ao criar conta: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Bem-vindo!</CardTitle>
          <CardDescription>
            Faça login ou crie uma conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Digite seu email"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Digite sua senha"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              {signUpSuccess ? (
                <div className="text-center space-y-4 py-8">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-600">Conta criada com sucesso!</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      Enviamos um email de confirmação para você.
                    </p>
                    <div className="flex justify-center items-center text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Verifique sua caixa de entrada</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSignUpSuccess(false)}
                  >
                    Criar outra conta
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      name="email"
                      placeholder="Digite seu email"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      name="password"
                      placeholder="Digite sua senha"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

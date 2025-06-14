
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AdminRewardsHeader() {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Gerenciar Recompensas</CardTitle>
          <CardDescription>
            Cadastre e gerencie as recompensas do programa de fidelidade
          </CardDescription>
        </div>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Recompensa
          </Button>
        </DialogTrigger>
      </div>
    </CardHeader>
  );
}

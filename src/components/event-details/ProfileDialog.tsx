
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cpf: string;
  birthDate: string;
  onCpfChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function ProfileDialog({
  open,
  onOpenChange,
  cpf,
  birthDate,
  onCpfChange,
  onBirthDateChange,
  onSubmit,
  isPending
}: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete seu perfil</DialogTitle>
          <DialogDescription>
            Para continuar, precisamos de algumas informações adicionais.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={(e) => onCpfChange(e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div>
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => onBirthDateChange(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomerFormProps {
  name: string;
  cpf: string;
  phone: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CustomerForm({
  name,
  cpf,
  phone,
  isLoading,
  onNameChange,
  onCpfChange,
  onPhoneChange,
  onSubmit,
}: CustomerFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 pt-4 border-t">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          value={cpf}
          onChange={(e) => onCpfChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processando..." : "Continuar"}
      </Button>
    </form>
  );
}

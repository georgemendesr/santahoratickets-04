
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateCPF, validatePhone, formatCPF, formatPhone } from "@/utils/validation";
import { useState } from "react";
import { toast } from "sonner";

interface CustomerFormProps {
  name: string;
  cpf: string;
  phone: string;
  email: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CustomerForm({
  name,
  cpf,
  phone,
  email,
  isLoading,
  onNameChange,
  onCpfChange,
  onPhoneChange,
  onEmailChange,
  onSubmit,
}: CustomerFormProps) {
  const [errors, setErrors] = useState({
    name: false,
    cpf: false,
    phone: false,
    email: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      name: name.trim().length < 3,
      cpf: !validateCPF(cpf),
      phone: !validatePhone(phone),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      toast.error("Por favor, corrija os campos destacados");
      return;
    }
    
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">Nome deve ter pelo menos 3 caracteres</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">E-mail inválido</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          value={cpf}
          onChange={(e) => onCpfChange(formatCPF(e.target.value))}
          required
          maxLength={14}
          className={errors.cpf ? "border-red-500" : ""}
        />
        {errors.cpf && (
          <p className="text-sm text-red-500">CPF inválido</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => onPhoneChange(formatPhone(e.target.value))}
          required
          maxLength={15}
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">Telefone inválido</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processando..." : "Continuar"}
      </Button>
    </form>
  );
}

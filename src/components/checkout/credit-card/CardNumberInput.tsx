
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CardNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function CardNumberInput({ value, onChange }: CardNumberInputProps) {
  return (
    <div>
      <Label htmlFor="cardNumber">Número do Cartão</Label>
      <Input
        id="cardNumber"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        maxLength={16}
        required
      />
    </div>
  );
}

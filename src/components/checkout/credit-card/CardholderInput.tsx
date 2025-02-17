
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CardholderInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function CardholderInput({ value, onChange }: CardholderInputProps) {
  return (
    <div>
      <Label htmlFor="cardholderName">Nome no Cartão</Label>
      <Input
        id="cardholderName"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}

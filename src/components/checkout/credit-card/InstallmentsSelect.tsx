
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface InstallmentOption {
  installments: number;
  installment_amount: number;
  installment_rate: number;
}

interface InstallmentsSelectProps {
  value: string;
  options: InstallmentOption[];
  onChange: (value: string) => void;
}

export function InstallmentsSelect({
  value,
  options,
  onChange,
}: InstallmentsSelectProps) {
  return (
    <div>
      <Label htmlFor="installments">Parcelas</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="installments">
          <SelectValue placeholder="Selecione o número de parcelas" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.installments} value={String(option.installments)}>
              {option.installments}x de {" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(option.installment_amount)}
              {option.installments > 1 && option.installment_rate === 0 && " sem juros"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

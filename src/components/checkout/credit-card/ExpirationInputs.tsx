
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExpirationInputsProps {
  month: string;
  year: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

export function ExpirationInputs({
  month,
  year,
  onMonthChange,
  onYearChange,
}: ExpirationInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="expirationMonth">Mês</Label>
        <Input
          id="expirationMonth"
          value={month}
          onChange={(e) => onMonthChange(e.target.value.replace(/\D/g, ""))}
          maxLength={2}
          required
        />
      </div>
      <div>
        <Label htmlFor="expirationYear">Ano</Label>
        <Input
          id="expirationYear"
          value={year}
          onChange={(e) => onYearChange(e.target.value.replace(/\D/g, ""))}
          maxLength={2}
          required
        />
      </div>
    </div>
  );
}

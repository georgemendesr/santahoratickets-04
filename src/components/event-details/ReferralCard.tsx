
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ReferralCardProps {
  code: string;
}

export function ReferralCard({ code }: ReferralCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Link de Indicação</CardTitle>
        <CardDescription>
          Compartilhe este código com seus amigos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={code}
            readOnly
            className="font-mono"
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast.success("Código copiado!");
            }}
          >
            Copiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

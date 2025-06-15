
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail } from "lucide-react";

export interface Participant {
  name: string;
  email: string;
}

interface ParticipantFormProps {
  quantity: number;
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export function ParticipantForm({
  quantity,
  participants,
  onParticipantsChange,
  onSubmit,
  isLoading = false
}: ParticipantFormProps) {
  const [errors, setErrors] = useState<{ [key: number]: { name?: string; email?: string } }>({});

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], [field]: value };
    onParticipantsChange(newParticipants);

    // Clear error when user starts typing
    if (errors[index]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [index]: { ...prev[index], [field]: undefined }
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: number]: { name?: string; email?: string } } = {};
    let hasErrors = false;

    participants.forEach((participant, index) => {
      if (!participant.name.trim()) {
        newErrors[index] = { ...newErrors[index], name: "Nome é obrigatório" };
        hasErrors = true;
      }

      if (!participant.email.trim()) {
        newErrors[index] = { ...newErrors[index], email: "Email é obrigatório" };
        hasErrors = true;
      } else if (!/\S+@\S+\.\S+/.test(participant.email)) {
        newErrors[index] = { ...newErrors[index], email: "Email inválido" };
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados dos Participantes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preencha os dados de cada participante que utilizará os ingressos
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {Array.from({ length: quantity }, (_, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Participante {index + 1}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>
                    <User className="inline w-4 h-4 mr-1" />
                    Nome Completo *
                  </Label>
                  <Input
                    id={`name-${index}`}
                    type="text"
                    placeholder="Nome completo do participante"
                    value={participants[index]?.name || ""}
                    onChange={(e) => updateParticipant(index, "name", e.target.value)}
                    className={errors[index]?.name ? "border-red-500" : ""}
                  />
                  {errors[index]?.name && (
                    <p className="text-sm text-red-500">{errors[index].name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`}>
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email *
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="email@exemplo.com"
                    value={participants[index]?.email || ""}
                    onChange={(e) => updateParticipant(index, "email", e.target.value)}
                    className={errors[index]?.email ? "border-red-500" : ""}
                  />
                  {errors[index]?.email && (
                    <p className="text-sm text-red-500">{errors[index].email}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Finalizar Compra"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

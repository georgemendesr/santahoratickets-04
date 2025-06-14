
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Gift, Star, Award, BadgePercent } from "lucide-react";

interface RewardFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingReward: any;
  onSubmit: (data: any) => void;
  onReset: () => void;
}

export function RewardFormDialog({ 
  isOpen, 
  onOpenChange, 
  editingReward, 
  onSubmit, 
  onReset 
}: RewardFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_required: "",
    available_units: "",
    icon: "gift",
    active: true
  });

  const iconOptions = [
    { value: "gift", label: "Presente", icon: Gift },
    { value: "star", label: "Estrela", icon: Star },
    { value: "award", label: "Prêmio", icon: Award },
    { value: "badge-percent", label: "Desconto", icon: BadgePercent }
  ];

  // Update form data when editing reward changes
  useEffect(() => {
    if (editingReward) {
      setFormData({
        name: editingReward.name,
        description: editingReward.description,
        points_required: editingReward.points_required.toString(),
        available_units: editingReward.available_units?.toString() || "",
        icon: editingReward.icon,
        active: editingReward.active
      });
    } else {
      setFormData({
        name: "",
        description: "",
        points_required: "",
        available_units: "",
        icon: "gift",
        active: true
      });
    }
  }, [editingReward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      points_required: parseInt(formData.points_required),
      available_units: formData.available_units ? parseInt(formData.available_units) : null
    };

    if (editingReward) {
      await onSubmit({ ...data, id: editingReward.id });
    } else {
      await onSubmit(data);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) onReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingReward ? "Editar Recompensa" : "Nova Recompensa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="points_required">Pontos Necessários</Label>
            <Input
              id="points_required"
              type="number"
              value={formData.points_required}
              onChange={(e) => setFormData({ ...formData, points_required: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="available_units">Unidades Disponíveis</Label>
            <Input
              id="available_units"
              type="number"
              value={formData.available_units}
              onChange={(e) => setFormData({ ...formData, available_units: e.target.value })}
              placeholder="Deixe vazio para ilimitado"
            />
          </div>
          <div>
            <Label htmlFor="icon">Ícone</Label>
            <select
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
          <Button type="submit" className="w-full">
            {editingReward ? "Atualizar" : "Criar"} Recompensa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

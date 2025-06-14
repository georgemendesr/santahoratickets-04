
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useAdminRewards } from "@/hooks/useAdminRewards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Edit, Gift, Star, Award, BadgePercent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const AdminRewards = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const { rewards, isLoading, createReward, updateReward } = useAdminRewards();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_required: "",
    available_units: "",
    icon: "gift",
    active: true
  });

  if (!session || !isAdmin) {
    navigate("/");
    return null;
  }

  const iconOptions = [
    { value: "gift", label: "Presente", icon: Gift },
    { value: "star", label: "Estrela", icon: Star },
    { value: "award", label: "Prêmio", icon: Award },
    { value: "badge-percent", label: "Desconto", icon: BadgePercent }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      points_required: parseInt(formData.points_required),
      available_units: formData.available_units ? parseInt(formData.available_units) : null
    };

    try {
      if (editingReward) {
        await updateReward({ ...data, id: editingReward.id });
      } else {
        await createReward(data);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving reward:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      points_required: "",
      available_units: "",
      icon: "gift",
      active: true
    });
    setEditingReward(null);
  };

  const handleEdit = (reward: any) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      points_required: reward.points_required.toString(),
      available_units: reward.available_units?.toString() || "",
      icon: reward.icon,
      active: reward.active
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gerenciar Recompensas</CardTitle>
                <CardDescription>
                  Cadastre e gerencie as recompensas do programa de fidelidade
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Recompensa
                  </Button>
                </DialogTrigger>
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward: any) => (
                  <TableRow key={reward.id}>
                    <TableCell className="font-medium">{reward.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{reward.description}</TableCell>
                    <TableCell>{reward.points_required}</TableCell>
                    <TableCell>
                      {reward.available_units !== null ? reward.available_units : "Ilimitado"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={reward.active ? "default" : "secondary"}>
                        {reward.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(reward)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRewards;

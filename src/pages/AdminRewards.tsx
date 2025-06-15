
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Plus, Edit2, Eye, Award, Users } from "lucide-react";
import { useAdminFidelity } from "@/hooks/useAdminFidelity";
import { MainLayout } from "@/components/layout/MainLayout";
import { FidelityReward } from "@/types/fidelity.types";

const AdminRewards = () => {
  const { allRewards, allRedemptions, loadingRewards, loadingRedemptions, saveReward, isSaving, updateRedemptionStatus, isUpdating } = useAdminFidelity();
  const [editingReward, setEditingReward] = useState<Partial<FidelityReward> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReward && editingReward.name && editingReward.description && editingReward.points_required) {
      saveReward(editingReward as FidelityReward & { name: string; description: string; points_required: number });
      setIsDialogOpen(false);
      setEditingReward(null);
    }
  };

  const handleEditReward = (reward: FidelityReward) => {
    setEditingReward(reward);
    setIsDialogOpen(true);
  };

  const handleNewReward = () => {
    setEditingReward({
      name: "",
      description: "",
      points_required: 100,
      active: true,
      icon: "gift"
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (redemptionId: string, newStatus: string) => {
    updateRedemptionStatus({ id: redemptionId, status: newStatus });
  };

  const iconOptions = [
    { value: "gift", label: "🎁 Presente" },
    { value: "star", label: "⭐ Estrela" },
    { value: "award", label: "🏆 Troféu" },
    { value: "badge-percent", label: "% Desconto" }
  ];

  const statusOptions = [
    { value: "pending", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
    { value: "approved", label: "Aprovado", color: "bg-blue-100 text-blue-800" },
    { value: "delivered", label: "Entregue", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" }
  ];

  if (loadingRewards || loadingRedemptions) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Administração de Recompensas
          </h1>
          <p className="text-muted-foreground">
            Gerencie recompensas e acompanhe resgates dos usuários
          </p>
        </div>

        <Tabs defaultValue="rewards" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resgates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recompensas Cadastradas</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleNewReward}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Recompensa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReward?.id ? "Editar Recompensa" : "Nova Recompensa"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveReward} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={editingReward?.name || ""}
                        onChange={(e) => setEditingReward(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={editingReward?.description || ""}
                        onChange={(e) => setEditingReward(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="points">Pontos Necessários</Label>
                      <Input
                        id="points"
                        type="number"
                        value={editingReward?.points_required || 0}
                        onChange={(e) => setEditingReward(prev => ({ ...prev, points_required: parseInt(e.target.value) }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon">Ícone</Label>
                      <Select 
                        value={editingReward?.icon || "gift"}
                        onValueChange={(value) => setEditingReward(prev => ({ ...prev, icon: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="units">Unidades Disponíveis (opcional)</Label>
                      <Input
                        id="units"
                        type="number"
                        value={editingReward?.available_units || ""}
                        onChange={(e) => setEditingReward(prev => ({ 
                          ...prev, 
                          available_units: e.target.value ? parseInt(e.target.value) : null,
                          total_units: e.target.value ? parseInt(e.target.value) : null
                        }))}
                        placeholder="Deixe vazio para ilimitado"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={editingReward?.active || false}
                        onCheckedChange={(checked) => setEditingReward(prev => ({ ...prev, active: checked }))}
                      />
                      <Label htmlFor="active">Ativa</Label>
                    </div>
                    <Button type="submit" disabled={isSaving} className="w-full">
                      {isSaving ? "Salvando..." : "Salvar Recompensa"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {reward.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReward(reward)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {reward.points_required} pontos
                      </Badge>
                      <Badge variant={reward.active ? "default" : "secondary"}>
                        {reward.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    {reward.available_units && (
                      <div className="text-sm text-muted-foreground">
                        {reward.available_units} unidades restantes
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-6">
            <h2 className="text-xl font-semibold">Histórico de Resgates</h2>
            
            <div className="space-y-4">
              {allRedemptions.map((redemption: any) => (
                <Card key={redemption.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{redemption.reward?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {redemption.user?.name || redemption.user?.email} • {redemption.points_used} pontos
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(redemption.created_at).toLocaleDateString('pt-BR')} às {new Date(redemption.created_at).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={redemption.status}
                          onValueChange={(value) => handleStatusChange(redemption.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge className={statusOptions.find(s => s.value === redemption.status)?.color}>
                          {statusOptions.find(s => s.value === redemption.status)?.label}
                        </Badge>
                      </div>
                    </div>
                    {redemption.notes && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <strong>Observações:</strong> {redemption.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminRewards;

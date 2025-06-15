
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Gift, Plus, Edit, Star, Award, BadgePercent } from "lucide-react";
import { useAdminFidelity } from "@/hooks/useAdminFidelity";
import { MainLayout } from "@/components/layout/MainLayout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";

const iconOptions = [
  { value: 'gift', label: 'Gift', icon: Gift },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'badge-percent', label: 'Badge Percent', icon: BadgePercent },
];

const statusOptions = [
  { value: 'pending', label: 'Pendente', variant: 'outline' as const },
  { value: 'approved', label: 'Aprovado', variant: 'secondary' as const },
  { value: 'delivered', label: 'Entregue', variant: 'default' as const },
  { value: 'cancelled', label: 'Cancelado', variant: 'destructive' as const },
];

const AdminRewards = () => {
  const { allRewards, allRedemptions, saveReward, updateRedemptionStatus, isSaving, isUpdating } = useAdminFidelity();
  const [editingReward, setEditingReward] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const onSubmit = (data: any) => {
    saveReward({
      ...data,
      id: editingReward?.id,
      points_required: parseInt(data.points_required),
      available_units: data.available_units ? parseInt(data.available_units) : null,
      total_units: data.total_units ? parseInt(data.total_units) : null,
      active: data.active === 'true'
    });
    
    setIsDialogOpen(false);
    setEditingReward(null);
    reset();
  };

  const handleEdit = (reward: any) => {
    setEditingReward(reward);
    setValue('name', reward.name);
    setValue('description', reward.description);
    setValue('points_required', reward.points_required);
    setValue('available_units', reward.available_units || '');
    setValue('total_units', reward.total_units || '');
    setValue('icon', reward.icon || 'gift');
    setValue('active', reward.active.toString());
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = (redemptionId: string, status: string) => {
    updateRedemptionStatus({ id: redemptionId, status });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            Gerenciar Recompensas
          </h1>
          <p className="text-muted-foreground">
            Gerencie recompensas e resgates do programa de fidelidade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recompensas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recompensas Cadastradas</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingReward(null); reset(); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Recompensa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Nome</label>
                        <Input {...register('name', { required: true })} placeholder="Nome da recompensa" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Pontos Necessários</label>
                        <Input {...register('points_required', { required: true })} type="number" placeholder="100" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Descrição</label>
                      <Textarea {...register('description', { required: true })} placeholder="Descrição da recompensa" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium">Ícone</label>
                        <Select onValueChange={(value) => setValue('icon', value)} value={watch('icon')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <option.icon className="h-4 w-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Unidades Disponíveis</label>
                        <Input {...register('available_units')} type="number" placeholder="Deixe vazio para ilimitado" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select onValueChange={(value) => setValue('active', value)} value={watch('active')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Ativo</SelectItem>
                            <SelectItem value="false">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {iconOptions.find(opt => opt.value === reward.icon)?.icon && 
                          React.createElement(iconOptions.find(opt => opt.value === reward.icon)!.icon, { className: "h-5 w-5 text-primary" })}
                      </div>
                      <div>
                        <p className="font-medium">{reward.name}</p>
                        <p className="text-sm text-muted-foreground">{reward.points_required} pontos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={reward.active ? 'default' : 'secondary'}>
                        {reward.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(reward)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resgates */}
          <Card>
            <CardHeader>
              <CardTitle>Resgates Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRedemptions.filter((r: any) => r.status === 'pending').map((redemption: any) => (
                  <div key={redemption.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{redemption.reward?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {redemption.user?.name || redemption.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {statusOptions.map((status) => (
                        <Button
                          key={status.value}
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(redemption.id, status.value)}
                          disabled={isUpdating}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Todos os Resgates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Histórico de Resgates</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Recompensa</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRedemptions.map((redemption: any) => (
                  <TableRow key={redemption.id}>
                    <TableCell>
                      {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{redemption.user?.name || redemption.user?.email}</TableCell>
                    <TableCell>{redemption.reward?.name}</TableCell>
                    <TableCell>{redemption.points_used}</TableCell>
                    <TableCell>
                      <Badge variant={statusOptions.find(s => s.value === redemption.status)?.variant}>
                        {statusOptions.find(s => s.value === redemption.status)?.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminRewards;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export default function AdminVouchers() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: "1",
      name: "Ingresso VIP",
      price: 150.00,
      quantity: 50,
      availableQuantity: 30,
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      status: 'active'
    },
    {
      id: "2", 
      name: "Meia Entrada",
      price: 25.00,
      quantity: 200,
      availableQuantity: 180,
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      status: 'active'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
    startDate: "",
    endDate: ""
  });

  if (!session || !isAdmin) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTicket: TicketType = {
        id: editingTicket?.id || Date.now().toString(),
        name: formData.name,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        availableQuantity: editingTicket?.availableQuantity || parseInt(formData.quantity),
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: 'active'
      };

      if (editingTicket) {
        setTicketTypes(prev => prev.map(t => t.id === editingTicket.id ? newTicket : t));
        toast.success("Tipo de ingresso atualizado!");
      } else {
        setTicketTypes(prev => [...prev, newTicket]);
        toast.success("Tipo de ingresso criado!");
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar tipo de ingresso");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", price: "", quantity: "", startDate: "", endDate: "" });
    setEditingTicket(null);
  };

  const handleEdit = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setFormData({
      name: ticket.name,
      price: ticket.price.toString(),
      quantity: ticket.quantity.toString(),
      startDate: ticket.startDate,
      endDate: ticket.endDate
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (ticketId: string) => {
    setTicketTypes(prev => prev.filter(t => t.id !== ticketId));
    toast.success("Tipo de ingresso removido!");
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-8">
            <Ticket className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gerenciar Tipos de Ingressos</h1>
              <p className="text-muted-foreground">
                Configure os diferentes tipos de ingressos para seus eventos
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tipos de Ingressos</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Tipo de Ingresso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingTicket ? "Editar" : "Criar"} Tipo de Ingresso
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: VIP, Meia Entrada"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Preço (R$) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantidade *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          placeholder="100"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Data de Início *</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">Data de Término *</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingTicket ? "Atualizar" : "Criar"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {ticketTypes.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum tipo de ingresso</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando seu primeiro tipo de ingresso
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Tipo
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Disponível/Total</TableHead>
                      <TableHead>Período de Venda</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketTypes.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.name}</TableCell>
                        <TableCell>R$ {ticket.price.toFixed(2)}</TableCell>
                        <TableCell>{ticket.availableQuantity}/{ticket.quantity}</TableCell>
                        <TableCell>
                          {new Date(ticket.startDate).toLocaleDateString()} - {new Date(ticket.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={ticket.status === 'active' ? 'default' : 'secondary'}>
                            {ticket.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(ticket)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(ticket.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

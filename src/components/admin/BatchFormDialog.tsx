
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Batch } from "@/types/event.types";

interface BatchFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBatch?: Batch | null;
  eventId: string;
}

type VisibilityType = 'public' | 'guest_only' | 'internal_pdv';

export function BatchFormDialog({ isOpen, onClose, onSuccess, editingBatch, eventId }: BatchFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: editingBatch?.title || "",
    price: editingBatch?.price?.toString() || "",
    total_tickets: editingBatch?.total_tickets?.toString() || "",
    start_date: editingBatch?.start_date?.split('T')[0] || "",
    start_time: editingBatch?.start_date?.split('T')[1]?.substring(0, 5) || "",
    end_date: editingBatch?.end_date?.split('T')[0] || "",
    end_time: editingBatch?.end_date?.split('T')[1]?.substring(0, 5) || "",
    visibility: (editingBatch?.visibility || "public") as VisibilityType,
    is_visible: editingBatch?.is_visible !== false,
    description: editingBatch?.description || "",
    min_purchase: editingBatch?.min_purchase?.toString() || "1",
    max_purchase: editingBatch?.max_purchase?.toString() || "",
    batch_group: editingBatch?.batch_group || "none"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validações
      if (!formData.title || !formData.price || !formData.total_tickets || !formData.start_date || !formData.start_time) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      if (parseFloat(formData.price) <= 0) {
        toast.error("O preço deve ser maior que zero");
        return;
      }

      if (parseInt(formData.total_tickets) <= 0) {
        toast.error("A quantidade deve ser maior que zero");
        return;
      }

      if (formData.end_date && formData.end_time) {
        const startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
        const endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
        
        if (endDateTime <= startDateTime) {
          toast.error("A data de término deve ser posterior à data de início");
          return;
        }
      }

      const minPurchase = parseInt(formData.min_purchase);
      const maxPurchase = formData.max_purchase ? parseInt(formData.max_purchase) : null;
      
      if (maxPurchase && minPurchase > maxPurchase) {
        toast.error("A quantidade mínima não pode ser maior que a máxima");
        return;
      }

      const batchData = {
        title: formData.title,
        price: parseFloat(formData.price),
        total_tickets: parseInt(formData.total_tickets),
        available_tickets: editingBatch?.available_tickets || parseInt(formData.total_tickets),
        start_date: `${formData.start_date}T${formData.start_time}:00Z`,
        end_date: formData.end_date && formData.end_time ? `${formData.end_date}T${formData.end_time}:00Z` : null,
        visibility: formData.visibility,
        is_visible: formData.is_visible,
        description: formData.description || null,
        min_purchase: minPurchase,
        max_purchase: maxPurchase,
        batch_group: formData.batch_group === "none" ? null : formData.batch_group,
        event_id: eventId,
        order_number: editingBatch?.order_number || 1,
        status: 'active'
      };

      if (editingBatch) {
        const { error } = await supabase
          .from('batches')
          .update(batchData)
          .eq('id', editingBatch.id);

        if (error) throw error;
        toast.success("Lote atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('batches')
          .insert([batchData]);

        if (error) throw error;
        toast.success("Lote criado com sucesso!");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      toast.error("Erro ao salvar lote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      total_tickets: "",
      start_date: "",
      start_time: "",
      end_date: "",
      end_time: "",
      visibility: "public",
      is_visible: true,
      description: "",
      min_purchase: "1",
      max_purchase: "",
      batch_group: "none"
    });
  };

  const handleClose = () => {
    onClose();
    if (!editingBatch) {
      resetForm();
    }
  };

  const handleVisibilityChange = (value: string) => {
    if (value === 'public' || value === 'guest_only' || value === 'internal_pdv') {
      setFormData({ ...formData, visibility: value });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBatch ? "Editar" : "Adicionar"} Tipo de Ingresso
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Tipo de ingresso *</Label>
            <Input
              id="title"
              placeholder="4º LOTE - ÚLTIMO LOTE"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="15,00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="total_tickets">Quantidade *</Label>
              <Input
                id="total_tickets"
                type="number"
                placeholder="100"
                value={formData.total_tickets}
                onChange={(e) => setFormData({ ...formData, total_tickets: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">Início das vendas *</Label>
              <div className="mt-2 space-y-2">
                <div>
                  <Label htmlFor="start_date" className="text-xs text-muted-foreground">Data:</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="start_time" className="text-xs text-muted-foreground">Hora:</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Término das vendas</Label>
              <div className="mt-2 space-y-2">
                <div>
                  <Label htmlFor="end_date" className="text-xs text-muted-foreground">Data:</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_time" className="text-xs text-muted-foreground">Hora:</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Disponibilidade do ingresso</Label>
            <RadioGroup
              value={formData.visibility}
              onValueChange={handleVisibilityChange}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="text-sm">Para todo o público</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guest_only" id="guest_only" />
                <Label htmlFor="guest_only" className="text-sm">Restrito a convidados</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="internal_pdv" id="internal_pdv" />
                <Label htmlFor="internal_pdv" className="text-sm">Disponível apenas no PDV interno</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_visible"
              checked={formData.is_visible}
              onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              className="h-4 w-4 rounded border border-gray-300"
            />
            <Label htmlFor="is_visible" className="text-sm">Visível?</Label>
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Informação adicional. Ex: Esse ingresso dá direito a um copo"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_purchase">Qtd. mínima permitida por compra *</Label>
              <Input
                id="min_purchase"
                type="number"
                min="1"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="max_purchase">Qtd. máxima permitida por compra</Label>
              <Input
                id="max_purchase"
                type="number"
                value={formData.max_purchase}
                onChange={(e) => setFormData({ ...formData, max_purchase: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="batch_group">Grupo (opcional)</Label>
            <Select value={formData.batch_group} onValueChange={(value) => setFormData({ ...formData, batch_group: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Agrupar exibição dos tipos de ingressos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum grupo</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="promocional">Promocional</SelectItem>
                <SelectItem value="especial">Especial</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Recomendado quando existem grande variação de tipos.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

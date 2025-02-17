
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoucherCard } from "@/components/voucher/VoucherCard";
import { Ticket } from "@/types";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { Send, Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface Participant {
  fullName: string;
  email: string;
  phone: string;
}

export function VoucherDesigner() {
  const [customerName, setCustomerName] = useState("João da Silva");
  const [orderNumber, setOrderNumber] = useState("123456");
  const [batchTitle, setBatchTitle] = useState("1º Lote");
  const [ticketPrice, setTicketPrice] = useState(50);
  const [eventTitle, setEventTitle] = useState("Festa de Exemplo");
  const [eventDate, setEventDate] = useState("01/01/2024");
  const [eventTime, setEventTime] = useState("20:00");
  const [isSharing, setIsSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([{ 
    fullName: "", 
    email: "", 
    phone: "" 
  }]);
  const voucherRef = useRef<HTMLDivElement>(null);

  const addParticipant = () => {
    setParticipants([...participants, { fullName: "", email: "", phone: "" }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      const newParticipants = [...participants];
      newParticipants.splice(index, 1);
      setParticipants(newParticipants);
    }
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: value
    };
    setParticipants(newParticipants);
  };

  const saveParticipants = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_participants')
        .insert(
          participants.map(participant => ({
            ticket_id: ticketId,
            full_name: participant.fullName,
            email: participant.email,
            phone: participant.phone
          }))
        );

      if (error) throw error;
      
      toast.success("Participantes salvos com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar participantes:', error);
      toast.error("Erro ao salvar dados dos participantes");
    }
  };

  const shareOnWhatsApp = async () => {
    if (!voucherRef.current) return;
    
    // Validar dados dos participantes
    const hasEmptyFields = participants.some(p => !p.fullName || !p.email || !p.phone);
    if (hasEmptyFields) {
      toast.error("Por favor, preencha todos os dados dos participantes");
      return;
    }
    
    setIsSharing(true);
    try {
      const canvas = await html2canvas(voucherRef.current);
      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      const fileName = `voucher-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vouchers')
        .upload(fileName, imageBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vouchers')
        .getPublicUrl(fileName);

      // Criar mensagem do WhatsApp com informações do evento e link do voucher
      const message = `🎫 Seu ingresso para ${eventTitle}\n\n` +
        `📅 Data: ${eventDate}\n` +
        `⏰ Horário: ${eventTime}\n` +
        `🎯 Pedido: #${orderNumber}\n\n` +
        `Seu voucher: ${publicUrl}`;

      // Abrir WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast.success("Voucher pronto para compartilhar!");
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao preparar o voucher para compartilhamento");
    } finally {
      setIsSharing(false);
    }
  };

  const previewTicket: Ticket = {
    id: "preview-ticket",
    event_id: "preview-event",
    user_id: "preview-user",
    purchase_date: new Date().toISOString(),
    qr_code: "https://example.com/ticket/preview",
    qr_code_foreground: "#000000",
    qr_code_background: "#FFFFFF",
    used: false,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Preview de Dados</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Título do Evento
              </Label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Nome do evento"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">
                Data
              </Label>
              <Input
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">
                Horário
              </Label>
              <Input
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="HH:MM"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">
                Nome do Comprador
              </Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do comprador"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">
                Número do Pedido
              </Label>
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="123456"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">
                Lote
              </Label>
              <Input
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                placeholder="1º Lote"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-1 block">
                Valor
              </Label>
              <Input
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                placeholder="50.00"
              />
            </div>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Dados dos Participantes</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParticipant}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {participants.map((participant, index) => (
                  <div key={index} className="space-y-4 mb-6 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Participante {index + 1}</h4>
                      {participants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Nome Completo
                      </Label>
                      <Input
                        value={participant.fullName}
                        onChange={(e) => updateParticipant(index, 'fullName', e.target.value)}
                        placeholder="Nome completo do participante"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={participant.email}
                        onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-1 block">
                        Telefone
                      </Label>
                      <Input
                        value={participant.phone}
                        onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button 
              className="w-full"
              onClick={shareOnWhatsApp}
              disabled={isSharing}
            >
              <Send className="w-4 h-4 mr-2" />
              Compartilhar no WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div ref={voucherRef}>
          <VoucherCard
            ticket={previewTicket}
            eventTitle={eventTitle}
            eventDate={eventDate}
            eventTime={eventTime}
            customerName={customerName}
            orderNumber={orderNumber}
            batchTitle={batchTitle}
            ticketPrice={ticketPrice}
          />
        </div>
      </div>
    </div>
  );
}

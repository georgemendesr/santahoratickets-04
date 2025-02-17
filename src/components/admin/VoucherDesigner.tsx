
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoucherCard } from "@/components/voucher/VoucherCard";
import { Ticket } from "@/types";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

export function VoucherDesigner() {
  const [customerName, setCustomerName] = useState("João da Silva");
  const [orderNumber, setOrderNumber] = useState("123456");
  const [batchTitle, setBatchTitle] = useState("1º Lote");
  const [ticketPrice, setTicketPrice] = useState(50);
  const [eventTitle, setEventTitle] = useState("Festa de Exemplo");
  const [eventDate, setEventDate] = useState("01/01/2024");
  const [eventTime, setEventTime] = useState("20:00");
  const [isSharing, setIsSharing] = useState(false);
  const voucherRef = useRef<HTMLDivElement>(null);

  const shareOnWhatsApp = async () => {
    if (!voucherRef.current) return;
    
    setIsSharing(true);
    try {
      // Captura o voucher como imagem
      const canvas = await html2canvas(voucherRef.current);
      const imageBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      // Upload para o Supabase Storage
      const fileName = `voucher-${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vouchers')
        .upload(fileName, imageBlob);

      if (uploadError) throw uploadError;

      // Gera URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('vouchers')
        .getPublicUrl(fileName);

      // Cria mensagem do WhatsApp
      const message = `🎫 Seu ingresso para ${eventTitle}\n\n` +
        `📅 Data: ${eventDate}\n` +
        `⏰ Horário: ${eventTime}\n` +
        `🎯 Pedido: #${orderNumber}\n\n` +
        `Seu voucher: ${publicUrl}`;

      // Abre WhatsApp
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
              <label className="text-sm font-medium mb-1 block">
                Título do Evento
              </label>
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Nome do evento"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Data
              </label>
              <Input
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="DD/MM/YYYY"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Horário
              </label>
              <Input
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="HH:MM"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Nome do Cliente
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Número do Pedido
              </label>
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="123456"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Lote
              </label>
              <Input
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                placeholder="1º Lote"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Valor
              </label>
              <Input
                type="number"
                value={ticketPrice}
                onChange={(e) => setTicketPrice(Number(e.target.value))}
                placeholder="50.00"
              />
            </div>

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

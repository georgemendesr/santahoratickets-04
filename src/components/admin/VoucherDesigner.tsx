
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VoucherCard } from "@/components/voucher/VoucherCard";
import { Ticket } from "@/types";

export function VoucherDesigner() {
  const [customerName, setCustomerName] = useState("João da Silva");
  const [orderNumber, setOrderNumber] = useState("123456");
  const [batchTitle, setBatchTitle] = useState("1º Lote");
  const [ticketPrice, setTicketPrice] = useState(50);

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
          </div>

          <Button className="w-full">
            Salvar Configurações
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <div>
          <h2 className="text-xl font-semibold mb-4">Preview do Voucher</h2>
          <VoucherCard
            ticket={previewTicket}
            eventTitle="Festa de Exemplo"
            eventDate="01/01/2024"
            eventTime="20:00"
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

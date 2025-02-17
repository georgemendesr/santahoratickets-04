
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VoucherCard } from "@/components/voucher/VoucherCard";

export function VoucherDesigner() {
  const [qrCodeForeground, setQrCodeForeground] = useState("#8B5CF6");
  const [qrCodeBackground, setQrCodeBackground] = useState("#FFFFFF");

  const previewTicket = {
    id: "preview-ticket",
    qr_code: "https://example.com/ticket/preview",
    qr_code_foreground: qrCodeForeground,
    qr_code_background: qrCodeBackground,
    used: false,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Personalização do QR Code</h2>
          
          <div className="space-y-2">
            <Label htmlFor="foreground">Cor do QR Code</Label>
            <Input
              id="foreground"
              type="color"
              value={qrCodeForeground}
              onChange={(e) => setQrCodeForeground(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Cor de Fundo do QR Code</Label>
            <Input
              id="background"
              type="color"
              value={qrCodeBackground}
              onChange={(e) => setQrCodeBackground(e.target.value)}
            />
          </div>

          <Button className="w-full">
            Salvar Configurações
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Preview do Voucher</h2>
        <VoucherCard
          ticket={previewTicket}
          eventTitle="Evento de Exemplo"
          eventDate="01/01/2024"
          eventTime="20:00"
        />
      </div>
    </div>
  );
}


import { Card } from "@/components/ui/card";
import { Ticket } from "@/types";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface VoucherCardProps {
  ticket: Ticket;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  batchTitle?: string;
  ticketPrice?: number;
  customerName?: string;
  orderNumber?: string;
}

export function VoucherCard({ 
  ticket, 
  eventTitle, 
  eventDate, 
  eventTime,
  batchTitle,
  ticketPrice,
  customerName,
  orderNumber
}: VoucherCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000", // QR Code sempre preto
            light: "#FFFFFF" // Fundo sempre branco
          }
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        console.error("Erro ao gerar QR code:", err);
      }
    };

    generateQRCode();
  }, [ticket]);

  return (
    <Card className="relative overflow-hidden bg-white w-[300px]">
      {/* Borda superior laranja */}
      <div className="h-2 bg-[#F97316]" />

      {/* Logo no topo */}
      <div className="flex justify-center pt-4">
        <img 
          src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
          alt="Logo Santinha"
          className="h-8"
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Informações do evento */}
        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg">{eventTitle}</h3>
          <div className="text-sm text-gray-600">
            <p>{eventDate}</p>
            <p>{eventTime}</p>
          </div>
        </div>

        {/* Informações do ingresso */}
        <div className="text-sm space-y-1 border-t border-b border-orange-200 py-2">
          {customerName && (
            <p className="font-medium">Nome: {customerName}</p>
          )}
          {batchTitle && (
            <p>Lote: {batchTitle}</p>
          )}
          {ticketPrice && (
            <p>Valor: R$ {ticketPrice.toFixed(2)}</p>
          )}
          {orderNumber && (
            <p>Pedido: #{orderNumber}</p>
          )}
        </div>

        {/* QR Code centralizado */}
        <div className="flex justify-center">
          {qrCodeUrl && (
            <img 
              src={qrCodeUrl} 
              alt="QR Code do ingresso" 
              className="w-40 h-40"
            />
          )}
        </div>

        {/* Status do ingresso */}
        <div className="text-center text-sm text-gray-600">
          <p>Código: {ticket.id.slice(0, 8)}</p>
          <p className="mt-1">
            {ticket.used ? 
              "Voucher já utilizado" : 
              "Voucher válido"
            }
          </p>
        </div>
      </div>

      {/* Borda inferior laranja */}
      <div className="h-2 bg-[#F97316]" />
    </Card>
  );
}

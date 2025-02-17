
import { Card } from "@/components/ui/card";
import { Ticket } from "@/types";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface VoucherCardProps {
  ticket: Ticket;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
}

export function VoucherCard({ ticket, eventTitle, eventDate, eventTime }: VoucherCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code, {
          width: 200,
          margin: 2,
          color: {
            dark: ticket.qr_code_foreground || "#8B5CF6", // Cor do QR code (roxo por padrão)
            light: ticket.qr_code_background || "#FFFFFF" // Cor de fundo
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
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
      {/* Logo no topo */}
      <div className="absolute top-4 right-4">
        <img 
          src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
          alt="Logo Santinha"
          className="h-8 opacity-50"
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Informações do evento */}
        <div className="text-center space-y-2">
          <h3 className="font-bold text-xl">{eventTitle}</h3>
          <div className="text-sm text-muted-foreground">
            <p>{eventDate}</p>
            <p>{eventTime}</p>
          </div>
        </div>

        {/* QR Code centralizado */}
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="QR Code do ingresso" 
                className="w-48 h-48"
              />
            )}
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Voucher ID: {ticket.id.slice(0, 8)}</p>
          <p className="mt-1">
            {ticket.used ? 
              "Voucher já utilizado" : 
              "Voucher válido"
            }
          </p>
        </div>
      </div>

      {/* Padrão decorativo */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-blue-500" />
    </Card>
  );
}

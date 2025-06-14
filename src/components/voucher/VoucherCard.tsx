
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket } from "@/types";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Clock, MapPin, User, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [qrError, setQrError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateQRCode = async () => {
      setIsGenerating(true);
      setQrError("");
      
      try {
        if (!ticket.qr_code) {
          throw new Error("Código QR não disponível");
        }

        const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          },
          errorCorrectionLevel: 'M'
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        console.error("Erro ao gerar QR code:", err);
        setQrError("Erro ao gerar código QR. Tente recarregar a página.");
      } finally {
        setIsGenerating(false);
      }
    };

    generateQRCode();
  }, [ticket.qr_code]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      return timeStr.substring(0, 5);
    } catch {
      return timeStr;
    }
  };

  return (
    <Card className="relative overflow-hidden bg-white w-full max-w-[320px] mx-auto shadow-lg">
      {/* Borda superior laranja */}
      <div className="h-2 bg-[#F97316]" />

      {/* Logo no topo */}
      <div className="flex justify-center pt-4 px-4">
        <img 
          src="/lovable-uploads/1435babf-b231-494c-a8fb-9dd1239cd347.png" 
          alt="Logo Santinha"
          className="h-6 sm:h-8"
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Informações do evento */}
        <div className="text-center space-y-2">
          <h3 className="font-bold text-base sm:text-lg leading-tight">{eventTitle}</h3>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(eventDate)} • {formatTime(eventTime)}</span>
          </div>
        </div>

        {/* Status do ingresso */}
        <div className="flex justify-center">
          <Badge 
            variant={ticket.used ? "destructive" : "default"}
            className="text-xs"
          >
            {ticket.used ? "Já Utilizado" : "Válido"}
          </Badge>
        </div>

        {/* Informações detalhadas */}
        <div className="space-y-2 text-xs border-t border-b border-orange-200 py-3">
          {customerName && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
              <span className="font-medium truncate">{customerName}</span>
            </div>
          )}
          
          {batchTitle && (
            <div className="flex justify-between">
              <span className="text-gray-600">Lote:</span>
              <span className="font-medium">{batchTitle}</span>
            </div>
          )}
          
          {ticketPrice && (
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium">R$ {ticketPrice.toFixed(2)}</span>
            </div>
          )}
          
          {orderNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Pedido:</span>
              <span className="font-medium">#{orderNumber}</span>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center space-y-2">
              <Skeleton className="w-32 h-32 sm:w-40 sm:h-40" />
              <p className="text-xs text-gray-500">Gerando QR Code...</p>
            </div>
          ) : qrError ? (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {qrError}
              </AlertDescription>
            </Alert>
          ) : qrCodeUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <img 
                src={qrCodeUrl} 
                alt="QR Code do ingresso" 
                className="w-32 h-32 sm:w-40 sm:h-40 border border-gray-200 rounded"
              />
              <p className="text-xs text-gray-500 text-center">
                Apresente este código na entrada
              </p>
            </div>
          ) : null}
        </div>

        {/* Informações do ticket */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Código: {ticket.id.slice(0, 8)}</p>
          {ticket.check_in_time && (
            <p className="text-green-600 font-medium">
              Check-in: {new Date(ticket.check_in_time).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      {/* Borda inferior laranja */}
      <div className="h-2 bg-[#F97316]" />
    </Card>
  );
}

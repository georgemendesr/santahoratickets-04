
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { QrReader } from 'react-qr-reader';
import { toast } from 'sonner';
import type { Ticket, Event } from '@/types';

const ValidateTicket = () => {
  const [scanning, setScanning] = useState(false);

  const validateTicket = async (qrCode: string) => {
    try {
      // Buscar o ticket pelo QR code
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('*, events(*)')
        .eq('qr_code', qrCode)
        .single();

      if (ticketError) throw ticketError;
      
      if (!ticket) {
        toast.error('Ingresso não encontrado');
        return;
      }

      if (ticket.used) {
        toast.error('Ingresso já utilizado');
        return;
      }

      // Marcar o ticket como usado
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ used: true })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      toast.success('Ingresso validado com sucesso!');
      setScanning(false);
    } catch (error) {
      console.error('Erro ao validar ingresso:', error);
      toast.error('Erro ao validar ingresso');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-center">Validação de Ingressos</h1>

          {!scanning ? (
            <Button 
              className="w-full"
              onClick={() => setScanning(true)}
            >
              Iniciar Scanner
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg">
                <QrReader
                  onResult={(result) => {
                    if (result) {
                      validateTicket(result.getText());
                    }
                  }}
                  constraints={{ facingMode: 'environment' }}
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setScanning(false)}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidateTicket;

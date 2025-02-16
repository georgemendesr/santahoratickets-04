
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket, Share2 } from 'lucide-react';
import { type Event } from '@/types';
import { toast } from 'sonner';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Event;
    },
  });

  const shareViaWhatsApp = (ticketUrl: string) => {
    const message = `Aqui está seu ingresso para ${event?.title}! 🎫\n\nApresente este QR Code na entrada do evento:\n${ticketUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleBuyTickets = async () => {
    try {
      // Criar preferência de pagamento
      const { data: preference, error } = await supabase.functions.invoke('create-payment-preference', {
        body: {
          eventId: event?.id,
          quantity,
          unitPrice: event?.price
        }
      });

      if (error) throw error;

      // Redirecionar para o checkout do Mercado Pago
      window.location.href = preference.init_point;
    } catch (error) {
      toast.error('Erro ao processar pagamento. Tente novamente.');
      console.error('Erro:', error);
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (!event) return <div>Evento não encontrado</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[400px] overflow-hidden rounded-lg">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{event.title}</h1>
            
            <div className="space-y-4">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-5 w-5" />
                <span>{event.date} - {event.time}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Ticket className="mr-2 h-5 w-5" />
                <span>{event.available_tickets} ingressos disponíveis</span>
              </div>
            </div>

            <p className="text-lg">{event.description}</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  R$ {event.price.toFixed(2)}
                </span>
                
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="text-xl">{quantity}</span>
                  <Button
                    variant="outline"
                    onClick={() => setQuantity(Math.min(event.available_tickets, quantity + 1))}
                    disabled={quantity >= event.available_tickets}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Total:</span>
                  <span className="font-bold">
                    R$ {(event.price * quantity).toFixed(2)}
                  </span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleBuyTickets}
                  disabled={quantity > event.available_tickets}
                >
                  Comprar Ingressos
                </Button>

                {/* Botão de compartilhar por WhatsApp */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => shareViaWhatsApp(window.location.href)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar por WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

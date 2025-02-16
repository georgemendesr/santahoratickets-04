
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type Event } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    enabled: !!id,
  });

  const formatDate = (date: string, time: string) => {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year} às ${time}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Publicado</Badge>;
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      case "ended":
        return <Badge variant="destructive">Encerrado</Badge>;
      default:
        return <Badge variant="outline">Status desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          <p>Evento não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  {getStatusBadge(event.status || 'published')}
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/edit-event/${event.id}`)}
                  >
                    Editar Evento
                  </Button>
                </div>
                <CardTitle className="text-3xl">{event.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date, event.time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{event.description}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações dos Ingressos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Preço por ingresso</span>
                  <span className="text-xl font-bold">{formatPrice(event.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ingressos disponíveis</span>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span className="text-xl font-bold">{event.available_tickets}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  Comprar Ingresso
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;

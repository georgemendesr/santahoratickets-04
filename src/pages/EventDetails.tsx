
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventLayout } from "@/components/event-details/EventLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";
import { EventReferralCard } from "@/components/event-details/EventReferralCard";
import { ReferralBanner } from "@/components/event-details/ReferralBanner";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      return data || null;
    },
  });

  useEffect(() => {
    if (error) {
      console.error("Erro ao carregar evento:", error);
    }
  }, [error]);

  const handleBack = () => {
    navigate('/events');
  };

  if (isLoading) {
    return (
      <EventLayout onBack={handleBack}>
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-6 w-64" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>

          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </EventLayout>
    );
  }

  if (!event) {
    return (
      <EventLayout onBack={handleBack}>
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Evento não encontrado.
          </p>
        </div>
      </EventLayout>
    );
  }

  return (
    <EventLayout onBack={handleBack}>
      {/* Banner de referral se houver código na URL */}
      <ReferralBanner eventId={id!} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {event.title}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            <CalendarDays className="h-4 w-4 mr-2" />
            {format(new Date(event.date), 'PPPP', { locale: ptBR })}
          </Badge>
          <Badge variant="secondary">
            <Clock className="h-4 w-4 mr-2" />
            {event.time}
          </Badge>
          <Badge variant="secondary">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.image && (
            <Card>
              <CardContent className="p-0">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Event Description */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {event.description}
              </p>
            </CardContent>
          </Card>

          {/* Event Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Local
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                {event.location}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Tickets Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ingressos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Preço:</span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(event.price)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Disponíveis:</span>
                  <span className={`font-medium ${event.available_tickets <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {event.available_tickets} ingressos
                  </span>
                </div>

                {event.available_tickets <= 5 && event.available_tickets > 0 && (
                  <p className="text-sm text-yellow-600 font-medium">
                    Últimas unidades disponíveis!
                  </p>
                )}

                {event.available_tickets === 0 && (
                  <p className="text-sm text-red-600 font-medium">
                    Ingressos esgotados
                  </p>
                )}

                <Button 
                  className="w-full" 
                  disabled={event.available_tickets === 0}
                  onClick={() => navigate(`/checkout/${event.id}`)}
                >
                  {event.available_tickets === 0 ? 'Esgotado' : 'Comprar Ingresso'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Card de indicação e compartilhamento */}
          {session && event && (
            <EventReferralCard 
              eventId={event.id} 
              eventTitle={event.title} 
            />
          )}
        </div>
      </div>
    </EventLayout>
  );
};

export default EventDetails;

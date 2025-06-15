
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventLayout } from "@/components/event-details/EventLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, MapPin, ArrowLeft } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { EventReferralCard } from "@/components/event-details/EventReferralCard";
import { ReferralBanner } from "@/components/event-details/ReferralBanner";
import { EventDetailsContent } from "@/components/event-details/EventDetailsContent";
import { Participant } from "@/components/checkout/ParticipantForm";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
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

  const { data: batches = [], isLoading: batchesLoading } = useQuery({
    queryKey: ["batches", id],
    queryFn: async () => {
      if (!id) return [];

      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('event_id', id)
        .eq('is_visible', true)
        .order('order_number');

      if (error) {
        console.error("Error fetching batches:", error);
        throw error;
      }

      // Filtrar lotes disponíveis (ativo e dentro do período de venda)
      const now = new Date();
      return data.filter(batch => {
        const startDate = new Date(batch.start_date);
        const endDate = batch.end_date ? new Date(batch.end_date) : null;
        
        return batch.status === 'active' && 
               now >= startDate && 
               (!endDate || now <= endDate);
      });
    },
    enabled: !!id,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleBack = () => {
    navigate('/eventos');
  };

  const handlePurchase = (batchId: string, quantity: number, participants: Participant[]) => {
    const searchParams = new URLSearchParams({
      event: id!,
      batch: batchId,
      quantity: quantity.toString(),
    });

    // Adicionar dados dos participantes aos searchParams se necessário
    participants.forEach((participant, index) => {
      searchParams.append(`participant_${index}_name`, participant.name);
      if (participant.email) {
        searchParams.append(`participant_${index}_email`, participant.email);
      }
      if (participant.phone) {
        searchParams.append(`participant_${index}_phone`, participant.phone);
      }
    });

    navigate(`/checkout?${searchParams.toString()}`);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/eventos/${id}`;
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      console.log('Link copiado para a área de transferência');
    }
  };

  const handleEdit = () => {
    navigate(`/eventos/${id}/editar`);
  };

  useEffect(() => {
    if (eventError) {
      console.error("Erro ao carregar evento:", eventError);
    }
  }, [eventError]);

  const isLoading = eventLoading || batchesLoading;

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
          {/* Usar o novo componente EventDetailsContent que usa o sistema de lotes */}
          <EventDetailsContent
            event={event}
            batches={batches}
            isAdmin={isAdmin}
            profile={profile}
            referrer={null}
            referralCode={null}
            onShare={handleShare}
            onPurchase={handlePurchase}
            onEdit={handleEdit}
          />
          
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

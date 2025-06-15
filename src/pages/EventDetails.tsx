
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventLayout } from "@/components/event-details/EventLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { EventReferralCard } from "@/components/event-details/EventReferralCard";
import { ReferralBanner } from "@/components/event-details/ReferralBanner";
import { EventDetailsHeader } from "@/components/event-details/EventDetailsHeader";
import { EventPoster } from "@/components/event-details/EventPoster";
import { EventDescription } from "@/components/event-details/EventDescription";
import { TicketAvailability } from "@/components/event-details/TicketAvailability";
import { EventActions } from "@/components/event-details/EventActions";
import { LoyaltyCard } from "@/components/event-details/LoyaltyCard";
import { SalesSimulationWrapper } from "@/components/event-details/SalesSimulationWrapper";
import { Participant } from "@/components/checkout/ParticipantForm";
import { Event, Batch } from "@/types/event.types";
import { Card, CardContent } from "@/components/ui/card";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isAdmin } = useRole(session);

  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do evento não fornecido");
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      return data as Event;
    },
    enabled: !!id,
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
      return (data as Batch[]).filter(batch => {
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
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </EventLayout>
    );
  }

  if (!event) {
    return (
      <EventLayout onBack={handleBack}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Evento não encontrado
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            O evento que você está procurando não existe ou foi removido.
          </p>
        </div>
      </EventLayout>
    );
  }

  return (
    <EventLayout onBack={handleBack}>
      <SalesSimulationWrapper event={event}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Banner de referral se houver código na URL */}
          <ReferralBanner eventId={id!} />
          
          {/* Event Header */}
          <EventDetailsHeader event={event} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Event Poster */}
            <div>
              <EventPoster imageUrl={event.image} title={event.title} />
            </div>

            {/* Right Column - Ticket Information */}
            <div className="space-y-6">
              <TicketAvailability 
                batches={batches}
                onPurchase={handlePurchase}
              />

              {/* Admin Actions */}
              {isAdmin && (
                <Card>
                  <CardContent className="p-6">
                    <EventActions
                      event={event}
                      isAdmin={isAdmin}
                      onPurchase={() => {}} // Admin não compra pelo frontend público
                      onShare={handleShare}
                      onEdit={handleEdit}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Loyalty Card */}
              {profile && <LoyaltyCard points={profile.loyalty_points} />}
            </div>
          </div>

          {/* Bottom Section - Event Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <EventDescription event={event} />
            
            {/* Referral Card */}
            <div>
              {session && event && (
                <EventReferralCard 
                  eventId={event.id} 
                  eventTitle={event.title} 
                />
              )}
            </div>
          </div>
        </div>
      </SalesSimulationWrapper>
    </EventLayout>
  );
};

export default EventDetails;

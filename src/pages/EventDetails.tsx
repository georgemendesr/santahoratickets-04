import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventLayout } from "@/components/layout/EventLayout";
import { EventInfoCard } from "@/components/event-details/EventInfoCard";
import { EventTicketsCard } from "@/components/event-details/EventTicketsCard";
import { EventSchedule } from "@/components/event-details/EventSchedule";
import { EventLocation } from "@/components/event-details/EventLocation";
import { EventDescription } from "@/components/event-details/EventDescription";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from "@/hooks/useAuth";
import { Event } from "@/types";
import { EventReferralCard } from "@/components/event-details/EventReferralCard";
import { ReferralBanner } from "@/components/event-details/ReferralBanner";

const EventDetails = () => {
  const { id } = useParams();
  const { session } = useAuth();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async (): Promise<Event | null> => {
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

  if (isLoading) {
    return (
      <EventLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
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
          </div>
        </div>
      </EventLayout>
    );
  }

  if (!event) {
    return (
      <EventLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Evento não encontrado.
              </p>
            </div>
          </div>
        </div>
      </EventLayout>
    );
  }

  return (
    <EventLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Banner de referral se houver código na URL */}
          <ReferralBanner eventId={id!} />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              <Badge variant="secondary">
                <CalendarDays className="h-4 w-4 mr-2" />
                {format(new Date(event.start_date), 'PPPP', { locale: ptBR })}
              </Badge>
              <Badge variant="secondary">
                <Clock className="h-4 w-4 mr-2" />
                {format(new Date(event.start_date), 'HH:mm', { locale: ptBR })} - {format(new Date(event.end_date), 'HH:mm', { locale: ptBR })}
              </Badge>
              <Badge variant="secondary">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </Badge>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <EventInfoCard event={event} />
              <EventDescription description={event.description} />
              <EventSchedule schedule={event.schedule} />
              <EventLocation location={event.location} />
            </div>

            <div className="space-y-6">
              <EventTicketsCard
                eventId={event.id}
                ticketPrice={event.ticket_price}
                availableTickets={event.available_tickets}
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
        </div>
      </div>
    </EventLayout>
  );
};

export default EventDetails;


import { ReactNode } from 'react';
import { Event } from '@/types';
import { useSalesSimulation } from '@/hooks/useSalesSimulation';

interface SalesSimulationWrapperProps {
  event: Event;
  children: ReactNode;
}

export function SalesSimulationWrapper({ event, children }: SalesSimulationWrapperProps) {
  const eventEndDate = new Date(`${event.date} ${event.time}`);
  
  // Ativar o hook de simulação
  useSalesSimulation({
    eventId: event.id,
    eventEndDate,
  });

  return <>{children}</>;
}

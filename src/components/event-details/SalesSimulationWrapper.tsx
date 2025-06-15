
import { ReactNode } from 'react';
import { Event } from '@/types';
import { useSalesSimulation } from '@/hooks/useSalesSimulation';

interface SalesSimulationWrapperProps {
  event: Event;
  children: ReactNode;
}

export function SalesSimulationWrapper({ event, children }: SalesSimulationWrapperProps) {
  console.log(`[SalesSimulationWrapper] Rendering for event: ${event.id}`);
  console.log(`[SalesSimulationWrapper] Event date: ${event.date}, time: ${event.time}`);
  
  const eventEndDate = new Date(`${event.date} ${event.time}`);
  console.log(`[SalesSimulationWrapper] Event end date: ${eventEndDate.toISOString()}`);
  
  // Ativar o hook de simulação
  const simulationState = useSalesSimulation({
    eventId: event.id,
    eventEndDate,
  });

  console.log(`[SalesSimulationWrapper] Simulation state:`, simulationState);

  return <>{children}</>;
}

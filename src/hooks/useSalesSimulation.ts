
import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SalesSimulationOptions {
  eventId: string;
  eventEndDate: Date;
  maxSimulations?: number;
  minInterval?: number;
  maxInterval?: number;
}

export const useSalesSimulation = ({
  eventId,
  eventEndDate,
  maxSimulations = 100,
  minInterval = 2 * 60 * 1000, // 2 minutos
  maxInterval = 5 * 60 * 1000, // 5 minutos
}: SalesSimulationOptions) => {
  const { session } = useAuth();
  const { isAdmin } = useRole(session);
  const [simulationCount, setSimulationCount] = useState(0);

  const messages = [
    "🎉 +1 pulseira vendida",
    "🎉 +2 pulseiras vendidas", 
    "Mais uma pulseira foi garantida!",
    "🎊 Nova pulseira adquirida",
    "✨ +1 ingresso vendido",
    "🎫 +2 ingressos garantidos"
  ];

  const getStorageKey = () => `sales_simulation_${eventId}`;

  // Carregar contador do localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem(getStorageKey());
    const count = savedCount ? parseInt(savedCount, 10) : 0;
    setSimulationCount(count);
    console.log(`[SalesSimulation] Loaded count from storage: ${count} for event ${eventId}`);
  }, [eventId]);

  // Salvar contador no localStorage
  const updateSimulationCount = (newCount: number) => {
    setSimulationCount(newCount);
    localStorage.setItem(getStorageKey(), newCount.toString());
    console.log(`[SalesSimulation] Updated count to: ${newCount} for event ${eventId}`);
  };

  const showSalesNotification = () => {
    console.log(`[SalesSimulation] Attempting to show notification - isAdmin: ${isAdmin}, count: ${simulationCount}, maxSimulations: ${maxSimulations}`);
    
    if (isAdmin) {
      console.log(`[SalesSimulation] Skipping notification - user is admin`);
      return;
    }

    if (simulationCount >= maxSimulations) {
      console.log(`[SalesSimulation] Skipping notification - max simulations reached (${simulationCount}/${maxSimulations})`);
      return;
    }

    const now = new Date();
    console.log(`[SalesSimulation] Current time: ${now.toISOString()}, Event end: ${eventEndDate.toISOString()}`);
    
    if (now > eventEndDate) {
      console.log(`[SalesSimulation] Skipping notification - event has ended`);
      return;
    }

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    console.log(`[SalesSimulation] Showing toast: ${randomMessage}`);
    
    toast({
      description: randomMessage,
      duration: 4000,
      className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
    });

    updateSimulationCount(simulationCount + 1);
  };

  useEffect(() => {
    console.log(`[SalesSimulation] Setting up simulation effect for event ${eventId}`);
    console.log(`[SalesSimulation] isAdmin: ${isAdmin}, simulationCount: ${simulationCount}, maxSimulations: ${maxSimulations}`);
    console.log(`[SalesSimulation] eventEndDate: ${eventEndDate.toISOString()}, now: ${new Date().toISOString()}`);

    if (isAdmin) {
      console.log(`[SalesSimulation] Not setting up timer - user is admin`);
      return;
    }

    if (simulationCount >= maxSimulations) {
      console.log(`[SalesSimulation] Not setting up timer - max simulations reached`);
      return;
    }

    const now = new Date();
    if (now > eventEndDate) {
      console.log(`[SalesSimulation] Not setting up timer - event has ended`);
      return;
    }

    // Para testar, vamos usar um intervalo mais curto inicialmente (30 segundos)
    const testInterval = 30 * 1000; // 30 segundos para teste
    // Gerar intervalo aleatório entre min e max
    const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;
    
    // Usar intervalo de teste se for a primeira simulação
    const interval = simulationCount === 0 ? testInterval : randomInterval;
    
    console.log(`[SalesSimulation] Setting timer for ${interval}ms (${interval/1000}s)`);
    
    const timeoutId = setTimeout(() => {
      console.log(`[SalesSimulation] Timer fired after ${interval}ms`);
      showSalesNotification();
    }, interval);

    return () => {
      console.log(`[SalesSimulation] Cleaning up timer`);
      clearTimeout(timeoutId);
    };
  }, [simulationCount, isAdmin, eventEndDate, minInterval, maxInterval, maxSimulations, eventId]);

  // Log inicial do estado do hook
  useEffect(() => {
    console.log(`[SalesSimulation] Hook initialized for event ${eventId}`);
    console.log(`[SalesSimulation] Initial state - isAdmin: ${isAdmin}, session: ${!!session}`);
  }, [eventId, isAdmin, session]);

  return {
    simulationCount,
    isActive: !isAdmin && simulationCount < maxSimulations && new Date() <= eventEndDate,
    remainingSimulations: maxSimulations - simulationCount
  };
};

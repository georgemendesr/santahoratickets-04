
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
    if (savedCount) {
      setSimulationCount(parseInt(savedCount, 10));
    }
  }, [eventId]);

  // Salvar contador no localStorage
  const updateSimulationCount = (newCount: number) => {
    setSimulationCount(newCount);
    localStorage.setItem(getStorageKey(), newCount.toString());
  };

  const showSalesNotification = () => {
    if (isAdmin || simulationCount >= maxSimulations) {
      return;
    }

    const now = new Date();
    if (now > eventEndDate) {
      return;
    }

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    toast({
      description: randomMessage,
      duration: 4000,
      className: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
    });

    updateSimulationCount(simulationCount + 1);
  };

  useEffect(() => {
    if (isAdmin || simulationCount >= maxSimulations) {
      return;
    }

    const now = new Date();
    if (now > eventEndDate) {
      return;
    }

    // Gerar intervalo aleatório entre min e max
    const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;
    
    const timeoutId = setTimeout(() => {
      showSalesNotification();
    }, randomInterval);

    return () => clearTimeout(timeoutId);
  }, [simulationCount, isAdmin, eventEndDate, minInterval, maxInterval, maxSimulations]);

  return {
    simulationCount,
    isActive: !isAdmin && simulationCount < maxSimulations && new Date() <= eventEndDate,
    remainingSimulations: maxSimulations - simulationCount
  };
};

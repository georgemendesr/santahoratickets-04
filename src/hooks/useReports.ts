
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventFinancialReport, FinancialSummary, ReportFilters } from "@/types/reports.types";

export function useFinancialSummary(filters: ReportFilters) {
  return useQuery({
    queryKey: ["financial-summary", filters],
    queryFn: async (): Promise<FinancialSummary> => {
      console.log("[useFinancialSummary] Fetching financial summary...");

      const now = new Date();
      let startDate: Date;

      switch (filters.period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'current_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Buscar dados de pagamentos aprovados no período
      const { data: payments, error: paymentsError } = await supabase
        .from("payment_preferences")
        .select("total_amount, created_at, event_id")
        .eq("status", "approved")
        .gte("created_at", startDate.toISOString());

      if (paymentsError) throw paymentsError;

      // Buscar eventos ativos
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id")
        .eq("status", "published")
        .gte("date", now.toISOString().split('T')[0]);

      if (eventsError) throw eventsError;

      // Calcular métricas
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;
      const ticketsSold = payments?.reduce((sum, p) => sum + 1, 0) || 0;
      const averageTicketPrice = ticketsSold > 0 ? totalRevenue / ticketsSold : 0;

      // Agrupar receita por dia
      const revenueByDay = payments?.reduce((acc: any, payment) => {
        const date = new Date(payment.created_at).toLocaleDateString('pt-BR');
        acc[date] = (acc[date] || 0) + Number(payment.total_amount);
        return acc;
      }, {}) || {};

      const revenueByPeriod = Object.entries(revenueByDay).map(([date, revenue]) => ({
        date,
        revenue: Number(revenue)
      }));

      return {
        total_revenue_30d: totalRevenue,
        active_events: events?.length || 0,
        tickets_sold_30d: ticketsSold,
        average_ticket_price: averageTicketPrice,
        revenue_by_period: revenueByPeriod
      };
    },
  });
}

export function useEventsFinancialReport(filters: ReportFilters) {
  return useQuery({
    queryKey: ["events-financial-report", filters],
    queryFn: async (): Promise<EventFinancialReport[]> => {
      console.log("[useEventsFinancialReport] Fetching events financial report...");

      let query = supabase
        .from("events")
        .select(`
          id,
          title,
          date,
          gross_revenue,
          net_revenue,
          approved_tickets,
          available_tickets
        `)
        .order("date", { ascending: false });

      if (filters.event_id) {
        query = query.eq("id", filters.event_id);
      }

      const { data: events, error: eventsError } = await query;
      if (eventsError) throw eventsError;

      // Para cada evento, buscar dados dos lotes
      const reportsPromises = events?.map(async (event) => {
        const { data: batches, error: batchesError } = await supabase
          .from("batches")
          .select("id, title, price, available_tickets, total_tickets")
          .eq("event_id", event.id);

        if (batchesError) throw batchesError;

        const ticketsByBatch = batches?.map(batch => ({
          batch_id: batch.id,
          batch_title: batch.title,
          tickets_sold: batch.total_tickets - batch.available_tickets,
          available_tickets: batch.available_tickets,
          price: Number(batch.price),
          revenue: (batch.total_tickets - batch.available_tickets) * Number(batch.price)
        })) || [];

        const totalTicketsSold = ticketsByBatch.reduce((sum, batch) => sum + batch.tickets_sold, 0);
        const grossRevenue = ticketsByBatch.reduce((sum, batch) => sum + batch.revenue, 0);

        return {
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          total_tickets_sold: totalTicketsSold,
          tickets_by_batch: ticketsByBatch,
          gross_revenue: grossRevenue,
          net_revenue: grossRevenue * 0.9, // Assumindo 10% de taxa
          available_tickets: event.available_tickets || 0,
          total_participants: totalTicketsSold,
          average_ticket_price: totalTicketsSold > 0 ? grossRevenue / totalTicketsSold : 0
        };
      }) || [];

      return Promise.all(reportsPromises);
    },
  });
}

export function useEventDetailedReport(eventId: string) {
  return useQuery({
    queryKey: ["event-detailed-report", eventId],
    queryFn: async (): Promise<EventFinancialReport | null> => {
      if (!eventId) return null;

      console.log("[useEventDetailedReport] Fetching detailed report for event:", eventId);

      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      const { data: batches, error: batchesError } = await supabase
        .from("batches")
        .select("*")
        .eq("event_id", eventId)
        .order("order_number");

      if (batchesError) throw batchesError;

      const { data: tickets, error: ticketsError } = await supabase
        .from("tickets")
        .select("id, participant_name, participant_email")
        .eq("event_id", eventId);

      if (ticketsError) throw ticketsError;

      const ticketsByBatch = batches?.map(batch => ({
        batch_id: batch.id,
        batch_title: batch.title,
        tickets_sold: batch.total_tickets - batch.available_tickets,
        available_tickets: batch.available_tickets,
        price: Number(batch.price),
        revenue: (batch.total_tickets - batch.available_tickets) * Number(batch.price)
      })) || [];

      const totalTicketsSold = ticketsByBatch.reduce((sum, batch) => sum + batch.tickets_sold, 0);
      const grossRevenue = ticketsByBatch.reduce((sum, batch) => sum + batch.revenue, 0);

      return {
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        total_tickets_sold: totalTicketsSold,
        tickets_by_batch: ticketsByBatch,
        gross_revenue: grossRevenue,
        net_revenue: grossRevenue * 0.9,
        available_tickets: event.available_tickets || 0,
        total_participants: tickets?.length || 0,
        average_ticket_price: totalTicketsSold > 0 ? grossRevenue / totalTicketsSold : 0
      };
    },
    enabled: !!eventId,
  });
}

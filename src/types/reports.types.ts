
export interface EventFinancialReport {
  event_id: string;
  event_title: string;
  event_date: string;
  total_tickets_sold: number;
  tickets_by_batch: {
    batch_id: string;
    batch_title: string;
    tickets_sold: number;
    available_tickets: number;
    price: number;
    revenue: number;
  }[];
  gross_revenue: number;
  net_revenue: number;
  available_tickets: number;
  total_participants: number;
  average_ticket_price: number;
}

export interface FinancialSummary {
  total_revenue_30d: number;
  active_events: number;
  tickets_sold_30d: number;
  average_ticket_price: number;
  revenue_by_period: {
    date: string;
    revenue: number;
  }[];
}

export interface ReportFilters {
  period: '7d' | '30d' | 'current_month';
  event_id?: string;
  start_date?: string;
  end_date?: string;
}

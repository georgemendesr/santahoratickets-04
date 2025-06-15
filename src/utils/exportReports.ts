
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EventFinancialReport } from "@/types/reports.types";

export const exportEventsReportToCSV = (reports: EventFinancialReport[]) => {
  const headers = [
    "Evento",
    "Data",
    "Ingressos Vendidos",
    "Ingressos Disponíveis",
    "Receita Bruta (R$)",
    "Receita Líquida (R$)",
    "Ticket Médio (R$)",
    "Total Participantes"
  ];

  const rows = reports.map(report => [
    report.event_title,
    format(new Date(report.event_date), "dd/MM/yyyy", { locale: ptBR }),
    report.total_tickets_sold,
    report.available_tickets,
    report.gross_revenue.toFixed(2),
    report.net_revenue.toFixed(2),
    report.average_ticket_price.toFixed(2),
    report.total_participants
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio-eventos-${format(new Date(), "dd-MM-yyyy")}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportEventDetailToCSV = (report: EventFinancialReport) => {
  const headers = [
    "Lote",
    "Ingressos Vendidos",
    "Ingressos Disponíveis",
    "Preço (R$)",
    "Receita (R$)"
  ];

  const rows = report.tickets_by_batch.map(batch => [
    batch.batch_title,
    batch.tickets_sold,
    batch.available_tickets,
    batch.price.toFixed(2),
    batch.revenue.toFixed(2)
  ]);

  const csvContent = [
    `Relatório do Evento: ${report.event_title}`,
    `Data: ${format(new Date(report.event_date), "dd/MM/yyyy", { locale: ptBR })}`,
    "",
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio-${report.event_title}-${format(new Date(), "dd-MM-yyyy")}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

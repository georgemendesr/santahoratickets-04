
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type FinancialData = {
  title: string;
  date: string;
  gross_revenue: number;
  net_revenue: number;
  approved_tickets: number;
}

export const exportFinancialData = (data: FinancialData[]) => {
  // Cabeçalho do CSV
  const headers = [
    "Evento",
    "Data",
    "Receita Bruta",
    "Receita Líquida",
    "Ingressos Vendidos",
    "Ticket Médio"
  ];

  // Formatar os dados
  const rows = data.map(event => [
    event.title,
    format(new Date(event.date), "dd/MM/yyyy", { locale: ptBR }),
    event.gross_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    event.net_revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    event.approved_tickets,
    (event.gross_revenue / (event.approved_tickets || 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
  ]);

  // Juntar cabeçalho e linhas
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  // Criar blob e download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio-financeiro-${format(new Date(), "dd-MM-yyyy")}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

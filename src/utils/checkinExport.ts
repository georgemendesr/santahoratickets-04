
import { Participant, Event } from "@/types/checkin.types";
import { toast } from "sonner";

export const exportCheckins = async (participants: Participant[], event: Event | null) => {
  try {
    const csvContent = [
      'Nome,Email,Lote,Status,Data Check-in,Operador',
      ...participants.map(p => [
        p.participant_name,
        p.participant_email,
        p.batch_title,
        p.checked_in ? 'Realizado' : 'Pendente',
        p.check_in_time ? new Date(p.check_in_time).toLocaleString() : '',
        p.validator_name || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `checkin-${event?.title}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dados exportados com sucesso!');
  } catch (error) {
    console.error('Error exporting check-ins:', error);
    toast.error('Erro ao exportar dados');
  }
};

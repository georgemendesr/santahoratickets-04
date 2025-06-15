
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Clock, User } from "lucide-react";

interface Participant {
  id: string;
  participant_name: string;
  participant_email: string;
  batch_title: string;
  batch_id: string;
  checked_in: boolean;
  check_in_time: string | null;
  checked_in_by: string | null;
  validator_name: string | null;
}

interface CheckinTableProps {
  participants: Participant[];
  searchTerm: string;
  statusFilter: string;
  batchFilter: string;
}

export const CheckinTable = ({ 
  participants, 
  searchTerm, 
  statusFilter, 
  batchFilter 
}: CheckinTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.participant_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" ||
      (statusFilter === "checked_in" && participant.checked_in) ||
      (statusFilter === "pending" && !participant.checked_in);
    
    const matchesBatch = 
      batchFilter === "all" || participant.batch_id === batchFilter;

    return matchesSearch && matchesStatus && matchesBatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedParticipants = filteredParticipants.slice(startIndex, startIndex + itemsPerPage);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Participantes ({filteredParticipants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Operador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    {participant.participant_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {participant.participant_email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {participant.batch_title}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {participant.checked_in ? (
                      <Badge className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Realizado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pendente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(participant.check_in_time)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {participant.validator_name || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredParticipants.length)} de {filteredParticipants.length} participantes
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm">
                {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import { CheckCircle2, XCircle, Clock, User, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ValidatedTicket {
  id: string;
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    status: string;
  };
  user: {
    name: string;
    email: string;
  };
  check_in_time: string;
  status: 'validated' | 'used';
}

interface TicketValidationCardProps {
  ticket: ValidatedTicket;
  isSuccess: boolean;
}

export const TicketValidationCard = ({ ticket, isSuccess }: TicketValidationCardProps) => {
  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date} ${time}`).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCheckInTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <Card className={`w-full ${isSuccess ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {isSuccess ? (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <CardTitle className={isSuccess ? 'text-green-700' : 'text-red-700'}>
          {isSuccess ? 'Ingresso Validado!' : 'Validação Negada'}
        </CardTitle>
        <Badge variant={isSuccess ? 'default' : 'destructive'} className="w-fit mx-auto">
          {ticket.status === 'validated' ? 'Válido' : 'Já Utilizado'}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-semibold">{ticket.event.title}</p>
              <p className="text-muted-foreground">
                {formatDateTime(ticket.event.date, ticket.event.time)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p>{ticket.event.location}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{ticket.user.name}</p>
              <p className="text-muted-foreground">{ticket.user.email}</p>
            </div>
          </div>

          {ticket.check_in_time && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Check-in realizado:</p>
                <p className="text-muted-foreground">
                  {formatCheckInTime(ticket.check_in_time)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          ID: {ticket.id.substring(0, 8)}...
        </div>
      </CardContent>
    </Card>
  );
};

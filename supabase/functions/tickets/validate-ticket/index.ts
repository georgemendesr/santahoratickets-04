
import { validateAuthToken } from '../../_shared/auth.ts';
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';
import { validateRequiredFields } from '../../_shared/validation.ts';

interface ValidateTicketRequest {
  qr_code: string;
  validator_user_id?: string;
}

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

const handler = async (req: Request): Promise<Response> => {
  console.log('validate-ticket function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));
    const requestData: ValidateTicketRequest = await req.json();
    
    validateRequiredFields(requestData, ['qr_code']);
    
    const { qr_code } = requestData;
    console.log('Validating ticket with QR code:', qr_code);

    // Buscar o ticket pelo QR code
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        id,
        event_id,
        user_id,
        used,
        check_in_time,
        qr_code,
        events (
          id,
          title,
          date,
          time,
          location,
          status
        ),
        user_profiles (
          name,
          email
        )
      `)
      .eq('qr_code', qr_code)
      .single();

    if (ticketError || !ticket) {
      console.error('Ticket not found:', ticketError);
      return errorResponse('Ingresso não encontrado', 404);
    }

    // Verificar se o ticket já foi usado
    if (ticket.used) {
      console.log('Ticket already used:', ticket.id);
      return errorResponse('Ingresso já foi utilizado', 409, {
        ticket: {
          id: ticket.id,
          event: ticket.events,
          user: ticket.user_profiles,
          check_in_time: ticket.check_in_time,
          status: 'used'
        }
      });
    }

    // Verificar se o evento ainda está ativo
    if (ticket.events?.status === 'ended') {
      return errorResponse('Evento já foi encerrado', 400);
    }

    // Validar o ticket (marcar como usado)
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        used: true, 
        check_in_time: now,
        checked_in_by: user.id
      })
      .eq('id', ticket.id);

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return errorResponse('Erro ao validar ingresso', 500);
    }

    console.log('Ticket validated successfully:', ticket.id);

    const validatedTicket: ValidatedTicket = {
      id: ticket.id,
      event: ticket.events,
      user: ticket.user_profiles,
      check_in_time: now,
      status: 'validated'
    };

    return successResponse({
      message: 'Ingresso validado com sucesso!',
      ticket: validatedTicket
    });

  } catch (error: any) {
    console.error('Error in validate-ticket function:', error);
    return errorResponse(error.message || 'Erro interno do servidor', 500);
  }
};

Deno.serve(handler);

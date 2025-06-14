
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateTicketRequest {
  qr_code: string;
  validator_user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('validate-ticket function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { qr_code, validator_user_id }: ValidateTicketRequest = await req.json();
    console.log('Validating ticket with QR code:', qr_code);

    if (!qr_code) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'QR Code é obrigatório' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ingresso não encontrado' 
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Verificar se o ticket já foi usado
    if (ticket.used) {
      console.log('Ticket already used:', ticket.id);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ingresso já foi utilizado',
          ticket: {
            id: ticket.id,
            event: ticket.events,
            user: ticket.user_profiles,
            check_in_time: ticket.check_in_time,
            status: 'used'
          }
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Verificar se o evento ainda está ativo
    if (ticket.events?.status === 'ended') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Evento já foi encerrado' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Validar o ticket (marcar como usado)
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        used: true, 
        check_in_time: now,
        checked_in_by: validator_user_id || null
      })
      .eq('id', ticket.id);

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao validar ingresso' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    console.log('Ticket validated successfully:', ticket.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Ingresso validado com sucesso!',
        ticket: {
          id: ticket.id,
          event: ticket.events,
          user: ticket.user_profiles,
          check_in_time: now,
          status: 'validated'
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in validate-ticket function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);

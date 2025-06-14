
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TicketEmailRequest {
  payment_id: string;
  user_email?: string;
}

const generateTicketEmailTemplate = (eventTitle: string, eventDate: string, eventLocation: string, ticketCount: number, qrCodes: string[]) => {
  const ticketsHtml = qrCodes.map((qrCode, index) => `
    <div style="border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px;">
      <h3>Ingresso ${index + 1}</h3>
      <div style="text-align: center; margin: 20px 0;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}" 
             alt="QR Code do Ingresso" style="max-width: 200px;" />
      </div>
      <p><strong>Código:</strong> ${qrCode}</p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Seus Ingressos - ${eventTitle}</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0;">🎫 Seus Ingressos</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Pagamento aprovado com sucesso!</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">📅 ${eventTitle}</h2>
          <p><strong>📍 Local:</strong> ${eventLocation}</p>
          <p><strong>🕒 Data:</strong> ${new Date(eventDate).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })}</p>
          <p><strong>🎟️ Quantidade:</strong> ${ticketCount} ingresso(s)</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Seus Ingressos:</h3>
          ${ticketsHtml}
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h4 style="color: #1976d2; margin-top: 0;">📱 Instruções Importantes:</h4>
          <ul style="color: #666; line-height: 1.6;">
            <li>Apresente o QR Code na entrada do evento</li>
            <li>Mantenha este email salvo no seu celular</li>
            <li>Chegue com antecedência para evitar filas</li>
            <li>Em caso de dúvidas, entre em contato conosco</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; margin: 0;">Nos vemos no evento! 🎉</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('send-ticket-email function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { payment_id, user_email }: TicketEmailRequest = await req.json();
    console.log('Processing ticket email for payment:', payment_id);

    // Buscar dados do pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('payment_preferences')
      .select('*')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      throw new Error('Pagamento não encontrado');
    }

    // Buscar dados do evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', payment.event_id)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      throw new Error('Evento não encontrado');
    }

    // Buscar dados do usuário
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', payment.user_id)
      .single();

    if (userError || !userProfile) {
      console.error('User not found:', userError);
      throw new Error('Usuário não encontrado');
    }

    // Buscar ingressos criados
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('qr_code')
      .eq('user_id', payment.user_id)
      .eq('event_id', payment.event_id)
      .order('created_at', { ascending: false })
      .limit(payment.ticket_quantity);

    if (ticketsError || !tickets) {
      console.error('Tickets not found:', ticketsError);
      throw new Error('Ingressos não encontrados');
    }

    const emailTo = user_email || userProfile.email;
    if (!emailTo) {
      throw new Error('Email do usuário não encontrado');
    }

    const qrCodes = tickets.map(ticket => ticket.qr_code);
    const emailContent = generateTicketEmailTemplate(
      event.title,
      `${event.date} ${event.time}`,
      event.location,
      payment.ticket_quantity,
      qrCodes
    );

    // Enviar email via função send-email
    const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: emailTo,
        subject: `🎫 Seus ingressos para ${event.title}`,
        htmlContent: emailContent,
        senderName: "Eventos",
        senderEmail: "ingressos@eventos.com"
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Error sending email:', errorText);
      throw new Error('Erro ao enviar email');
    }

    const emailResult = await emailResponse.json();
    console.log('Ticket email sent successfully:', emailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de ingressos enviado com sucesso',
        emailResult 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in send-ticket-email function:', error);
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

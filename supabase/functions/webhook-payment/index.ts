
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log do corpo da requisição
    const body = await req.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    // Validar o formato da requisição
    if (!body.type || !body.data || !body.data.id) {
      throw new Error('Formato de notificação inválido');
    }

    // Buscar detalhes do pagamento no Mercado Pago
    const mercadoPagoUrl = 'https://api.mercadopago.com';
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!mercadoPagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    const paymentResponse = await fetch(
      `${mercadoPagoUrl}/v1/payments/${body.data.id}`,
      {
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error('Erro ao buscar pagamento:', await paymentResponse.text());
      throw new Error(`Erro ao buscar dados do pagamento: ${paymentResponse.status}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('Dados do pagamento:', JSON.stringify(paymentData, null, 2));

    // Extrair referência externa (event_id|preference_id)
    const [eventId, preferenceId] = (paymentData.external_reference || '').split('|');

    if (!eventId || !preferenceId) {
      throw new Error('Referência externa inválida');
    }

    console.log('Referências encontradas:', { eventId, preferenceId });

    // Buscar preferência de pagamento
    const { data: preference, error: preferenceError } = await supabaseClient
      .from('payment_preferences')
      .select('*')
      .eq('id', preferenceId)
      .single();

    if (preferenceError || !preference) {
      console.error('Erro ao buscar preferência:', preferenceError);
      throw new Error('Preferência de pagamento não encontrada');
    }

    console.log('Preferência encontrada:', preference);

    // Atualizar status do pagamento
    const { error: updateError } = await supabaseClient
      .from('payment_preferences')
      .update({
        status: paymentData.status,
        external_id: paymentData.id.toString(),
      })
      .eq('id', preferenceId);

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      throw new Error('Erro ao atualizar status do pagamento');
    }

    // Se o pagamento foi aprovado, gerar ingressos
    if (paymentData.status === 'approved') {
      console.log('Gerando ingressos para o pagamento aprovado');

      const tickets = Array.from({ length: preference.ticket_quantity }, () => ({
        event_id: eventId,
        user_id: preference.user_id,
        qr_code: crypto.randomUUID(),
        purchase_date: new Date().toISOString(),
        used: false
      }));

      const { error: ticketsError } = await supabaseClient
        .from('tickets')
        .insert(tickets);

      if (ticketsError) {
        console.error('Erro ao gerar ingressos:', ticketsError);
        throw new Error('Erro ao gerar ingressos');
      }

      // Atualizar quantidade de ingressos disponíveis
      const { error: eventError } = await supabaseClient
        .from('events')
        .update({
          available_tickets: preference.ticket_quantity
        })
        .eq('id', eventId);

      if (eventError) {
        console.error('Erro ao atualizar evento:', eventError);
      }

      console.log('Ingressos gerados com sucesso:', tickets.length);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Importante: Retornar 200 mesmo em caso de erro para o Mercado Pago não tentar reenviar
      }
    );
  }
});


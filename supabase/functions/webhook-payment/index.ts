
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

    // Verificar se é uma notificação de pagamento
    if (body.type !== 'payment') {
      console.log('Tipo de notificação ignorado:', body.type);
      return new Response(JSON.stringify({ message: 'Notification type ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
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

    const paymentData = await paymentResponse.json();
    console.log('Dados do pagamento:', JSON.stringify(paymentData, null, 2));

    if (!paymentResponse.ok) {
      throw new Error('Erro ao buscar dados do pagamento');
    }

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
      }));

      const { error: ticketsError } = await supabaseClient
        .from('tickets')
        .insert(tickets);

      if (ticketsError) {
        console.error('Erro ao gerar ingressos:', ticketsError);
        throw new Error('Erro ao gerar ingressos');
      }

      // Atualizar quantidade de ingressos disponíveis no lote
      const { error: batchError } = await supabaseClient.rpc('update_batch_tickets', {
        p_event_id: eventId,
        p_quantity: preference.ticket_quantity
      });

      if (batchError) {
        console.error('Erro ao atualizar lote:', batchError);
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
        status: 400,
      }
    );
  }
});


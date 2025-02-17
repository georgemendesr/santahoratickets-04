
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log da requisição completa para debug
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const body = await req.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    // Validar o tipo de notificação
    if (body.type !== 'payment' || !body.data || !body.data.id) {
      console.error('Formato inválido:', body);
      return new Response(
        JSON.stringify({ error: 'Formato de notificação inválido' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadoPagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    // Buscar detalhes do pagamento no Mercado Pago
    const paymentId = body.data.id;
    console.log('Buscando pagamento:', paymentId);

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${mercadoPagoAccessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Erro ao buscar pagamento:', {
        status: paymentResponse.status,
        response: errorText
      });
      throw new Error(`Erro ao buscar dados do pagamento: ${paymentResponse.status}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('Dados do pagamento:', JSON.stringify(paymentData, null, 2));

    // Extrair referências do external_reference (formato: eventId|preferenceId)
    const [eventId, preferenceId] = (paymentData.external_reference || '').split('|');

    if (!eventId || !preferenceId) {
      console.error('Referência externa inválida:', paymentData.external_reference);
      throw new Error('Referência externa inválida');
    }

    console.log('Processando pagamento:', {
      eventId,
      preferenceId,
      status: paymentData.status
    });

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

    // Atualizar status do pagamento
    const { error: updateError } = await supabaseClient
      .from('payment_preferences')
      .update({
        status: paymentData.status,
        external_id: paymentData.id.toString(),
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', preferenceId);

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      throw new Error('Erro ao atualizar status do pagamento');
    }

    // Se o pagamento foi aprovado, gerar ingressos
    if (paymentData.status === 'approved') {
      console.log('Pagamento aprovado, gerando ingressos...');

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
      const { error: batchError } = await supabaseClient.rpc(
        'update_batch_tickets',
        { 
          p_event_id: eventId,
          p_quantity: preference.ticket_quantity
        }
      );

      if (batchError) {
        console.error('Erro ao atualizar lote:', batchError);
      }

      console.log('Ingressos gerados com sucesso:', tickets.length);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Erro no webhook:', error);
    // Importante: Sempre retornar 200 para o Mercado Pago não reenviar
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

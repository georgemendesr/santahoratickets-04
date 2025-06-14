
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, batchId, quantity, userId } = await req.json();

    console.log('Criando preferência de pagamento:', { eventId, batchId, quantity, userId });

    // Validar dados necessários
    if (!eventId || !batchId || !quantity || !userId) {
      throw new Error('Dados incompletos para processamento');
    }

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar JWT do usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização não fornecido');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Erro de autenticação:', userError);
      throw new Error('Usuário não autorizado');
    }

    // Buscar evento
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Erro ao buscar evento:', eventError);
      throw new Error('Evento não encontrado');
    }

    // Buscar lote
    const { data: batch, error: batchError } = await supabaseClient
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      console.error('Erro ao buscar lote:', batchError);
      throw new Error('Lote não encontrado');
    }

    // Verificar disponibilidade
    if (batch.available_tickets < quantity) {
      throw new Error('Quantidade de ingressos não disponível');
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Erro ao buscar perfil:', profileError);
      throw new Error('Perfil do usuário não encontrado');
    }

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadoPagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    // Criar referência única
    const external_reference = `${eventId}-${user.id}-${Date.now()}`;
    const totalAmount = batch.price * quantity;

    // Criar preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          title: `${quantity}x Ingressos para ${event.title}`,
          description: `Lote: ${batch.title}`,
          quantity: quantity,
          unit_price: Number(batch.price),
          currency_id: "BRL"
        }
      ],
      payer: {
        name: profile.name?.split(' ')[0] || 'Cliente',
        surname: profile.name?.split(' ').slice(1).join(' ') || 'MercadoPago',
        email: user.email,
        identification: {
          type: 'CPF',
          number: profile.cpf?.replace(/\D/g, '') || '00000000000'
        }
      },
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12
      },
      back_urls: {
        success: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/payment-status?status=approved`,
        failure: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/payment-status?status=rejected`,
        pending: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/payment-status?status=pending`
      },
      auto_return: "approved",
      external_reference,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-payment`,
      metadata: {
        event_id: eventId,
        batch_id: batchId,
        user_id: user.id,
        quantity: quantity
      }
    };

    console.log('Criando preferência no Mercado Pago:', preferenceData);

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro do MercadoPago:', errorData);
      throw new Error(errorData.message || 'Erro na API do Mercado Pago');
    }

    const preferenceResponse = await response.json();
    console.log('Preferência criada:', preferenceResponse);

    // Salvar preferência no banco
    const { data: savedPreference, error: saveError } = await supabaseClient
      .from('payment_preferences')
      .insert({
        init_point: preferenceResponse.init_point,
        external_id: preferenceResponse.id,
        event_id: eventId,
        user_id: user.id,
        ticket_quantity: quantity,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar preferência:', saveError);
    }

    return new Response(
      JSON.stringify({ 
        init_point: preferenceResponse.init_point,
        preference_id: preferenceResponse.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao criar preferência de pagamento'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

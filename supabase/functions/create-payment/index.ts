
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
    const { 
      preferenceId, 
      eventId, 
      batchId, 
      quantity, 
      paymentType, 
      cardToken, 
      installments, 
      paymentMethodId 
    } = await req.json();

    console.log('Dados recebidos:', { 
      preferenceId, 
      eventId, 
      batchId, 
      quantity, 
      paymentType, 
      paymentMethodId 
    });

    // Validar dados necessários
    if (!preferenceId || !eventId || !batchId || !quantity || !paymentType) {
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

    // Buscar dados da preferência
    const { data: preference, error: prefError } = await supabaseClient
      .from('payment_preferences')
      .select('*')
      .eq('id', preferenceId)
      .single();

    if (prefError || !preference) {
      console.error('Erro ao buscar preferência:', prefError);
      throw new Error('Preferência de pagamento não encontrada');
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

    // Preparar dados do pagamento
    const totalAmount = batch.price * quantity;
    const paymentData: any = {
      transaction_amount: totalAmount,
      description: `${quantity}x Ingressos para ${event.title}`,
      payment_method_id: paymentMethodId,
      payer: {
        email: user.email,
        first_name: profile.name?.split(' ')[0] || 'Cliente',
        last_name: profile.name?.split(' ').slice(1).join(' ') || 'MercadoPago',
        identification: {
          type: 'CPF',
          number: profile.cpf?.replace(/\D/g, '') || '00000000000'
        }
      },
      external_reference: `${eventId}|${preferenceId}|${quantity}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-payment`,
      metadata: {
        event_id: eventId,
        batch_id: batchId,
        preference_id: preferenceId,
        user_id: user.id,
        quantity: quantity
      }
    };

    // Adicionar dados específicos para cartão de crédito
    if (paymentType === 'credit_card' && cardToken) {
      paymentData.token = cardToken;
      paymentData.installments = installments || 1;
    }

    console.log('Criando pagamento no Mercado Pago:', {
      amount: totalAmount,
      method: paymentMethodId,
      type: paymentType
    });

    // Gerar chave de idempotência única
    const idempotencyKey = `${preferenceId}-${Date.now()}`;

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await response.json();
    console.log('Resposta do MercadoPago:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      // Atualizar preferência com erro
      await supabaseClient
        .from('payment_preferences')
        .update({
          status: 'rejected',
          error_message: responseData.message || 'Erro na API do Mercado Pago',
          attempts: preference.attempts + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', preferenceId);

      throw new Error(responseData.message || 'Erro ao processar pagamento no Mercado Pago');
    }

    // Extrair dados específicos do PIX se aplicável
    let qrCode = null;
    let qrCodeBase64 = null;

    if (paymentType === 'pix' && responseData.point_of_interaction?.transaction_data) {
      qrCode = responseData.point_of_interaction.transaction_data.qr_code;
      qrCodeBase64 = responseData.point_of_interaction.transaction_data.qr_code_base64;
    }

    // Atualizar preferência com dados do pagamento
    const { error: updateError } = await supabaseClient
      .from('payment_preferences')
      .update({
        external_id: responseData.id.toString(),
        status: responseData.status,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        payment_method_id: responseData.payment_method_id,
        payment_type: responseData.payment_type_id,
        card_token: cardToken,
        installments: installments,
        attempts: preference.attempts + 1,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', preferenceId);

    if (updateError) {
      console.error('Erro ao atualizar preferência:', updateError);
    }

    // Retornar dados do pagamento
    return new Response(
      JSON.stringify({ 
        payment_id: responseData.id,
        status: responseData.status,
        qr_code: qrCode,
        qr_code_base64: qrCodeBase64,
        message: paymentType === 'pix' ? 'PIX gerado com sucesso' : 'Pagamento processado'
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
        details: 'Erro ao processar pagamento. Tente novamente.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

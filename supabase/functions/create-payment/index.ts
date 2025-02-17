
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

    const { preferenceId, eventId, batchId, quantity, paymentType, cardToken, installments, paymentMethodId } = await req.json();

    console.log("Dados recebidos:", {
      preferenceId,
      eventId,
      batchId,
      quantity,
      paymentType,
      hasCardToken: !!cardToken,
      installments,
      paymentMethodId
    });

    // Buscar dados do usuário e evento
    const { data: { user } } = await supabaseClient.auth.getUser(req.headers.get('Authorization')?.split('Bearer ')[1] ?? '');
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    // Buscar perfil do usuário
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      throw new Error('Perfil do usuário não encontrado');
    }

    console.log("Dados do perfil encontrados:", profile);

    // Configurar o cliente do Mercado Pago
    const mercadoPagoUrl = 'https://api.mercadopago.com';
    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!mercadoPagoAccessToken) {
      throw new Error('Token do Mercado Pago não configurado');
    }

    // Preparar dados do pagamento
    const paymentData: any = {
      transaction_amount: 1, // Valor fixo para teste
      description: `Ingresso para evento ${eventId}`,
      external_reference: `${eventId}|${preferenceId}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-payment`,
      payer: {
        email: profile.email,
        first_name: profile.name.split(' ')[0],
        last_name: profile.name.split(' ').slice(1).join(' '),
        identification: {
          type: "CPF",
          number: profile.cpf.replace(/\D/g, '')
        }
      }
    };

    // Adicionar dados específicos do método de pagamento
    if (paymentType === 'credit_card') {
      paymentData.payment_method_id = paymentMethodId;
      paymentData.token = cardToken;
      paymentData.installments = installments || 1;
    } else if (paymentType === 'pix') {
      paymentData.payment_method_id = 'pix';
    }

    console.log("Payload para MercadoPago:", JSON.stringify(paymentData, null, 2));

    // Gerar X-Idempotency-Key único
    const idempotencyKey = `${preferenceId}-${new Date().toISOString()}`;

    // Criar pagamento no Mercado Pago
    const paymentResponse = await fetch(`${mercadoPagoUrl}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await paymentResponse.json();
    
    console.log("Resposta do MercadoPago:", JSON.stringify(paymentResult, null, 2));

    if (!paymentResponse.ok) {
      throw new Error(`Erro ao criar pagamento: ${JSON.stringify(paymentResult)}`);
    }

    // Para pagamentos PIX, salvar o QR code
    if (paymentType === 'pix' && paymentResult.point_of_interaction?.transaction_data?.qr_code) {
      console.log("Salvando dados do PIX:", {
        qr_code: paymentResult.point_of_interaction.transaction_data.qr_code,
        qr_code_base64: paymentResult.point_of_interaction.transaction_data.qr_code_base64
      });

      const { error: updateError } = await supabaseClient
        .from('payment_preferences')
        .update({
          qr_code: paymentResult.point_of_interaction.transaction_data.qr_code,
          qr_code_base64: paymentResult.point_of_interaction.transaction_data.qr_code_base64,
          external_id: paymentResult.id.toString()
        })
        .eq('id', preferenceId);

      if (updateError) {
        console.error("Erro ao salvar dados do PIX:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        payment_id: paymentResult.id,
        status: paymentResult.status,
        status_detail: paymentResult.status_detail,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

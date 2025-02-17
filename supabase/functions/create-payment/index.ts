
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MercadoPagoPayment {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  payment_method_id: string;
  external_reference: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { preferenceId, eventId, batchId, quantity, paymentType, cardToken, installments, paymentMethodId } = await req.json();

    // Buscar a preferência de pagamento
    const { data: preference, error: prefError } = await supabase
      .from('payment_preferences')
      .select('*')
      .eq('id', preferenceId)
      .single();

    if (prefError || !preference) {
      throw new Error('Preferência de pagamento não encontrada');
    }

    // Atualizar tentativa
    await supabase
      .from('payment_preferences')
      .update({
        attempts: preference.attempts + 1,
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', preferenceId);

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Token do MercadoPago não configurado');
    }

    // Preparar dados para o MercadoPago
    const paymentData = {
      transaction_amount: preference.total_amount,
      payment_method_id: paymentMethodId,
      ...(paymentType === 'credit_card' ? {
        token: cardToken,
        installments: installments || 1,
      } : {}),
      description: `Ingresso para evento ${eventId}`,
      external_reference: `${eventId}|${preferenceId}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-payment`,
    };

    console.log('Iniciando pagamento com dados:', {
      ...paymentData,
      token: cardToken ? '[REDACTED]' : undefined
    });

    // Criar pagamento no MercadoPago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const mpData: MercadoPagoPayment = await mpResponse.json();
    console.log('Resposta MercadoPago:', mpData);

    if (!mpResponse.ok) {
      throw new Error(`Erro MercadoPago: ${mpData.status_detail}`);
    }

    // Atualizar preferência de pagamento com dados externos
    await supabase
      .from('payment_preferences')
      .update({
        external_id: String(mpData.id),
        status: mpData.status === 'approved' ? 'approved' : 'pending',
        error_message: mpData.status === 'rejected' ? mpData.status_detail : null
      })
      .eq('id', preferenceId);

    // Retornar resposta com headers CORS
    return new Response(
      JSON.stringify({
        status: mpData.status,
        payment_id: mpData.id,
        status_detail: mpData.status_detail,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Erro ao processar pagamento:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Erro interno ao processar pagamento'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

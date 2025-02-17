
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferenceId, eventId, batchId, quantity, paymentType, cardToken, installments, paymentMethodId } = await req.json();
    
    // Validar dados obrigatórios
    if (!preferenceId || !eventId || !batchId || !quantity || !paymentType || !paymentMethodId) {
      throw new Error("Dados obrigatórios faltando");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error("Token do MercadoPago não configurado");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar preferência e dados relacionados
    const { data: preference } = await supabase
      .from('payment_preferences')
      .select()
      .eq('id', preferenceId)
      .maybeSingle();

    if (!preference) {
      throw new Error("Preferência de pagamento não encontrada");
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('email, name, cpf')
      .eq('id', preference.user_id)
      .maybeSingle();

    if (!userProfile?.email) {
      throw new Error("Dados do usuário não encontrados");
    }

    // Preparar dados comuns do pagamento
    const basePaymentData = {
      transaction_amount: Number(preference.total_amount),
      description: `Ingresso para evento ${eventId}`,
      external_reference: `${eventId}|${preference.id}`,
      notification_url: `${supabaseUrl}/functions/v1/webhook-payment`,
      payer: {
        email: userProfile.email,
        first_name: userProfile.name?.split(' ')[0] || '',
        last_name: userProfile.name?.split(' ').slice(1).join(' ') || '',
        identification: {
          type: "CPF",
          number: userProfile.cpf?.replace(/\D/g, '') || ''
        }
      }
    };

    // Configurar dados específicos por tipo de pagamento
    const paymentData = paymentType === 'credit_card' 
      ? {
          ...basePaymentData,
          payment_method_id: paymentMethodId,
          token: cardToken,
          installments: installments || 1,
          binary_mode: true
        }
      : {
          ...basePaymentData,
          payment_method_id: "pix",
          payment_type_id: "bank_transfer",
          transaction_details: {
            financial_institution: "bcb"
          }
        };

    // Criar pagamento no MercadoPago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${preferenceId}-${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Erro MercadoPago:', mpData);
      throw new Error(mpData.message || 'Erro ao processar pagamento');
    }

    // Atualizar preferência com dados do pagamento
    await supabase
      .from('payment_preferences')
      .update({
        external_id: String(mpData.id),
        status: mpData.status,
        error_message: mpData.status === 'rejected' ? mpData.status_detail : null
      })
      .eq('id', preferenceId);

    return new Response(
      JSON.stringify({
        status: mpData.status,
        payment_id: mpData.id,
        status_detail: mpData.status_detail,
        ...(paymentType === 'pix' && {
          qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64
        })
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

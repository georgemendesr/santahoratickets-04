
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

interface PaymentRequest {
  preferenceId: string;
  eventId: string;
  batchId: string;
  quantity: number;
  paymentType: "credit_card" | "pix";
  cardToken?: string;
  installments?: number;
  paymentMethodId: string;
}

function validatePaymentRequest(data: PaymentRequest) {
  const errors = [];
  
  if (!data.preferenceId) errors.push("preferenceId é obrigatório");
  if (!data.eventId) errors.push("eventId é obrigatório");
  if (!data.batchId) errors.push("batchId é obrigatório");
  if (!data.quantity || data.quantity < 1) errors.push("quantity deve ser maior que 0");
  if (!data.paymentType) errors.push("paymentType é obrigatório");
  if (!data.paymentMethodId) errors.push("paymentMethodId é obrigatório");
  
  if (data.paymentType === "credit_card") {
    if (!data.cardToken) errors.push("cardToken é obrigatório para pagamento com cartão");
    if (!data.installments || data.installments < 1) errors.push("installments deve ser maior que 0");
  }

  return errors;
}

function generateIdempotencyKey(preferenceId: string): string {
  return `${preferenceId}-${Date.now()}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('1. Iniciando processamento do pagamento...');

    // Validar configuração do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuração do Supabase ausente');
    }

    if (!accessToken) {
      throw new Error('Token do MercadoPago não configurado');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validar dados da requisição
    const requestData: PaymentRequest = await req.json();
    console.log('2. Dados recebidos:', JSON.stringify(requestData, null, 2));

    const validationErrors = validatePaymentRequest(requestData);
    if (validationErrors.length > 0) {
      throw new Error(`Erros de validação: ${validationErrors.join(', ')}`);
    }

    // Buscar preferência de pagamento
    console.log('3. Buscando preferência de pagamento...');
    const { data: preference, error: prefError } = await supabase
      .from('payment_preferences')
      .select()
      .eq('id', requestData.preferenceId)
      .maybeSingle();

    if (prefError) {
      console.error('Erro ao buscar preferência:', prefError);
      throw new Error(`Erro ao buscar preferência de pagamento: ${prefError.message}`);
    }

    if (!preference) {
      throw new Error('Preferência de pagamento não encontrada');
    }

    console.log('4. Preferência encontrada:', {
      id: preference.id,
      total_amount: preference.total_amount,
      status: preference.status
    });

    // Buscar perfil do usuário
    console.log('5. Buscando perfil do usuário...');
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('email, name')
      .eq('id', preference.user_id)
      .maybeSingle();

    if (userError || !userProfile?.email) {
      console.error('Erro ao buscar usuário:', userError);
      throw new Error('Dados do usuário não encontrados');
    }

    console.log('6. Perfil encontrado:', {
      email: userProfile.email,
      name: userProfile.name
    });

    // Validar lote
    console.log('7. Validando lote...');
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select()
      .eq('id', requestData.batchId)
      .maybeSingle();

    if (batchError || !batch) {
      console.error('Erro ao buscar lote:', batchError);
      throw new Error('Lote não encontrado');
    }

    console.log('8. Lote validado:', {
      available: batch.available_tickets,
      requested: requestData.quantity,
      price: batch.price
    });

    if (batch.available_tickets < requestData.quantity) {
      throw new Error('Quantidade de ingressos indisponível');
    }

    // Validar valor total
    const expectedAmount = Number(batch.price) * requestData.quantity;
    if (Number(preference.total_amount) !== expectedAmount) {
      console.error('9. Divergência de valores:', {
        expected: expectedAmount,
        received: preference.total_amount
      });
      throw new Error('Valor total inválido');
    }

    // Preparar dados para o MercadoPago
    const paymentData = {
      transaction_amount: Number(preference.total_amount),
      payment_method_id: requestData.paymentMethodId,
      ...(requestData.paymentType === 'credit_card' ? {
        token: requestData.cardToken,
        installments: requestData.installments || 1,
      } : {}),
      description: `Ingresso para evento ${requestData.eventId}`,
      external_reference: `${requestData.eventId}|${preference.id}`,
      notification_url: `${supabaseUrl}/functions/v1/webhook-payment`,
      payer: {
        email: userProfile.email,
        first_name: userProfile.name?.split(' ')[0] || '',
        last_name: userProfile.name?.split(' ').slice(1).join(' ') || ''
      }
    };

    console.log('10. Dados do pagamento:', JSON.stringify(paymentData, null, 2));

    // Gerar chave de idempotência
    const idempotencyKey = generateIdempotencyKey(requestData.preferenceId);
    console.log('11. Chave de idempotência:', idempotencyKey);

    // Criar pagamento no MercadoPago
    console.log('12. Enviando requisição para o MercadoPago...');
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentData),
    });

    const mpData = await mpResponse.json();
    console.log('13. Resposta do MercadoPago:', JSON.stringify(mpData, null, 2));

    if (!mpResponse.ok) {
      console.error('Erro do MercadoPago:', mpData);
      throw new Error(`Erro MercadoPago: ${mpData.message || mpData.status_detail || JSON.stringify(mpData)}`);
    }

    // Atualizar preferência de pagamento
    console.log('14. Atualizando preferência de pagamento...');
    const { error: updateError } = await supabase
      .from('payment_preferences')
      .update({
        external_id: String(mpData.id),
        status: mpData.status === 'approved' ? 'approved' : 'pending',
        error_message: mpData.status === 'rejected' ? mpData.status_detail : null
      })
      .eq('id', preference.id);

    if (updateError) {
      console.error('Erro ao atualizar preferência:', updateError);
      throw new Error('Erro ao atualizar preferência de pagamento');
    }

    console.log('15. Processo de pagamento concluído com sucesso');

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
    console.error('Erro no processo de pagamento:', error);

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

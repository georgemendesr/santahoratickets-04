
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

function generateIdempotencyKey(preferenceId: string): string {
  return `${preferenceId}-${Date.now()}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment processing...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData: PaymentRequest = await req.json();
    console.log('Request data:', JSON.stringify(requestData, null, 2));

    // Validate required fields
    const requiredFields = ['preferenceId', 'eventId', 'batchId', 'quantity', 'paymentType', 'paymentMethodId'];
    const missingFields = requiredFields.filter(field => !requestData[field as keyof PaymentRequest]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Fetch payment preference
    const { data: preference, error: prefError } = await supabase
      .from('payment_preferences')
      .select()
      .eq('id', requestData.preferenceId)
      .maybeSingle();

    console.log('Payment preference query result:', { data: preference, error: prefError });

    if (prefError) {
      console.error('Error fetching payment preference:', prefError);
      throw new Error(`Erro ao buscar preferência de pagamento: ${prefError.message}`);
    }

    if (!preference) {
      throw new Error('Preferência de pagamento não encontrada');
    }

    // Fetch user profile
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('email, name')
      .eq('id', preference.user_id)
      .maybeSingle();

    console.log('User profile query result:', { data: userProfile, error: userError });

    if (userError) {
      console.error('Error fetching user profile:', userError);
      throw new Error('Erro ao buscar dados do usuário');
    }

    if (!userProfile?.email) {
      throw new Error('Email do usuário não encontrado');
    }

    // Validate batch availability
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select()
      .eq('id', requestData.batchId)
      .maybeSingle();

    console.log('Batch query result:', { data: batch, error: batchError });

    if (batchError) {
      console.error('Error fetching batch:', batchError);
      throw new Error(`Erro ao buscar lote: ${batchError.message}`);
    }

    if (!batch) {
      throw new Error('Lote não encontrado');
    }

    if (batch.available_tickets < requestData.quantity) {
      throw new Error('Quantidade de ingressos indisponível');
    }

    if (requestData.quantity < (batch.min_purchase || 1)) {
      throw new Error(`Quantidade mínima de compra: ${batch.min_purchase}`);
    }

    if (batch.max_purchase && requestData.quantity > batch.max_purchase) {
      throw new Error(`Quantidade máxima de compra: ${batch.max_purchase}`);
    }

    // Validate total amount
    const expectedAmount = Number(batch.price) * requestData.quantity;
    if (Number(preference.total_amount) !== expectedAmount) {
      console.error('Amount mismatch:', {
        expected: expectedAmount,
        received: preference.total_amount
      });
      throw new Error('Valor total inválido');
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Token do MercadoPago não configurado');
    }

    // Prepare payment data
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
      }
    };

    console.log('MercadoPago payment data:', JSON.stringify(paymentData, null, 2));

    // Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(requestData.preferenceId);
    console.log('Generated idempotency key:', idempotencyKey);

    // Create payment in MercadoPago
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
    console.log('MercadoPago response:', JSON.stringify(mpData, null, 2));

    if (!mpResponse.ok) {
      throw new Error(`Erro MercadoPago: ${mpData.message || mpData.status_detail || JSON.stringify(mpData)}`);
    }

    // Update payment preference
    const { error: updateError } = await supabase
      .from('payment_preferences')
      .update({
        external_id: String(mpData.id),
        status: mpData.status === 'approved' ? 'approved' : 'pending',
        error_message: mpData.status === 'rejected' ? mpData.status_detail : null
      })
      .eq('id', preference.id);

    if (updateError) {
      console.error('Error updating payment preference:', updateError);
      throw new Error('Erro ao atualizar preferência de pagamento');
    }

    console.log('Payment process completed successfully');

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
    console.error('Payment process failed:', error);

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

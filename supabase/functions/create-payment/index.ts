
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting payment processing...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse and validate request body
    const requestData: PaymentRequest = await req.json();
    console.log('Received payment request:', {
      preferenceId: requestData.preferenceId,
      eventId: requestData.eventId,
      batchId: requestData.batchId,
      quantity: requestData.quantity,
      paymentType: requestData.paymentType,
      paymentMethodId: requestData.paymentMethodId,
      hasCardToken: !!requestData.cardToken,
      installments: requestData.installments
    });

    // Validate required fields
    const requiredFields = ['preferenceId', 'eventId', 'batchId', 'quantity', 'paymentType', 'paymentMethodId'];
    const missingFields = requiredFields.filter(field => !requestData[field as keyof PaymentRequest]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Fetch payment preference
    console.log('Fetching payment preference with ID:', requestData.preferenceId);
    const { data: preference, error: prefError } = await supabase
      .from('payment_preferences')
      .select(`
        *,
        user_profiles (
          name,
          email
        )
      `)
      .eq('id', requestData.preferenceId)
      .single();

    if (prefError) {
      console.error('Error fetching payment preference:', prefError);
      throw new Error(`Erro ao buscar preferência de pagamento: ${prefError.message}`);
    }

    if (!preference) {
      console.error('Payment preference not found for ID:', requestData.preferenceId);
      throw new Error('Preferência de pagamento não encontrada');
    }

    console.log('Found payment preference:', {
      id: preference.id,
      status: preference.status,
      total_amount: preference.total_amount,
      user_email: preference.user_profiles?.email
    });

    // Validate batch availability
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('available_tickets, min_purchase, max_purchase, price')
      .eq('id', requestData.batchId)
      .single();

    if (batchError) {
      console.error('Error fetching batch:', batchError);
      throw new Error(`Erro ao buscar lote: ${batchError.message}`);
    }

    if (!batch) {
      throw new Error('Lote não encontrado');
    }

    console.log('Batch validation:', {
      available: batch.available_tickets,
      requested: requestData.quantity,
      minPurchase: batch.min_purchase,
      maxPurchase: batch.max_purchase
    });

    if (batch.available_tickets < requestData.quantity) {
      throw new Error('Quantidade de ingressos indisponível');
    }

    if (requestData.quantity < batch.min_purchase) {
      throw new Error(`Quantidade mínima de compra: ${batch.min_purchase}`);
    }

    if (batch.max_purchase && requestData.quantity > batch.max_purchase) {
      throw new Error(`Quantidade máxima de compra: ${batch.max_purchase}`);
    }

    // Validate total amount
    const expectedAmount = batch.price * requestData.quantity;
    if (preference.total_amount !== expectedAmount) {
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

    // Prepare payment data for MercadoPago
    const paymentData = {
      transaction_amount: preference.total_amount,
      payment_method_id: requestData.paymentMethodId,
      ...(requestData.paymentType === 'credit_card' ? {
        token: requestData.cardToken,
        installments: requestData.installments || 1,
      } : {}),
      description: `Ingresso para evento ${requestData.eventId}`,
      external_reference: `${requestData.eventId}|${preference.id}`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-payment`,
      payer: {
        email: preference.user_profiles?.email,
      }
    };

    console.log('Initiating MercadoPago payment:', {
      amount: paymentData.transaction_amount,
      payment_method_id: paymentData.payment_method_id,
      description: paymentData.description,
      payer_email: paymentData.payer.email
    });

    // Create payment in MercadoPago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const mpData: MercadoPagoPayment = await mpResponse.json();
    console.log('MercadoPago response:', {
      id: mpData.id,
      status: mpData.status,
      status_detail: mpData.status_detail
    });

    if (!mpResponse.ok) {
      console.error('MercadoPago error:', mpData);
      throw new Error(`Erro MercadoPago: ${mpData.status_detail}`);
    }

    // Update payment preference with external data
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
      throw updateError;
    }

    console.log('Payment process completed successfully');

    // Return response with CORS headers
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

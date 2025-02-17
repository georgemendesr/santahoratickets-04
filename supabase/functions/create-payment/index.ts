
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'https://esm.sh/mercadopago@1.5.14'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.split(' ')[1] ?? ''
    )

    if (authError || !user) {
      throw new Error('Não autorizado')
    }

    const { 
      eventId, 
      batchId, 
      quantity, 
      cardToken, 
      installments, 
      paymentMethodId 
    } = await req.json()

    if (!eventId || !quantity || !batchId) {
      throw new Error('Dados inválidos')
    }

    // Buscar informações do evento e do lote
    const { data: event } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    const { data: batch } = await supabaseClient
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (!event || !batch) {
      throw new Error('Evento ou lote não encontrado')
    }

    // Configurar MercadoPago
    mercadopago.configure({
      access_token: Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''
    })

    const totalAmount = batch.price * quantity

    // Criar pagamento
    const payment = {
      transaction_amount: totalAmount,
      token: cardToken,
      description: `${event.title} - ${batch.title} (${quantity} ingressos)`,
      installments: installments,
      payment_method_id: paymentMethodId,
      payer: {
        email: user.email,
      }
    }

    const paymentResponse = await mercadopago.payment.save(payment)

    // Criar registro de pagamento
    const { data: paymentPreference, error: paymentError } = await supabaseClient
      .from('payment_preferences')
      .insert({
        event_id: eventId,
        user_id: user.id,
        ticket_quantity: quantity,
        total_amount: totalAmount,
        card_token: cardToken,
        installments: installments,
        payment_method_id: paymentMethodId,
        status: paymentResponse.status,
        init_point: '' // Não é necessário para checkout transparente
      })
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    return new Response(
      JSON.stringify({
        status: paymentResponse.status,
        payment_id: paymentResponse.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})



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

    const { eventId, quantity, batchId } = await req.json()

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

    // Criar preferência de pagamento
    const preference = {
      items: [
        {
          title: `${event.title} - ${batch.title}`,
          description: event.description,
          quantity: quantity,
          currency_id: 'BRL',
          unit_price: Number(batch.price)
        }
      ],
      external_reference: `${eventId}|${user.id}|${quantity}|${batchId}`,
      back_urls: {
        success: `${Deno.env.get('APP_URL')}/payment/success`,
        pending: `${Deno.env.get('APP_URL')}/payment/pending`,
        failure: `${Deno.env.get('APP_URL')}/payment/failure`
      },
      auto_return: 'approved'
    }

    const response = await mercadopago.preferences.create(preference)

    // Criar registro de pagamento
    const { data: paymentPreference, error: paymentError } = await supabaseClient
      .from('payment_preferences')
      .insert({
        event_id: eventId,
        user_id: user.id,
        ticket_quantity: quantity,
        total_amount: batch.price * quantity,
        init_point: response.body.init_point,
        status: 'pending'
      })
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    return new Response(
      JSON.stringify({
        init_point: response.body.init_point,
        preference_id: response.body.id,
        payment_id: paymentPreference.id
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'https://esm.sh/mercadopago@1.5.14'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    console.log('1. Iniciando função create-payment');
    
    // Configurar MercadoPago primeiro
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('Token do MercadoPago não configurado')
    }

    mercadopago.configure({
      access_token: accessToken
    })

    // Configurar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Configuração do Supabase ausente')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Header de autorização ausente')
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Erro de autenticação')
    }

    // Processar body da requisição
    let body;
    try {
      body = await req.json()
    } catch (error) {
      throw new Error('Body inválido: ' + error.message)
    }

    const { 
      eventId, 
      batchId, 
      quantity, 
      cardToken, 
      installments, 
      paymentMethodId,
      paymentType 
    } = body

    if (!eventId || !quantity || !batchId) {
      throw new Error('Dados obrigatórios ausentes')
    }

    // Buscar informações do evento e do lote
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      throw new Error('Evento não encontrado')
    }

    const { data: batch, error: batchError } = await supabaseClient
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (batchError || !batch) {
      throw new Error('Lote não encontrado')
    }

    const totalAmount = batch.price * quantity

    let paymentData;
    if (paymentType === 'credit_card') {
      paymentData = {
        transaction_amount: totalAmount,
        token: cardToken,
        description: `${event.title} - ${batch.title} (${quantity} ingressos)`,
        installments: installments || 1,
        payment_method_id: paymentMethodId,
        payer: {
          email: user.email,
          identification: {
            type: "CPF",
            number: user.user_metadata?.cpf || ""
          }
        }
      }
    } else if (paymentType === 'pix') {
      paymentData = {
        transaction_amount: totalAmount,
        description: `${event.title} - ${batch.title} (${quantity} ingressos)`,
        payment_method_id: 'pix',
        payment_type_id: 'pix',
        payer: {
          email: user.email,
          first_name: user.user_metadata?.name || user.email,
          identification: {
            type: "CPF",
            number: user.user_metadata?.cpf || ""
          }
        }
      }
    } else {
      throw new Error('Método de pagamento inválido')
    }

    console.log('Dados do pagamento:', JSON.stringify(paymentData, null, 2))
    
    const paymentResponse = await mercadopago.payment.create(paymentData)
    console.log('Resposta do MercadoPago:', JSON.stringify(paymentResponse.body, null, 2))

    if (!paymentResponse.body) {
      throw new Error('Resposta inválida do MercadoPago')
    }

    if (paymentResponse.body.status === 'rejected') {
      throw new Error('Pagamento rejeitado: ' + paymentResponse.body.status_detail)
    }

    // Criar registro de pagamento
    const { error: paymentError } = await supabaseClient
      .from('payment_preferences')
      .insert({
        event_id: eventId,
        user_id: user.id,
        ticket_quantity: quantity,
        total_amount: totalAmount,
        payment_method_id: paymentMethodId,
        status: paymentResponse.body.status,
        init_point: paymentType === 'pix' ? 
          paymentResponse.body.point_of_interaction?.transaction_data?.qr_code : '',
        payment_type: paymentType
      })

    if (paymentError) {
      throw paymentError
    }

    const responseData = {
      status: paymentResponse.body.status,
      payment_id: paymentResponse.body.id
    }

    if (paymentType === 'pix') {
      const pixData = paymentResponse.body.point_of_interaction?.transaction_data
      responseData.qr_code = pixData?.qr_code
      responseData.qr_code_base64 = pixData?.qr_code_base64
    }

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400,
      }
    )
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'https://esm.sh/mercadopago@1.5.14'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    console.log('1. Iniciando função create-payment');
    
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('4. Token do MercadoPago não encontrado');
      throw new Error('Token do MercadoPago não configurado')
    }
    console.log('4. Token do MercadoPago encontrado:', accessToken.substring(0, 10) + '...');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('5. Configurações do Supabase ausentes');
      throw new Error('Configuração do Supabase ausente')
    }
    console.log('5. Configurações do Supabase encontradas');

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('6. Header de autorização ausente');
      throw new Error('Header de autorização ausente')
    }
    console.log('6. Header de autorização presente:', authHeader.substring(0, 20) + '...');

    console.log('7. Verificando autenticação do usuário');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError) {
      console.error('8. Erro de autenticação:', authError);
      throw new Error('Erro de autenticação')
    }

    if (!user) {
      console.error('8. Usuário não encontrado');
      throw new Error('Usuário não encontrado')
    }
    console.log('8. Usuário autenticado:', user.id);

    const rawBody = await req.text();
    console.log('Body raw recebido:', rawBody);
    
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error('Erro ao fazer parse do JSON:', error);
      throw new Error('Body inválido: ' + error.message);
    }
    console.log('Body parseado:', body);

    const { 
      eventId, 
      batchId, 
      quantity, 
      cardToken, 
      installments, 
      paymentMethodId,
      paymentType 
    } = body

    console.log('10. Dados extraídos:', {
      eventId,
      batchId,
      quantity,
      paymentType,
      paymentMethodId,
      cardToken: cardToken ? 'presente' : 'ausente',
      installments
    });

    if (!eventId || !quantity || !batchId) {
      console.error('11. Dados obrigatórios ausentes:', { eventId, quantity, batchId });
      throw new Error('Dados inválidos')
    }

    // Buscar informações do evento e do lote
    console.log('12. Buscando informações do evento');
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) {
      console.error('13. Erro ao buscar evento:', eventError);
      throw new Error('Evento não encontrado')
    }
    console.log('13. Evento encontrado:', event.title);

    console.log('14. Buscando informações do lote');
    const { data: batch, error: batchError } = await supabaseClient
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (batchError) {
      console.error('15. Erro ao buscar lote:', batchError);
      throw new Error('Lote não encontrado')
    }
    console.log('15. Lote encontrado:', batch.title);

    // Configurar MercadoPago
    console.log('16. Configurando MercadoPago');
    mercadopago.configure({
      access_token: accessToken
    })

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
      console.error('17. Método de pagamento inválido:', paymentType);
      throw new Error('Método de pagamento inválido')
    }

    console.log('17. Dados do pagamento preparados:', JSON.stringify(paymentData, null, 2));
    
    console.log('18. Criando pagamento no MercadoPago');
    const paymentResponse = await mercadopago.payment.create(paymentData);
    console.log('19. Resposta do pagamento:', JSON.stringify(paymentResponse, null, 2));

    if (!paymentResponse.body) {
      console.error('20. Resposta do MercadoPago inválida');
      throw new Error('Resposta inválida do MercadoPago')
    }

    if (paymentResponse.body.status === 'rejected') {
      console.error('20. Pagamento rejeitado:', paymentResponse.body.status_detail);
      throw new Error('Pagamento rejeitado: ' + paymentResponse.body.status_detail)
    }

    // Criar registro de pagamento
    console.log('21. Salvando registro de pagamento');
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
      console.error('22. Erro ao salvar preferência:', paymentError);
      throw paymentError
    }
    console.log('22. Registro de pagamento salvo com sucesso');

    const responseData = {
      status: paymentResponse.body.status,
      payment_id: paymentResponse.body.id
    }

    if (paymentType === 'pix') {
      const pixData = paymentResponse.body.point_of_interaction?.transaction_data
      responseData.qr_code = pixData?.qr_code
      responseData.qr_code_base64 = pixData?.qr_code_base64
    }

    console.log('23. Retornando resposta de sucesso:', JSON.stringify(responseData, null, 2));
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
    console.error('Erro detalhado:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
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

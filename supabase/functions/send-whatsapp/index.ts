
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import html2canvas from 'https://esm.sh/html2canvas@1.4.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  payment_id: string;
  phone_number: string; // Formato: 5511999999999
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { payment_id, phone_number }: WhatsAppMessage = await req.json()

    // Inicializa cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Busca informações do pagamento
    const { data: payment, error: paymentError } = await supabase
      .from('payment_preferences')
      .select(`
        *,
        events:event_id (
          title,
          date,
          time
        )
      `)
      .eq('id', payment_id)
      .single()

    if (paymentError || !payment) {
      throw new Error('Pagamento não encontrado')
    }

    // Busca tickets associados
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', payment.event_id)
      .eq('user_id', payment.user_id)

    if (ticketsError || !tickets?.length) {
      throw new Error('Tickets não encontrados')
    }

    // Envia mensagem via WhatsApp Business API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v17.0/${Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('WHATSAPP_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone_number,
          type: "template",
          template: {
            name: "ticket_confirmation",
            language: {
              code: "pt_BR"
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: payment.events.title
                  },
                  {
                    type: "text",
                    text: new Date(payment.events.date).toLocaleDateString('pt-BR')
                  },
                  {
                    type: "text",
                    text: payment.events.time
                  }
                ]
              }
            ]
          }
        })
      }
    )

    if (!whatsappResponse.ok) {
      throw new Error('Erro ao enviar WhatsApp')
    }

    console.log('WhatsApp enviado com sucesso:', await whatsappResponse.json())

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
    )
  }
})

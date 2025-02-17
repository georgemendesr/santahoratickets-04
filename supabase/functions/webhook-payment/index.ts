
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MercadoPagoNotification {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
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

    const notification: MercadoPagoNotification = await req.json();
    console.log('Notificação recebida:', notification);

    if (notification.type !== 'payment') {
      return new Response(
        JSON.stringify({ message: 'Notificação não relacionada a pagamento' }),
        { 
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Token do MercadoPago não configurado');
    }

    // Buscar detalhes do pagamento no MercadoPago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${notification.data.id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      throw new Error('Erro ao buscar detalhes do pagamento');
    }

    const paymentData = await paymentResponse.json();
    console.log('Dados do pagamento:', paymentData);

    // Extrair referência externa para encontrar a preferência
    const [eventId, preferenceId] = paymentData.external_reference.split('|');

    // Atualizar preferência de pagamento
    const { error: updateError } = await supabase
      .from('payment_preferences')
      .update({
        status: paymentData.status,
        error_message: paymentData.status_detail,
        external_id: String(paymentData.id),
        last_attempt_at: new Date().toISOString()
      })
      .eq('id', preferenceId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Erro ao processar webhook:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Erro interno ao processar webhook'
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

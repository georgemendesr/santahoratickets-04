
import { validateAuthToken } from '../../_shared/auth.ts';
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';
import { validateRequiredFields, validateUUID } from '../../_shared/validation.ts';

interface CreatePaymentPreferenceRequest {
  eventId: string;
  batchId: string;
  quantity: number;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('create-payment-preference function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));
    const requestData: CreatePaymentPreferenceRequest = await req.json();

    validateRequiredFields(requestData, ['eventId', 'batchId', 'quantity', 'userId']);
    validateUUID(requestData.eventId, 'Event ID');
    validateUUID(requestData.batchId, 'Batch ID');

    const { eventId, batchId, quantity, userId } = requestData;

    console.log('Creating payment preference:', { eventId, batchId, quantity, userId });

    // Buscar evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return errorResponse('Evento não encontrado', 404);
    }

    // Buscar lote
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      console.error('Batch not found:', batchError);
      return errorResponse('Lote não encontrado', 404);
    }

    // Verificar disponibilidade
    if (batch.available_tickets < quantity) {
      return errorResponse('Quantidade de ingressos não disponível', 400);
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return errorResponse('Perfil do usuário não encontrado', 404);
    }

    const mercadoPagoAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!mercadoPagoAccessToken) {
      return errorResponse('Token do Mercado Pago não configurado', 500);
    }

    // Criar referência única
    const external_reference = `${eventId}-${user.id}-${Date.now()}`;
    const totalAmount = batch.price * quantity;

    // Criar preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          title: `${quantity}x Ingressos para ${event.title}`,
          description: `Lote: ${batch.title}`,
          quantity: quantity,
          unit_price: Number(batch.price),
          currency_id: "BRL"
        }
      ],
      payer: {
        name: profile.name?.split(' ')[0] || 'Cliente',
        surname: profile.name?.split(' ').slice(1).join(' ') || 'MercadoPago',
        email: user.email,
        identification: {
          type: 'CPF',
          number: profile.cpf?.replace(/\D/g, '') || '00000000000'
        }
      },
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12
      },
      back_urls: {
        success: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/payment-status?status=approved`,
        failure: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/payment-status?status=rejected`,
        pending: `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/payment-status?status=pending`
      },
      auto_return: "approved",
      external_reference,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payments/webhook-payment`,
      metadata: {
        event_id: eventId,
        batch_id: batchId,
        user_id: user.id,
        quantity: quantity
      }
    };

    console.log('Creating preference in MercadoPago...');

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('MercadoPago error:', errorData);
      return errorResponse(errorData.message || 'Erro na API do Mercado Pago', 400);
    }

    const preferenceResponse = await response.json();
    console.log('Preference created:', preferenceResponse);

    // Salvar preferência no banco
    const { data: savedPreference, error: saveError } = await supabase
      .from('payment_preferences')
      .insert({
        init_point: preferenceResponse.init_point,
        external_id: preferenceResponse.id,
        event_id: eventId,
        user_id: user.id,
        ticket_quantity: quantity,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving preference:', saveError);
    }

    return successResponse({
      init_point: preferenceResponse.init_point,
      preference_id: preferenceResponse.id
    });

  } catch (error: any) {
    console.error('Error in create-payment-preference function:', error);
    return errorResponse(error.message || 'Erro ao criar preferência de pagamento', 500);
  }
};

Deno.serve(handler);

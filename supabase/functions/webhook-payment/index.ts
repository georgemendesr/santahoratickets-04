import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { load } from "https://deno.land/std@0.192.0/dotenv/mod.ts";

const env = await load();

Deno.cron("Check payment status", "*/5 * * * *", async () => {
  console.log("Running a scheduled task every 5 minutes");

  const supabase = createClient(
    env["SUPABASE_URL"],
    env["SUPABASE_SERVICE_ROLE_KEY"],
    {
      auth: {
        persistSession: false
      }
    }
  )

  const { data: paymentPreferences, error } = await supabase
    .from('payment_preferences')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', new Date(Date.now() - 30 * 60000).toISOString()) // 30 minutes

  if (error) {
    console.error("Error fetching payment preferences:", error);
    return;
  }

  if (paymentPreferences.length === 0) {
    console.log("No pending payment preferences found.");
    return;
  }

  for (const paymentPreference of paymentPreferences) {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentPreference.external_id}`, {
        headers: {
          'Authorization': `Bearer ${env["MERCADOPAGO_ACCESS_TOKEN"]}`
        }
      });

      if (!response.ok) {
        console.error(`Mercado Pago API error for payment ${paymentPreference.id}:`, response.status, response.statusText);
        continue;
      }

      const paymentData = await response.json();
      const paymentStatus = paymentData.status;

      console.log(`Payment ${paymentPreference.id} status from Mercado Pago:`, paymentStatus);

      if (paymentStatus === 'approved' || paymentStatus === 'rejected') {
        const { error: updateError } = await supabase
          .from('payment_preferences')
          .update({ status: paymentStatus })
          .eq('id', paymentPreference.id);

        if (updateError) {
          console.error(`Error updating payment preference ${paymentPreference.id}:`, updateError);
        } else {
          console.log(`Payment preference ${paymentPreference.id} updated to ${paymentStatus}`);
        }
      }
    } catch (err) {
      console.error(`Error processing payment ${paymentPreference.id}:`, err);
    }
  }
});

Deno.serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get('topic');
  const id = searchParams.get('id');

  console.log(`Received webhook notification for topic: ${topic}, id: ${id}`);

  if (topic === 'merchant_order') {
    console.log('Ignoring merchant_order topic');
    return new Response(JSON.stringify({ message: 'Ignoring merchant_order topic' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!id) {
    console.error('Missing id parameter');
    return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    env["SUPABASE_URL"],
    env["SUPABASE_SERVICE_ROLE_KEY"],
    {
      auth: {
        persistSession: false
      }
    }
  )

  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${env["MERCADOPAGO_ACCESS_TOKEN"]}`
      }
    });

    if (!response.ok) {
      console.error('Mercado Pago API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'Mercado Pago API error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const paymentData = await response.json();
    const status = paymentData.status;
    const paymentMethodId = paymentData.payment_method_id;
    const paymentTypeId = paymentData.payment_type_id;
    const externalReference = paymentData.external_reference;
    const installments = paymentData.installments;
    const cardTokenId = paymentData.card_id;

    console.log(`Payment status from Mercado Pago: ${status}`);

    // Buscar PaymentPreference
    const { data: payment, error: paymentError } = await supabase
      .from('payment_preferences')
      .select('*')
      .eq('external_id', id)
      .single();

    if (paymentError) {
      console.error('Error fetching payment preference:', paymentError);
      return new Response(JSON.stringify({ error: 'Error fetching payment preference' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!payment) {
      console.error('Payment preference not found');
      return new Response(JSON.stringify({ error: 'Payment preference not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Atualizar PaymentPreference com dados do pagamento
    const { error: updateError } = await supabase
      .from('payment_preferences')
      .update({
        status: status,
        payment_method_id: paymentMethodId,
        payment_type: paymentTypeId,
        card_token: cardTokenId,
        installments: installments
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment preference:', updateError);
      return new Response(JSON.stringify({ error: 'Error updating payment preference' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (status === 'approved') {
      try {
        const reference = externalReference.split('|');
        const eventId = reference[0];
        const quantity = parseInt(reference[2] || '1', 10);

        // Buscar informações do evento e do usuário
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          throw new Error('Error fetching event');
        }

        const { data: user, error: userError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', payment.user_id)
          .single();

        if (userError) {
          console.error('Error fetching user:', userError);
          throw new Error('Error fetching user');
        }

        // Criar os tickets
        for (let i = 0; i < quantity; i++) {
          const qrCodeData = `${payment.user_id}-${eventId}-${Date.now()}-${i}`;

          const { data: newTicket, error: ticketError } = await supabase
            .from('tickets')
            .insert({
              event_id: eventId,
              user_id: payment.user_id,
              purchase_date: new Date().toISOString(),
              qr_code: qrCodeData,
              qr_code_background: event.qr_code_background,
              qr_code_foreground: event.qr_code_foreground,
            })
            .select()
            .single();

          if (ticketError) {
            console.error('Error creating ticket:', ticketError);
            throw new Error('Error creating ticket');
          }

          console.log('Ticket created successfully:', newTicket);
        }

        // Busca o número de telefone do usuário
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('phone')
          .eq('id', payment.user_id)
          .single()

        if (profile?.phone) {
          // Formata o número de telefone (remove caracteres especiais)
          const phoneNumber = profile.phone.replace(/\D/g, '')
          
          // Envia WhatsApp
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              payment_id: payment.id,
              phone_number: phoneNumber
            })
          })
        }
      } catch (error) {
        console.error('Erro ao enviar WhatsApp:', error)
      }
    }

    return new Response(JSON.stringify({ message: 'Webhook processed successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referral_code, user_id, event_id } = await req.json();

    console.log('Processing referral:', { referral_code, user_id, event_id });

    // Buscar o referral pelo código
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('code', referral_code)
      .eq('event_id', event_id)
      .single();

    if (referralError || !referral) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código de indicação inválido' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verificar se o usuário não está tentando usar seu próprio código
    if (referral.referrer_id === user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não é possível usar seu próprio código de indicação' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verificar se o usuário já usou este código
    const { data: existingUse } = await supabase
      .from('referral_uses')
      .select('id')
      .eq('referral_id', referral.id)
      .eq('user_id', user_id)
      .single();

    if (existingUse) {
      return new Response(
        JSON.stringify({ success: false, error: 'Código de indicação já utilizado por este usuário' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Registrar o uso do referral
    const { error: useError } = await supabase
      .from('referral_uses')
      .insert({
        referral_id: referral.id,
        user_id: user_id,
        event_id: event_id
      });

    if (useError) {
      console.error('Error creating referral use:', useError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao processar indicação' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Atualizar contador no referral
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ used_count: referral.used_count + 1 })
      .eq('id', referral.id);

    if (updateError) {
      console.error('Error updating referral count:', updateError);
    }

    // Adicionar pontos para quem indicou (100 pontos)
    const { error: pointsReferrerError } = await supabase
      .from('fidelity_points')
      .insert({
        user_id: referral.referrer_id,
        points: 100,
        source: 'referral',
        reference_id: event_id,
        description: 'Pontos por indicação bem-sucedida'
      });

    if (pointsReferrerError) {
      console.error('Error adding points to referrer:', pointsReferrerError);
    }

    // Adicionar pontos para quem foi indicado (50 pontos)
    const { error: pointsReferredError } = await supabase
      .from('fidelity_points')
      .insert({
        user_id: user_id,
        points: 50,
        source: 'referral',
        reference_id: event_id,
        description: 'Bônus por usar código de indicação'
      });

    if (pointsReferredError) {
      console.error('Error adding points to referred user:', pointsReferredError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Indicação processada com sucesso! Pontos adicionados para ambos os usuários.',
        points_earned: 50,
        points_given: 100
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in process-referral function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

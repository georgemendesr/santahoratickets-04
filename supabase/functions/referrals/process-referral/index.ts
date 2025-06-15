
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';
import { validateAuthToken } from '../../_shared/auth.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log('referrals/process-referral function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));
    const { referralCode, eventId } = await req.json();

    console.log('Processing referral:', { referralCode, eventId, userId: user.id });

    // Buscar o referral pelo código
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('code', referralCode)
      .eq('event_id', eventId)
      .single();

    if (referralError || !referral) {
      console.error('Referral not found:', referralError);
      return errorResponse('Código de convite inválido ou expirado', 400);
    }

    // Verificar se não é o próprio usuário
    if (referral.referrer_id === user.id) {
      return errorResponse('Você não pode usar seu próprio código de convite', 400);
    }

    // Verificar se já usou este código antes
    const { data: existingUse } = await supabase
      .from('referral_uses')
      .select('id')
      .eq('referral_id', referral.id)
      .eq('user_id', user.id)
      .single();

    if (existingUse) {
      return errorResponse('Você já utilizou este código de convite', 400);
    }

    // Registrar o uso do referral
    const { error: useError } = await supabase
      .from('referral_uses')
      .insert({
        referral_id: referral.id,
        user_id: user.id,
        event_id: eventId
      });

    if (useError) {
      console.error('Error creating referral use:', useError);
      return errorResponse('Erro ao registrar uso do convite', 500);
    }

    // Atualizar contador de usos
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ used_count: referral.used_count + 1 })
      .eq('id', referral.id);

    if (updateError) {
      console.error('Error updating referral count:', updateError);
    }

    // Processar recompensas de pontos
    const { error: rewardError } = await supabase
      .rpc('process_referral_reward', {
        p_referrer_id: referral.referrer_id,
        p_referred_id: user.id,
        p_event_id: eventId
      });

    if (rewardError) {
      console.error('Error processing referral rewards:', rewardError);
    }

    console.log('Referral processed successfully');
    return successResponse({ 
      message: 'Código de convite aplicado com sucesso!',
      referrerId: referral.referrer_id 
    });

  } catch (error: any) {
    console.error('Error in process-referral function:', error);
    return errorResponse(error.message || 'Erro ao processar convite', 500);
  }
};

Deno.serve(handler);

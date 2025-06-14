
import { validateAuthToken } from '../../_shared/auth.ts';
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';
import { validateRequiredFields, validateUUID } from '../../_shared/validation.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log('fidelity/redeem-reward function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  if (req.method !== 'POST') {
    return errorResponse('Método não permitido', 405);
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));
    
    const body = await req.json();
    console.log('Request body:', body);

    validateRequiredFields(body, ['rewardId']);
    validateUUID(body.rewardId, 'ID da recompensa');

    // Buscar a recompensa
    const { data: reward, error: rewardError } = await supabase
      .from('fidelity_rewards')
      .select('*')
      .eq('id', body.rewardId)
      .eq('active', true)
      .single();

    if (rewardError || !reward) {
      console.error('Reward not found:', rewardError);
      return errorResponse('Recompensa não encontrada ou inativa', 404);
    }

    // Verificar se há unidades disponíveis
    if (reward.available_units !== null && reward.available_units <= 0) {
      return errorResponse('Recompensa esgotada', 400);
    }

    // Buscar saldo atual do usuário
    const { data: currentBalance, error: balanceError } = await supabase
      .rpc('get_user_points_balance', { user_id_param: user.id });

    if (balanceError) {
      console.error('Error fetching balance:', balanceError);
      return errorResponse('Erro ao verificar saldo', 500);
    }

    // Verificar se o usuário tem pontos suficientes
    if (currentBalance < reward.points_required) {
      return errorResponse('Pontos insuficientes para este resgate', 400);
    }

    // Criar o resgate
    const { data: redemption, error: redemptionError } = await supabase
      .from('fidelity_redemptions')
      .insert([
        {
          user_id: user.id,
          reward_id: body.rewardId,
          points_used: reward.points_required,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
      return errorResponse('Erro ao processar resgate', 500);
    }

    // Atualizar unidades disponíveis se limitado
    if (reward.available_units !== null) {
      const { error: updateError } = await supabase
        .from('fidelity_rewards')
        .update({ available_units: reward.available_units - 1 })
        .eq('id', body.rewardId);

      if (updateError) {
        console.error('Error updating available units:', updateError);
        // Reverter o resgate em caso de erro
        await supabase
          .from('fidelity_redemptions')
          .delete()
          .eq('id', redemption.id);
        
        return errorResponse('Erro ao atualizar estoque da recompensa', 500);
      }
    }

    console.log('Reward redeemed successfully:', redemption.id);
    return successResponse(redemption);

  } catch (error: any) {
    console.error('Error in redeem-reward function:', error);
    return errorResponse(error.message || 'Erro ao resgatar recompensa', 500);
  }
};

Deno.serve(handler);

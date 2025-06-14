
import { validateAuthToken } from '../../_shared/auth.ts';
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log('fidelity/get-user-balance function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));

    console.log('Fetching fidelity balance for user:', user.id);

    // Buscar saldo de pontos usando a função do banco
    const { data: balanceData, error: balanceError } = await supabase
      .rpc('get_user_points_balance', { user_id_param: user.id });

    if (balanceError) {
      console.error('Error fetching balance:', balanceError);
      return errorResponse('Erro ao buscar saldo de pontos', 500);
    }

    // Buscar histórico de pontos
    const { data: pointsHistory, error: historyError } = await supabase
      .from('fidelity_points')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (historyError) {
      console.error('Error fetching points history:', historyError);
      return errorResponse('Erro ao buscar histórico de pontos', 500);
    }

    // Buscar resgates
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('fidelity_redemptions')
      .select(`
        *,
        fidelity_rewards (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (redemptionsError) {
      console.error('Error fetching redemptions:', redemptionsError);
      return errorResponse('Erro ao buscar resgates', 500);
    }

    const result = {
      balance: balanceData || 0,
      pointsHistory: pointsHistory || [],
      redemptions: redemptions || []
    };

    console.log('Fidelity data fetched successfully');
    return successResponse(result);

  } catch (error: any) {
    console.error('Error in get-user-balance function:', error);
    return errorResponse(error.message || 'Erro ao buscar dados de fidelidade', 500);
  }
};

Deno.serve(handler);

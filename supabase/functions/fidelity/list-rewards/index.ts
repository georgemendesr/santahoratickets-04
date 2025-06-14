
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log('fidelity/list-rewards function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return errorResponse('Configuração do Supabase não encontrada', 500);
    }

    // Buscar recompensas ativas (não precisa de autenticação)
    const response = await fetch(`${supabaseUrl}/rest/v1/fidelity_rewards?active=eq.true&order=points_required.asc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      console.error('Error fetching rewards:', await response.text());
      return errorResponse('Erro ao buscar recompensas', 500);
    }

    const rewards = await response.json();
    console.log('Rewards fetched successfully:', rewards.length);

    return successResponse(rewards);

  } catch (error: any) {
    console.error('Error in list-rewards function:', error);
    return errorResponse('Erro ao buscar recompensas', 500);
  }
};

Deno.serve(handler);

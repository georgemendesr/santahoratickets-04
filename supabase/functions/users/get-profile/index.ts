
import { validateAuthToken } from '../../_shared/auth.ts';
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log('users/get-profile function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));

    console.log('Fetching profile for user:', user.id);

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return errorResponse('Erro ao buscar perfil do usuário', 500);
    }

    // Buscar role do usuário
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const userRole = roleData?.role || 'user';

    const profileWithRole = {
      ...profile,
      email: user.email,
      role: userRole
    };

    console.log('Profile fetched successfully');

    return successResponse(profileWithRole);

  } catch (error: any) {
    console.error('Error in get-profile function:', error);
    return errorResponse(error.message || 'Erro ao buscar perfil', 500);
  }
};

Deno.serve(handler);

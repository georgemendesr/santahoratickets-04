
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const createAuthenticatedClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

export const validateAuthToken = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error('Token de autorização não fornecido');
  }

  const supabase = createAuthenticatedClient();
  const jwt = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(jwt);

  if (error || !user) {
    throw new Error('Usuário não autorizado');
  }

  return { user, supabase };
};

export const validateAdminRole = async (supabase: any, userId: string) => {
  const { data: roleData, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || roleData?.role !== 'admin') {
    throw new Error('Acesso negado: permissões de administrador necessárias');
  }

  return true;
};

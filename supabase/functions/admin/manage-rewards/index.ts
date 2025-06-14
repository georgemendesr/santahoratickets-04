
import { validateAuthToken, validateAdminRole } from '../../_shared/auth.ts';
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';
import { validateRequiredFields } from '../../_shared/validation.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log('admin/manage-rewards function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));
    await validateAdminRole(supabase, user.id);

    if (req.method === 'GET') {
      // Listar todas as recompensas para admin
      const { data: rewards, error } = await supabase
        .from('fidelity_rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rewards:', error);
        return errorResponse('Erro ao buscar recompensas', 500);
      }

      return successResponse(rewards);
    }

    if (req.method === 'POST') {
      // Criar nova recompensa
      const body = await req.json();
      console.log('Creating reward:', body);

      validateRequiredFields(body, ['name', 'description', 'points_required']);

      const { data: reward, error } = await supabase
        .from('fidelity_rewards')
        .insert([
          {
            name: body.name,
            description: body.description,
            points_required: body.points_required,
            available_units: body.available_units || null,
            total_units: body.available_units || null,
            icon: body.icon || 'gift',
            active: body.active !== false
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating reward:', error);
        return errorResponse('Erro ao criar recompensa', 500);
      }

      console.log('Reward created successfully:', reward.id);
      return successResponse(reward);
    }

    if (req.method === 'PUT') {
      // Atualizar recompensa existente
      const body = await req.json();
      console.log('Updating reward:', body);

      validateRequiredFields(body, ['id']);

      const updateData: any = {};
      if (body.name) updateData.name = body.name;
      if (body.description) updateData.description = body.description;
      if (body.points_required) updateData.points_required = body.points_required;
      if (body.available_units !== undefined) updateData.available_units = body.available_units;
      if (body.icon) updateData.icon = body.icon;
      if (body.active !== undefined) updateData.active = body.active;

      const { data: reward, error } = await supabase
        .from('fidelity_rewards')
        .update(updateData)
        .eq('id', body.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reward:', error);
        return errorResponse('Erro ao atualizar recompensa', 500);
      }

      console.log('Reward updated successfully:', reward.id);
      return successResponse(reward);
    }

    return errorResponse('Método não permitido', 405);

  } catch (error: any) {
    console.error('Error in manage-rewards function:', error);
    return errorResponse(error.message || 'Erro ao gerenciar recompensas', 500);
  }
};

Deno.serve(handler);

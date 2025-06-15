
import { corsHeaders, successResponse, errorResponse, handleCors } from '../../_shared/responses.ts';
import { validateAuthToken } from '../../_shared/auth.ts';

const handler = async (req: Request): Promise<Response> => {
  console.log('referrals/create-referral function called');

  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    const { user, supabase } = await validateAuthToken(req.headers.get('Authorization'));
    const { eventId } = await req.json();

    console.log('Creating referral for:', { eventId, userId: user.id });

    // Verificar se já existe um referral para este usuário e evento
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .eq('event_id', eventId)
      .single();

    if (existingReferral) {
      console.log('Referral already exists:', existingReferral.code);
      return successResponse(existingReferral);
    }

    // Gerar código único
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const { data: generatedCode, error: codeError } = await supabase
        .rpc('generate_unique_referral_code');

      if (codeError || !generatedCode) {
        throw new Error('Erro ao gerar código único');
      }

      code = generatedCode;

      // Verificar se o código é único
      const { data: existingCode } = await supabase
        .from('referrals')
        .select('id')
        .eq('code', code)
        .single();

      isUnique = !existingCode;
      attempts++;
    } while (!isUnique && attempts < maxAttempts);

    if (!isUnique) {
      throw new Error('Não foi possível gerar um código único');
    }

    // Criar o referral
    const { data: newReferral, error: createError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: user.id,
        event_id: eventId,
        code: code,
        used_count: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating referral:', createError);
      throw new Error('Erro ao criar código de convite');
    }

    console.log('Referral created successfully:', newReferral.code);
    return successResponse(newReferral);

  } catch (error: any) {
    console.error('Error in create-referral function:', error);
    return errorResponse(error.message || 'Erro ao criar código de convite', 500);
  }
};

Deno.serve(handler);

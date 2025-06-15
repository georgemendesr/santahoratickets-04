
-- Criar função para gerar códigos únicos de referral se não existir
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT[] := '{A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,2,3,4,5,6,7,8,9}';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Atualizar tabela referrals se necessário (adicionar campos que podem faltar)
ALTER TABLE public.referrals 
  ADD COLUMN IF NOT EXISTS code TEXT,
  ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;

-- Garantir que códigos sejam únicos
CREATE UNIQUE INDEX IF NOT EXISTS referrals_code_unique ON public.referrals(code);

-- Criar tabela de usos de referrals se não existir
CREATE TABLE IF NOT EXISTS public.referral_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.referrals(id),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS para referral_uses
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

-- Políticas para referral_uses
DROP POLICY IF EXISTS "Usuários podem ver seus próprios usos de referral" ON public.referral_uses;
CREATE POLICY "Usuários podem ver seus próprios usos de referral"
  ON public.referral_uses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar usos de referral" ON public.referral_uses;
CREATE POLICY "Usuários podem criar usos de referral"
  ON public.referral_uses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas atualizadas para referrals
DROP POLICY IF EXISTS "Usuários podem ver referrals" ON public.referrals;
CREATE POLICY "Usuários podem ver referrals"
  ON public.referrals
  FOR SELECT
  TO authenticated
  USING (true); -- Todos podem ver para validar códigos

DROP POLICY IF EXISTS "Usuários podem criar seus próprios referrals" ON public.referrals;
CREATE POLICY "Usuários podem criar seus próprios referrals"
  ON public.referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios referrals" ON public.referrals;
CREATE POLICY "Usuários podem atualizar seus próprios referrals"
  ON public.referrals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_id);

-- Função para processar uso de referral e atribuir pontos
CREATE OR REPLACE FUNCTION public.process_referral_reward(
  p_referrer_id UUID,
  p_referred_id UUID,
  p_event_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Adicionar pontos para quem indicou (100 pontos)
  INSERT INTO public.fidelity_points (
    user_id,
    points,
    source,
    reference_id,
    description
  ) VALUES (
    p_referrer_id,
    100,
    'referral_reward',
    p_event_id,
    'Pontos por indicação bem-sucedida'
  );

  -- Adicionar pontos para quem foi indicado (50 pontos)
  INSERT INTO public.fidelity_points (
    user_id,
    points,
    source,
    reference_id,
    description
  ) VALUES (
    p_referred_id,
    50,
    'referral_bonus',
    p_event_id,
    'Bônus por usar código de indicação'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Verificar se as tabelas de fidelidade já existem e criar as que faltam
-- Tabela de recompensas (se não existir)
CREATE TABLE IF NOT EXISTS public.fidelity_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  available_units INTEGER,
  total_units INTEGER,
  image_url TEXT,
  icon TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabela de resgates (se não existir)
CREATE TABLE IF NOT EXISTS public.fidelity_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.fidelity_rewards(id),
  points_used INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Inserir algumas recompensas de exemplo se a tabela estiver vazia
INSERT INTO public.fidelity_rewards (name, description, points_required, available_units, total_units, icon, active)
SELECT 
  'Camiseta Exclusiva', 
  'Camiseta oficial do evento com design exclusivo', 
  200, 
  50, 
  50, 
  'gift', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.fidelity_rewards WHERE name = 'Camiseta Exclusiva');

INSERT INTO public.fidelity_rewards (name, description, points_required, available_units, total_units, icon, active)
SELECT 
  'Desconto 10%', 
  'Cupom de 10% de desconto no próximo evento', 
  100, 
  100, 
  100, 
  'award', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.fidelity_rewards WHERE name = 'Desconto 10%');

INSERT INTO public.fidelity_rewards (name, description, points_required, available_units, total_units, icon, active)
SELECT 
  'Acesso VIP', 
  'Acesso à área VIP em eventos selecionados', 
  500, 
  20, 
  20, 
  'star', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.fidelity_rewards WHERE name = 'Acesso VIP');

INSERT INTO public.fidelity_rewards (name, description, points_required, available_units, total_units, icon, active)
SELECT 
  'Brinde Especial', 
  'Kit com brindes exclusivos do evento', 
  150, 
  30, 
  30, 
  'gift', 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.fidelity_rewards WHERE name = 'Brinde Especial');

-- Habilitar RLS para as tabelas
ALTER TABLE public.fidelity_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fidelity_redemptions ENABLE ROW LEVEL SECURITY;

-- Políticas para fidelity_rewards (público para leitura)
DROP POLICY IF EXISTS "Recompensas são visíveis para todos" ON public.fidelity_rewards;
CREATE POLICY "Recompensas são visíveis para todos"
  ON public.fidelity_rewards
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Políticas para fidelity_redemptions (usuários só veem seus próprios resgates)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios resgates" ON public.fidelity_redemptions;
CREATE POLICY "Usuários podem ver seus próprios resgates"
  ON public.fidelity_redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar resgates" ON public.fidelity_redemptions;
CREATE POLICY "Usuários podem criar resgates"
  ON public.fidelity_redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_fidelity_rewards_updated_at ON public.fidelity_rewards;
CREATE TRIGGER update_fidelity_rewards_updated_at
    BEFORE UPDATE ON public.fidelity_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fidelity_redemptions_updated_at ON public.fidelity_redemptions;
CREATE TRIGGER update_fidelity_redemptions_updated_at
    BEFORE UPDATE ON public.fidelity_redemptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

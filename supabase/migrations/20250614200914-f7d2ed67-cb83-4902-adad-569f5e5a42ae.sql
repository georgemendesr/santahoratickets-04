
-- Criar tabela para histórico de pontos de fidelidade
CREATE TABLE public.fidelity_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('purchase', 'referral', 'manual', 'bonus')),
  reference_id UUID, -- ID da compra, referral, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Criar tabela para recompensas cadastráveis
CREATE TABLE public.fidelity_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  available_units INTEGER, -- NULL = ilimitado
  total_units INTEGER, -- Total original para controle
  icon TEXT, -- URL da imagem ou nome do ícone
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Criar tabela para resgates de recompensas
CREATE TABLE public.fidelity_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.fidelity_rewards(id),
  points_used INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.fidelity_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fidelity_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fidelity_redemptions ENABLE ROW LEVEL SECURITY;

-- Políticas para fidelity_points
CREATE POLICY "Users can view their own fidelity points"
  ON public.fidelity_points
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all fidelity points"
  ON public.fidelity_points
  FOR SELECT
  USING (public.current_user_has_role('admin'));

CREATE POLICY "System can insert fidelity points"
  ON public.fidelity_points
  FOR INSERT
  WITH CHECK (true); -- Será controlado pelas Edge Functions

-- Políticas para fidelity_rewards
CREATE POLICY "Everyone can view active rewards"
  ON public.fidelity_rewards
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage rewards"
  ON public.fidelity_rewards
  FOR ALL
  USING (public.current_user_has_role('admin'));

-- Políticas para fidelity_redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.fidelity_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own redemptions"
  ON public.fidelity_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.fidelity_redemptions
  FOR SELECT
  USING (public.current_user_has_role('admin'));

CREATE POLICY "Admins can update redemptions"
  ON public.fidelity_redemptions
  FOR UPDATE
  USING (public.current_user_has_role('admin'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fidelity_rewards_updated_at 
  BEFORE UPDATE ON public.fidelity_rewards 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_fidelity_redemptions_updated_at 
  BEFORE UPDATE ON public.fidelity_redemptions 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Função para calcular saldo total de pontos de um usuário
CREATE OR REPLACE FUNCTION public.get_user_points_balance(user_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT SUM(points) FROM public.fidelity_points WHERE user_id = user_id_param) -
    (SELECT COALESCE(SUM(points_used), 0) FROM public.fidelity_redemptions WHERE user_id = user_id_param AND status != 'cancelled'),
    0
  );
$$;

-- Trigger para criar pontos automáticos quando pagamento for aprovado
CREATE OR REPLACE FUNCTION public.create_fidelity_points_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  points_to_add INTEGER;
  reais_per_point NUMERIC := 5.0; -- R$ 5,00 = 1 ponto (configurável)
BEGIN
  -- Só processa se o pagamento for aprovado e não foi processado antes
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Calcula pontos baseado no valor total
    points_to_add := FLOOR(NEW.total_amount / reais_per_point);
    
    -- Só adiciona se houver pontos para adicionar
    IF points_to_add > 0 THEN
      INSERT INTO public.fidelity_points (
        user_id,
        points,
        source,
        reference_id,
        description
      ) VALUES (
        NEW.user_id,
        points_to_add,
        'purchase',
        NEW.id,
        'Pontos ganhos na compra de ingressos'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Aplicar trigger na tabela payment_preferences
CREATE TRIGGER create_fidelity_points_trigger
  AFTER UPDATE ON public.payment_preferences
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_fidelity_points_on_payment();

-- Inserir algumas recompensas de exemplo
INSERT INTO public.fidelity_rewards (name, description, points_required, available_units, total_units, icon, active) VALUES
('Drink Cortesia', 'Um drink grátis em qualquer evento', 100, 50, 50, 'gift', true),
('Cupom 10% OFF', 'Desconto de 10% na próxima compra', 150, NULL, NULL, 'badge-percent', true),
('Ingresso VIP', 'Upgrade para área VIP em evento selecionado', 500, 10, 10, 'star', true),
('Meet & Greet', 'Encontro exclusivo com artistas', 1000, 5, 5, 'award', true);

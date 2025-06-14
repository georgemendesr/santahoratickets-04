
-- ================================
-- HABILITANDO RLS EM TODAS AS TABELAS
-- ================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_uses ENABLE ROW LEVEL SECURITY;

-- ================================
-- FUNÇÃO AUXILIAR PARA VERIFICAR ROLES
-- ================================

-- Função para verificar se o usuário atual tem um role específico
-- Evita recursão infinita usando SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.current_user_has_role(required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = required_role
  );
$$;

-- ================================
-- POLICIES PARA USER_PROFILES
-- ================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- Usuários podem criar seu próprio perfil
CREATE POLICY "Users can create own profile" 
ON public.user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (id = auth.uid());

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.user_profiles FOR SELECT 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA USER_ROLES
-- ================================

-- Usuários podem ver apenas seu próprio role
CREATE POLICY "Users can view own role" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Apenas admins podem gerenciar roles
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (public.current_user_has_role('admin'))
WITH CHECK (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA EVENTS
-- ================================

-- Todos podem visualizar eventos publicados
CREATE POLICY "Anyone can view published events" 
ON public.events FOR SELECT 
TO authenticated 
USING (status = 'published');

-- Usuários anônimos também podem ver eventos publicados
CREATE POLICY "Anonymous can view published events" 
ON public.events FOR SELECT 
TO anon 
USING (status = 'published');

-- Apenas admins podem criar, editar ou deletar eventos
CREATE POLICY "Admins can manage events" 
ON public.events FOR ALL 
TO authenticated 
USING (public.current_user_has_role('admin'))
WITH CHECK (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA BATCHES
-- ================================

-- Todos podem visualizar lotes de eventos publicados
CREATE POLICY "Anyone can view event batches" 
ON public.batches FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = batches.event_id 
    AND events.status = 'published'
  )
);

-- Usuários anônimos também podem ver lotes
CREATE POLICY "Anonymous can view event batches" 
ON public.batches FOR SELECT 
TO anon 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = batches.event_id 
    AND events.status = 'published'
  )
);

-- Apenas admins podem gerenciar lotes
CREATE POLICY "Admins can manage batches" 
ON public.batches FOR ALL 
TO authenticated 
USING (public.current_user_has_role('admin'))
WITH CHECK (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA TICKETS
-- ================================

-- Usuários podem ver apenas seus próprios tickets
CREATE POLICY "Users can view own tickets" 
ON public.tickets FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Sistema pode criar tickets (para processos de pagamento)
CREATE POLICY "System can create tickets" 
ON public.tickets FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Apenas admins podem ver todos os tickets
CREATE POLICY "Admins can view all tickets" 
ON public.tickets FOR SELECT 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- Admins podem atualizar tickets (para check-in)
CREATE POLICY "Admins can update tickets" 
ON public.tickets FOR UPDATE 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA TICKET_PARTICIPANTS
-- ================================

-- Usuários podem ver participantes dos seus tickets
CREATE POLICY "Users can view own ticket participants" 
ON public.ticket_participants FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_participants.ticket_id 
    AND tickets.user_id = auth.uid()
  )
);

-- Usuários podem adicionar participantes aos seus tickets
CREATE POLICY "Users can add participants to own tickets" 
ON public.ticket_participants FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets 
    WHERE tickets.id = ticket_participants.ticket_id 
    AND tickets.user_id = auth.uid()
  )
);

-- Admins podem ver todos os participantes
CREATE POLICY "Admins can view all participants" 
ON public.ticket_participants FOR ALL 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA PAYMENT_PREFERENCES
-- ================================

-- Usuários podem ver apenas seus próprios pagamentos
CREATE POLICY "Users can view own payments" 
ON public.payment_preferences FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Usuários podem criar seus próprios pagamentos
CREATE POLICY "Users can create own payments" 
ON public.payment_preferences FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Sistema pode atualizar status de pagamentos (webhooks)
CREATE POLICY "System can update payment status" 
ON public.payment_preferences FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Admins podem ver todos os pagamentos
CREATE POLICY "Admins can view all payments" 
ON public.payment_preferences FOR SELECT 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA SAVED_CARDS
-- ================================

-- Usuários podem gerenciar apenas seus próprios cartões
CREATE POLICY "Users can manage own cards" 
ON public.saved_cards FOR ALL 
TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ================================
-- POLICIES PARA LOYALTY_POINTS_HISTORY
-- ================================

-- Usuários podem ver apenas seu próprio histórico
CREATE POLICY "Users can view own points history" 
ON public.loyalty_points_history FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Sistema pode adicionar pontos
CREATE POLICY "System can add points" 
ON public.loyalty_points_history FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Admins podem ver todo o histórico
CREATE POLICY "Admins can view all points history" 
ON public.loyalty_points_history FOR SELECT 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA REWARDS
-- ================================

-- Todos podem ver recompensas ativas
CREATE POLICY "Anyone can view active rewards" 
ON public.rewards FOR SELECT 
TO authenticated 
USING (active = true);

-- Apenas admins podem gerenciar recompensas
CREATE POLICY "Admins can manage rewards" 
ON public.rewards FOR ALL 
TO authenticated 
USING (public.current_user_has_role('admin'))
WITH CHECK (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA REWARD_REDEMPTIONS
-- ================================

-- Usuários podem ver apenas seus próprios resgates
CREATE POLICY "Users can view own redemptions" 
ON public.reward_redemptions FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Usuários podem criar seus próprios resgates
CREATE POLICY "Users can create own redemptions" 
ON public.reward_redemptions FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Admins podem ver e gerenciar todos os resgates
CREATE POLICY "Admins can manage all redemptions" 
ON public.reward_redemptions FOR ALL 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA REFERRALS
-- ================================

-- Usuários podem ver apenas suas próprias indicações
CREATE POLICY "Users can view own referrals" 
ON public.referrals FOR SELECT 
TO authenticated 
USING (referrer_id = auth.uid());

-- Usuários podem criar suas próprias indicações
CREATE POLICY "Users can create own referrals" 
ON public.referrals FOR INSERT 
TO authenticated 
WITH CHECK (referrer_id = auth.uid());

-- Admins podem ver todas as indicações
CREATE POLICY "Admins can view all referrals" 
ON public.referrals FOR SELECT 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- POLICIES PARA REFERRAL_USES
-- ================================

-- Sistema pode registrar uso de indicações
CREATE POLICY "System can record referral uses" 
ON public.referral_uses FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Usuários podem ver indicações que usaram
CREATE POLICY "Users can view own referral uses" 
ON public.referral_uses FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Proprietários de indicações podem ver usos
CREATE POLICY "Referrers can view their referral uses" 
ON public.referral_uses FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.referrals 
    WHERE referrals.id = referral_uses.referral_id 
    AND referrals.referrer_id = auth.uid()
  )
);

-- Admins podem ver todos os usos
CREATE POLICY "Admins can view all referral uses" 
ON public.referral_uses FOR SELECT 
TO authenticated 
USING (public.current_user_has_role('admin'));

-- ================================
-- COMENTÁRIOS FINAIS
-- ================================

-- Estas políticas garantem que:
-- 1. Usuários só acessam seus próprios dados
-- 2. Admins têm acesso completo para gestão
-- 3. Dados públicos (eventos publicados) são acessíveis
-- 4. Sistema pode funcionar via triggers e funções
-- 5. Validação de tickets é possível mantendo segurança

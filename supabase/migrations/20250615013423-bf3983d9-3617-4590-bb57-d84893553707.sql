
-- Primeiro, criar a constraint única na tabela user_roles
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Agora promover o primeiro usuário a administrador
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Buscar o primeiro usuário criado (você)
    SELECT id INTO first_user_id 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se encontrou um usuário, criar/atualizar seu role para admin
    IF first_user_id IS NOT NULL THEN
        -- Inserir ou atualizar o role do usuário para admin
        INSERT INTO public.user_roles (user_id, role)
        VALUES (first_user_id, 'admin')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin';
        
        RAISE NOTICE 'Usuário % promovido a administrador', first_user_id;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado';
    END IF;
END $$;

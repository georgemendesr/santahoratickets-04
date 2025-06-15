
-- Promover o primeiro usuário (você) para administrador novamente
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Buscar o primeiro usuário criado
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

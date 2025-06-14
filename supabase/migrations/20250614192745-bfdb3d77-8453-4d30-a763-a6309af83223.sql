
-- Adicionar campos para controle de check-in na tabela tickets
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS check_in_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS checked_in_by uuid;

-- Criar índice para melhorar performance nas consultas de validação
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_used ON tickets(used);

-- Comentários para documentar os novos campos
COMMENT ON COLUMN tickets.check_in_time IS 'Timestamp quando o ingresso foi validado/usado';
COMMENT ON COLUMN tickets.checked_in_by IS 'ID do usuário que fez a validação (admin/staff)';

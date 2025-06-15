
-- Adicionar a coluna batch_id na tabela tickets para associar ingressos aos lotes
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS batch_id uuid;

-- Adicionar uma referência foreign key opcional para os batches
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_batch_id 
FOREIGN KEY (batch_id) REFERENCES batches(id);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_tickets_batch_id ON tickets(batch_id);

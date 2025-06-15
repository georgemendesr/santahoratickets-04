
-- Add check-in fields to tickets table if they don't exist
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS check_in_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS checked_in_by uuid;

-- Add index for better performance on QR code lookups
CREATE INDEX IF NOT EXISTS idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_used ON tickets(used);

-- Comments for documentation
COMMENT ON COLUMN tickets.check_in_time IS 'Timestamp when the ticket was validated/used';
COMMENT ON COLUMN tickets.checked_in_by IS 'ID of the user who performed the validation (admin/staff)';

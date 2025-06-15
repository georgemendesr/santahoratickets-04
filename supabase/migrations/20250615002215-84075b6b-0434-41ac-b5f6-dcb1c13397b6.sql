
-- Add participant information to tickets table (only if columns don't exist)
DO $$ 
BEGIN
    -- Add participant_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'participant_name'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN participant_name TEXT;
    END IF;
    
    -- Add participant_email if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'participant_email'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN participant_email TEXT;
    END IF;
    
    -- Add order_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'order_id'
    ) THEN
        ALTER TABLE public.tickets ADD COLUMN order_id UUID;
    END IF;
END $$;

-- Update payment preferences to include batch_id for better tracking (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_preferences' AND column_name = 'batch_id'
    ) THEN
        ALTER TABLE public.payment_preferences ADD COLUMN batch_id UUID REFERENCES public.batches(id);
    END IF;
END $$;

-- Ensure RLS is enabled for ticket_participants (safe to run multiple times)
ALTER TABLE public.ticket_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view participants of their tickets" ON public.ticket_participants;
DROP POLICY IF EXISTS "Users can insert participants for their tickets" ON public.ticket_participants;

-- Create policies for ticket participants
CREATE POLICY "Users can view participants of their tickets"
  ON public.ticket_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_participants.ticket_id
      AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert participants for their tickets"
  ON public.ticket_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_participants.ticket_id
      AND t.user_id = auth.uid()
    )
  );

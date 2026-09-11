-- 10. NOTIFICATIONS TABLE (Realtime Agri Alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
    link_tab VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full on notifications" ON public.notifications;
CREATE POLICY "Allow full on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Seed initial genuine notification for platform activation
INSERT INTO public.notifications (title, message, type, link_tab, read)
VALUES 
  ('MSAMB APMC Linkage Active', 'Connected to Maharashtra State Agricultural Marketing Board network. 590+ APMC mandis live.', 'SYSTEM', 'intelligence', false),
  ('Realtime Nodal Escrow Online', 'Statutory digital escrow settlement protocol active under Maharashtra APMC Act.', 'ESCROW', 'contracts', false)
ON CONFLICT DO NOTHING;

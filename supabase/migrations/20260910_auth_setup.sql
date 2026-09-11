-- AgroConnect Supabase Auth & Users Profile Sync
-- Smart India Hackathon 2026 - Problem Statement ID: 26132

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;

-- Enable RLS on users with complete select/insert/update policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on users" ON public.users;
CREATE POLICY "Allow public read on users" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert on users" ON public.users;
CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on users" ON public.users;
CREATE POLICY "Allow public update on users" ON public.users FOR UPDATE USING (true) WITH CHECK (true);

-- Ensure all transactional tables have full read/write policies
DROP POLICY IF EXISTS "Allow write on produce lots" ON public.produce_lots;
DROP POLICY IF EXISTS "Allow full access to produce lots" ON public.produce_lots;
CREATE POLICY "Allow full access to produce lots" ON public.produce_lots FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to rfqs" ON public.rfqs;
CREATE POLICY "Allow full access to rfqs" ON public.rfqs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to rfq messages" ON public.rfq_messages;
CREATE POLICY "Allow full access to rfq messages" ON public.rfq_messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to contracts" ON public.contracts;
CREATE POLICY "Allow full access to contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to escrow payments" ON public.escrow_payments;
CREATE POLICY "Allow full access to escrow payments" ON public.escrow_payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to disputes" ON public.disputes;
CREATE POLICY "Allow full access to disputes" ON public.disputes FOR ALL USING (true) WITH CHECK (true);

-- Auto-provision public profile trigger when user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, phone, name, role, district, state, kyc_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', new.phone, '98' || lpad(floor(random()*100000000)::text, 8, '0')),
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'FARMER'),
    COALESCE(new.raw_user_meta_data->>'district', 'Nashik'),
    'Maharashtra',
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET auth_user_id = EXCLUDED.auth_user_id,
      name = COALESCE(EXCLUDED.name, public.users.name),
      role = COALESCE(EXCLUDED.role, public.users.role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

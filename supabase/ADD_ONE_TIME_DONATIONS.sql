-- =====================================================
--  RUN THIS FILE IN SUPABASE SQL EDITOR
--  Creates the one_time_donations table
-- =====================================================

CREATE TABLE public.one_time_donations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  amount          INTEGER NOT NULL DEFAULT 12000,
  message         TEXT,
  donated_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.one_time_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record donation"
  ON public.one_time_donations FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view donations"
  ON public.one_time_donations FOR SELECT USING (true);

CREATE POLICY "Admins update donations"
  ON public.one_time_donations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete donations"
  ON public.one_time_donations FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

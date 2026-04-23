
-- ============ MONTHLY DONORS ============
CREATE TABLE public.monthly_donors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT,
  phone            TEXT,
  amount           INTEGER NOT NULL,
  last_payment_date DATE,
  next_reminder_date DATE NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.monthly_donors ENABLE ROW LEVEL SECURITY;

-- Anyone can register themselves as a monthly donor
CREATE POLICY "Anyone can register as donor"
  ON public.monthly_donors FOR INSERT WITH CHECK (true);

-- Only admins can read, update, or delete donor records
CREATE POLICY "Admins manage monthly donors"
  ON public.monthly_donors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_monthly_donors_reminder ON public.monthly_donors(next_reminder_date) WHERE is_active = true;

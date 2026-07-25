-- ============================================================
-- DesiDiabetiCoach — Medications, Schedules & A1C
-- Migration: 002_medications_a1c.sql
-- Adds tables needed for spec §5.3 (A1C tracking) and §5.4
-- (structured medication management) beyond the ad-hoc
-- medication_logs table from 001_initial_schema.sql.
-- Run: supabase db push (staging/prod) | applied automatically in local dev
-- ============================================================

-- ─── A1C LAB LOGS ──────────────────────────────────────────────
CREATE TABLE public.a1c_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  test_date       DATE NOT NULL,
  value           NUMERIC(3,1) NOT NULL CHECK (value BETWEEN 3.0 AND 15.0),
  lab_name        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_a1c_logs_user_date ON public.a1c_logs(user_id, test_date DESC);

-- ─── STRUCTURED MEDICATIONS (distinct from the ad-hoc medication_logs) ──
CREATE TABLE public.medications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  dose_value      NUMERIC(6,2) NOT NULL,
  dose_unit       TEXT NOT NULL CHECK (dose_unit IN ('mg', 'units', 'mcg')),
  frequency       TEXT NOT NULL CHECK (frequency IN (
                    'once_daily', 'twice_daily', 'three_times_daily',
                    'with_meals', 'at_bedtime', 'as_needed'
                  )),
  is_insulin      BOOLEAN DEFAULT false,
  start_date      DATE NOT NULL,
  end_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_user ON public.medications(user_id) WHERE end_date IS NULL;

-- ─── MEDICATION SCHEDULES (scheduled dose times per medication) ────────
CREATE TABLE public.medication_schedules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_id   UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time  TIME NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── UNIQUE NAME ON FOODS (supports idempotent seeding via upsert) ─────
ALTER TABLE public.foods ADD CONSTRAINT foods_name_en_key UNIQUE (name_en);

-- ─── ADDITIONAL ONBOARDING FIELDS ON user_profiles (spec §5.1) ─────────
-- 001_initial_schema.sql didn't include these; added here rather than
-- editing the existing migration, per the "never edit existing migrations"
-- rule.
ALTER TABLE public.user_profiles
  ADD COLUMN target_bg_fasting_min   INT DEFAULT 80,
  ADD COLUMN target_bg_fasting_max   INT DEFAULT 130,
  ADD COLUMN target_bg_post_meal_max INT DEFAULT 180,
  ADD COLUMN cuisine_preference      TEXT CHECK (cuisine_preference IN (
                                      'south_indian', 'north_indian', 'sri_lankan',
                                      'bangladeshi', 'pakistani', 'mixed'
                                    )),
  ADD COLUMN dietary_restriction     TEXT CHECK (dietary_restriction IN (
                                      'vegetarian', 'vegan', 'jain', 'halal', 'none'
                                    )),
  ADD COLUMN units_preference        TEXT DEFAULT 'mg/dL' CHECK (units_preference IN ('mg/dL', 'mmol/L'));

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.a1c_logs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_schedules  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their A1C logs"
  ON public.a1c_logs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their medications"
  ON public.medications FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their medication schedules"
  ON public.medication_schedules FOR ALL
  USING (medication_id IN (SELECT id FROM public.medications WHERE user_id = auth.uid()));

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTO-CREATE user_profiles ROW ON SIGNUP ───────────────────
-- 001_initial_schema.sql defines user_profiles but nothing populated it on
-- signup; without this, the onboarding wizard has no row to update.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── MEAL PHOTO STORAGE BUCKET (spec §5.5.1 — Supabase Storage) ────────
-- Private bucket; users can only read/write objects under their own
-- user-id-prefixed path (mobile uploads to `${userId}/${filename}`).
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users manage their own meal photos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'meal-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- DesiDiabetiCoach — Initial Schema
-- Migration: 001_initial_schema.sql
-- Run: supabase db reset (dev) | supabase db push (staging/prod)
-- ============================================================

-- Enable required extensions.
-- NOTE: primary keys use gen_random_uuid() (core Postgres 13+, resolved from
-- pg_catalog) rather than uuid-ossp's uuid_generate_v4(). Supabase installs
-- extensions into the `extensions` schema, which is not on the search_path
-- used by `supabase db push`, so the unqualified uuid_generate_v4() call
-- fails with "function does not exist" even though the extension is present.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS (extends Supabase auth.users) ─────────────────────
CREATE TABLE public.user_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  date_of_birth   DATE,
  gender          TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  diabetes_type   TEXT CHECK (diabetes_type IN ('type1', 'type2', 'prediabetes', 'gestational', 'unknown')),
  diagnosis_year  INT,
  -- South Asian specifics
  ethnicity       TEXT,  -- 'telugu', 'tamil', 'hindi', 'punjabi', 'gujarati', 'bengali', 'other'
  language_pref   TEXT DEFAULT 'en' CHECK (language_pref IN ('en', 'te', 'hi', 'ta', 'pa', 'gu')),
  country         TEXT DEFAULT 'US',
  city            TEXT,
  -- Health baseline
  height_cm       NUMERIC(5,1),
  weight_kg       NUMERIC(5,1),
  target_hba1c    NUMERIC(3,1) DEFAULT 7.0,
  daily_carb_goal INT DEFAULT 130,
  -- App settings
  onboarded_at    TIMESTAMPTZ,
  subscription    TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'coach', 'family')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SOUTH ASIAN FOOD DATABASE ───────────────────────────────
CREATE TABLE public.foods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Names
  name_en         TEXT NOT NULL,          -- English: "Masoor Dal"
  name_regional   TEXT,                   -- Regional: "Masur Dal" / "Paruppu"
  regional_lang   TEXT,                   -- 'te', 'hi', 'ta', etc.
  aliases         TEXT[],                 -- ["red lentil soup", "masur"]
  -- Classification
  category        TEXT NOT NULL,          -- 'breakfast', 'lunch', 'dinner', 'snack', 'sweet', 'drink'
  cuisine_region  TEXT[],                 -- ['south_indian', 'north_indian', 'pan_indian']
  is_vegetarian   BOOLEAN DEFAULT true,
  is_vegan        BOOLEAN DEFAULT false,
  -- Nutrition per standard serving
  serving_desc    TEXT NOT NULL,          -- "1 katori (150ml)"
  serving_g       NUMERIC(6,1),           -- grams
  carbs_g         NUMERIC(5,1) NOT NULL,
  protein_g       NUMERIC(5,1),
  fat_g           NUMERIC(5,1),
  fiber_g         NUMERIC(5,1),
  calories        INT,
  -- Diabetes-specific
  gi_score        INT CHECK (gi_score BETWEEN 0 AND 100),
  gi_category     TEXT GENERATED ALWAYS AS (
                    CASE
                      WHEN gi_score <= 55 THEN 'low'
                      WHEN gi_score <= 69 THEN 'medium'
                      ELSE 'high'
                    END
                  ) STORED,
  gl_score        NUMERIC(4,1),           -- Glycemic Load = (GI × carbs) / 100
  diabetic_notes  TEXT,                   -- "Safe in small portions", "Avoid — spikes BG"
  -- Metadata
  verified        BOOLEAN DEFAULT false,  -- Verified by nutritionist
  source          TEXT,                   -- Data source
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_foods_category ON public.foods(category);
CREATE INDEX idx_foods_gi ON public.foods(gi_score);
CREATE INDEX idx_foods_name ON public.foods USING gin(to_tsvector('english', name_en));

-- ─── MEAL LOGS ────────────────────────────────────────────────
CREATE TABLE public.meal_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  meal_type       TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'drink')),
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Glucose context
  bg_before       INT,                    -- mg/dL before meal
  bg_after_1h     INT,                    -- mg/dL 1 hour after
  bg_after_2h     INT,                    -- mg/dL 2 hours after
  -- Photo (stored in Supabase Storage)
  photo_url       TEXT,
  -- AI analysis
  ai_analysis     JSONB,                  -- Claude's meal analysis response
  -- Totals (computed from meal_items)
  total_carbs_g   NUMERIC(6,1),
  total_calories  INT,
  -- Notes
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, logged_at DESC);

-- ─── MEAL ITEMS (foods within a meal log) ─────────────────────
CREATE TABLE public.meal_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_log_id     UUID NOT NULL REFERENCES public.meal_logs(id) ON DELETE CASCADE,
  food_id         UUID REFERENCES public.foods(id),
  food_name_raw   TEXT,                   -- If not in DB, store as entered
  quantity        NUMERIC(5,2) DEFAULT 1,
  serving_unit    TEXT,                   -- 'katori', 'piece', 'cup', 'tablespoon'
  carbs_g         NUMERIC(5,1),
  calories        INT
);

-- ─── BLOOD GLUCOSE LOGS ──────────────────────────────────────
CREATE TABLE public.bg_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  value           INT NOT NULL,           -- mg/dL
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context         TEXT CHECK (context IN (
                    'fasting', 'before_breakfast', 'after_breakfast',
                    'before_lunch', 'after_lunch', 'before_dinner',
                    'after_dinner', 'bedtime', 'random'
                  )),
  notes           TEXT,
  device          TEXT                    -- 'manual', 'glucometer_brand_x'
);

CREATE INDEX idx_bg_logs_user_date ON public.bg_logs(user_id, logged_at DESC);

-- ─── MEDICATION LOGS ─────────────────────────────────────────
CREATE TABLE public.medication_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,          -- 'Metformin', 'Glipizide', 'Ozempic'
  dose_mg         NUMERIC(6,1),
  taken_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at    TIMESTAMPTZ,
  taken           BOOLEAN DEFAULT true,
  notes           TEXT
);

-- ─── AI COACH CONVERSATIONS ───────────────────────────────────
CREATE TABLE public.ai_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  session_id      UUID DEFAULT gen_random_uuid(),
  messages        JSONB NOT NULL DEFAULT '[]',  -- [{role, content, timestamp}]
  tokens_used     INT DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE public.user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bg_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations  ENABLE ROW LEVEL SECURITY;
-- Foods table is PUBLIC (no RLS — all users can read)

-- Users can only access their own data
CREATE POLICY "Users own their profile"
  ON public.user_profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users own their meal logs"
  ON public.meal_logs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their meal items"
  ON public.meal_items FOR ALL
  USING (meal_log_id IN (SELECT id FROM public.meal_logs WHERE user_id = auth.uid()));

CREATE POLICY "Users own their BG logs"
  ON public.bg_logs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their medication logs"
  ON public.medication_logs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their AI conversations"
  ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

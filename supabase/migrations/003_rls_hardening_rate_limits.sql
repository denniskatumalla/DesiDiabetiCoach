-- ============================================================
-- DesiDiabetiCoach — RLS hardening, rate limiting, missing indexes
-- Migration: 003_rls_hardening_rate_limits.sql
-- Run: supabase db push (staging/prod) | applied automatically in local dev
-- ============================================================

-- ─── FOODS: READ-ONLY THROUGH THE API ─────────────────────────
-- 001_initial_schema.sql left RLS off on `foods` with the comment "all users
-- can read". Disabling RLS does not make a table read-only: Supabase grants
-- anon and authenticated full CRUD on every table in `public`, and with RLS
-- off nothing filters those grants. Anyone holding the anon key — which ships
-- in the client bundle — could rewrite the curated GI/GL values the app uses
-- to advise on portions.
--
-- Enabling RLS with a SELECT-only policy restores the intended behaviour.
-- Seeding (scripts/seed-foods.ts) uses the service-role key, which bypasses
-- RLS, so it is unaffected.
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone may read foods"
  ON public.foods FOR SELECT
  USING (true);

-- ─── MISSING INDEXES ON HOT QUERY PATHS ───────────────────────
-- coach.latestSession filters by user_id and orders by updated_at DESC.
CREATE INDEX idx_ai_conversations_user_updated
  ON public.ai_conversations(user_id, updated_at DESC);

-- medications.recentLogs filters by user_id and ranges over taken_at.
CREATE INDEX idx_medication_logs_user_date
  ON public.medication_logs(user_id, taken_at DESC);

-- ─── RATE LIMITING FOR THE AI ENDPOINTS ───────────────────────
-- Both Claude calls (/api/coach and foodScan.scan) were unmetered, so a
-- single account could drive unbounded API spend. Redis is provisioned for
-- local dev but is not available on Vercel without extra infrastructure, so
-- the counter lives in Postgres: it is already present in every environment
-- and the upsert below is atomic under concurrency.
CREATE TABLE public.rate_limits (
  bucket_key    TEXT PRIMARY KEY,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hits          INT NOT NULL DEFAULT 0
);

-- No policies are defined: RLS is on and the table is reachable only through
-- the SECURITY DEFINER function below, so clients can neither read other
-- users' counters nor reset their own.
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

/**
 * Consume one unit from the caller's fixed window for `p_action`.
 * Returns true when the call is allowed, false when the window is exhausted.
 *
 * The whole read-modify-write happens inside a single INSERT ... ON CONFLICT,
 * so concurrent requests from the same user cannot both observe a stale count.
 */
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_action         TEXT,
  p_max_hits       INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_key  TEXT;
  v_hits INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  v_key := p_action || ':' || auth.uid()::text;

  INSERT INTO public.rate_limits AS rl (bucket_key, window_start, hits)
  VALUES (v_key, NOW(), 1)
  ON CONFLICT (bucket_key) DO UPDATE
    SET hits = CASE
                 WHEN rl.window_start < NOW() - make_interval(secs => p_window_seconds)
                 THEN 1
                 ELSE rl.hits + 1
               END,
        window_start = CASE
                 WHEN rl.window_start < NOW() - make_interval(secs => p_window_seconds)
                 THEN NOW()
                 ELSE rl.window_start
               END
  RETURNING rl.hits INTO v_hits;

  RETURN v_hits <= p_max_hits;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INT, INT) TO authenticated;

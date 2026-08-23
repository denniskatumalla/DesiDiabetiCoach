import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@desidiabeticoach/shared';

/**
 * Per-user rate limits for the two Anthropic-backed endpoints. Both were
 * previously unmetered, so one account could drive unbounded API spend.
 *
 * The counter lives in Postgres (`consume_rate_limit`, migration 003) rather
 * than the Redis in `infrastructure/dev/docker-compose.yml`: Redis is a
 * local-dev service only, while the database is present in every environment
 * and the function's upsert is atomic under concurrent requests.
 */
export const RATE_LIMITS = {
  /** Chat is interactive, so the window is short and fairly generous. */
  coach: { action: 'coach', maxHits: 20, windowSeconds: 60 },
  /** Vision calls cost roughly an order of magnitude more per request. */
  foodScan: { action: 'food_scan', maxHits: 30, windowSeconds: 3600 },
} as const;

export type RateLimit = (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS];

/**
 * Returns true when the call is within the caller's budget.
 *
 * Fails **open** on an unexpected database error: the limiter protects against
 * cost overrun, not abuse of authenticated data, so a transient Postgres
 * failure should not take the coach offline for everyone.
 */
export async function withinRateLimit(
  supabase: SupabaseClient<Database>,
  limit: RateLimit
): Promise<boolean> {
  const { data, error } = await supabase.rpc('consume_rate_limit', {
    p_action: limit.action,
    p_max_hits: limit.maxHits,
    p_window_seconds: limit.windowSeconds,
  });

  if (error) {
    console.error(`[rate-limit] ${limit.action} check failed, allowing request`, error);
    return true;
  }

  return data !== false;
}

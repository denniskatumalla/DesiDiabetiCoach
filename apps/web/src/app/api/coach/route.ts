import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  ABNORMAL_BG_ALERT_WINDOW_MS,
  BgContext,
  COACHING_DISCLAIMER,
  CoachChatInput,
  DiabetesType,
  LanguageCode,
  buildCoachContextBlock,
  buildCoachSystemPrompt,
  isAbnormalBg,
  type CoachHistoryTurn,
  type CoachingContext,
  type Database,
} from '@desidiabeticoach/shared';
import { createClient } from '@/lib/supabase/server';
import { getAnthropicClient, CLAUDE_MODEL } from '@/lib/anthropic';
import { RATE_LIMITS, withinRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const ABNORMAL_BG_BANNER =
  'Note: a recent reading was outside safe range — contact your healthcare provider or seek emergency care if symptomatic.\n\n';

/**
 * Streaming AI coaching chat — spec §5.6/§9.2. A plain Route Handler
 * (not tRPC) so the Anthropic `stream: true` response can be piped through
 * as it's generated, matching the spec's "no spinner wait" requirement.
 *
 * Authenticates via the web app's session cookie, or (for the mobile app,
 * which has no access to those cookies — see server/trpc.ts) an
 * `Authorization: Bearer <access_token>` header.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const supabase = bearerToken
    ? createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${bearerToken}` } },
      })
    : createClient();

  const {
    data: { user },
  } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = CoachChatInput.safeParse(await req.json());
  if (!body.success) {
    return new Response('Invalid request', { status: 400 });
  }

  if (!(await withinRateLimit(supabase, RATE_LIMITS.coach))) {
    return new Response('You are sending messages too quickly. Give your coach a moment.', {
      status: 429,
      headers: { 'Retry-After': String(RATE_LIMITS.coach.windowSeconds) },
    });
  }

  const [{ data: profile }, { data: bgLogs }, { data: mealLogs }, { data: medications }] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase
      .from('bg_logs')
      .select('value, context, logged_at')
      .eq('user_id', user.id)
      .gte('logged_at', new Date(Date.now() - 14 * 86400000).toISOString())
      .order('logged_at', { ascending: false }),
    supabase
      .from('meal_logs')
      .select('total_carbs_g, logged_at, meal_items(food_name_raw)')
      .eq('user_id', user.id)
      .gte('logged_at', new Date(Date.now() - 7 * 86400000).toISOString())
      .order('logged_at', { ascending: false }),
    supabase.from('medications').select('name, frequency').eq('user_id', user.id).is('end_date', null),
  ]);

  // These columns are TEXT + CHECK in Postgres, so the generated types widen
  // them to `string | null`. Re-narrow through the domain enums rather than
  // asserting: a legacy or hand-edited row falls back instead of sending an
  // out-of-range value into the coaching prompt.
  const language = LanguageCode.catch('en').parse(profile?.language_pref);
  const context: CoachingContext = {
    diabetesType: DiabetesType.catch('type2').parse(profile?.diabetes_type),
    a1cTarget: profile?.target_hba1c ?? 7.0,
    language,
    dietaryRestrictions: profile?.dietary_restriction ? [profile.dietary_restriction] : [],
    cuisinePreference: profile?.cuisine_preference ?? 'mixed',
    bgLogs14d: (bgLogs ?? []).map((b) => ({
      value: b.value,
      context: BgContext.catch('random').parse(b.context),
      timestamp: b.logged_at,
    })),
    mealLogs7d: (mealLogs ?? []).map((m) => ({
      foods: (m.meal_items ?? []).map((i: { food_name_raw: string | null }) => i.food_name_raw ?? 'unknown'),
      totalGl: m.total_carbs_g ?? 0,
      timestamp: m.logged_at,
    })),
    medications: (medications ?? []).map((m) => ({ name: m.name, frequency: m.frequency })),
  };

  const showBanner = hasRecentAbnormalBg(bgLogs ?? []);

  const anthropic = getAnthropicClient();
  const stream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 512,
    // A 2-4 sentence coaching reply does not benefit from the model's default
    // `high` effort, and this endpoint streams to a waiting user — so the
    // default costs latency the task never spends.
    thinking: { type: 'disabled' },
    output_config: { effort: 'low' },
    system: buildCoachSystemPrompt(language),
    messages: [
      ...toModelHistory(body.data.history),
      // The health context rides in the user turn, delimited as data, rather
      // than in the system prompt beside the safety guardrails — see
      // buildCoachSystemPrompt.
      { role: 'user', content: `${buildCoachContextBlock(context)}\n\n${body.data.message}` },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      if (showBanner) {
        controller.enqueue(encoder.encode(ABNORMAL_BG_BANNER));
      }
      stream.on('text', (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on('end', () => {
        // Appended here rather than requested in the system prompt: a
        // regulatory footer must not depend on the model remembering it, and
        // `max_tokens` can truncate a long reply before it arrives.
        controller.enqueue(encoder.encode(`\n\n${COACHING_DISCLAIMER}`));
        controller.close();
      });
      stream.on('error', (err) => controller.error(err));
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

/**
 * Spec §5.6.4 — the safety banner tracks the reading the user is looking at
 * now. Readings arrive newest-first; only the latest one counts, and only
 * while it is still current.
 */
function hasRecentAbnormalBg(bgLogs: { value: number; logged_at: string }[]): boolean {
  const latest = bgLogs[0];
  if (!latest || !isAbnormalBg(latest.value)) return false;

  const age = Date.now() - new Date(latest.logged_at).getTime();
  return age >= 0 && age <= ABNORMAL_BG_ALERT_WINDOW_MS;
}

/**
 * The Messages API requires the first turn to be `user`, so drop any leading
 * assistant turns (a client that trimmed its history mid-exchange can produce
 * them) before replaying the conversation.
 */
function toModelHistory(history: CoachHistoryTurn[]) {
  const start = history.findIndex((turn) => turn.role === 'user');
  if (start === -1) return [];
  return history.slice(start).map((turn) => ({ role: turn.role, content: turn.content }));
}

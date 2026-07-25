import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { buildCoachSystemPrompt, isAbnormalBg, type CoachingContext } from '@desidiabeticoach/shared';
import { createClient } from '@/lib/supabase/server';
import { getAnthropicClient, CLAUDE_MODEL } from '@/lib/anthropic';

export const runtime = 'nodejs';

const RequestBody = z.object({
  message: z.string().min(1).max(2000),
});

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
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${bearerToken}` } },
      })
    : createClient();

  const {
    data: { user },
  } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = RequestBody.safeParse(await req.json());
  if (!body.success) {
    return new Response('Invalid request', { status: 400 });
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

  const context: CoachingContext = {
    diabetesType: profile?.diabetes_type ?? 'type2',
    a1cTarget: profile?.target_hba1c ?? 7.0,
    language: profile?.language_pref ?? 'en',
    dietaryRestrictions: profile?.dietary_restriction ? [profile.dietary_restriction] : [],
    cuisinePreference: profile?.cuisine_preference ?? 'mixed',
    bgLogs14d: (bgLogs ?? []).map((b) => ({ value: b.value, context: b.context, timestamp: b.logged_at })),
    mealLogs7d: (mealLogs ?? []).map((m) => ({
      foods: (m.meal_items ?? []).map((i: { food_name_raw: string | null }) => i.food_name_raw ?? 'unknown'),
      totalGl: m.total_carbs_g ?? 0,
      timestamp: m.logged_at,
    })),
    medications: (medications ?? []).map((m) => ({ name: m.name, frequency: m.frequency })),
  };

  const recentAbnormal = (bgLogs ?? []).find((b) => isAbnormalBg(b.value));

  const anthropic = getAnthropicClient();
  const stream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 512,
    system: buildCoachSystemPrompt(context),
    messages: [{ role: 'user', content: body.data.message }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      if (recentAbnormal) {
        controller.enqueue(
          encoder.encode(
            'Note: a recent reading was outside safe range — contact your healthcare provider or seek emergency care if symptomatic.\n\n'
          )
        );
      }
      stream.on('text', (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on('end', () => controller.close());
      stream.on('error', (err) => controller.error(err));
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

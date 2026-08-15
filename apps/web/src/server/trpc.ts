import { initTRPC, TRPCError } from '@trpc/server';
import { createClient as createServerClient } from '../lib/supabase/server';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@desidiabeticoach/shared';

export interface Context {
  supabase: SupabaseClient<Database>;
  userId: string | null;
}

/**
 * Web calls are same-origin and authenticate via the Supabase session cookie.
 * The mobile app (spec §8.3 — "API calls still go to the cloud backend")
 * calls this same tRPC endpoint cross-origin and authenticates via a bearer
 * token instead, since it has no access to the web app's cookies.
 */
export async function createContext({ req }: { req: Request }): Promise<Context> {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (bearerToken) {
    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser(bearerToken);
    return { supabase, userId: user?.id ?? null };
  }

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

/** Requires an authenticated Supabase session; RLS still enforces row ownership. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in.' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

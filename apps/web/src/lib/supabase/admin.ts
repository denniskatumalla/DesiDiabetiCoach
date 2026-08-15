import { createClient } from '@supabase/supabase-js';
import type { Database } from '@desidiabeticoach/shared';

/**
 * Service-role client — server-side only, never imported by client
 * components. Bypasses RLS; used by tRPC routers for privileged writes
 * (e.g. AI photo scan results) where the acting user has already been
 * verified via the request's session.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

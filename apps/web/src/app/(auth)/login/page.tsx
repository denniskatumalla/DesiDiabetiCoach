import { LoginForm } from './login-form';

// Auth pages are inherently dynamic (they create a Supabase client at
// render time) — never statically prerendered. Route segment config only
// takes effect from a Server Component, hence the split from login-form.tsx.
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm />;
}

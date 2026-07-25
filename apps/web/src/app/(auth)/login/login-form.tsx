'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@desidiabeticoach/ui';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push('/dashboard');
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) return setError('Enter your email first.');
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setMagicLinkSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-white px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Log In</h1>

        {magicLinkSent ? (
          <p className="mt-4 text-sm text-brand-navy/70">
            Check your email for a magic link to log in.
          </p>
        ) : (
          <form onSubmit={handlePasswordLogin} className="mt-4 space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-control border border-brand-navy/20 px-3 py-2.5"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-control border border-brand-navy/20 px-3 py-2.5"
            />
            {error && <p className="text-sm text-brand-rose">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging in…' : 'Log In'}
            </Button>
            <button
              type="button"
              onClick={handleMagicLink}
              className="w-full text-sm text-brand-teal hover:underline"
            >
              Send me a magic link instead
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-brand-navy/60">
          New here?{' '}
          <Link href="/signup" className="text-brand-teal hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </main>
  );
}

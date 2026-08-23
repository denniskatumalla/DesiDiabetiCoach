'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@desidiabeticoach/ui';
import { AuthField, AuthShell } from '@/components/auth-shell';
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
    <AuthShell
      eyebrow="Welcome back"
      title="Log in"
      footer={
        <>
          New here?{' '}
          <Link href="/signup" className="text-brand-saffron underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      {magicLinkSent ? (
        <p className="text-sm leading-relaxed text-white/70">
          Check your email for a magic link to log in.
        </p>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-3">
          <AuthField
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthField
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p role="alert" className="font-mono text-[13px] text-brand-rose">
              {error}
            </p>
          )}
          <Button type="submit" variant="saffron" size="lg" disabled={loading} className="w-full">
            {loading ? 'Logging in…' : 'Log in'}
          </Button>
          <button
            type="button"
            onClick={handleMagicLink}
            className="w-full py-1 text-sm text-white/60 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Send me a magic link instead
          </button>
        </form>
      )}
    </AuthShell>
  );
}

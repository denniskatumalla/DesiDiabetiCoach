'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@desidiabeticoach/ui';
import { AuthField, AuthShell } from '@/components/auth-shell';
import { createClient } from '@/lib/supabase/client';

export function SignupForm() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setSubmitted(true);
  }

  return (
    <AuthShell
      eyebrow="Free to start"
      title="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="text-brand-saffron underline-offset-4 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {submitted ? (
        <p className="text-sm leading-relaxed text-white/70">
          Check your email to confirm your account, then log in and complete your diabetic
          profile.
        </p>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3">
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
            minLength={8}
            placeholder="Password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p role="alert" className="font-mono text-[13px] text-brand-rose">
              {error}
            </p>
          )}
          <Button type="submit" variant="saffron" size="lg" disabled={loading} className="w-full">
            {loading ? 'Creating account…' : 'Sign up'}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

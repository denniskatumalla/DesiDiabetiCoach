'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@desidiabeticoach/ui';
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
    <main className="flex min-h-screen items-center justify-center bg-brand-white px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Create Your Account</h1>

        {submitted ? (
          <p className="mt-4 text-sm text-brand-navy/70">
            Check your email to confirm your account, then log in and complete your diabetic
            profile.
          </p>
        ) : (
          <form onSubmit={handleSignup} className="mt-4 space-y-3">
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
              minLength={8}
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-control border border-brand-navy/20 px-3 py-2.5"
            />
            {error && <p className="text-sm text-brand-rose">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-brand-navy/60">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-teal hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}

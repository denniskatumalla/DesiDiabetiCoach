import * as React from 'react';
import Link from 'next/link';

/**
 * Auth sits on the same dark ground as the landing page, so signing in feels
 * like walking further into the product rather than into a different one.
 */
export function AuthShell({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main data-theme="dark" className="relative flex min-h-screen flex-col overflow-hidden bg-ink px-6 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-56 left-1/2 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(closest-side, #F59E0B, transparent)' }}
      />

      <header className="relative py-6">
        <Link href="/" className="font-display text-[15px] font-bold tracking-tight">
          DesiDiabetiCoach
        </Link>
      </header>

      <div className="relative flex flex-1 items-center justify-center pb-16">
        <div className="w-full max-w-sm animate-rise-in">
          <p className="eyebrow text-brand-saffron">{eyebrow}</p>
          <h1 className="mb-8 mt-3 font-display text-display-md font-bold">{title}</h1>

          {children}

          {footer && <p className="mt-8 text-sm text-white/55">{footer}</p>}
        </div>
      </div>
    </main>
  );
}

/** Field styled for the dark ground; placeholder doubles as the label. */
export function AuthField({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      aria-label={typeof props.placeholder === 'string' ? props.placeholder : undefined}
      className={`w-full rounded-control border border-ink-rule bg-white/[0.04] px-4 py-3 text-[15px] text-white transition-colors placeholder:text-white/40 hover:border-white/25 focus:border-brand-saffron ${className}`}
      {...props}
    />
  );
}

/** Select styled to match {@link AuthField}, for the onboarding-style forms. */
export function AuthSelect({
  className = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-control border border-ink-rule bg-ink-raised px-4 py-3 text-[15px] text-white transition-colors hover:border-white/25 focus:border-brand-saffron ${className}`}
      {...props}
    />
  );
}

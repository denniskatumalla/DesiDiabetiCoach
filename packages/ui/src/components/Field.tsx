import * as React from 'react';

const CONTROL =
  'w-full rounded-control border border-ink-rule bg-fg/[0.04] px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/40 hover:border-fg/25 focus:border-brand-saffron';

export function Field({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      aria-label={typeof props.placeholder === 'string' ? props.placeholder : undefined}
      className={`${CONTROL} ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${CONTROL} ${className}`} {...props} />;
}

/** A row in a list of records — the app's other recurring surface. */
export function Row({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-card border border-ink-rule bg-fg/[0.04] px-4 py-3 transition-colors hover:border-fg/25 ${className}`}
      {...props}
    />
  );
}

/** Shown in place of a list when there is nothing in it yet. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-card border border-dashed border-ink-rule px-4 py-10 text-center text-sm text-fg/45">
      {children}
    </p>
  );
}

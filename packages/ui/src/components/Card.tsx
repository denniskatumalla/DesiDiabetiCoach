import * as React from 'react';

/**
 * A compartment on the thali: a raised surface held by a hairline rather than
 * a shadow, so several can sit side by side on the dark ground without the
 * page feeling busy.
 */
export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-ink-rule bg-ink-raised p-5 text-fg ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`eyebrow mb-3 text-fg/45 ${className}`} {...props} />;
}

/** Section opener: monospace eyebrow above a display-scale heading. */
export function SectionHeading({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="eyebrow text-accent">{eyebrow}</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">{title}</h1>
      {children && <p className="mt-2 max-w-xl text-sm text-fg/60">{children}</p>}
    </div>
  );
}

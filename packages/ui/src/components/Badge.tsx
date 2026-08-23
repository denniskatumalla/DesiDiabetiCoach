import * as React from 'react';

/**
 * A small labelled marker. `color` tints the dot only — the text always
 * carries the meaning, so the badge stays readable under colour-vision
 * deficiency and in forced-colours mode.
 */
export function Badge({
  color,
  children,
  className = '',
}: {
  color: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-ink-rule bg-ink-raised px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-fg/75 ${className}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {children}
    </span>
  );
}

import * as React from 'react';

export function Card({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl bg-white shadow-[0_2px_12px_rgba(15,35,64,0.08)] p-5 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-[13px] uppercase tracking-[0.08em] text-brand-navy/40 font-semibold mb-3 ${className}`}
      {...props}
    />
  );
}

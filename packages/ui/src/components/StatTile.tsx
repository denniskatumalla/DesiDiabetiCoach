import * as React from 'react';
import { Card, CardTitle } from './Card';

/**
 * A status is never carried by colour alone: the in-range green and
 * out-of-range red separate by only ΔE 7.2 under deuteranopia, and both fall
 * under 3:1 against a white surface. The written `label` is therefore
 * required, not optional.
 */
export interface StatStatus {
  color: string;
  label: string;
}

export interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  status?: StatStatus;
}

export function StatTile({ label, value, sublabel, status }: StatTileProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardTitle>{label}</CardTitle>

      <p className="font-display text-[2.5rem] font-bold leading-none tracking-[-0.03em] text-fg [font-variant-numeric:tabular-nums]">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2">
        {status && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-fg/70">
            <span
              className="inline-block h-2 w-2 rounded-full ring-2 ring-ink-raised"
              style={{ backgroundColor: status.color }}
              aria-hidden
            />
            {status.label}
          </span>
        )}
        {sublabel && <p className="text-xs text-fg/50">{sublabel}</p>}
      </div>
    </Card>
  );
}

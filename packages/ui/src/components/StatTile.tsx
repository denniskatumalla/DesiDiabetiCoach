import * as React from 'react';
import { Card, CardTitle } from './Card';

export interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  statusColor?: string;
}

export function StatTile({ label, value, sublabel, statusColor }: StatTileProps) {
  return (
    <Card>
      <CardTitle>{label}</CardTitle>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold text-brand-navy">{value}</span>
        {statusColor && (
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: statusColor }}
            aria-hidden
          />
        )}
      </div>
      {sublabel && <p className="mt-1 text-sm text-brand-navy/60">{sublabel}</p>}
    </Card>
  );
}

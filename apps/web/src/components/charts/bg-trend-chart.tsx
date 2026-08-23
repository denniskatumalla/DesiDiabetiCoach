'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export interface BgTrendPoint {
  loggedAt: string;
  value: number;
}

/**
 * Colours are picked for the dark surface, not flipped from the light one.
 * Brand teal is legible on `ink-raised` but sits close to it in lightness, so
 * the line steps up to a brighter tint of the same hue (validated ≥ 3:1
 * against the dark ground). Dots are ringed in the surface colour so
 * overlapping points stay countable.
 *
 * The target band is a region rather than a series, and the tooltip states
 * in/out of range in words — the in-range green and out-of-range red separate
 * by only ΔE 7.2 under deuteranopia, so range is never carried by colour alone.
 */
const LINE = '#2FB3AC';
const BAND = '#F59E0B';

/**
 * Recharts writes these into SVG presentation attributes, where CSS custom
 * properties do not resolve — so the themed colours are read off the document
 * and refreshed when `data-theme` changes.
 */
function useThemeColors() {
  const [colors, setColors] = useState({
    grid: 'rgba(233, 240, 247, 0.12)',
    axis: 'rgba(233, 240, 247, 0.60)',
    surface: '#132A45',
  });

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const fg = style.getPropertyValue('--c-fg').trim();
      const surface = style.getPropertyValue('--c-surface').trim();
      if (!fg || !surface) return;
      setColors({
        grid: `rgb(${fg} / 0.12)`,
        axis: `rgb(${fg} / 0.6)`,
        surface: `rgb(${surface})`,
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });

    // `system` sets no attribute, so OS changes have to be watched separately.
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', read);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', read);
    };
  }, []);

  return colors;
}

export function BgTrendChart({
  data,
  targetMin,
  targetMax,
}: {
  data: BgTrendPoint[];
  targetMin: number;
  targetMax: number;
}) {
  const { grid: GRID, axis: AXIS_INK, surface: SURFACE } = useThemeColors();

  const AXIS_TICK = useMemo(
    () => ({
      fontSize: 11,
      fill: AXIS_INK,
      fontFamily: 'ui-monospace, "Cascadia Mono", "SF Mono", Consolas, monospace',
    }),
    [AXIS_INK]
  );

  const chartData = [...data]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((d) => ({
      ...d,
      label: new Date(d.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />

          {/* Target range, drawn behind the line and labelled in the legend below. */}
          <ReferenceArea y1={targetMin} y2={targetMax} fill={BAND} fillOpacity={0.1} />
          <ReferenceLine y={targetMin} stroke={BAND} strokeOpacity={0.45} strokeDasharray="3 3" />
          <ReferenceLine y={targetMax} stroke={BAND} strokeOpacity={0.45} strokeDasharray="3 3" />

          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={52}
            domain={['dataMin - 20', 'dataMax + 20']}
            label={{
              value: 'mg/dL',
              angle: -90,
              position: 'insideLeft',
              offset: 26,
              style: { ...AXIS_TICK, textAnchor: 'middle' },
            }}
          />

          <Tooltip
            cursor={{ stroke: AXIS_INK, strokeOpacity: 0.35, strokeDasharray: '4 4' }}
            content={<BgTooltip targetMin={targetMin} targetMax={targetMax} />}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={LINE}
            strokeWidth={2}
            dot={{ r: 3, fill: LINE, stroke: SURFACE, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: LINE, stroke: SURFACE, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* One series needs no legend, but the target band does need naming. */}
      <p className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-fg/50">
        <span
          aria-hidden
          className="inline-block h-2.5 w-5 rounded-sm"
          style={{ backgroundColor: BAND, opacity: 0.25 }}
        />
        Target range {targetMin}–{targetMax} mg/dL
      </p>
    </div>
  );
}

function BgTooltip({
  active,
  payload,
  label,
  targetMin,
  targetMax,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  targetMin: number;
  targetMax: number;
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;
  const state =
    value < targetMin ? 'Below range' : value > targetMax ? 'Above range' : 'In range';

  return (
    <div className="rounded-control border border-ink-rule bg-ink-raised px-3 py-2 shadow-card">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-fg/50">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-fg [font-variant-numeric:tabular-nums]">
        {value} <span className="text-sm font-medium text-fg/50">mg/dL</span>
      </p>
      <p className="mt-0.5 text-xs text-fg/70">{state}</p>
    </div>
  );
}

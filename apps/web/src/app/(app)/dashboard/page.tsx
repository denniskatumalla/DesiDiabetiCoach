'use client';

import { Card, CardTitle, SectionHeading, StatTile } from '@desidiabeticoach/ui';
import { calculateTir, bgStatusColor, COLORS } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc/client';
import { BgTrendChart } from '@/components/charts/bg-trend-chart';

export default function DashboardPage() {
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: bgLogs, isLoading } = trpc.bgLogs.list.useQuery({ limit: 30 });
  const { data: medLogs } = trpc.medications.recentLogs.useQuery({ days: 30 });

  const targetMin = profile?.target_bg_fasting_min ?? 80;
  const targetMax = profile?.target_bg_post_meal_max ?? 180;

  const last7 = (bgLogs ?? []).filter(
    (b) => new Date(b.logged_at).getTime() > Date.now() - 7 * 86400000
  );
  const tir = calculateTir(last7.map((b) => b.value), targetMin, targetMax);
  const lastReading = bgLogs?.[0];
  const adherencePct =
    medLogs && medLogs.length > 0
      ? Math.round((medLogs.filter((m) => m.taken).length / medLogs.length) * 100)
      : null;

  return (
    <div>
      <SectionHeading eyebrow="Your day" title="Dashboard" />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Last reading"
          value={lastReading ? `${lastReading.value}` : '—'}
          sublabel={
            lastReading ? new Date(lastReading.logged_at).toLocaleString() : 'No readings yet'
          }
          status={
            lastReading
              ? {
                  color: bgStatusColor(lastReading.value, targetMin, targetMax),
                  label: rangeLabel(lastReading.value, targetMin, targetMax),
                }
              : undefined
          }
        />
        <StatTile
          label="Time in range"
          value={last7.length > 0 ? `${tir}%` : '—'}
          sublabel={last7.length > 0 ? `${last7.length} readings, 7 days` : 'No readings this week'}
          // A brand-new account has 0% time in range only because it has no
          // readings at all — flagging that as "needs attention" tells someone
          // their control is poor when nothing has been measured.
          status={last7.length > 0 ? { color: tirColor(tir), label: tirLabel(tir) } : undefined}
        />
        <StatTile
          label="Medication adherence"
          value={adherencePct !== null ? `${adherencePct}%` : '—'}
          sublabel="Last 30 days"
        />
        <StatTile label="Calories today" value="—" sublabel="See Log Meal for detail" />
      </div>

      <Card className="mt-6">
        <CardTitle>Blood glucose trend · 30 days</CardTitle>
        {isLoading ? (
          <p className="py-12 text-center text-sm text-fg/50">Loading…</p>
        ) : bgLogs && bgLogs.length > 0 ? (
          <BgTrendChart
            data={bgLogs.map((b) => ({ loggedAt: b.logged_at, value: b.value }))}
            targetMin={targetMin}
            targetMax={targetMax}
          />
        ) : (
          <p className="py-12 text-center text-sm text-fg/50">
            No readings yet — log your first one to see your trend here.
          </p>
        )}
      </Card>
    </div>
  );
}

/** Status is always paired with these words; the dot alone never carries it. */
function rangeLabel(value: number, min: number, max: number): string {
  if (value < min) return 'Below range';
  if (value > max) return 'Above range';
  return 'In range';
}

function tirColor(tir: number): string {
  if (tir >= 70) return COLORS.jade;
  if (tir >= 50) return COLORS.saffron;
  return COLORS.rose;
}

function tirLabel(tir: number): string {
  if (tir >= 70) return 'On target';
  if (tir >= 50) return 'Below target';
  return 'Needs attention';
}

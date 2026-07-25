'use client';

import { StatTile } from '@desidiabeticoach/ui';
import { calculateTir, bgStatusColor } from '@desidiabeticoach/shared';
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
  const adherencePct = medLogs && medLogs.length > 0
    ? Math.round((medLogs.filter((m) => m.taken).length / medLogs.length) * 100)
    : null;
  const caloriesEstimate = null; // requires today's meal_logs; see /meals for detail

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Last BG"
          value={lastReading ? `${lastReading.value} mg/dL` : '—'}
          sublabel={lastReading ? new Date(lastReading.logged_at).toLocaleString() : 'No readings yet'}
          statusColor={lastReading ? bgStatusColor(lastReading.value, targetMin, targetMax) : undefined}
        />
        <StatTile label="7-Day Time in Range" value={`${tir}%`} sublabel={`${last7.length} readings`} />
        <StatTile
          label="Medication Adherence"
          value={adherencePct !== null ? `${adherencePct}%` : '—'}
          sublabel="Last 30 days"
        />
        <StatTile label="Calories Today" value={caloriesEstimate ?? '—'} sublabel="See Log Meal for detail" />
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-[0_2px_12px_rgba(15,35,64,0.08)]">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-navy/40">
          BG Trend (30 days)
        </h2>
        {isLoading ? (
          <p className="text-sm text-brand-navy/60">Loading…</p>
        ) : bgLogs && bgLogs.length > 0 ? (
          <BgTrendChart
            data={bgLogs.map((b) => ({ loggedAt: b.logged_at, value: b.value }))}
            targetMin={targetMin}
            targetMax={targetMax}
          />
        ) : (
          <p className="text-sm text-brand-navy/60">
            No readings yet — log your first BG reading to see your trend here.
          </p>
        )}
      </div>
    </div>
  );
}

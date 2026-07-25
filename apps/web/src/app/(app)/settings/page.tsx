'use client';

import { trpc } from '@/lib/trpc/client';
import { Card } from '@desidiabeticoach/ui';
import { LANGUAGES } from '@desidiabeticoach/shared';

export default function SettingsPage() {
  const { data: profile, isLoading } = trpc.profile.get.useQuery();

  if (isLoading) return <p className="text-sm text-brand-navy/60">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Settings</h1>

      <Card className="mt-6 max-w-md space-y-3">
        <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-navy/40">
          Profile
        </h2>
        <Row label="Name" value={profile?.full_name ?? '—'} />
        <Row label="Diabetes type" value={profile?.diabetes_type ?? '—'} />
        <Row
          label="Language"
          value={profile?.language_pref ? LANGUAGES[profile.language_pref as keyof typeof LANGUAGES]?.label : '—'}
        />
        <Row label="Target fasting BG" value={`${profile?.target_bg_fasting_min ?? '—'}–${profile?.target_bg_fasting_max ?? '—'} mg/dL`} />
        <Row label="Units" value={profile?.units_preference ?? 'mg/dL'} />
        <p className="pt-2 text-xs text-brand-navy/40">
          Full profile editing is available from the onboarding flow at /onboarding for now —
          an inline edit form is a near-term follow-up.
        </p>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-brand-navy/5 py-1.5 text-sm last:border-0">
      <span className="text-brand-navy/60">{label}</span>
      <span className="font-medium text-brand-navy">{value}</span>
    </div>
  );
}

'use client';

import { trpc } from '@/lib/trpc/client';
import { Card } from '@desidiabeticoach/ui';
import { LANGUAGES } from '@desidiabeticoach/shared';
import { ThemeToggle } from '@/components/theme-toggle';

export default function SettingsPage() {
  const { data: profile, isLoading } = trpc.profile.get.useQuery();

  if (isLoading) return <p className="text-sm text-fg/60">Loading…</p>;

  return (
    <div>
      <p className="eyebrow text-accent">Your profile</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">Settings</h1>

      <Card className="mt-6 max-w-md space-y-3">
        <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-fg/40">
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
        <p className="pt-2 text-xs text-fg/40">
          Full profile editing is available from the onboarding flow at /onboarding for now —
          an inline edit form is a near-term follow-up.
        </p>
      </Card>

      <Card className="mt-4 max-w-md">
        <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-fg/40">
          Appearance
        </h2>
        <p className="mb-3 text-sm text-fg/60">
          Choose how DesiDiabetiCoach looks. This is stored on this device, not on your
          account.
        </p>
        <ThemeToggle />
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-ink-rule py-1.5 text-sm last:border-0">
      <span className="text-fg/60">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@desidiabeticoach/ui';
import { OnboardingInput, type OnboardingInput as OnboardingInputType } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc/client';

const DEFAULTS: OnboardingInputType = {
  fullName: '',
  dateOfBirth: '1980-01-01',
  gender: 'prefer_not_to_say',
  diabetesType: 'type2',
  diagnosisYear: new Date().getFullYear(),
  targetBgFastingMin: 80,
  targetBgFastingMax: 130,
  targetBgPostMealMax: 180,
  languagePref: 'en',
  cuisinePreference: 'mixed',
  dietaryRestriction: 'none',
  unitsPreference: 'mg/dL',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState<OnboardingInputType>(DEFAULTS);
  const [error, setError] = useState<string | null>(null);
  const mutation = trpc.profile.completeOnboarding.useMutation({
    onSuccess: () => router.push('/dashboard'),
    onError: (e) => setError(e.message),
  });

  function update<K extends keyof OnboardingInputType>(key: K, value: OnboardingInputType[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = OnboardingInput.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? 'Please check your inputs.');
    mutation.mutate(parsed.data);
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy">
        Let&rsquo;s set up your diabetic profile
      </h1>
      <p className="mt-1 text-sm text-brand-navy/60">
        This personalizes your dashboard, food scanning, and coaching — you can edit it anytime in
        Settings.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Card className="space-y-3">
          <label className="block text-sm font-medium text-brand-navy">Full name</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          />

          <label className="block text-sm font-medium text-brand-navy">Date of birth</label>
          <input
            type="date"
            required
            value={form.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          />

          <label className="block text-sm font-medium text-brand-navy">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => update('gender', e.target.value as OnboardingInputType['gender'])}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </Card>

        <Card className="space-y-3">
          <label className="block text-sm font-medium text-brand-navy">Diabetes type</label>
          <select
            value={form.diabetesType}
            onChange={(e) => update('diabetesType', e.target.value as OnboardingInputType['diabetesType'])}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          >
            <option value="type1">Type 1</option>
            <option value="type2">Type 2</option>
            <option value="prediabetes">Pre-diabetes</option>
            <option value="gestational">Gestational</option>
          </select>

          <label className="block text-sm font-medium text-brand-navy">Year of diagnosis</label>
          <input
            type="number"
            min={1950}
            max={2100}
            value={form.diagnosisYear}
            onChange={(e) => update('diagnosisYear', Number(e.target.value))}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          />

          <label className="block text-sm font-medium text-brand-navy">
            Target fasting BG range (mg/dL)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={form.targetBgFastingMin}
              onChange={(e) => update('targetBgFastingMin', Number(e.target.value))}
              className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
            />
            <input
              type="number"
              value={form.targetBgFastingMax}
              onChange={(e) => update('targetBgFastingMax', Number(e.target.value))}
              className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
            />
          </div>
        </Card>

        <Card className="space-y-3">
          <label className="block text-sm font-medium text-brand-navy">Language preference</label>
          <select
            value={form.languagePref}
            onChange={(e) => update('languagePref', e.target.value as OnboardingInputType['languagePref'])}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          >
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="pa">Punjabi</option>
            <option value="gu">Gujarati</option>
          </select>

          <label className="block text-sm font-medium text-brand-navy">Cuisine preference</label>
          <select
            value={form.cuisinePreference}
            onChange={(e) =>
              update('cuisinePreference', e.target.value as OnboardingInputType['cuisinePreference'])
            }
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          >
            <option value="south_indian">South Indian</option>
            <option value="north_indian">North Indian</option>
            <option value="sri_lankan">Sri Lankan</option>
            <option value="bangladeshi">Bangladeshi</option>
            <option value="pakistani">Pakistani</option>
            <option value="mixed">Mixed</option>
          </select>

          <label className="block text-sm font-medium text-brand-navy">Dietary restriction</label>
          <select
            value={form.dietaryRestriction}
            onChange={(e) =>
              update('dietaryRestriction', e.target.value as OnboardingInputType['dietaryRestriction'])
            }
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2"
          >
            <option value="none">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
            <option value="halal">Halal</option>
          </select>
        </Card>

        {error && <p className="text-sm text-brand-rose">{error}</p>}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Saving…' : 'Finish Setup'}
        </Button>
      </form>
    </main>
  );
}

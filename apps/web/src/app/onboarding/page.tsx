'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Field, Select } from '@desidiabeticoach/ui';
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
    <main className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <p className="eyebrow text-accent">One time only</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">
        Let&rsquo;s set up your diabetic profile
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-fg/60">
        This personalizes your dashboard, food scanning, and coaching — you can edit it anytime in
        Settings.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Card className="space-y-3">
          <label className="block text-sm font-medium text-fg">Full name</label>
          <Field
            required
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            
          />

          <label className="block text-sm font-medium text-fg">Date of birth</label>
          <Field
            type="date"
            required
            value={form.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            
          />

          <label className="block text-sm font-medium text-fg">Gender</label>
          <Select
            value={form.gender}
            onChange={(e) => update('gender', e.target.value as OnboardingInputType['gender'])}
            
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </Select>
        </Card>

        <Card className="space-y-3">
          <label className="block text-sm font-medium text-fg">Diabetes type</label>
          <Select
            value={form.diabetesType}
            onChange={(e) => update('diabetesType', e.target.value as OnboardingInputType['diabetesType'])}
            
          >
            <option value="type1">Type 1</option>
            <option value="type2">Type 2</option>
            <option value="prediabetes">Pre-diabetes</option>
            <option value="gestational">Gestational</option>
          </Select>

          <label className="block text-sm font-medium text-fg">Year of diagnosis</label>
          <Field
            type="number"
            min={1950}
            max={2100}
            value={form.diagnosisYear}
            onChange={(e) => update('diagnosisYear', Number(e.target.value))}
            
          />

          <label className="block text-sm font-medium text-fg">
            Target fasting BG range (mg/dL)
          </label>
          <div className="flex gap-2">
            <Field
              type="number"
              value={form.targetBgFastingMin}
              onChange={(e) => update('targetBgFastingMin', Number(e.target.value))}
              
            />
            <Field
              type="number"
              value={form.targetBgFastingMax}
              onChange={(e) => update('targetBgFastingMax', Number(e.target.value))}
              
            />
          </div>
        </Card>

        <Card className="space-y-3">
          <label className="block text-sm font-medium text-fg">Language preference</label>
          <Select
            value={form.languagePref}
            onChange={(e) => update('languagePref', e.target.value as OnboardingInputType['languagePref'])}
            
          >
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="pa">Punjabi</option>
            <option value="gu">Gujarati</option>
          </Select>

          <label className="block text-sm font-medium text-fg">Cuisine preference</label>
          <Select
            value={form.cuisinePreference}
            onChange={(e) =>
              update('cuisinePreference', e.target.value as OnboardingInputType['cuisinePreference'])
            }
            
          >
            <option value="south_indian">South Indian</option>
            <option value="north_indian">North Indian</option>
            <option value="sri_lankan">Sri Lankan</option>
            <option value="bangladeshi">Bangladeshi</option>
            <option value="pakistani">Pakistani</option>
            <option value="mixed">Mixed</option>
          </Select>

          <label className="block text-sm font-medium text-fg">Dietary restriction</label>
          <Select
            value={form.dietaryRestriction}
            onChange={(e) =>
              update('dietaryRestriction', e.target.value as OnboardingInputType['dietaryRestriction'])
            }
            
          >
            <option value="none">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="jain">Jain</option>
            <option value="halal">Halal</option>
          </Select>
        </Card>

        {error && <p className="text-sm text-brand-rose">{error}</p>}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? 'Saving…' : 'Finish Setup'}
        </Button>
      </form>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { Button, Card } from '@desidiabeticoach/ui';
import { COMMON_MEDICATIONS, type MedicationFrequency } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc/client';

const FREQUENCY_LABELS: Record<MedicationFrequency, string> = {
  once_daily: 'Once daily',
  twice_daily: 'Twice daily',
  three_times_daily: 'Three times daily',
  with_meals: 'With meals',
  at_bedtime: 'At bedtime',
  as_needed: 'As needed',
};

export default function MedicationsPage() {
  const utils = trpc.useUtils();
  const { data: medications, isLoading } = trpc.medications.list.useQuery();
  const createMutation = trpc.medications.create.useMutation({
    onSuccess: () => {
      utils.medications.list.invalidate();
      setName('');
      setDoseValue('');
    },
  });
  const logDoseMutation = trpc.medications.logDose.useMutation({
    onSuccess: () => utils.medications.recentLogs.invalidate(),
  });

  const [name, setName] = useState('');
  const [doseValue, setDoseValue] = useState('');
  const [doseUnit, setDoseUnit] = useState<'mg' | 'units' | 'mcg'>('mg');
  const [frequency, setFrequency] = useState<MedicationFrequency>('once_daily');

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !doseValue) return;
    createMutation.mutate({
      name,
      doseValue: Number(doseValue),
      doseUnit,
      frequency,
      isInsulin: /insulin|lantus|humalog|novolog|tresiba|nph/i.test(name),
      startDate: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div>
      <p className="eyebrow text-accent">Your regimen</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">Medications</h1>

      <Card className="mt-6 max-w-md">
        <h2 className="eyebrow mb-3 text-fg/45">
          Add Medication
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            list="common-medications"
            required
            placeholder="Medication name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-control border border-ink-rule bg-ink-raised px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/35 hover:border-brand-navy/25 focus:border-brand-teal"
          />
          <datalist id="common-medications">
            {COMMON_MEDICATIONS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <div className="flex gap-2">
            <input
              type="number"
              required
              placeholder="Dose"
              value={doseValue}
              onChange={(e) => setDoseValue(e.target.value)}
              className="w-full rounded-control border border-ink-rule bg-ink-raised px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/35 hover:border-brand-navy/25 focus:border-brand-teal"
            />
            <select
              value={doseUnit}
              onChange={(e) => setDoseUnit(e.target.value as typeof doseUnit)}
              className="w-full rounded-control border border-ink-rule bg-ink-raised px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/35 hover:border-brand-navy/25 focus:border-brand-teal"
            >
              <option value="mg">mg</option>
              <option value="units">units</option>
              <option value="mcg">mcg</option>
            </select>
          </div>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as MedicationFrequency)}
            className="w-full rounded-control border border-ink-rule bg-ink-raised px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/35 hover:border-brand-navy/25 focus:border-brand-teal"
          >
            {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            Add Medication
          </Button>
        </form>
      </Card>

      <div className="mt-8 space-y-2">
        <h2 className="eyebrow mb-3 text-fg/45">
          Current Medications
        </h2>
        {isLoading ? (
          <p className="text-sm text-fg/60">Loading…</p>
        ) : (
          (medications ?? []).map((med) => (
            <div
              key={med.id}
              className="flex items-center justify-between rounded-card border border-ink-rule bg-ink-raised p-3.5"
            >
              <div>
                <p className="font-medium text-fg">
                  {med.name} — {med.dose_value}
                  {med.dose_unit}
                </p>
                <p className="text-xs text-fg/50">{FREQUENCY_LABELS[med.frequency as MedicationFrequency]}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() =>
                  logDoseMutation.mutate({
                    medicationId: med.id,
                    medicationName: med.name,
                    doseMg: med.dose_unit === 'mg' ? med.dose_value : undefined,
                    taken: true,
                  })
                }
              >
                Mark Taken
              </Button>
            </div>
          ))
        )}
        {medications?.length === 0 && (
          <p className="text-sm text-fg/60">No medications added yet.</p>
        )}
      </div>
    </div>
  );
}

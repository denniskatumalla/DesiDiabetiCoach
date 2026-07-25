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
      <h1 className="font-display text-2xl font-bold text-brand-navy">Medications</h1>

      <Card className="mt-6 max-w-md">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-navy/40">
          Add Medication
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            list="common-medications"
            required
            placeholder="Medication name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2.5"
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
              className="w-full rounded-control border border-brand-navy/20 px-3 py-2.5"
            />
            <select
              value={doseUnit}
              onChange={(e) => setDoseUnit(e.target.value as typeof doseUnit)}
              className="w-full rounded-control border border-brand-navy/20 px-3 py-2.5"
            >
              <option value="mg">mg</option>
              <option value="units">units</option>
              <option value="mcg">mcg</option>
            </select>
          </div>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as MedicationFrequency)}
            className="w-full rounded-control border border-brand-navy/20 px-3 py-2.5"
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
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-navy/40">
          Current Medications
        </h2>
        {isLoading ? (
          <p className="text-sm text-brand-navy/60">Loading…</p>
        ) : (
          (medications ?? []).map((med) => (
            <div
              key={med.id}
              className="flex items-center justify-between rounded-lg bg-white p-3 shadow-[0_2px_12px_rgba(15,35,64,0.08)]"
            >
              <div>
                <p className="font-medium text-brand-navy">
                  {med.name} — {med.dose_value}
                  {med.dose_unit}
                </p>
                <p className="text-xs text-brand-navy/50">{FREQUENCY_LABELS[med.frequency as MedicationFrequency]}</p>
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
          <p className="text-sm text-brand-navy/60">No medications added yet.</p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button, Card, Badge } from '@desidiabeticoach/ui';
import { BG_CONTEXT_LABELS, bgStatusColor, isAbnormalBg, type BgContext } from '@desidiabeticoach/shared';
import { trpc } from '@/lib/trpc/client';

export default function BgLogPage() {
  const utils = trpc.useUtils();
  const { data: profile } = trpc.profile.get.useQuery();
  const { data: logs, isLoading } = trpc.bgLogs.list.useQuery({ limit: 50 });
  const createMutation = trpc.bgLogs.create.useMutation({
    onSuccess: () => {
      utils.bgLogs.list.invalidate();
      setValue('');
      setNotes('');
    },
  });
  const deleteMutation = trpc.bgLogs.delete.useMutation({
    onSuccess: () => utils.bgLogs.list.invalidate(),
  });

  const [value, setValue] = useState('');
  const [context, setContext] = useState<BgContext>('fasting');
  const [notes, setNotes] = useState('');

  const targetMin = profile?.target_bg_fasting_min ?? 80;
  const targetMax = profile?.target_bg_post_meal_max ?? 180;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numValue = Number(value);
    if (!numValue) return;
    createMutation.mutate({ value: numValue, context, notes: notes || undefined });
  }

  return (
    <div>
      <p className="eyebrow text-accent">Blood glucose</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">Log BG</h1>

      <Card className="mt-6 max-w-md">
        <h2 className="eyebrow mb-3 text-fg/45">
          Log a BG Reading
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="number"
            required
            inputMode="numeric"
            placeholder="BG value (mg/dL)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-control border border-ink-rule bg-ink-raised px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/35 hover:border-brand-navy/25 focus:border-brand-teal"
          />
          <select
            value={context}
            onChange={(e) => setContext(e.target.value as BgContext)}
            className="w-full rounded-control border border-ink-rule bg-ink-raised px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/35 hover:border-brand-navy/25 focus:border-brand-teal"
          >
            {Object.entries(BG_CONTEXT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <input
            placeholder="Note (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={200}
            className="w-full rounded-control border border-ink-rule bg-ink-raised px-3.5 py-2.5 text-sm text-fg transition-colors placeholder:text-fg/35 hover:border-brand-navy/25 focus:border-brand-teal"
          />
          {value && isAbnormalBg(Number(value)) && (
            <p className="text-sm text-brand-rose">
              This reading is outside safe range — contact your healthcare provider or seek
              emergency care if symptomatic.
            </p>
          )}
          <Button type="submit" disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending ? 'Saving…' : 'Save Reading'}
          </Button>
        </form>
      </Card>

      <div className="mt-8">
        <h2 className="eyebrow mb-3 text-fg/45">
          History
        </h2>
        {isLoading ? (
          <p className="text-sm text-fg/60">Loading…</p>
        ) : (
          <div className="space-y-2">
            {(logs ?? []).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-card border border-ink-rule bg-ink-raised p-3.5"
              >
                <div className="flex items-center gap-3">
                  <Badge color={bgStatusColor(log.value, targetMin, targetMax)}>{log.value} mg/dL</Badge>
                  <span className="text-sm text-fg/70">
                    {BG_CONTEXT_LABELS[log.context as BgContext]}
                  </span>
                  <span className="text-xs text-fg/40">
                    {new Date(log.logged_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate({ id: log.id })}
                  className="text-xs text-brand-rose hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
            {logs?.length === 0 && (
              <p className="text-sm text-fg/60">No readings logged yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { Button, Card } from '@desidiabeticoach/ui';

const REPORTS = [
  { type: 'bg', label: 'Blood Glucose Logs' },
  { type: 'meals', label: 'Meal Logs' },
  { type: 'medications', label: 'Medication Logs' },
] as const;

export default function ReportsPage() {
  return (
    <div>
      <p className="eyebrow text-accent">Share with your doctor</p>
      <h1 className="mt-2 font-display text-display-md font-bold text-fg">Reports</h1>
      <p className="mt-1 max-w-lg text-sm text-fg/60">
        Export your data as CSV to share with your physician or your own spreadsheet. Branded PDF
        Doctor/Personal reports (spec §5.8) are on the roadmap — see docs/ROADMAP.md.
      </p>

      <div className="mt-6 grid max-w-md gap-4">
        {REPORTS.map((r) => (
          <Card key={r.type} className="flex items-center justify-between">
            <span className="font-medium text-fg">{r.label}</span>
            <a href={`/api/reports/csv?type=${r.type}`} download>
              <Button variant="ghost">Export CSV</Button>
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}

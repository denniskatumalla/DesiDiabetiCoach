'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

export interface BgTrendPoint {
  loggedAt: string;
  value: number;
}

export function BgTrendChart({
  data,
  targetMin,
  targetMax,
}: {
  data: BgTrendPoint[];
  targetMin: number;
  targetMax: number;
}) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((d) => ({ ...d, label: new Date(d.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#0F2340" strokeOpacity={0.08} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 20', 'dataMax + 20']} />
        <Tooltip />
        <ReferenceArea y1={targetMin} y2={targetMax} fill="#F59E0B" fillOpacity={0.08} />
        <Line type="monotone" dataKey="value" stroke="#1B8F8A" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

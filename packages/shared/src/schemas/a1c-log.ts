import { z } from 'zod';

/** Spec §5.3 — HbA1c / A1C Tracking */
export const A1cLogInput = z.object({
  testDate: z.string().date(),
  value: z.number().min(3).max(15),
  labName: z.string().max(120).optional(),
  notes: z.string().max(200).optional(),
});
export type A1cLogInput = z.infer<typeof A1cLogInput>;

export const A1cLog = A1cLogInput.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type A1cLog = z.infer<typeof A1cLog>;

/**
 * Estimated A1C via the ADAG formula — spec §5.3.
 * eA1C = (46.7 + eAG) / 28.7, where eAG is the 90-day average BG in mg/dL.
 */
export function estimateA1c(avgBgMgDl: number): number {
  return Math.round(((46.7 + avgBgMgDl) / 28.7) * 10) / 10;
}

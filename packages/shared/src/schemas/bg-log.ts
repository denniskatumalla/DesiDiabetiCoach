import { z } from 'zod';

/** Spec §5.2 — BG logging entry fields */
export const BgContext = z.enum([
  'fasting',
  'before_breakfast',
  'after_breakfast',
  'before_lunch',
  'after_lunch',
  'before_dinner',
  'after_dinner',
  'bedtime',
  'random',
]);
export type BgContext = z.infer<typeof BgContext>;

export const BgLogInput = z.object({
  value: z.number().int().min(20).max(600),
  context: BgContext,
  loggedAt: z.string().datetime().optional(),
  notes: z.string().max(200).optional(),
});
export type BgLogInput = z.infer<typeof BgLogInput>;

export const BgLog = BgLogInput.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type BgLog = z.infer<typeof BgLog>;

/** Safety banner threshold, spec §5.6.4 */
export const isAbnormalBg = (value: number) => value < 54 || value > 350;

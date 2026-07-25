import { z } from 'zod';

/** Spec §5.4 — Medication Management */
export const MedicationFrequency = z.enum([
  'once_daily',
  'twice_daily',
  'three_times_daily',
  'with_meals',
  'at_bedtime',
  'as_needed',
]);
export type MedicationFrequency = z.infer<typeof MedicationFrequency>;

export const MedicationInput = z.object({
  name: z.string().min(1).max(120),
  doseValue: z.number().positive(),
  doseUnit: z.enum(['mg', 'units', 'mcg']),
  frequency: MedicationFrequency,
  isInsulin: z.boolean().default(false),
  startDate: z.string().date(),
});
export type MedicationInput = z.infer<typeof MedicationInput>;

export const Medication = MedicationInput.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  endDate: z.string().date().nullable(),
  createdAt: z.string().datetime(),
});
export type Medication = z.infer<typeof Medication>;

export const MedicationLogInput = z.object({
  medicationId: z.string().uuid(),
  medicationName: z.string(),
  doseMg: z.number().optional(),
  taken: z.boolean().default(true),
  takenAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().max(200).optional(),
});
export type MedicationLogInput = z.infer<typeof MedicationLogInput>;

/** Spec §5.4 — common medication autocomplete list */
export const COMMON_MEDICATIONS = [
  'Metformin',
  'Glipizide',
  'Januvia (Sitagliptin)',
  'Ozempic (Semaglutide)',
  'Victoza (Liraglutide)',
  'Trulicity (Dulaglutide)',
  'Jardiance (Empagliflozin)',
  'Farxiga (Dapagliflozin)',
  'NPH Insulin',
  'Lantus (Insulin Glargine)',
  'Humalog (Insulin Lispro)',
  'Novolog (Insulin Aspart)',
  'Tresiba (Insulin Degludec)',
] as const;

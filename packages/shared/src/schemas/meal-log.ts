import { z } from 'zod';

/** Spec §5.5.3 — Meal Log Entry */
export const MealType = z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'drink']);
export type MealType = z.infer<typeof MealType>;

export const MealItemInput = z.object({
  foodId: z.string().uuid().optional(),
  foodNameRaw: z.string().optional(),
  quantity: z.number().positive().default(1),
  servingUnit: z.enum(['katori', 'piece', 'cup', 'tablespoon', 'gram']).default('katori'),
  carbsG: z.number().optional(),
  calories: z.number().optional(),
});
export type MealItemInput = z.infer<typeof MealItemInput>;

export const MealLogInput = z.object({
  mealType: MealType,
  loggedAt: z.string().datetime().optional(),
  items: z.array(MealItemInput).min(1),
  /**
   * Object path within the private `meal-photos` bucket, e.g.
   * `<user-id>/<timestamp>.jpg` — never a signed URL. Signed URLs expire, so
   * persisting one leaves every photo in the history broken a day later;
   * `meals.list` signs the stored path on read instead.
   */
  photoPath: z.string().min(1).max(255).optional(),
  aiAnalysis: z.unknown().optional(),
  notes: z.string().max(500).optional(),
});
export type MealLogInput = z.infer<typeof MealLogInput>;

export const MealLog = MealLogInput.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  totalCarbsG: z.number(),
  totalCalories: z.number(),
  createdAt: z.string().datetime(),
});
export type MealLog = z.infer<typeof MealLog>;

import type { ScannedFoodItem } from '../schemas/food';
import type { MealItemInput } from '../schemas/meal-log';

/**
 * Convert a vision-scan result into a `meal_items` row.
 *
 * These two models of a portion do NOT agree, and conflating them double-counts
 * every scanned meal:
 *
 *   - Claude reports `carbsG`/`calories` for the *whole portion it identified*,
 *     and `estimatedKatori` describes that same portion. The two are already
 *     consistent with each other.
 *   - `meal_items` stores *per-unit* nutrition and lets `meals.create` compute
 *     `carbsG * quantity`.
 *
 * So the AI figures must be divided down before they are stored. Passing them
 * through untouched alongside `quantity: estimatedKatori` logs a two-katori
 * serving of rice with twice its carbohydrates — which then propagates into
 * daily carb totals and the coaching prompt.
 */
export function scannedItemToMealItem(item: ScannedFoodItem): MealItemInput {
  // A zero or negative portion is meaningless and would divide by zero; treat
  // it as a single serving so the totals stay equal to what Claude reported.
  const katori = item.estimatedKatori > 0 ? item.estimatedKatori : 1;

  return {
    foodId: item.foodDbId,
    foodNameRaw: item.name,
    quantity: katori,
    servingUnit: 'katori',
    carbsG: item.carbsG / katori,
    calories: item.calories / katori,
  };
}

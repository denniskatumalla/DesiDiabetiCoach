import { scannedItemToMealItem } from './scan-to-meal';
import type { ScannedFoodItem } from '../schemas/food';

const ITEM: ScannedFoodItem = {
  name: 'Rice',
  estimatedGrams: 300,
  estimatedKatori: 2,
  calories: 400,
  carbsG: 90,
  giScore: 73,
  glScore: 65.7,
  confidence: 0.9,
};

describe('scannedItemToMealItem', () => {
  it('divides the scanned portion down to per-unit nutrition', () => {
    expect(scannedItemToMealItem(ITEM)).toMatchObject({
      quantity: 2,
      servingUnit: 'katori',
      carbsG: 45,
      calories: 200,
    });
  });

  // The regression this function exists to prevent: quantity x per-unit carbs
  // must reproduce exactly what Claude reported for the whole portion.
  it.each([
    [1, 30, 150],
    [2, 90, 400],
    [0.5, 12, 58],
    [2.5, 75, 310],
  ])('round-trips a %p-katori portion back to its scanned totals', (katori, carbsG, calories) => {
    const item = scannedItemToMealItem({ ...ITEM, estimatedKatori: katori, carbsG, calories });

    expect(item.carbsG! * item.quantity).toBeCloseTo(carbsG);
    expect(item.calories! * item.quantity).toBeCloseTo(calories);
  });

  it.each([0, -1])('treats a %p-katori estimate as a single serving', (katori) => {
    const item = scannedItemToMealItem({ ...ITEM, estimatedKatori: katori });

    expect(item.quantity).toBe(1);
    expect(item.carbsG).toBe(90);
    expect(item.calories).toBe(400);
  });

  it('carries the food database id through when the scan matched a known food', () => {
    const id = '00000000-0000-4000-8000-000000000001';

    expect(scannedItemToMealItem({ ...ITEM, foodDbId: id }).foodId).toBe(id);
  });

  it('records the detected name so unmatched foods are still logged', () => {
    expect(scannedItemToMealItem({ ...ITEM, name: 'Masoor Dal' }).foodNameRaw).toBe('Masoor Dal');
  });
});

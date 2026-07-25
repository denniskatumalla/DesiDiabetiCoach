import { z } from 'zod';

/** Spec §10 — `foods` table (public, no RLS) */
export const FoodCategory = z.enum([
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'sweet',
  'drink',
]);
export type FoodCategory = z.infer<typeof FoodCategory>;

export const Food = z.object({
  id: z.string().uuid(),
  nameEn: z.string(),
  nameRegional: z.string().nullable(),
  regionalLang: z.string().nullable(),
  aliases: z.array(z.string()).default([]),
  category: FoodCategory,
  cuisineRegion: z.array(z.string()).default([]),
  isVegetarian: z.boolean(),
  isVegan: z.boolean(),
  servingDesc: z.string(),
  servingG: z.number().nullable(),
  carbsG: z.number(),
  proteinG: z.number().nullable(),
  fatG: z.number().nullable(),
  fiberG: z.number().nullable(),
  calories: z.number().int().nullable(),
  giScore: z.number().int().min(0).max(100).nullable(),
  giCategory: z.enum(['low', 'medium', 'high']).nullable(),
  glScore: z.number().nullable(),
  diabeticNotes: z.string().nullable(),
});
export type Food = z.infer<typeof Food>;

/** Spec §9.1 — AI food recognition response schema (Claude vision) */
export const ScannedFoodItem = z.object({
  name: z.string(),
  regionalName: z.string().optional(),
  foodDbId: z.string().uuid().optional(),
  estimatedGrams: z.number(),
  estimatedKatori: z.number(),
  calories: z.number(),
  carbsG: z.number(),
  giScore: z.number().min(0).max(100),
  glScore: z.number(),
  confidence: z.number().min(0).max(1),
  candidates: z.array(z.string()).optional(),
});
export type ScannedFoodItem = z.infer<typeof ScannedFoodItem>;

export const FoodScanResult = z.object({
  items: z.array(ScannedFoodItem),
  thaliDetected: z.boolean(),
  rawDescription: z.string(),
});
export type FoodScanResult = z.infer<typeof FoodScanResult>;

/** Low-confidence items are surfaced to the user for confirmation — spec §5.5.2 */
export const LOW_CONFIDENCE_THRESHOLD = 0.7;

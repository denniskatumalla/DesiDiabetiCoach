import { z } from 'zod';
import { LanguageCode } from '../constants/languages';

/** Spec §5.1 — Onboarding & Diabetic Profile */
export const DiabetesType = z.enum(['type1', 'type2', 'prediabetes', 'gestational']);
export type DiabetesType = z.infer<typeof DiabetesType>;

export const CuisinePreference = z.enum([
  'south_indian',
  'north_indian',
  'sri_lankan',
  'bangladeshi',
  'pakistani',
  'mixed',
]);
export type CuisinePreference = z.infer<typeof CuisinePreference>;

export const DietaryRestriction = z.enum(['vegetarian', 'vegan', 'jain', 'halal', 'none']);
export type DietaryRestriction = z.infer<typeof DietaryRestriction>;

export const OnboardingInput = z.object({
  fullName: z.string().min(1).max(120),
  dateOfBirth: z.string().date(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  diabetesType: DiabetesType,
  diagnosisYear: z.number().int().min(1950).max(2100),
  targetBgFastingMin: z.number().int().default(80),
  targetBgFastingMax: z.number().int().default(130),
  targetBgPostMealMax: z.number().int().default(180),
  languagePref: LanguageCode.default('en'),
  cuisinePreference: CuisinePreference,
  dietaryRestriction: DietaryRestriction,
  unitsPreference: z.enum(['mg/dL', 'mmol/L']).default('mg/dL'),
});
export type OnboardingInput = z.infer<typeof OnboardingInput>;

export const UserProfile = OnboardingInput.extend({
  id: z.string().uuid(),
  targetHba1c: z.number().default(7.0),
  heightCm: z.number().nullable(),
  weightKg: z.number().nullable(),
  onboardedAt: z.string().datetime().nullable(),
  subscription: z.enum(['free', 'coach', 'family']).default('free'),
});
export type UserProfile = z.infer<typeof UserProfile>;

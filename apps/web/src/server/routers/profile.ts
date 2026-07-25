import { OnboardingInput } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';

export const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ctx.userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }),

  completeOnboarding: protectedProcedure.input(OnboardingInput).mutation(async ({ ctx, input }) => {
    // Upsert (not update) — a trigger creates a bare user_profiles row on
    // signup, but upsert is defensive in case that row is ever missing.
    const { error } = await ctx.supabase.from('user_profiles').upsert({
      id: ctx.userId,
      full_name: input.fullName,
      date_of_birth: input.dateOfBirth,
      gender: input.gender,
      diabetes_type: input.diabetesType,
      diagnosis_year: input.diagnosisYear,
      language_pref: input.languagePref,
      target_bg_fasting_min: input.targetBgFastingMin,
      target_bg_fasting_max: input.targetBgFastingMax,
      target_bg_post_meal_max: input.targetBgPostMealMax,
      cuisine_preference: input.cuisinePreference,
      dietary_restriction: input.dietaryRestriction,
      units_preference: input.unitsPreference,
      onboarded_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { success: true };
  }),
});

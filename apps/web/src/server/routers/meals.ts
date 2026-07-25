import { z } from 'zod';
import { MealLogInput, calculateGl } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';

export const mealsRouter = router({
  /** Manual food search — spec §5.5.4. `foods` has no RLS (public read). */
  searchFoods: protectedProcedure.input(z.object({ query: z.string().min(1) })).query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('foods')
      .select('*')
      .textSearch('name_en', input.query, { type: 'websearch' })
      .limit(20);

    if (error) throw error;
    return data;
  }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('meal_logs')
        .select('*, meal_items(*)')
        .eq('user_id', ctx.userId)
        .order('logged_at', { ascending: false })
        .limit(input?.limit ?? 20);

      if (error) throw error;
      return data;
    }),

  create: protectedProcedure.input(MealLogInput).mutation(async ({ ctx, input }) => {
    const totalCarbsG = input.items.reduce((sum, i) => sum + (i.carbsG ?? 0) * i.quantity, 0);
    const totalCalories = input.items.reduce((sum, i) => sum + (i.calories ?? 0) * i.quantity, 0);

    const { data: mealLog, error: mealError } = await ctx.supabase
      .from('meal_logs')
      .insert({
        user_id: ctx.userId,
        meal_type: input.mealType,
        logged_at: input.loggedAt ?? new Date().toISOString(),
        photo_url: input.photoUrl,
        ai_analysis: input.aiAnalysis ?? null,
        total_carbs_g: totalCarbsG,
        total_calories: totalCalories,
        notes: input.notes,
      })
      .select()
      .single();

    if (mealError) throw mealError;

    const { error: itemsError } = await ctx.supabase.from('meal_items').insert(
      input.items.map((item) => ({
        meal_log_id: mealLog.id,
        food_id: item.foodId,
        food_name_raw: item.foodNameRaw,
        quantity: item.quantity,
        serving_unit: item.servingUnit,
        carbs_g: item.carbsG,
        calories: item.calories,
      }))
    );

    if (itemsError) throw itemsError;
    return mealLog;
  }),
});

/** Re-exported so the client can preview GL before submitting a manual log. */
export { calculateGl };

import { z } from 'zod';
import { MealLogInput, calculateGl, type Json, type Tables } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';

/**
 * Shape returned by the `*, meal_items(*)` join.
 *
 * `ai_analysis` is widened from the recursive `Json` type to `unknown`:
 * tRPC's output-serialisation mapper recurses through `Json` and trips
 * TS2589 in every client that reads this query. Clients cannot rely on its
 * internal shape anyway — it is raw model output persisted for display.
 */
type MealLogWithItems = Omit<Tables<'meal_logs'>, 'ai_analysis'> & {
  ai_analysis: unknown;
  meal_items: Tables<'meal_items'>[];
};

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
    // Annotated explicitly: inferring the nested-select generic through tRPC
    // trips TS2589 ("type instantiation is excessively deep") in consumers.
    .query(async ({ ctx, input }): Promise<MealLogWithItems[]> => {
      const { data, error } = await ctx.supabase
        .from('meal_logs')
        .select('*, meal_items(*)')
        .eq('user_id', ctx.userId)
        .order('logged_at', { ascending: false })
        .limit(input?.limit ?? 20);

      if (error) throw error;
      return data ?? [];
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
        // Validated upstream by FoodScanResult; the column is untyped JSONB.
        ai_analysis: (input.aiAnalysis ?? null) as Json,
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

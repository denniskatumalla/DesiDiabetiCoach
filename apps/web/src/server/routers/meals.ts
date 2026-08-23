import { z } from 'zod';
import { MealLogInput, calculateGl, type Json, type Tables } from '@desidiabeticoach/shared';
import { protectedProcedure, router, type Context } from '../trpc';

/** Meal photos live in a private bucket; read URLs are signed for one hour. */
const PHOTO_URL_TTL_SECONDS = 3600;

/**
 * Shape returned by the `*, meal_items(*)` join.
 *
 * `ai_analysis` is widened from the recursive `Json` type to `unknown`:
 * tRPC's output-serialisation mapper recurses through `Json` and trips
 * TS2589 in every client that reads this query. Clients cannot rely on its
 * internal shape anyway — it is raw model output persisted for display.
 *
 * `photo_url` holds a storage object path; `photo_signed_url` is the
 * short-lived URL clients actually render.
 */
type MealLogWithItems = Omit<Tables<'meal_logs'>, 'ai_analysis'> & {
  ai_analysis: unknown;
  meal_items: Tables<'meal_items'>[];
  photo_signed_url: string | null;
};

export const mealsRouter = router({
  /** Manual food search — spec §5.5.4. `foods` is read-only for all users. */
  searchFoods: protectedProcedure.input(z.object({ query: z.string().min(1) })).query(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('foods')
      .select('*')
      // `config` is required for the GIN index on to_tsvector('english', name_en)
      // to apply — without it postgrest emits the one-argument to_tsvector(),
      // which is a different expression and forces a sequential scan.
      .textSearch('name_en', input.query, { type: 'websearch', config: 'english' })
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

      const meals = (data ?? []) as unknown as Omit<MealLogWithItems, 'photo_signed_url'>[];
      const signed = await signPhotoPaths(ctx.supabase, meals.map((m) => m.photo_url));

      return meals.map((meal) => ({
        ...meal,
        photo_signed_url: meal.photo_url ? (signed.get(meal.photo_url) ?? null) : null,
      }));
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
        // Storage object path, not a URL — signed on read by `list`.
        photo_url: input.photoPath,
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

    if (itemsError) {
      // The two writes are separate statements, so a failure here would
      // otherwise leave a meal carrying carb and calorie totals with no
      // components behind them — visible in history, fed to the coaching
      // prompt, and unexplainable to the user. Undo the parent row before
      // surfacing the error.
      await ctx.supabase.from('meal_logs').delete().eq('id', mealLog.id).eq('user_id', ctx.userId);
      throw itemsError;
    }

    return mealLog;
  }),
});

/**
 * Batch-sign the stored object paths, keyed by the value held in `photo_url`.
 *
 * Rows written before photos were stored as paths hold a full (long-expired)
 * URL; pass those through untouched rather than signing them as object keys.
 */
async function signPhotoPaths(
  supabase: Context['supabase'],
  rawPaths: (string | null)[]
): Promise<Map<string, string>> {
  const signed = new Map<string, string>();
  const isUrl = (value: string) => /^https?:\/\//.test(value);
  const stored = rawPaths.filter((p): p is string => !!p);

  stored.filter(isUrl).forEach((url) => signed.set(url, url));

  const paths = [...new Set(stored.filter((p) => !isUrl(p)))];
  if (paths.length === 0) return signed;

  const { data } = await supabase.storage.from('meal-photos').createSignedUrls(paths, PHOTO_URL_TTL_SECONDS);

  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
  }

  return signed;
}

/** Re-exported so the client can preview GL before submitting a manual log. */
export { calculateGl };

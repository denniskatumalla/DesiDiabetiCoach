import { A1cLogInput } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';

export const a1cRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('a1c_logs')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('test_date', { ascending: false });

    if (error) throw error;
    return data;
  }),

  create: protectedProcedure.input(A1cLogInput).mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('a1c_logs')
      .insert({
        user_id: ctx.userId,
        test_date: input.testDate,
        value: input.value,
        lab_name: input.labName,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }),
});

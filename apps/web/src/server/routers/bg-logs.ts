import { z } from 'zod';
import { BgLogInput } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';

export const bgLogsRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(200).default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('bg_logs')
        .select('*')
        .eq('user_id', ctx.userId)
        .order('logged_at', { ascending: false })
        .limit(input?.limit ?? 30);

      if (error) throw error;
      return data;
    }),

  create: protectedProcedure.input(BgLogInput).mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('bg_logs')
      .insert({
        user_id: ctx.userId,
        value: input.value,
        context: input.context,
        logged_at: input.loggedAt ?? new Date().toISOString(),
        notes: input.notes,
        device: 'manual',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }),

  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase.from('bg_logs').delete().eq('id', input.id).eq('user_id', ctx.userId);
    if (error) throw error;
    return { success: true };
  }),
});

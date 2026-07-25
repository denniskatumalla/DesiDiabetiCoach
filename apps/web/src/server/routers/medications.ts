import { z } from 'zod';
import { MedicationInput, MedicationLogInput } from '@desidiabeticoach/shared';
import { protectedProcedure, router } from '../trpc';

export const medicationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('medications')
      .select('*')
      .eq('user_id', ctx.userId)
      .is('end_date', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }),

  create: protectedProcedure.input(MedicationInput).mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('medications')
      .insert({
        user_id: ctx.userId,
        name: input.name,
        dose_value: input.doseValue,
        dose_unit: input.doseUnit,
        frequency: input.frequency,
        is_insulin: input.isInsulin,
        start_date: input.startDate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }),

  discontinue: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('medications')
      .update({ end_date: new Date().toISOString().slice(0, 10) })
      .eq('id', input.id)
      .eq('user_id', ctx.userId);

    if (error) throw error;
    return { success: true };
  }),

  logDose: protectedProcedure.input(MedicationLogInput).mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('medication_logs')
      .insert({
        user_id: ctx.userId,
        medication_name: input.medicationName,
        dose_mg: input.doseMg,
        taken: input.taken,
        taken_at: input.takenAt ?? new Date().toISOString(),
        scheduled_at: input.scheduledAt,
        notes: input.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }),

  recentLogs: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }).optional())
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - (input?.days ?? 30));

      const { data, error } = await ctx.supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', ctx.userId)
        .gte('taken_at', since.toISOString())
        .order('taken_at', { ascending: false });

      if (error) throw error;
      return data;
    }),
});

import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';

/**
 * Conversation persistence. The streaming chat call itself lives at
 * POST /api/coach (a plain Route Handler, not tRPC) so the Anthropic
 * `stream: true` response can be piped straight through — see spec §9.2.
 */
export const coachRouter = router({
  latestSession: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', ctx.userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }),

  appendMessages: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid().optional(),
        messages: z.array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
            timestamp: z.string().datetime(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.sessionId) {
        const { data: existing, error: fetchError } = await ctx.supabase
          .from('ai_conversations')
          .select('messages')
          .eq('id', input.sessionId)
          .eq('user_id', ctx.userId)
          .single();

        if (fetchError) throw fetchError;

        // `messages` is a JSONB column, so it is only `Json` at the type level.
        // Guard rather than spreading blindly — a non-array value would throw
        // at runtime and lose the turn.
        const history = Array.isArray(existing.messages) ? existing.messages : [];

        const { error } = await ctx.supabase
          .from('ai_conversations')
          .update({ messages: [...history, ...input.messages] })
          .eq('id', input.sessionId);

        if (error) throw error;
        return { sessionId: input.sessionId };
      }

      const { data, error } = await ctx.supabase
        .from('ai_conversations')
        .insert({ user_id: ctx.userId, messages: input.messages })
        .select('id')
        .single();

      if (error) throw error;
      return { sessionId: data.id };
    }),
});

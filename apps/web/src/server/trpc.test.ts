import { TRPCError } from '@trpc/server';
import { appRouter } from './routers/_app';
import { createSupabaseMock } from '../test/supabase-mock';
import type { Context } from './trpc';

/**
 * Every user-data procedure sits behind `protectedProcedure`. RLS is the
 * real backstop, but the guard must reject anonymous calls before a query is
 * ever issued — otherwise a misconfigured policy is the only thing standing
 * between an anonymous caller and another user's rows.
 */

function anonContext(): Context {
  return { supabase: createSupabaseMock().supabase, userId: null };
}

/** One representative procedure per router, with input that would otherwise be valid. */
const PROCEDURES: { name: string; call: (caller: ReturnType<typeof appRouter.createCaller>) => Promise<unknown> }[] = [
  { name: 'profile.get', call: (c) => c.profile.get() },
  { name: 'bgLogs.list', call: (c) => c.bgLogs.list() },
  { name: 'bgLogs.create', call: (c) => c.bgLogs.create({ value: 110, context: 'fasting' }) },
  { name: 'bgLogs.delete', call: (c) => c.bgLogs.delete({ id: '11111111-1111-4111-8111-111111111111' }) },
  { name: 'a1c.list', call: (c) => c.a1c.list() },
  { name: 'a1c.create', call: (c) => c.a1c.create({ testDate: '2026-01-15', value: 6.8 }) },
  { name: 'medications.list', call: (c) => c.medications.list() },
  { name: 'medications.recentLogs', call: (c) => c.medications.recentLogs() },
  { name: 'meals.list', call: (c) => c.meals.list() },
  { name: 'meals.searchFoods', call: (c) => c.meals.searchFoods({ query: 'idli' }) },
  { name: 'foodScan.scan', call: (c) => c.foodScan.scan({ imageBase64: 'abc', mediaType: 'image/jpeg' }) },
];

describe('protectedProcedure', () => {
  it.each(PROCEDURES)('rejects an anonymous caller on $name', async ({ call }) => {
    const caller = appRouter.createCaller(anonContext());

    await expect(call(caller)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('never touches the database when unauthenticated', async () => {
    const mock = createSupabaseMock();
    const caller = appRouter.createCaller({ supabase: mock.supabase, userId: null });

    await expect(caller.bgLogs.list()).rejects.toThrow(TRPCError);
    expect(mock.calls).toHaveLength(0);
  });

  it('passes the authenticated user id through to the resolver', async () => {
    const mock = createSupabaseMock({ bg_logs: { data: [] } });
    const caller = appRouter.createCaller({ supabase: mock.supabase, userId: 'user-1' });

    await caller.bgLogs.list();

    expect(mock.argsFor('bg_logs', 'eq')).toEqual(['user_id', 'user-1']);
  });
});

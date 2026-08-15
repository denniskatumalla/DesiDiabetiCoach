import { bgLogsRouter } from './bg-logs';
import { createSupabaseMock, dbError } from '../../test/supabase-mock';

const USER = 'user-1';

function caller(results = {}) {
  const mock = createSupabaseMock(results);
  return { caller: bgLogsRouter.createCaller({ supabase: mock.supabase, userId: USER }), mock };
}

describe('bgLogs.list', () => {
  it('scopes to the caller and returns newest first', async () => {
    const rows = [{ id: 'a', value: 110 }];
    const { caller: c, mock } = caller({ bg_logs: { data: rows } });

    await expect(c.list()).resolves.toEqual(rows);
    expect(mock.argsFor('bg_logs', 'eq')).toEqual(['user_id', USER]);
    expect(mock.argsFor('bg_logs', 'order')).toEqual(['logged_at', { ascending: false }]);
  });

  it('defaults to 30 rows when no input is given', async () => {
    const { caller: c, mock } = caller({ bg_logs: { data: [] } });

    await c.list();

    expect(mock.argsFor('bg_logs', 'limit')).toEqual([30]);
  });

  it('honours an explicit limit', async () => {
    const { caller: c, mock } = caller({ bg_logs: { data: [] } });

    await c.list({ limit: 5 });

    expect(mock.argsFor('bg_logs', 'limit')).toEqual([5]);
  });

  it.each([0, 201])('rejects an out-of-range limit (%i)', async (limit) => {
    const { caller: c } = caller({ bg_logs: { data: [] } });

    await expect(c.list({ limit })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('propagates a database error', async () => {
    const { caller: c } = caller({ bg_logs: dbError('connection lost') });

    await expect(c.list()).rejects.toMatchObject({ message: 'connection lost' });
  });
});

describe('bgLogs.create', () => {
  it('inserts the reading against the caller and tags it manual', async () => {
    const { caller: c, mock } = caller({ bg_logs: { data: { id: 'new' } } });

    await c.create({ value: 142, context: 'after_lunch', notes: 'post-thali' });

    const [payload] = mock.argsFor('bg_logs', 'insert') ?? [];
    expect(payload).toMatchObject({
      user_id: USER,
      value: 142,
      context: 'after_lunch',
      notes: 'post-thali',
      device: 'manual',
    });
  });

  it('defaults logged_at to now when omitted', async () => {
    const { caller: c, mock } = caller({ bg_logs: { data: { id: 'new' } } });
    const before = Date.now();

    await c.create({ value: 100, context: 'fasting' });

    const [payload] = (mock.argsFor('bg_logs', 'insert') ?? []) as [{ logged_at: string }];
    expect(Date.parse(payload.logged_at)).toBeGreaterThanOrEqual(before);
  });

  it('preserves an explicit logged_at', async () => {
    const { caller: c, mock } = caller({ bg_logs: { data: { id: 'new' } } });

    await c.create({ value: 100, context: 'fasting', loggedAt: '2026-01-02T03:04:05.000Z' });

    expect(mock.argsFor('bg_logs', 'insert')).toEqual([
      expect.objectContaining({ logged_at: '2026-01-02T03:04:05.000Z' }),
    ]);
  });

  // Spec §5.2 clamps physiologically plausible readings; a bad value must not reach the DB.
  it.each([19, 601, 110.5])('rejects an implausible value (%p)', async (value) => {
    const { caller: c, mock } = caller();

    await expect(c.create({ value, context: 'fasting' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });

  it('rejects an unknown context', async () => {
    const { caller: c } = caller();

    await expect(
      c.create({ value: 100, context: 'after_tea' } as unknown as { value: number; context: 'fasting' })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

describe('bgLogs.delete', () => {
  // Without the user_id filter, a caller could delete another user's reading
  // if an RLS policy were ever relaxed.
  it('filters on both the row id and the caller id', async () => {
    const { caller: c, mock } = caller({ bg_logs: {} });

    await c.delete({ id: '11111111-1111-4111-8111-111111111111' });

    expect(mock.allArgsFor('bg_logs', 'eq')).toEqual([
      ['id', '11111111-1111-4111-8111-111111111111'],
      ['user_id', USER],
    ]);
  });

  it('rejects a non-uuid id', async () => {
    const { caller: c, mock } = caller();

    await expect(c.delete({ id: 'not-a-uuid' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });

  it('propagates a database error', async () => {
    const { caller: c } = caller({ bg_logs: dbError('row locked') });

    await expect(c.delete({ id: '11111111-1111-4111-8111-111111111111' })).rejects.toMatchObject({
      message: 'row locked',
    });
  });
});

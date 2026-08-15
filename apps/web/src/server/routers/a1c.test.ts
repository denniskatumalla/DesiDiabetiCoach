import { a1cRouter } from './a1c';
import { createSupabaseMock, dbError } from '../../test/supabase-mock';

const USER = 'user-1';

function caller(results = {}) {
  const mock = createSupabaseMock(results);
  return { caller: a1cRouter.createCaller({ supabase: mock.supabase, userId: USER }), mock };
}

describe('a1c.list', () => {
  it('returns the caller rows newest test first', async () => {
    const rows = [{ id: 'a', value: 6.8 }];
    const { caller: c, mock } = caller({ a1c_logs: { data: rows } });

    await expect(c.list()).resolves.toEqual(rows);
    expect(mock.argsFor('a1c_logs', 'eq')).toEqual(['user_id', USER]);
    expect(mock.argsFor('a1c_logs', 'order')).toEqual(['test_date', { ascending: false }]);
  });

  it('propagates a database error', async () => {
    const { caller: c } = caller({ a1c_logs: dbError('unavailable') });

    await expect(c.list()).rejects.toMatchObject({ message: 'unavailable' });
  });
});

describe('a1c.create', () => {
  it('maps the input onto the a1c_logs row', async () => {
    const { caller: c, mock } = caller({ a1c_logs: { data: { id: 'a1c-1' } } });

    await c.create({ testDate: '2026-02-01', value: 7.2, labName: 'Apollo', notes: 'fasting draw' });

    expect(mock.argsFor('a1c_logs', 'insert')).toEqual([
      {
        user_id: USER,
        test_date: '2026-02-01',
        value: 7.2,
        lab_name: 'Apollo',
        notes: 'fasting draw',
      },
    ]);
  });

  it('accepts an entry with no lab or notes', async () => {
    const { caller: c, mock } = caller({ a1c_logs: { data: {} } });

    await c.create({ testDate: '2026-02-01', value: 6.1 });

    expect(mock.argsFor('a1c_logs', 'insert')).toEqual([
      expect.objectContaining({ lab_name: undefined, notes: undefined }),
    ]);
  });

  // HbA1c outside 3–15% is not physiologically meaningful (spec §5.3).
  it.each([2.9, 15.1])('rejects an out-of-range value (%p)', async (value) => {
    const { caller: c, mock } = caller();

    await expect(c.create({ testDate: '2026-02-01', value })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });

  it.each([3, 15])('accepts the boundary value %p', async (value) => {
    const { caller: c, mock } = caller({ a1c_logs: { data: {} } });

    await c.create({ testDate: '2026-02-01', value });

    expect(mock.argsFor('a1c_logs', 'insert')).toEqual([expect.objectContaining({ value })]);
  });

  it('rejects a non-ISO test date', async () => {
    const { caller: c } = caller();

    await expect(c.create({ testDate: '01-02-2026', value: 7 })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

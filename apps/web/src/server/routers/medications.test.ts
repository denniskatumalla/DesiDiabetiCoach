import { medicationsRouter } from './medications';
import { createSupabaseMock, dbError } from '../../test/supabase-mock';

const USER = 'user-1';
const MED_ID = '22222222-2222-4222-8222-222222222222';

function caller(results = {}) {
  const mock = createSupabaseMock(results);
  return { caller: medicationsRouter.createCaller({ supabase: mock.supabase, userId: USER }), mock };
}

describe('medications.list', () => {
  // A discontinued medication has an end_date; the active list must exclude it.
  it('returns only active medications for the caller', async () => {
    const { caller: c, mock } = caller({ medications: { data: [{ id: MED_ID }] } });

    await expect(c.list()).resolves.toEqual([{ id: MED_ID }]);
    expect(mock.argsFor('medications', 'eq')).toEqual(['user_id', USER]);
    expect(mock.argsFor('medications', 'is')).toEqual(['end_date', null]);
  });

  it('propagates a database error', async () => {
    const { caller: c } = caller({ medications: dbError('timeout') });

    await expect(c.list()).rejects.toMatchObject({ message: 'timeout' });
  });
});

describe('medications.create', () => {
  it('maps the input onto the medications row', async () => {
    const { caller: c, mock } = caller({ medications: { data: { id: MED_ID } } });

    await c.create({
      name: 'Metformin',
      doseValue: 500,
      doseUnit: 'mg',
      frequency: 'twice_daily',
      isInsulin: false,
      startDate: '2026-01-01',
    });

    expect(mock.argsFor('medications', 'insert')).toEqual([
      {
        user_id: USER,
        name: 'Metformin',
        dose_value: 500,
        dose_unit: 'mg',
        frequency: 'twice_daily',
        is_insulin: false,
        start_date: '2026-01-01',
      },
    ]);
  });

  it('defaults isInsulin to false', async () => {
    const { caller: c, mock } = caller({ medications: { data: {} } });

    await c.create({
      name: 'Glipizide',
      doseValue: 5,
      doseUnit: 'mg',
      frequency: 'once_daily',
      startDate: '2026-01-01',
    });

    expect(mock.argsFor('medications', 'insert')).toEqual([expect.objectContaining({ is_insulin: false })]);
  });

  it('accepts insulin dosed in units', async () => {
    const { caller: c, mock } = caller({ medications: { data: {} } });

    await c.create({
      name: 'Lantus (Insulin Glargine)',
      doseValue: 18,
      doseUnit: 'units',
      frequency: 'at_bedtime',
      isInsulin: true,
      startDate: '2026-01-01',
    });

    expect(mock.argsFor('medications', 'insert')).toEqual([
      expect.objectContaining({ dose_unit: 'units', is_insulin: true }),
    ]);
  });

  it.each([
    ['a non-positive dose', { doseValue: 0 }],
    ['an unknown unit', { doseUnit: 'ml' }],
    ['an unknown frequency', { frequency: 'hourly' }],
    ['a non-date start', { startDate: '01/01/2026' }],
  ])('rejects %s', async (_label, override) => {
    const { caller: c, mock } = caller();
    const input = {
      name: 'Metformin',
      doseValue: 500,
      doseUnit: 'mg',
      frequency: 'once_daily',
      startDate: '2026-01-01',
      ...override,
    };

    await expect(
      c.create(input as unknown as Parameters<typeof c.create>[0])
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });
});

describe('medications.discontinue', () => {
  it('sets an end date scoped to the caller rather than deleting history', async () => {
    const { caller: c, mock } = caller({ medications: {} });

    await c.discontinue({ id: MED_ID });

    const [payload] = mock.argsFor('medications', 'update') as [{ end_date: string }];
    expect(payload.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mock.allArgsFor('medications', 'eq')).toEqual([
      ['id', MED_ID],
      ['user_id', USER],
    ]);
    expect(mock.callsFor('medications').some((call) => call.method === 'delete')).toBe(false);
  });

  it('rejects a non-uuid id', async () => {
    const { caller: c } = caller();

    await expect(c.discontinue({ id: 'nope' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

describe('medications.logDose', () => {
  it('records a taken dose against the caller', async () => {
    const { caller: c, mock } = caller({ medication_logs: { data: { id: 'log-1' } } });

    await c.logDose({ medicationId: MED_ID, medicationName: 'Metformin', doseMg: 500, taken: true });

    expect(mock.argsFor('medication_logs', 'insert')).toEqual([
      expect.objectContaining({ user_id: USER, medication_name: 'Metformin', dose_mg: 500, taken: true }),
    ]);
  });

  it('defaults taken to true and stamps taken_at', async () => {
    const { caller: c, mock } = caller({ medication_logs: { data: {} } });
    const before = Date.now();

    await c.logDose({ medicationId: MED_ID, medicationName: 'Metformin' });

    const [payload] = mock.argsFor('medication_logs', 'insert') as [{ taken: boolean; taken_at: string }];
    expect(payload.taken).toBe(true);
    expect(Date.parse(payload.taken_at)).toBeGreaterThanOrEqual(before);
  });

  // Adherence % on the dashboard depends on missed doses being recorded, not omitted.
  it('records a missed dose', async () => {
    const { caller: c, mock } = caller({ medication_logs: { data: {} } });

    await c.logDose({ medicationId: MED_ID, medicationName: 'Metformin', taken: false });

    expect(mock.argsFor('medication_logs', 'insert')).toEqual([expect.objectContaining({ taken: false })]);
  });
});

describe('medications.recentLogs', () => {
  it('defaults to a 30-day window', async () => {
    const { caller: c, mock } = caller({ medication_logs: { data: [] } });

    await c.recentLogs();

    const [column, since] = mock.argsFor('medication_logs', 'gte') as [string, string];
    expect(column).toBe('taken_at');
    const days = (Date.now() - Date.parse(since)) / 86_400_000;
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThan(30.1);
  });

  it('honours an explicit window', async () => {
    const { caller: c, mock } = caller({ medication_logs: { data: [] } });

    await c.recentLogs({ days: 7 });

    const [, since] = mock.argsFor('medication_logs', 'gte') as [string, string];
    const days = (Date.now() - Date.parse(since)) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });

  it('rejects a window beyond 90 days', async () => {
    const { caller: c } = caller();

    await expect(c.recentLogs({ days: 91 })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

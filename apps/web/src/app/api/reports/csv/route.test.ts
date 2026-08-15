import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSupabaseMock, dbError, type QueryResult } from '@/test/supabase-mock';
import { GET } from './route';

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));

const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const USER = { id: 'user-1' };

function request(type?: string) {
  const url = type
    ? `http://localhost/api/reports/csv?type=${type}`
    : 'http://localhost/api/reports/csv';
  return new NextRequest(url);
}

function withData(
  results: Record<string, QueryResult | QueryResult[]>,
  user: { id: string } | null = USER
) {
  const mock = createSupabaseMock(results, user);
  mockedCreateClient.mockReturnValue(mock.supabase as unknown as ReturnType<typeof createClient>);
  return mock;
}

/** Splits a CSV body into its header row and data rows. */
function rowsOf(body: string) {
  const [header, ...rows] = body.split('\n');
  return { header, rows };
}

beforeEach(() => mockedCreateClient.mockReset());

describe('auth and routing', () => {
  it('returns 401 for an anonymous request', async () => {
    const mock = withData({}, null);

    const response = await GET(request('bg'));

    expect(response.status).toBe(401);
    expect(mock.calls).toHaveLength(0);
  });

  it('returns 400 for an unknown report type', async () => {
    withData({});

    const response = await GET(request('sleep'));

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Unknown report type');
  });

  it('defaults to the BG report when no type is given', async () => {
    const mock = withData({ bg_logs: { data: [] } });

    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(mock.callsFor('bg_logs').length).toBeGreaterThan(0);
  });

  it('returns 500 when the query fails', async () => {
    withData({ bg_logs: dbError('query failed') });

    const response = await GET(request('bg'));

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe('query failed');
  });
});

describe('bg report', () => {
  it('scopes to the caller and emits the documented columns', async () => {
    const mock = withData({
      bg_logs: {
        data: [
          { value: 110, context: 'fasting', logged_at: '2026-02-01T06:00:00Z', notes: 'ok' },
          { value: 165, context: 'after_lunch', logged_at: '2026-02-01T14:00:00Z', notes: null },
        ],
      },
    });

    const response = await GET(request('bg'));
    const { header, rows } = rowsOf(await response.text());

    expect(mock.argsFor('bg_logs', 'eq')).toEqual(['user_id', USER.id]);
    expect(header).toBe('value_mg_dl,context,logged_at,notes');
    expect(rows).toEqual([
      '110,fasting,2026-02-01T06:00:00Z,ok',
      '165,after_lunch,2026-02-01T14:00:00Z,',
    ]);
  });

  it('sets CSV download headers', async () => {
    withData({ bg_logs: { data: [] } });

    const response = await GET(request('bg'));

    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="bg-logs.csv"');
  });

  it('emits a header-only file when there are no readings', async () => {
    withData({ bg_logs: { data: [] } });

    const response = await GET(request('bg'));

    await expect(response.text()).resolves.toBe('value_mg_dl,context,logged_at,notes');
  });
});

describe('meals and medications reports', () => {
  it('exports meal logs under their own filename', async () => {
    withData({
      meal_logs: {
        data: [
          {
            meal_type: 'lunch',
            logged_at: '2026-02-01T12:00:00Z',
            total_carbs_g: 45,
            total_calories: 320,
            notes: null,
          },
        ],
      },
    });

    const response = await GET(request('meals'));
    const { header, rows } = rowsOf(await response.text());

    expect(response.headers.get('Content-Disposition')).toContain('meal-logs.csv');
    expect(header).toBe('meal_type,logged_at,total_carbs_g,total_calories,notes');
    expect(rows).toEqual(['lunch,2026-02-01T12:00:00Z,45,320,']);
  });

  it('exports medication logs including boolean adherence', async () => {
    withData({
      medication_logs: {
        data: [
          {
            medication_name: 'Metformin',
            dose_mg: 500,
            taken: true,
            taken_at: '2026-02-01T08:00:00Z',
            scheduled_at: null,
          },
          {
            medication_name: 'Glipizide',
            dose_mg: null,
            taken: false,
            taken_at: '2026-02-01T20:00:00Z',
            scheduled_at: '2026-02-01T20:00:00Z',
          },
        ],
      },
    });

    const response = await GET(request('medications'));
    const { rows } = rowsOf(await response.text());

    expect(response.headers.get('Content-Disposition')).toContain('medication-logs.csv');
    expect(rows).toEqual([
      'Metformin,500,true,2026-02-01T08:00:00Z,',
      'Glipizide,,false,2026-02-01T20:00:00Z,2026-02-01T20:00:00Z',
    ]);
  });
});

// A note is free text, so it can carry the delimiter, the quote char, or a newline.
// Getting this wrong silently corrupts the user's export in Excel.
describe('CSV escaping', () => {
  /**
   * Returns everything after the header row. Deliberately not `rowsOf` — a
   * correctly escaped field may itself contain a newline, so splitting on
   * every '\n' would tear the row in half and mask the bug being tested.
   */
  async function bgNotes(notes: string) {
    withData({ bg_logs: { data: [{ value: 100, context: 'fasting', logged_at: 'T', notes }] } });
    const body = await (await GET(request('bg'))).text();
    return body.slice(body.indexOf('\n') + 1);
  }

  it('quotes a field containing a comma', async () => {
    await expect(bgNotes('ate rice, dal and curd')).resolves.toBe('100,fasting,T,"ate rice, dal and curd"');
  });

  it('doubles embedded quotes and wraps the field', async () => {
    await expect(bgNotes('felt "low"')).resolves.toBe('100,fasting,T,"felt ""low"""');
  });

  it('quotes a field containing a newline', async () => {
    await expect(bgNotes('line one\nline two')).resolves.toBe('100,fasting,T,"line one\nline two"');
  });

  it('leaves an ordinary field unquoted', async () => {
    await expect(bgNotes('after a walk')).resolves.toBe('100,fasting,T,after a walk');
  });
});

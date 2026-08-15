import { coachRouter } from './coach';
import { createSupabaseMock, dbError, type QueryResult } from '../../test/supabase-mock';

const USER = 'user-1';
const SESSION_ID = '33333333-3333-4333-8333-333333333333';

function caller(results: Record<string, QueryResult | QueryResult[]> = {}) {
  const mock = createSupabaseMock(results);
  return { caller: coachRouter.createCaller({ supabase: mock.supabase, userId: USER }), mock };
}

const MESSAGE = { role: 'user' as const, content: 'is idli ok?', timestamp: '2026-02-01T10:00:00.000Z' };
const REPLY = { role: 'assistant' as const, content: 'In moderation.', timestamp: '2026-02-01T10:00:05.000Z' };

describe('coach.latestSession', () => {
  it('returns the most recently updated conversation for the caller', async () => {
    const { caller: c, mock } = caller({ ai_conversations: { data: { id: SESSION_ID, messages: [] } } });

    await expect(c.latestSession()).resolves.toEqual({ id: SESSION_ID, messages: [] });
    expect(mock.argsFor('ai_conversations', 'eq')).toEqual(['user_id', USER]);
    expect(mock.argsFor('ai_conversations', 'order')).toEqual(['updated_at', { ascending: false }]);
    expect(mock.argsFor('ai_conversations', 'limit')).toEqual([1]);
  });

  it('returns null when the user has never chatted', async () => {
    const { caller: c } = caller({ ai_conversations: { data: null } });

    await expect(c.latestSession()).resolves.toBeNull();
  });

  it('propagates a database error', async () => {
    const { caller: c } = caller({ ai_conversations: dbError('unavailable') });

    await expect(c.latestSession()).rejects.toMatchObject({ message: 'unavailable' });
  });
});

describe('coach.appendMessages — new conversation', () => {
  it('inserts a conversation owned by the caller and returns its id', async () => {
    const { caller: c, mock } = caller({ ai_conversations: { data: { id: SESSION_ID } } });

    await expect(c.appendMessages({ messages: [MESSAGE, REPLY] })).resolves.toEqual({ sessionId: SESSION_ID });
    expect(mock.argsFor('ai_conversations', 'insert')).toEqual([
      { user_id: USER, messages: [MESSAGE, REPLY] },
    ]);
  });

  it('does not attempt a fetch when no session id is supplied', async () => {
    const { caller: c, mock } = caller({ ai_conversations: { data: { id: SESSION_ID } } });

    await c.appendMessages({ messages: [MESSAGE] });

    expect(mock.callsFor('ai_conversations').some((call) => call.method === 'update')).toBe(false);
  });

  it('rejects a message with an unknown role', async () => {
    const { caller: c, mock } = caller();

    await expect(
      c.appendMessages({
        messages: [{ role: 'system', content: 'x', timestamp: MESSAGE.timestamp }] as unknown as [typeof MESSAGE],
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(mock.calls).toHaveLength(0);
  });

  it('rejects a non-uuid session id', async () => {
    const { caller: c, mock } = caller();

    await expect(c.appendMessages({ sessionId: 'nope', messages: [MESSAGE] })).rejects.toMatchObject({
      code: 'BAD_REQUEST',
    });
    expect(mock.calls).toHaveLength(0);
  });
});

describe('coach.appendMessages — existing conversation', () => {
  /** The append path reads the row first, then writes the merged array back. */
  function appendResults(existing: unknown, updateResult: QueryResult = {}) {
    return { ai_conversations: [{ data: existing }, updateResult] };
  }

  it('reads the existing row scoped to both the session and the caller', async () => {
    const { caller: c, mock } = caller(appendResults({ messages: [MESSAGE] }));

    await c.appendMessages({ sessionId: SESSION_ID, messages: [REPLY] });

    // The read is what enforces ownership before the write.
    expect(mock.allArgsFor('ai_conversations', 'eq').slice(0, 2)).toEqual([
      ['id', SESSION_ID],
      ['user_id', USER],
    ]);
  });

  it('appends to the stored history rather than replacing it', async () => {
    const { caller: c, mock } = caller(appendResults({ messages: [MESSAGE] }));

    await expect(c.appendMessages({ sessionId: SESSION_ID, messages: [REPLY] })).resolves.toEqual({
      sessionId: SESSION_ID,
    });
    expect(mock.argsFor('ai_conversations', 'update')).toEqual([{ messages: [MESSAGE, REPLY] }]);
  });

  it('treats a null messages column as an empty history', async () => {
    const { caller: c, mock } = caller(appendResults({ messages: null }));

    await c.appendMessages({ sessionId: SESSION_ID, messages: [MESSAGE] });

    expect(mock.argsFor('ai_conversations', 'update')).toEqual([{ messages: [MESSAGE] }]);
  });

  it('aborts without writing when the row does not belong to the caller', async () => {
    const { caller: c, mock } = caller({ ai_conversations: [dbError('no rows returned'), {}] });

    await expect(c.appendMessages({ sessionId: SESSION_ID, messages: [REPLY] })).rejects.toMatchObject({
      message: 'no rows returned',
    });
    expect(mock.callsFor('ai_conversations').some((call) => call.method === 'update')).toBe(false);
  });

  it('propagates a failure on the write itself', async () => {
    const { caller: c } = caller(appendResults({ messages: [] }, dbError('update rejected')));

    await expect(c.appendMessages({ sessionId: SESSION_ID, messages: [REPLY] })).rejects.toMatchObject({
      message: 'update rejected',
    });
  });

  /**
   * Documents current behaviour: the UPDATE filters on id only, so ownership
   * rests entirely on the preceding SELECT (and RLS). Sibling procedures
   * (bgLogs.delete, medications.discontinue) additionally scope their write by
   * user_id. If that filter is ever added here, update this expectation.
   */
  it('scopes the update by id alone, relying on the prior read for ownership', async () => {
    const { caller: c, mock } = caller(appendResults({ messages: [] }));

    await c.appendMessages({ sessionId: SESSION_ID, messages: [REPLY] });

    expect(mock.allArgsFor('ai_conversations', 'eq').slice(2)).toEqual([['id', SESSION_ID]]);
  });
});

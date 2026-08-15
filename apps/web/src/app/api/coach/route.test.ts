import { NextRequest } from 'next/server';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getAnthropicClient } from '@/lib/anthropic';
import { createSupabaseMock, type QueryResult } from '@/test/supabase-mock';
import { POST } from './route';

jest.mock('@/lib/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('@/lib/anthropic', () => ({ getAnthropicClient: jest.fn(), CLAUDE_MODEL: 'test-model' }));
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockedCreateJsClient = createSupabaseJsClient as jest.MockedFunction<typeof createSupabaseJsClient>;
const mockedGetAnthropic = getAnthropicClient as jest.MockedFunction<typeof getAnthropicClient>;
const mockStream = jest.fn();

const USER = { id: 'user-1' };

/** Stands in for the Anthropic SDK's event-emitter stream handle. */
function fakeStream() {
  const handlers = new Map<string, ((arg?: unknown) => void)[]>();
  return {
    on(event: string, cb: (arg?: unknown) => void) {
      handlers.set(event, [...(handlers.get(event) ?? []), cb]);
      return this;
    },
    emit(event: string, arg?: unknown) {
      (handlers.get(event) ?? []).forEach((cb) => cb(arg));
    },
  };
}

function request(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/coach', {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  });
}

function setup(results: Record<string, QueryResult | QueryResult[]> = {}, user: { id: string } | null = USER) {
  const mock = createSupabaseMock(results, user);
  mockedCreateClient.mockReturnValue(mock.supabase as unknown as ReturnType<typeof createClient>);
  mockedCreateJsClient.mockReturnValue(mock.supabase as unknown as ReturnType<typeof createSupabaseJsClient>);

  const stream = fakeStream();
  mockStream.mockReturnValue(stream);
  mockedGetAnthropic.mockReturnValue({ messages: { stream: mockStream } } as unknown as ReturnType<
    typeof getAnthropicClient
  >);
  return { mock, stream };
}

/** Drives the stream to completion and returns the full response body. */
async function drain(response: Response, stream: ReturnType<typeof fakeStream>, deltas: string[] = ['Hi there.']) {
  deltas.forEach((delta) => stream.emit('text', delta));
  stream.emit('end');
  return response.text();
}

beforeEach(() => {
  mockedCreateClient.mockReset();
  mockedCreateJsClient.mockReset();
  mockedGetAnthropic.mockReset();
  mockStream.mockReset();
});

describe('auth', () => {
  it('returns 401 for an anonymous request', async () => {
    setup({}, null);

    const response = await POST(request({ message: 'hello' }));

    expect(response.status).toBe(401);
    expect(mockStream).not.toHaveBeenCalled();
  });

  it('accepts a bearer token from the mobile app', async () => {
    const { stream } = setup({ bg_logs: { data: [] } });

    const response = await POST(request({ message: 'hello' }, { authorization: 'Bearer mobile-token' }));

    expect(response.status).toBe(200);
    // Bearer requests build their own client rather than reading session cookies.
    expect(mockedCreateJsClient).toHaveBeenCalled();
    expect(mockedCreateClient).not.toHaveBeenCalled();
    await drain(response, stream);
  });

  it('falls back to the cookie session when no bearer token is present', async () => {
    const { stream } = setup({ bg_logs: { data: [] } });

    const response = await POST(request({ message: 'hello' }));

    expect(mockedCreateClient).toHaveBeenCalled();
    await drain(response, stream);
  });
});

describe('request validation', () => {
  it.each([
    ['an empty message', { message: '' }],
    ['a message over 2000 characters', { message: 'x'.repeat(2001) }],
    ['a missing message', {}],
    ['a non-string message', { message: 42 }],
  ])('returns 400 for %s', async (_label, body) => {
    setup({ bg_logs: { data: [] } });

    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(mockStream).not.toHaveBeenCalled();
  });

  it('accepts a message at the 2000-character limit', async () => {
    const { stream } = setup({ bg_logs: { data: [] } });

    const response = await POST(request({ message: 'x'.repeat(2000) }));

    expect(response.status).toBe(200);
    await drain(response, stream);
  });
});

describe('streaming response', () => {
  it('streams the model deltas as plain text', async () => {
    const { stream } = setup({ bg_logs: { data: [] } });

    const response = await POST(request({ message: 'what should I eat?' }));

    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    await expect(drain(response, stream, ['Try ', 'more ', 'fibre.'])).resolves.toBe('Try more fibre.');
  });

  it('passes the user message and a context-aware system prompt to the model', async () => {
    const { stream } = setup({ bg_logs: { data: [] } });

    const response = await POST(request({ message: 'is idli ok?' }));

    const [args] = mockStream.mock.calls[0] as [{ model: string; system: string; messages: { content: string }[] }];
    expect(args.model).toBe('test-model');
    expect(args.messages[0].content).toBe('is idli ok?');
    expect(typeof args.system).toBe('string');
    expect(args.system.length).toBeGreaterThan(0);
    await drain(response, stream);
  });
});

// Spec §5.6.4 — a dangerous recent reading must be surfaced before any AI advice,
// and must not depend on what the model happens to say.
describe('abnormal BG safety banner', () => {
  const banner =
    'Note: a recent reading was outside safe range — contact your healthcare provider or seek emergency care if symptomatic.\n\n';

  it('prepends the banner when a recent reading is dangerously high', async () => {
    const { stream } = setup({
      bg_logs: { data: [{ value: 400, context: 'random', logged_at: '2026-02-01T10:00:00Z' }] },
    });

    const response = await POST(request({ message: 'how am I doing?' }));

    await expect(drain(response, stream, ['Your levels look elevated.'])).resolves.toBe(
      banner + 'Your levels look elevated.'
    );
  });

  it('prepends the banner when a recent reading is dangerously low', async () => {
    const { stream } = setup({
      bg_logs: { data: [{ value: 45, context: 'fasting', logged_at: '2026-02-01T06:00:00Z' }] },
    });

    const response = await POST(request({ message: 'how am I doing?' }));

    await expect(drain(response, stream, ['ok'])).resolves.toBe(banner + 'ok');
  });

  it('omits the banner when all recent readings are in range', async () => {
    const { stream } = setup({
      bg_logs: {
        data: [
          { value: 110, context: 'fasting', logged_at: '2026-02-01T06:00:00Z' },
          { value: 160, context: 'after_lunch', logged_at: '2026-02-01T14:00:00Z' },
        ],
      },
    });

    const response = await POST(request({ message: 'how am I doing?' }));

    await expect(drain(response, stream, ['Looking good.'])).resolves.toBe('Looking good.');
  });

  it('flags an abnormal reading even when it is not the most recent', async () => {
    const { stream } = setup({
      bg_logs: {
        data: [
          { value: 105, context: 'fasting', logged_at: '2026-02-02T06:00:00Z' },
          { value: 380, context: 'after_dinner', logged_at: '2026-02-01T20:00:00Z' },
        ],
      },
    });

    const response = await POST(request({ message: 'how am I doing?' }));

    await expect(drain(response, stream, ['ok'])).resolves.toBe(banner + 'ok');
  });

  it('omits the banner when there are no readings at all', async () => {
    const { stream } = setup({ bg_logs: { data: [] } });

    const response = await POST(request({ message: 'hello' }));

    await expect(drain(response, stream, ['Welcome!'])).resolves.toBe('Welcome!');
  });
});

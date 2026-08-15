import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@desidiabeticoach/shared';

/**
 * Minimal stand-in for the postgrest query builder.
 *
 * Every builder method returns the builder itself, and the builder is
 * thenable — so any chain the routers build (`.from().select().eq().order()
 * .limit()`, `.insert().select().single()`, `.update().eq().eq()`, ...)
 * resolves to the `{ data, error }` shape configured per table, and every
 * link in the chain is recorded for assertions.
 */

export interface QueryResult {
  data?: unknown;
  error?: unknown;
}

export interface RecordedCall {
  table: string;
  method: string;
  args: unknown[];
}

const CHAIN_METHODS = [
  'select',
  'insert',
  'update',
  'upsert',
  'delete',
  'eq',
  'neq',
  'is',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'match',
  'order',
  'limit',
  'range',
  'textSearch',
  'single',
  'maybeSingle',
] as const;

type Resolver = (value: unknown) => unknown;

function createQueryBuilder(table: string, result: QueryResult, calls: RecordedCall[]) {
  const builder: Record<string, unknown> = {};

  for (const method of CHAIN_METHODS) {
    builder[method] = (...args: unknown[]) => {
      calls.push({ table, method, args });
      return builder;
    };
  }

  builder.then = (onFulfilled?: Resolver | null, onRejected?: Resolver | null) =>
    Promise.resolve({ data: result.data ?? null, error: result.error ?? null }).then(
      onFulfilled ?? undefined,
      onRejected ?? undefined
    );

  return builder;
}

export interface SupabaseMock {
  /** Cast to `SupabaseClient` so it can be dropped straight into a tRPC context. */
  supabase: SupabaseClient<Database>;
  calls: RecordedCall[];
  /** Every recorded call against one table, in order. */
  callsFor(table: string): RecordedCall[];
  /** Args of the first `table.method(...)` call, or `undefined` if never called. */
  argsFor(table: string, method: string): unknown[] | undefined;
  /** All args for repeated calls of the same method (e.g. chained `.eq()`s). */
  allArgsFor(table: string, method: string): unknown[][];
}

/**
 * @param results Per-table `{ data, error }`. Pass an array to return a
 *   different result for each successive `.from(table)` call — needed where a
 *   single procedure hits the same table twice.
 * @param user The value `auth.getUser()` resolves to (`null` = signed out).
 */
export function createSupabaseMock(
  results: Record<string, QueryResult | QueryResult[]> = {},
  user: { id: string } | null = null
): SupabaseMock {
  const calls: RecordedCall[] = [];
  const cursors: Record<string, number> = {};

  const from = (table: string) => {
    const entry = results[table];
    let result: QueryResult = {};

    if (Array.isArray(entry)) {
      const index = cursors[table] ?? 0;
      cursors[table] = index + 1;
      result = entry[index] ?? {};
    } else if (entry) {
      result = entry;
    }

    calls.push({ table, method: 'from', args: [table] });
    return createQueryBuilder(table, result, calls);
  };

  const client = {
    from,
    auth: {
      getUser: () => Promise.resolve({ data: { user }, error: null }),
    },
  };

  return {
    supabase: client as unknown as SupabaseClient,
    calls,
    callsFor: (table) => calls.filter((c) => c.table === table),
    argsFor: (table, method) => calls.find((c) => c.table === table && c.method === method)?.args,
    allArgsFor: (table, method) =>
      calls.filter((c) => c.table === table && c.method === method).map((c) => c.args),
  };
}

/** A `{ data, error }` result representing a failed postgrest call. */
export function dbError(message: string): QueryResult {
  return { data: null, error: { message } };
}

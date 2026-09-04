/**
 * supabase-mock-helper.ts
 *
 * Utilities for properly mocking Supabase in tests
 * Ensures .insert().select().single() chains work correctly
 */

import { vi } from 'vitest';

// ═══════════════════════════════════════════════════════════════════════════
// QA-02: STATEFUL in-memory Supabase stand-in.
//
// The mock in src/test/setup.ts is stateless-ish: reads always answer from a
// fixed DEFAULT_DATA row, so a service that writes a value and then reads it
// back gets the stub, not what it wrote. Several suites (FollowUpScheduler,
// ContinuousImprovementService) are round-trip tests — "complete day 30, then
// ask which milestone is next" — and were failing purely because nothing was
// ever persisted. This keeps rows in memory so those round-trips are real.
//
// Usage (the dynamic import inside the factory is what keeps vi.mock's
// hoisting happy — a plain top-level import would be in the TDZ):
//
//   vi.mock('../services/supabase-service', async () => {
//     const h = await import('../../test/supabase-mock-helper');
//     return { supabase: h.getStatefulStore().client };
//   });
//   import { getStatefulStore } from '../../test/supabase-mock-helper';
//   const store = getStatefulStore();   // same instance; reset it per test
// ═══════════════════════════════════════════════════════════════════════════

type Row = Record<string, any>;
type RowFilter = (row: Row) => boolean;

export interface StatefulStore {
  tables: Record<string, Row[]>;
  reset: () => void;
  seed: (table: string, rows: Row[]) => void;
  client: { from: (table: string) => any };
}

export function createStatefulSupabaseMock(): StatefulStore {
  const tables: Record<string, Row[]> = {};
  let seq = 0;
  const nextId = () => `mock-row-${++seq}`;
  const rowsOf = (t: string) => (tables[t] ||= []);

  function builder(table: string) {
    const filters: RowFilter[] = [];
    let mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
    let written: Row | null = null;
    let payload: Row | null = null;
    let applied = false;

    const matching = () => rowsOf(table).filter((r) => filters.every((f) => f(r)));

    const apply = () => {
      if (applied) return;
      applied = true;
      if (mode === 'update' && payload) {
        for (const row of matching()) Object.assign(row, payload);
      }
      if (mode === 'delete') {
        const doomed = new Set(matching());
        tables[table] = rowsOf(table).filter((r) => !doomed.has(r));
      }
    };

    // PostgREST semantics: .order() sorts by the raw column value (so a TEXT
    // column sorts lexicographically, not by any domain meaning), .limit() caps
    // the row count. Modelled faithfully — tests that depend on ordering should
    // see what Postgres would actually return.
    let orderBy: { column: string; ascending: boolean } | null = null;
    let rowLimit: number | null = null;

    const finalize = (rows: Row[]) => {
      let out = rows;
      if (orderBy) {
        const { column, ascending } = orderBy;
        out = [...out].sort((a, b) => {
          const x = a[column];
          const y = b[column];
          if (x === y) return 0;
          const cmp = x > y ? 1 : -1;
          return ascending ? cmp : -cmp;
        });
      }
      if (rowLimit !== null) out = out.slice(0, rowLimit);
      return out;
    };

    const api: any = {
      select: () => api,
      order: (column: string, opts?: { ascending?: boolean }) => {
        orderBy = { column, ascending: opts?.ascending !== false };
        return api;
      },
      limit: (n: number) => { rowLimit = n; return api; },
      is: (col: string, val: any) => {
        filters.push((r) => (val === null ? r[col] == null : r[col] === val));
        return api;
      },
      eq: (col: string, val: any) => { filters.push((r) => r[col] === val); return api; },
      neq: (col: string, val: any) => { filters.push((r) => r[col] !== val); return api; },
      in: (col: string, vals: any[]) => { filters.push((r) => vals.includes(r[col])); return api; },
      gte: (col: string, val: any) => { filters.push((r) => r[col] >= val); return api; },
      lte: (col: string, val: any) => { filters.push((r) => r[col] <= val); return api; },
      gt: (col: string, val: any) => { filters.push((r) => r[col] > val); return api; },
      lt: (col: string, val: any) => { filters.push((r) => r[col] < val); return api; },
      // The only .or() any service in this repo builds is the follow-up
      // scheduler's "any milestone whose due date has passed and which is not
      // yet completed" — modelled directly rather than parsed.
      or: () => {
        filters.push((r) =>
          [30, 90, 180, 365].some((d) => {
            const due = r[`day${d}_due`];
            return typeof due === 'string' && due <= new Date().toISOString() && !r[`day${d}_completed`];
          })
        );
        return api;
      },
      insert: (data: Row) => {
        mode = 'insert';
        written = {
          id: nextId(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        rowsOf(table).push(written);
        return api;
      },
      update: (data: Row) => { mode = 'update'; payload = data; return api; },
      delete: () => { mode = 'delete'; return api; },
      single: () => {
        if (mode === 'insert') return Promise.resolve({ data: written, error: null });
        apply();
        const hit = finalize(matching())[0];
        return Promise.resolve(
          hit ? { data: hit, error: null } : { data: null, error: { message: 'No rows found' } }
        );
      },
      maybeSingle: () => {
        if (mode === 'insert') return Promise.resolve({ data: written, error: null });
        apply();
        return Promise.resolve({ data: finalize(matching())[0] ?? null, error: null });
      },
      then: (onFulfilled: any, onRejected: any) => {
        if (mode === 'insert') {
          return Promise.resolve({ data: [written], error: null }).then(onFulfilled, onRejected);
        }
        apply();
        const data = mode === 'select' ? finalize(matching()) : [];
        return Promise.resolve({ data, error: null }).then(onFulfilled, onRejected);
      },
    };
    return api;
  }

  return {
    tables,
    reset: () => { for (const k of Object.keys(tables)) delete tables[k]; },
    seed: (table: string, rows: Row[]) => { rowsOf(table).push(...rows); },
    client: { from: (table: string) => builder(table) },
  };
}

let sharedStatefulStore: StatefulStore | null = null;

/**
 * Per-test-file singleton — vitest gives each test file its own module
 * registry, so this is not shared between files.
 */
export function getStatefulStore(): StatefulStore {
  return (sharedStatefulStore ||= createStatefulSupabaseMock());
}

export interface MockBuilderConfig {
  tableName?: string;
  shouldResolveToNull?: boolean;
  customData?: Record<string, unknown>;
}

/**
 * Create a chainable Supabase mock builder
 * Supports: .insert().select().single() chains
 */
export function createMockBuilder(config: MockBuilderConfig = {}) {
  const {
    tableName = 'test-table',
    shouldResolveToNull = false,
    customData = {},
  } = config;

  // Default response data based on table
  const DEFAULT_DATA: Record<string, unknown> = {
    id: `mock-${tableName}-id`,
    created_at: new Date().toISOString(),
    ...customData,
  };

  const builder: any = {};

  // Chainable methods (return builder)
  builder.select = vi.fn(() => builder);
  builder.insert = vi.fn(() => builder);
  builder.upsert = vi.fn(() => builder);
  builder.update = vi.fn(() => builder);
  builder.delete = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.neq = vi.fn(() => builder);
  builder.order = vi.fn(() => builder);
  builder.limit = vi.fn(() => builder);
  builder.in = vi.fn(() => builder);
  builder.gte = vi.fn(() => builder);
  builder.lte = vi.fn(() => builder);
  builder.gt = vi.fn(() => builder);
  builder.lt = vi.fn(() => builder);
  builder.not = vi.fn(() => builder);
  builder.is = vi.fn(() => builder);
  builder.contains = vi.fn(() => builder);
  builder.filter = vi.fn(() => builder);
  builder.match = vi.fn(() => builder);

  // Terminal methods (return Promise)
  const responseData = shouldResolveToNull ? null : DEFAULT_DATA;
  builder.single = vi.fn(() =>
    Promise.resolve({ data: responseData, error: null })
  );
  builder.maybeSingle = vi.fn(() =>
    Promise.resolve({ data: responseData, error: null })
  );

  return builder;
}

/**
 * Create a mock Supabase client
 */
export function createMockSupabaseClient() {
  const mockClient: any = {
    from: vi.fn((tableName: string) => {
      return createMockBuilder({ tableName });
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-test', email: 'test@example.com' } },
        error: null
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-test' } },
        error: null
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-test' }, session: {} },
        error: null
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'mock/path' }, error: null }),
        download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock.cdn/file' } }),
      }),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn(),
    }),
  };

  return mockClient;
}

/**
 * Mock Supabase.from() to return a specific response
 * Use this in tests to set up per-test behavior
 */
export function setupSupabaseMock(
  supabaseModule: any,
  config?: {
    tableName?: string;
    returnData?: Record<string, unknown>;
    shouldFail?: boolean;
    errorMessage?: string;
  }
) {
  const mockBuilder = createMockBuilder({
    tableName: config?.tableName,
    shouldResolveToNull: config?.shouldFail,
    customData: config?.returnData,
  });

  if (config?.shouldFail) {
    mockBuilder.single = vi.fn(() =>
      Promise.resolve({
        data: null,
        error: { message: config.errorMessage || 'Mock error' },
      })
    );
  }

  // Mock the from() method to return our builder
  vi.mocked(supabaseModule.from).mockReturnValue(mockBuilder);

  return mockBuilder;
}

/**
 * supabase-mock-helper.ts
 *
 * Utilities for properly mocking Supabase in tests
 * Ensures .insert().select().single() chains work correctly
 */

import { vi } from 'vitest';

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

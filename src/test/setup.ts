import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom doesn't implement scrollIntoView
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// ─────────────────────────────────────────────
// GLOBAL SUPABASE MOCK
// Prevents real Supabase connection in all tests.
// Uses a table-aware chainable builder factory.
// ─────────────────────────────────────────────

const NOW = new Date().toISOString()

/**
 * Default data returned per table — tuned so that
 * CoreAwakening / TwinLifecycle / Essence tests pass.
 */
function getDefaultData(tableName: string, isInsert: boolean) {
  switch (tableName) {
    case 'twins':
      // INSERT → return twin data; SELECT → null (no pre-existing twin)
      return isInsert
        ? { id: 'mock-twin-id', name: 'Aria', stage: 1, awakened_at: NOW, created_at: NOW, updated_at: NOW }
        : null

    case 'user_profiles':
      return {
        id: 'user_test_123',
        full_analysis_completed: true,
        full_analysis_completed_at: NOW,
        created_at: NOW,
        updated_at: NOW,
      }

    case 'awakening_essence':
      return {
        id: 'mock-essence-id',
        user_id: 'user_test_123',
        status: 'pending',
        personal_intelligence: {
          insights: ['You are deeply self-aware'],
          nextStepsSuggested: ['Continue exploring your worlds'],
          recommendedAction: 'Embrace your growth journey',
          warningsOrCautions: [],
        },
        sice_results: {},
        synthesis: { themes: ['Self-awareness', 'Growth'] },
        execution_time: 120,
        created_at: NOW,
      }

    case 'twin_memories':
      return { id: 'mock-memory-id', twin_id: 'mock-twin-id', created_at: NOW }

    case 'twin_sice_scores':
      return { id: 'mock-score-id', twin_id: 'mock-twin-id', created_at: NOW }

    case 'world_stats':
      return { id: 'mock-world-stat-id', created_at: NOW }

    case 'personal_contexts':
      return { id: 'mock-context-id', user_id: 'user_test_123', created_at: NOW }

    case 'analytics_events':
      return { id: 'mock-event-id', created_at: NOW }

    default:
      return { id: `mock-${tableName}-id`, created_at: NOW }
  }
}

/**
 * Chainable Supabase query builder mock.
 * Tracks whether an insert was made to toggle SELECT vs INSERT response.
 * Tracks eq-call count so completeCoreAwakening (2 eqs) returns a twin
 * while checkReadyForAwakening (1 eq) returns null for the twins table.
 */
function makeBuilder(tableName: string) {
  let isInsert = false
  let eqCount = 0

  function resolveData() {
    // Special case: twins SELECT with 2 eq conditions = completeCoreAwakening looking up its own twin
    if (tableName === 'twins' && !isInsert && eqCount >= 2) {
      return { id: 'mock-twin-id', name: 'Aria', stage: 1, awakened_at: NOW, created_at: NOW }
    }
    return getDefaultData(tableName, isInsert)
  }

  const builder: Record<string, any> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn(() => { isInsert = true; return builder }),
    upsert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn(() => { eqCount++; return builder }),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data: resolveData(), error: null })),
    // Awaitable directly: from(table).insert({}) → { data: [...], error: null }
    then: (resolve: any) =>
      Promise.resolve({ data: resolveData() ? [resolveData()] : [], error: null }).then(resolve),
  }

  return builder
}

const mockSupabaseClient = {
  from: vi.fn((tableName: string) => makeBuilder(tableName)),
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'user_test_123', email: 'test@example.com' } },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { access_token: 'mock-token', user: { id: 'user_test_123' } } },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: { id: 'user_test_123' } },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: 'user_test_123' }, session: {} },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'mock-path' }, error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock-url.com/file' } }),
    }),
  },
  rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  }),
}

// Mock @supabase/supabase-js so createClient() returns our mock
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// ─────────────────────────────────────────────
// GLOBAL SICE ORCHESTRATOR MOCK
// Prevents real SICE engines from running in tests.
// ─────────────────────────────────────────────

vi.mock('@/services/sice/SICEOrchestrator', () => ({
  SICEOrchestrator: vi.fn().mockImplementation(() => ({
    orchestrate: vi.fn().mockResolvedValue({
      personalIntelligence: {
        insights: ['You are deeply self-aware'],
        nextStepsSuggested: ['Continue exploring'],
        recommendedAction: 'Embrace your journey',
        warningsOrCautions: [],
      },
      synthesis: { themes: ['Growth', 'Self-awareness'] },
      results: {},
      totalExecutionTime: 50,
    }),
  })),
}))

// Also mock via relative path used by CoreAwakeningService
vi.mock('../services/sice/SICEOrchestrator', () => ({
  SICEOrchestrator: vi.fn().mockImplementation(() => ({
    orchestrate: vi.fn().mockResolvedValue({
      personalIntelligence: {
        insights: ['You are deeply self-aware'],
        nextStepsSuggested: ['Continue exploring'],
        recommendedAction: 'Embrace your journey',
        warningsOrCautions: [],
      },
      synthesis: { themes: ['Growth', 'Self-awareness'] },
      results: {},
      totalExecutionTime: 50,
    }),
  })),
}))

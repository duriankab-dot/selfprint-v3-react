import { vi } from 'vitest'
import '@testing-library/jest-dom'

// ── Use real timers for now (tests wait for real timeouts) ──────────────────
// vi.useFakeTimers() — only if tests actually use setTimeout/setInterval
// For now, keep real timers since async/await in tests need real promises

// ── jsdom fix ────────────────────────────────────────────────────────────────
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL SUPABASE MOCK
//
// MUST BE REGISTERED BEFORE ANY TEST FILE IMPORTS SUPABASE
// This prevents "Missing Supabase credentials" errors during initialization
//
// KEY RULES (prevent Worker crash):
//   ❌ NEVER add a `then` property to the builder object.
//      An object with `then` is treated as a thenable → vitest tries to await
//      it → infinite loop / Worker crash.
//   ✅ Use vi.fn().mockResolvedValue() for terminal calls (single, maybeSingle).
//   ✅ Use vi.fn().mockReturnThis() for chainable calls.
//
// Mock is table-aware:
//   - tracks isInsert (select vs insert)
//   - tracks eqCount to distinguish:
//       1 eq  = readiness-check query  (twins → null, no pre-existing twin)
//       2+ eq = named lookup            (twins → return the twin data)
//   This lets checkReadyForAwakening AND completeCoreAwakening both pass.
// ══════════════════════════════════════════════════════════════════════════════

const NOW = new Date().toISOString()

const TWIN_DATA = {
  id: 'mock-twin-id',
  user_id: 'user-test-123',
  name: 'Aria',
  stage: 1,
  awakened_at: NOW,
  created_at: NOW,
  updated_at: NOW,
  primary_archetype: 'sage',
  secondary_archetype: 'explorer',
  maturity_score: 30,
  personality_essence: null,
}

const DEFAULT_DATA: Record<string, Record<string, unknown>> = {
  // ── Core Identity ─────────────────────────────────────────────────────────
  user_profiles: {
    id: 'user-test-123',
    full_analysis_completed: true,
    full_analysis_completed_at: NOW,
    created_at: NOW,
    updated_at: NOW,
  },
  profiles: { id: 'profile_test_123', user_id: 'user-test-123', created_at: NOW },
  personal_profiles: { id: 'pers-prof-id', user_id: 'user-test-123', created_at: NOW },

  // ── Twin System ───────────────────────────────────────────────────────────
  twins: { id: 'mock-twin-id', user_id: 'user-test-123', name: 'Aria', stage: 1, created_at: NOW },
  twin_memories: { id: 'mock-memory-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_memory: { id: 'twin-mem-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_sice_scores: { id: 'mock-score-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_state: { id: 'twin-state-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_personality: { id: 'twin-pers-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_capabilities: { id: 'twin-cap-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_evolution_progress: { id: 'twin-evo-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_evolution_history: { id: 'twin-hist-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_prompt_updates: { id: 'twin-prompt-id', twin_id: 'mock-twin-id', version: 1, created_at: NOW },
  twin_world_expertise: { id: 'twin-exp-id', twin_id: 'mock-twin-id', created_at: NOW },

  // ── Intelligence & Feedback ────────────────────────────────────────────────
  awakening_essence: {
    id: 'mock-essence-id',
    user_id: 'user-test-123',
    status: 'pending',
    personal_intelligence: {
      insights: ['You are deeply self-aware'],
      nextStepsSuggested: ['Keep growing'],
      recommendedAction: 'Embrace your journey',
      warningsOrCautions: [],
    },
    sice_results: {},
    synthesis: { themes: ['Growth', 'Self-awareness'] },
    execution_time: 50,
    created_at: NOW,
  },
  personal_contexts: {
    id: 'mock-ctx-id',
    user_id: 'user-test-123',
    birthDate: '1990-05-15',
    values: [{ title: 'Growth', importance: 'high', confidence: 0.9 }],
    goals: [{ title: 'Learn', timeframe: '6-months', sourceOfTruth: 'onboarding_insights', confidence: 0.8 }],
    blindSpots: [{ title: 'Impatience', potentialImpact: 'medium', confidence: 0.7, actionable: true }],
    decisionStyle: { type: 'Intuitive-Analytical', confidence: 0.8, sourceOfTruth: 'onboarding_analysis' },
    hubsActive: ['personal-growth', 'career', 'creativity'],
    moodState: 'balanced',
    created_at: NOW,
  },
  personal_context: { id: 'pers-ctx-id', user_id: 'user-test-123', created_at: NOW },
  personal_memory: { id: 'pers-mem-id', user_id: 'user-test-123', created_at: NOW },
  behavioral_patterns: { id: 'behavior-id', user_id: 'user-test-123', created_at: NOW },
  detected_patterns: { id: 'detect-id', user_id: 'user-test-123', created_at: NOW },
  pattern_analysis: { id: 'pattern-id', user_id: 'user-test-123', created_at: NOW },
  insight_feedback: {
    id: 'insight-fb-id',
    user_id: 'user-test-123',
    insight_id: 'insight_123',
    sentiment: 'positive',
    confidence: 0.85,
    created_at: NOW,
  },
  user_feedback: {
    id: 'user-fb-id',
    user_id: 'user-test-123',
    twin_id: 'twin-456',
    response_id: 'response-789',
    feedback_type: 'quality',
    sentiment: 'positive',
    created_at: NOW,
    updated_at: NOW,
    // comment is intentionally omitted — will be set by insertData if provided
  },
  sice_feedback: { id: 'sice-fb-id', user_id: 'user-test-123', created_at: NOW },

  // ── Decisions & Outcomes ───────────────────────────────────────────────────
  decision_logs: {
    id: 'decision-log-id',
    user_id: 'user-test-123',
    title: 'Career Decision',
    context: 'Job opportunity',
    confidence: 0.8,
    autonomy_level: 70,
    mood: 'thoughtful',
    hub: 'career',
    created_at: NOW,
  },
  decision_log: {
    id: 'dec-log-id',
    user_id: 'user-test-123',
    decision_text: 'Decision made',
    autonomy_level: 70,
    confidence: 0.8,
    hub: 'personal-growth',
    mood: 'positive',
    created_at: NOW,
  },
  decisions: { id: 'decision-id', user_id: 'user-test-123', created_at: NOW },
  decision_outcomes: { id: 'mock-outcome-id', created_at: NOW },
  decision_patterns: { id: 'dec-pattern-id', user_id: 'user-test-123', created_at: NOW },
  decision_follow_ups: { id: 'dec-followup-id', created_at: NOW },
  follow_up_schedule: { id: 'followup-sched-id', created_at: NOW },
  improvement_actions: {
    id: 'improve-id',
    status: 'pending',
    improvementArea: 'response_length',
    targetChange: 'Make responses more concise',
    severity: 'medium',
    createdAt: NOW,
    description: 'Improve brevity',
    feedbackId: 'feedback-123',
  },

  // ── Conversations & Chat ───────────────────────────────────────────────────
  conversations: { id: 'conv-id', user_id: 'user-test-123', created_at: NOW },
  conversations_messages: { id: 'conv-msg-id', conversation_id: 'conv-id', created_at: NOW },
  conversation_memory: { id: 'conv-mem-id', conversation_id: 'conv-id', created_at: NOW },
  conversation_settings: { id: 'conv-set-id', conversation_id: 'conv-id', created_at: NOW },
  chat_messages: {
    id: 'chat-msg-id',
    user_id: 'user-test-123',
    hub: 'career',
    mood: 'thoughtful',
    role: 'user',
    content: 'Test message',
    autonomy_at_time: 50,
    created_at: NOW,
  },
  messages: { id: 'msg-id', user_id: 'user-test-123', created_at: NOW },

  // ── Worlds & Preferences ───────────────────────────────────────────────────
  world_stats: { id: 'mock-wstat-id', user_id: 'user-test-123', created_at: NOW },
  world_preferences: { id: 'world-pref-id', user_id: 'user-test-123', created_at: NOW },
  world_blueprints: { id: 'world-bp-id', user_id: 'user-test-123', created_at: NOW },
  user_journeys: { id: 'journey-id', user_id: 'user-test-123', created_at: NOW },

  // ── Gamification & Badges ──────────────────────────────────────────────────
  unlocked_badges: { id: 'badge-id', user_id: 'user-test-123', created_at: NOW },
  user_badges: { id: 'user-badge-id', user_id: 'user-test-123', created_at: NOW },
  user_insights: { id: 'insight-id', user_id: 'user-test-123', created_at: NOW },

  // ── Notifications & Analytics ──────────────────────────────────────────────
  notifications: { id: 'notif-id', user_id: 'user-test-123', created_at: NOW },
  notification_queue: { id: 'mock-notif-id', created_at: NOW },
  notification_schedule: { id: 'notif-sched-id', created_at: NOW },
  notification_analytics: { id: 'notif-anal-id', created_at: NOW },
  analytics_events: { id: 'mock-event-id', created_at: NOW },
  performance_metrics: { id: 'perf-metric-id', created_at: NOW },
  quality_metrics: [
    {
      id: 'quality-id-1',
      twin_id: 'twin-456',
      quality_score: 75,
      user_rating: 3,
      world: 'career',
      created_at: NOW,
    },
    {
      id: 'quality-id-2',
      twin_id: 'twin-456',
      quality_score: 85,
      user_rating: 4,
      world: 'career',
      created_at: new Date(new Date(NOW).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'quality-id-stable-1',
      twin_id: 'nonexistent-twin',
      quality_score: 75,
      user_rating: 3,
      world: 'career',
      created_at: NOW,
    },
    {
      id: 'quality-id-stable-2',
      twin_id: 'nonexistent-twin',
      quality_score: 75,
      user_rating: 3,
      world: 'career',
      created_at: new Date(new Date(NOW).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'quality-id-improving-1',
      twin_id: 'twin-improving',
      quality_score: 60,
      user_rating: 3,
      world: 'health',
      created_at: NOW,
    },
    {
      id: 'quality-id-improving-2',
      twin_id: 'twin-improving',
      quality_score: 70,
      user_rating: 4,
      world: 'health',
      created_at: new Date(new Date(NOW).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'quality-id-improving-3',
      twin_id: 'twin-improving',
      quality_score: 80,
      user_rating: 5,
      world: 'health',
      created_at: new Date(new Date(NOW).getTime() + 48 * 60 * 60 * 1000).toISOString(),
    },
  ],

  // ── Sharing & Profiles ─────────────────────────────────────────────────────
  share_links: { id: 'mock-share-id', code: 'AAAAAAAA', user_id: 'user-test-123' },
  profiles_blueprints: { id: 'prof-bp-id', user_id: 'user-test-123', created_at: NOW },
  blueprints: { id: 'mock-bp-id', accuracy_level: 80, is_latest: true, user_id: 'user-test-123' },

  // ── Privacy & Security ─────────────────────────────────────────────────────
  user_privacy_settings: { id: 'privacy-set-id', user_id: 'user-test-123', created_at: NOW },
  privacy_consent_log: { id: 'consent-id', user_id: 'user-test-123', created_at: NOW },
  privacy_audit_log: { id: 'audit-id', user_id: 'user-test-123', created_at: NOW },
  security_audit_log: { id: 'sec-audit-id', created_at: NOW },
  rate_limit_log: { id: 'rate-limit-id', created_at: NOW },
  error_logs: { id: 'error-log-id', created_at: NOW },

  // ── Sessions & Auth ────────────────────────────────────────────────────────
  sessions: { id: 'session-id', user_id: 'user-test-123', created_at: NOW },
  csrf_tokens: { id: 'csrf-id', created_at: NOW },

  // ── Subscriptions ──────────────────────────────────────────────────────────
  subscriptions: { id: 'mock-sub-id', tier: 'free', status: 'active', user_id: 'user-test-123' },

  // ── Alerts (fallback for unknowns) ─────────────────────────────────────────
  alerts: { id: 'alert-id', user_id: 'user-test-123', created_at: NOW },
}

// ── In-memory mock database ─────────────────────────────────────────────────
const testDataStore: Record<string, Array<Record<string, unknown>>> = {
  user_feedback: [],  // Will store inserted feedback
}

function resolveData(tableName: string, isWriteOp: boolean, eqCount: number): Record<string, unknown> | null {
  // twins table has special logic
  if (tableName === 'twins') {
    if (isWriteOp) return { ...TWIN_DATA }               // INSERT → return twin
    if (eqCount >= 2) return { ...TWIN_DATA }            // 2+ eqs = completeCoreAwakening lookup → return twin
    return null                                           // 1 eq = readiness check → no twin yet
  }

  return DEFAULT_DATA[tableName] ?? { id: `mock-${tableName}-id`, created_at: NOW }
}

function makeBuilder(tableName: string) {
  let isWriteOp = false
  let eqCount = 0
  let insertData: Record<string, unknown> | null = null
  let filters: Array<{ column: string; value: any; operator?: string }> = []

  const builder: any = {}

  // Chainable methods (return builder for method chaining)
  const chainMethods = ['select', 'insert', 'upsert', 'update', 'delete', 'eq', 'neq',
    'order', 'limit', 'in', 'gte', 'lte', 'gt', 'lt', 'not', 'is', 'contains', 'filter', 'match', 'or']

  chainMethods.forEach(method => {
    builder[method] = function(arg?: any, arg2?: any) {
      if (method === 'insert' || method === 'upsert') {
        isWriteOp = true
        insertData = arg
      }
      if (method === 'update') {
        isWriteOp = true
        insertData = arg
      }
      if (method === 'eq') {
        eqCount++
        filters.push({ column: arg, value: arg2, operator: 'eq' })
      }
      if (method === 'gte') {
        filters.push({ column: arg, value: arg2, operator: 'gte' })
      }
      if (method === 'lte') {
        filters.push({ column: arg, value: arg2, operator: 'lte' })
      }
      if (method === 'gt') {
        filters.push({ column: arg, value: arg2, operator: 'gt' })
      }
      if (method === 'lt') {
        filters.push({ column: arg, value: arg2, operator: 'lt' })
      }
      return builder
    }
  })

  // Terminal methods (return Promises immediately)
  builder.single = function() {
    let data = resolveData(tableName, isWriteOp, eqCount)
    // For inserts/updates, merge input data with defaults to preserve user input
    if (isWriteOp && insertData && data) {
      // Merge insertData into defaults (including undefined to reset optional fields)
      data = { ...data, ...insertData }
      // Store in mock database for future queries
      if (!testDataStore[tableName]) {
        testDataStore[tableName] = []
      }
      testDataStore[tableName].push(data)
    }
    return Promise.resolve({
      data,
      error: null
    })
  }

  builder.maybeSingle = function() {
    let data = resolveData(tableName, isWriteOp, eqCount)
    if (isWriteOp && insertData && data) {
      data = { ...data, ...insertData }
    }
    return Promise.resolve({
      data,
      error: null
    })
  }

  // For SELECT, override to return array-based builder
  const selectBuilder = Object.assign({}, builder)
  selectBuilder.eq = function(col: string, val: any) {
    eqCount++
    filters.push({ column: col, value: val, operator: 'eq' })
    return selectBuilder
  }
  selectBuilder.gte = function(col: string, val: any) {
    filters.push({ column: col, value: val, operator: 'gte' })
    return selectBuilder
  }
  selectBuilder.lte = function(col: string, val: any) {
    filters.push({ column: col, value: val, operator: 'lte' })
    return selectBuilder
  }
  selectBuilder.gt = function(col: string, val: any) {
    filters.push({ column: col, value: val, operator: 'gt' })
    return selectBuilder
  }
  selectBuilder.lt = function(col: string, val: any) {
    filters.push({ column: col, value: val, operator: 'lt' })
    return selectBuilder
  }
  selectBuilder.select = function(_columns?: string) {
    return selectBuilder
  }
  selectBuilder.order = function(_col: string, _opts?: any) {
    return selectBuilder
  }
  selectBuilder.limit = function(_n: number) {
    return selectBuilder
  }
  selectBuilder.not = function(_col: string, _op: string, _val: any) {
    return selectBuilder
  }

  // Terminal: awaitable for SELECT
  selectBuilder.then = function(onFulfilled?: any, onRejected?: any) {
    let arrayData: Array<Record<string, unknown>> = []

    // First, try mock database (inserted data)
    if (testDataStore[tableName] && testDataStore[tableName].length > 0) {
      arrayData = testDataStore[tableName]
    } else {
      // Fall back to default data
      const data = DEFAULT_DATA[tableName]
      if (data) {
        // If data is already an array, use it; otherwise wrap in array
        arrayData = Array.isArray(data) ? data : [data]
      }
    }

    // Apply filters with operator support
    if (filters.length > 0) {
      arrayData = arrayData.filter(item => {
        for (const filter of filters) {
          const itemValue = item[filter.column]
          switch (filter.operator) {
            case 'eq':
              if (itemValue !== filter.value) return false
              break
            case 'gte':
              if (!(itemValue >= filter.value)) return false
              break
            case 'lte':
              if (!(itemValue <= filter.value)) return false
              break
            case 'gt':
              if (!(itemValue > filter.value)) return false
              break
            case 'lt':
              if (!(itemValue < filter.value)) return false
              break
            default:
              if (itemValue !== filter.value) return false
          }
        }
        return true
      })
    }

    return Promise.resolve({ data: arrayData, error: null }).then(onFulfilled, onRejected)
  }

  // Allow .select() to return this chained builder
  builder.select = function(_columns?: string) {
    return selectBuilder
  }

  return builder
}

const mockSupabaseClient = {
  from: vi.fn((tableName: string) => {
    const builder = makeBuilder(tableName)
    // Return builder without freeze to preserve method chain
    return builder as any
  }),
  auth: {
    getUser:             vi.fn().mockResolvedValue({ data: { user: { id: 'user-test-123', email: 'test@example.com' } }, error: null }),
    getSession:          vi.fn().mockResolvedValue({ data: { session: { access_token: 'mock-token' } }, error: null }),
    signOut:             vi.fn().mockResolvedValue({ error: null }),
    signUp:              vi.fn().mockResolvedValue({ data: { user: { id: 'user-test-123' } }, error: null }),
    signInWithPassword:  vi.fn().mockResolvedValue({ data: { user: { id: 'user-test-123' }, session: {} }, error: null }),
    onAuthStateChange:   vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
  },
  storage: {
    from: vi.fn().mockReturnValue({
      upload:       vi.fn().mockResolvedValue({ data: { path: 'mock/path' }, error: null }),
      download:     vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://mock.cdn/file' } }),
    }),
  },
  rpc:     vi.fn().mockResolvedValue({ data: null, error: null }),
  channel: vi.fn().mockReturnValue({
    on:          vi.fn().mockReturnThis(),
    subscribe:   vi.fn().mockReturnThis(),
    unsubscribe: vi.fn(),
  }),
}

// Register mocks BEFORE any module imports
// Order matters: Mock the base library first, then the services that use it
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Mock the supabase client service using relative paths (Vitest vi.mock cannot resolve @ aliases)
vi.mock('../../lib/supabase/client', () => ({
  default: mockSupabaseClient,
  supabase: mockSupabaseClient,
}))

// Mock the services/supabase-service re-export for backward compatibility
vi.mock('../../services/supabase-service', () => ({
  supabase: mockSupabaseClient,
}))

// ═══════════════════════════════════════════════════════════════════════════════
// Mock SICEOrchestrator globally so CoreAwakeningService gets the mock version
// This prevents "() => ({...}) is not a constructor" errors
// ═══════════════════════════════════════════════════════════════════════════════
vi.mock('../services/sice/SICEOrchestrator', () => {
  class MockSICEOrchestrator {
    orchestrate = vi.fn().mockResolvedValue({
      personalIntelligence: { test: 'intelligence' },
      results: { engine1: 'result1' },
      synthesis: { combined: 'intelligence' },
      totalExecutionTime: 2500,
    });
  }
  return {
    SICEOrchestrator: MockSICEOrchestrator,
  };
})

import '@testing-library/jest-dom'
import { vi } from 'vitest'

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
  user_id: 'user_test_123',
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
    id: 'user_test_123',
    full_analysis_completed: true,
    full_analysis_completed_at: NOW,
    created_at: NOW,
    updated_at: NOW,
  },
  profiles: { id: 'profile_test_123', user_id: 'user_test_123', created_at: NOW },
  personal_profiles: { id: 'pers-prof-id', user_id: 'user_test_123', created_at: NOW },

  // ── Twin System ───────────────────────────────────────────────────────────
  twins: { id: 'mock-twin-id', user_id: 'user_test_123', name: 'Aria', stage: 1, created_at: NOW },
  twin_memories: { id: 'mock-memory-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_memory: { id: 'twin-mem-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_sice_scores: { id: 'mock-score-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_state: { id: 'twin-state-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_personality: { id: 'twin-pers-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_capabilities: { id: 'twin-cap-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_evolution_progress: { id: 'twin-evo-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_evolution_history: { id: 'twin-hist-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_prompt_updates: { id: 'twin-prompt-id', twin_id: 'mock-twin-id', created_at: NOW },
  twin_world_expertise: { id: 'twin-exp-id', twin_id: 'mock-twin-id', created_at: NOW },

  // ── Intelligence & Feedback ────────────────────────────────────────────────
  awakening_essence: {
    id: 'mock-essence-id',
    user_id: 'user_test_123',
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
  personal_contexts: { id: 'mock-ctx-id', user_id: 'user_test_123', created_at: NOW },
  personal_context: { id: 'pers-ctx-id', user_id: 'user_test_123', created_at: NOW },
  personal_memory: { id: 'pers-mem-id', user_id: 'user_test_123', created_at: NOW },
  behavioral_patterns: { id: 'behavior-id', user_id: 'user_test_123', created_at: NOW },
  detected_patterns: { id: 'detect-id', user_id: 'user_test_123', created_at: NOW },
  pattern_analysis: { id: 'pattern-id', user_id: 'user_test_123', created_at: NOW },
  insight_feedback: { id: 'insight-fb-id', user_id: 'user_test_123', created_at: NOW },
  user_feedback: { id: 'user-fb-id', user_id: 'user_test_123', created_at: NOW },
  sice_feedback: { id: 'sice-fb-id', user_id: 'user_test_123', created_at: NOW },

  // ── Decisions & Outcomes ───────────────────────────────────────────────────
  decision_logs: { id: 'decision-log-id', user_id: 'user_test_123', created_at: NOW },
  decision_log: { id: 'dec-log-id', user_id: 'user_test_123', created_at: NOW },
  decisions: { id: 'decision-id', user_id: 'user_test_123', created_at: NOW },
  decision_outcomes: { id: 'mock-outcome-id', created_at: NOW },
  decision_patterns: { id: 'dec-pattern-id', user_id: 'user_test_123', created_at: NOW },
  decision_follow_ups: { id: 'dec-followup-id', created_at: NOW },
  follow_up_schedule: { id: 'followup-sched-id', created_at: NOW },
  improvement_actions: { id: 'improve-id', created_at: NOW },

  // ── Conversations & Chat ───────────────────────────────────────────────────
  conversations: { id: 'conv-id', user_id: 'user_test_123', created_at: NOW },
  conversations_messages: { id: 'conv-msg-id', conversation_id: 'conv-id', created_at: NOW },
  conversation_memory: { id: 'conv-mem-id', conversation_id: 'conv-id', created_at: NOW },
  conversation_settings: { id: 'conv-set-id', conversation_id: 'conv-id', created_at: NOW },
  chat_messages: { id: 'chat-msg-id', user_id: 'user_test_123', created_at: NOW },
  messages: { id: 'msg-id', user_id: 'user_test_123', created_at: NOW },

  // ── Worlds & Preferences ───────────────────────────────────────────────────
  world_stats: { id: 'mock-wstat-id', user_id: 'user_test_123', created_at: NOW },
  world_preferences: { id: 'world-pref-id', user_id: 'user_test_123', created_at: NOW },
  world_blueprints: { id: 'world-bp-id', user_id: 'user_test_123', created_at: NOW },
  user_journeys: { id: 'journey-id', user_id: 'user_test_123', created_at: NOW },

  // ── Gamification & Badges ──────────────────────────────────────────────────
  unlocked_badges: { id: 'badge-id', user_id: 'user_test_123', created_at: NOW },
  user_badges: { id: 'user-badge-id', user_id: 'user_test_123', created_at: NOW },
  user_insights: { id: 'insight-id', user_id: 'user_test_123', created_at: NOW },

  // ── Notifications & Analytics ──────────────────────────────────────────────
  notifications: { id: 'notif-id', user_id: 'user_test_123', created_at: NOW },
  notification_queue: { id: 'mock-notif-id', created_at: NOW },
  notification_schedule: { id: 'notif-sched-id', created_at: NOW },
  notification_analytics: { id: 'notif-anal-id', created_at: NOW },
  analytics_events: { id: 'mock-event-id', created_at: NOW },
  performance_metrics: { id: 'perf-metric-id', created_at: NOW },
  quality_metrics: { id: 'quality-id', created_at: NOW },

  // ── Sharing & Profiles ─────────────────────────────────────────────────────
  share_links: { id: 'mock-share-id', code: 'AAAAAAAA', user_id: 'user_test_123' },
  profiles_blueprints: { id: 'prof-bp-id', user_id: 'user_test_123', created_at: NOW },
  blueprints: { id: 'mock-bp-id', accuracy_level: 80, is_latest: true, user_id: 'user_test_123' },

  // ── Privacy & Security ─────────────────────────────────────────────────────
  user_privacy_settings: { id: 'privacy-set-id', user_id: 'user_test_123', created_at: NOW },
  privacy_consent_log: { id: 'consent-id', user_id: 'user_test_123', created_at: NOW },
  privacy_audit_log: { id: 'audit-id', user_id: 'user_test_123', created_at: NOW },
  security_audit_log: { id: 'sec-audit-id', created_at: NOW },
  rate_limit_log: { id: 'rate-limit-id', created_at: NOW },
  error_logs: { id: 'error-log-id', created_at: NOW },

  // ── Sessions & Auth ────────────────────────────────────────────────────────
  sessions: { id: 'session-id', user_id: 'user_test_123', created_at: NOW },
  csrf_tokens: { id: 'csrf-id', created_at: NOW },

  // ── Subscriptions ──────────────────────────────────────────────────────────
  subscriptions: { id: 'mock-sub-id', tier: 'free', status: 'active', user_id: 'user_test_123' },

  // ── Alerts (fallback for unknowns) ─────────────────────────────────────────
  alerts: { id: 'alert-id', user_id: 'user_test_123', created_at: NOW },
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
  // isWriteOp: set by insert/upsert/update/delete — NEVER reset by select.
  // This ensures .insert().select().single() is still treated as a write op.
  let isWriteOp = false
  let eqCount = 0

  const builder: any = {}

  // Define all methods that forward calls properly
  builder.select = vi.fn(() => builder)
  builder.insert = vi.fn(() => { isWriteOp = true; return builder })
  builder.upsert = vi.fn(() => { isWriteOp = true; return builder })
  builder.update = vi.fn(() => { isWriteOp = true; return builder })
  builder.delete = vi.fn(() => { isWriteOp = true; return builder })
  builder.eq = vi.fn(() => { eqCount++; return builder })
  builder.neq = vi.fn(() => builder)
  builder.order = vi.fn(() => builder)
  builder.limit = vi.fn(() => builder)
  builder.in = vi.fn(() => builder)
  builder.gte = vi.fn(() => builder)
  builder.lte = vi.fn(() => builder)
  builder.gt = vi.fn(() => builder)
  builder.lt = vi.fn(() => builder)
  builder.not = vi.fn(() => builder)
  builder.is = vi.fn(() => builder)
  builder.contains = vi.fn(() => builder)
  builder.filter = vi.fn(() => builder)
  builder.match = vi.fn(() => builder)
  builder.single = vi.fn(() => Promise.resolve({ data: resolveData(tableName, isWriteOp, eqCount), error: null }))
  builder.maybeSingle = vi.fn(() => Promise.resolve({ data: resolveData(tableName, isWriteOp, eqCount), error: null }))

  return builder
}

const mockSupabaseClient = {
  from: vi.fn((tableName: string) => {
    const builder = makeBuilder(tableName)
    // Ensure all methods exist and are properly callable
    return Object.freeze(builder) as any
  }),
  auth: {
    getUser:             vi.fn().mockResolvedValue({ data: { user: { id: 'user_test_123', email: 'test@example.com' } }, error: null }),
    getSession:          vi.fn().mockResolvedValue({ data: { session: { access_token: 'mock-token' } }, error: null }),
    signOut:             vi.fn().mockResolvedValue({ error: null }),
    signUp:              vi.fn().mockResolvedValue({ data: { user: { id: 'user_test_123' } }, error: null }),
    signInWithPassword:  vi.fn().mockResolvedValue({ data: { user: { id: 'user_test_123' }, session: {} }, error: null }),
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

// Register mock BEFORE any module imports @supabase/supabase-js
// This is the ONLY vi.mock() in the file — it must be at the end
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

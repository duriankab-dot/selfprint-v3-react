/**
 * loadtests/config.js — Shared configuration for k6 and Node.js performance tests
 *
 * Environment variables required:
 *   BASE_URL           — App URL (e.g. https://staging.selfprint.one)
 *   SUPABASE_URL       — Supabase project URL (e.g. https://xxx.supabase.co)
 *   SUPABASE_ANON_KEY  — Supabase anon key (sb_publishable_*)
 *   TEST_EMAIL         — Test user email
 *   TEST_PASSWORD      — Test user password
 */

// ── Environment defaults ─────────────────────────────────────────────────────

// Support both k6 (__ENV) and Node.js (process.env)
const env = typeof __ENV !== 'undefined' ? __ENV : process.env;

// Map E2E_ prefixed vars to k6/Node.js expected names
const _supabaseUrl = env.SUPABASE_URL || env.E2E_SUPABASE_URL || '';
const _anonKey = env.SUPABASE_ANON_KEY || env.E2E_SUPABASE_ANON_KEY || '';
const _testEmail = env.TEST_EMAIL || env.E2E_TEST_EMAIL || 'test-phase-b@selfprint.one';
const _testPassword = env.TEST_PASSWORD || env.E2E_TEST_PASSWORD || '';

export const BASE_URL = env.BASE_URL || 'https://www.selfprint.one';
export const SUPABASE_URL = _supabaseUrl;
export const SUPABASE_ANON_KEY = _anonKey;
export const TEST_EMAIL = _testEmail;
export const TEST_PASSWORD = _testPassword;

// ── API endpoints ────────────────────────────────────────────────────────────

const API_BASE = `${BASE_URL}/api`;

export const ENDPOINTS = {
  // Auth
  AUTH_TOKEN: `${SUPABASE_URL}/auth/v1/token?grant_type=password`,

  // AI — Twin (expensive, rate limited to 40 req/min)
  TWIN: `${API_BASE}/twin`,
  TWIN_STREAM: `${API_BASE}/twin-stream`,

  // AI — Nova (lighter, rate limited to 60 req/min)
  NOVA: `${API_BASE}/nova`,
  NOVA_STREAM: `${API_BASE}/nova-stream`,

  // Data — Profile
  PROFILE: `${API_BASE}/profile`,

  // Data — Blueprint
  BLUEPRINT: `${API_BASE}/blueprint`,

  // Data — Share (GET is public, POST requires auth)
  SHARE: `${API_BASE}/share`,

  // Data — Notifications
  NOTIFICATIONS_LIST: `${API_BASE}/notifications/list`,
  NOTIFICATIONS_SCHEDULE: `${API_BASE}/notifications/schedule`,
  NOTIFICATIONS_MARK_READ: `${API_BASE}/notifications/mark-read`,
  NOTIFICATIONS_RECORD_OUTCOME: `${API_BASE}/notifications/record-outcome`,

  // Data — Twin Evolution
  TWIN_EVOLUTION: `${API_BASE}/twin-evolution`,

  // Data — SICE
  SICE_PATTERNS: `${API_BASE}/sice/get-patterns`,

  // Telemetry
  AUTONOMY_LOG: `${API_BASE}/autonomy-log`,
  METRICS: `${API_BASE}/metrics`,

  // Payment (read-only in tests)
  STRIPE_SUBSCRIPTION: `${API_BASE}/stripe/subscription`,
};

// ── Threshold definitions ────────────────────────────────────────────────────

/**
 * Helper to build a k6 threshold array from a config object.
 * Each entry: `http_req_duration{url:/api/twin} p(95)<2000,p(99)<5000`
 */
export function buildThresholds(thresholdConfig) {
  const thresholds = [];
  for (const [endpointKey, config] of Object.entries(thresholdConfig)) {
    const p95 = config.p95 ? `p(95)<${config.p95}` : null;
    const p99 = config.p99 ? `p(99)<${config.p99}` : null;
    const avg = config.avg ? `avg<${config.avg}` : null;
    const max = config.max ? `max<${config.max}` : null;

    const checks = [];
    if (p95) checks.push(p95);
    if (p99) checks.push(p99);
    if (avg) checks.push(avg);
    if (max) checks.push(max);

    if (checks.length > 0) {
      thresholds.push(`http_req_duration{url:${ENDPOINTS[endpointKey]}} ${checks.join(',')}`);
    }
  }
  return thresholds;
}

// ── Smoke thresholds ─────────────────────────────────────────────────────────

export const SMOKE_THRESHOLDS = {
  'AUTH_TOKEN':        { p95: 2000,  p99: 5000 },
  'PROFILE':           { p95: 1000,  p99: 3000 },
  'TWIN':              { p95: 8000,  p99: 15000 },
  'NOVA':              { p95: 7000,  p99: 12000 },
  'AUTONOMY_LOG':      { p95: 1000,  p99: 3000 },
  'SHARE_GET':         { p95: 1000,  p99: 3000 },
};

// ── Full-load thresholds ─────────────────────────────────────────────────────

export const FULL_LOAD_THRESHOLDS = {
  'AUTH_TOKEN':        { p95: 2000,  p99: 5000 },
  'PROFILE':           { p95: 1000,  p99: 3000 },
  'BLUEPRINT':         { p95: 1500,  p99: 4000 },
  'TWIN':              { p95: 8000,  p99: 15000 },
  'TWIN_STREAM':       { p95: 15000, p99: 30000 },
  'NOVA':              { p95: 7000,  p99: 12000 },
  'NOVA_STREAM':       { p95: 15000, p99: 30000 },
  'NOTIFICATIONS_LIST':{ p95: 1000,  p99: 3000 },
  'NOTIFICATIONS_SCHEDULE': { p95: 1500, p99: 4000 },
  'NOTIFICATIONS_MARK_READ': { p95: 1000, p99: 3000 },
  'NOTIFICATIONS_RECORD_OUTCOME': { p95: 1500, p99: 4000 },
  'TWIN_EVOLUTION':    { p95: 1000,  p99: 3000 },
  'SICE_PATTERNS':     { p95: 1000,  p99: 3000 },
  'AUTONOMY_LOG':      { p95: 1000,  p99: 3000 },
  'METRICS':           { p95: 1000,  p99: 3000 },
  'STRIPE_SUBSCRIPTION': { p95: 1000, p99: 3000 },
};

// ── Shared test data ─────────────────────────────────────────────────────────

export const SHARED_DATA = {
  twinMessages: [
    { role: 'user', content: 'ฉันควรเริ่มลงทุนในกองทุนรวมดีไหม?' },
    { role: 'assistant', content: 'คำถามที่ดีมากค่ะ การลงทุนในกองทุนรวมเป็นทางเลือกหนึ่งที่น่าสนใจ แต่ต้องพิจารณาจากเป้าหมายและระดับความเสี่ยงที่ยอมรับได้ก่อนค่ะ' },
    { role: 'user', content: 'แล้วฉันเหมาะกับความเสี่ยงระดับไหน?' },
  ],
  novaMessages: [
    { role: 'user', content: 'ช่วยแนะนำวิธีจัดการเวลาให้ดีกว่านี้หน่อยได้ไหม?' },
  ],
  profileData: {
    dateOfBirth: '1990-01-01',
    timeOfBirth: '10:30',
    placeOfBirth: 'Bangkok',
    initialMood: 'ready',
  },
  blueprintData: {
    accuracyLevel: 75,
    decisionStyle: 'นักวางกลยุทธ์เชิงวิเคราะห์',
    strengths: ['การวางแผนระยะยาว', 'การตัดสินใจบนข้อมูล'],
    insights: ['มีแนวโน้มตัดสินใจดีในสถานการณ์กดดัน'],
    opportunities: ['ควรฝึกความมั่นใจในการตัดสินใจเร็วขึ้น'],
    blindSpots: ['อาจมองข้ามรายละเอียดเล็กๆ น้อยๆ'],
  },
  autonomySignal: {
    hub: 'career',
    mood: 'focused',
    autonomy_level: 65,
    confidence: 0.8,
    hesitation: 0.2,
    response_time_ms: 1500,
    message_length: 50,
    response_length: 200,
  },
  notificationSchedule: {
    type: 'decision_followup',
    title: 'ตามผลการตัดสินใจ',
    message: 'อยากทราบผลจากการตัดสินใจของคุณ',
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    timezone: 'Asia/Bangkok',
  },
};

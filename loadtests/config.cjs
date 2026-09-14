/**
 * loadtests/config.cjs — CommonJS config shim for smoke-test.cjs
 *
 * Loads .env.e2e via dotenv and exposes the same values as config.js
 * so smoke-test.cjs can require() without ESM/CJS conflicts.
 *
 * Environment variable mapping (E2E_ prefix → base name):
 *   SUPABASE_URL       ← SUPABASE_URL / E2E_SUPABASE_URL
 *   SUPABASE_ANON_KEY  ← SUPABASE_ANON_KEY / E2E_SUPABASE_ANON_KEY
 *   TEST_EMAIL         ← TEST_EMAIL / E2E_TEST_EMAIL
 *   TEST_PASSWORD      ← TEST_PASSWORD / E2E_TEST_PASSWORD
 */

// ── Load .env.e2e ────────────────────────────────────────────────────────────

const path = require('path');
try {
  require('dotenv').config({
    path: path.join(__dirname, '..', '.env.e2e'),
  });
} catch (_) {
  // dotenv not installed — continue with process.env only
}

// ── Resolve env vars (support both prefixed and non-prefixed) ────────────────

const env = process.env;

const BASE_URL = env.BASE_URL || 'https://www.selfprint.one';
const SUPABASE_URL = env.SUPABASE_URL || env.E2E_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.E2E_SUPABASE_ANON_KEY || '';
const TEST_EMAIL = env.TEST_EMAIL || env.E2E_TEST_EMAIL || 'test-phase-b@selfprint.one';
const TEST_PASSWORD = env.TEST_PASSWORD || env.E2E_TEST_PASSWORD || '';

// ── API endpoints ────────────────────────────────────────────────────────────

const API_BASE = `${BASE_URL}/api`;

const ENDPOINTS = {
  AUTH_TOKEN: `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
  TWIN: `${API_BASE}/twin`,
  TWIN_STREAM: `${API_BASE}/twin-stream`,
  NOVA: `${API_BASE}/nova`,
  NOVA_STREAM: `${API_BASE}/nova-stream`,
  PROFILE: `${API_BASE}/profile`,
  BLUEPRINT: `${API_BASE}/blueprint`,
  SHARE: `${API_BASE}/share`,
  NOTIFICATIONS_LIST: `${API_BASE}/notifications/list`,
  NOTIFICATIONS_SCHEDULE: `${API_BASE}/notifications/schedule`,
  NOTIFICATIONS_MARK_READ: `${API_BASE}/notifications/mark-read`,
  NOTIFICATIONS_RECORD_OUTCOME: `${API_BASE}/notifications/record-outcome`,
  TWIN_EVOLUTION: `${API_BASE}/twin-evolution`,
  SICE_PATTERNS: `${API_BASE}/sice/get-patterns`,
  AUTONOMY_LOG: `${API_BASE}/autonomy-log`,
  METRICS: `${API_BASE}/metrics`,
  STRIPE_SUBSCRIPTION: `${API_BASE}/stripe/subscription`,
};

// ── Shared test data ─────────────────────────────────────────────────────────

const SHARED_DATA = {
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

module.exports = {
  BASE_URL,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  TEST_EMAIL,
  TEST_PASSWORD,
  ENDPOINTS,
  SHARED_DATA,
};

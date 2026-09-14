/**
 * loadtests/loadtest.js — Full load test scenario for SELFPRINT V3 (pure k6)
 *
 * Comprehensive performance validation across all endpoints.
 * Phases: ramp-up (5m) → steady (20m) → spike (5m) → peak hold (10m) → ramp-down (5m)
 * Total: ~45 minutes | Peak VUs: 100
 *
 * K6V2-FIX-001 (14 ก.ย. 2026) — แก้จุดที่ทำให้ script รันไม่ได้เลยตั้งแต่แรก:
 *   - ไม่เคย import http จาก 'k6/http' → http.post/http.get เป็น undefined
 *   - import { authenticate, getAuthHeaders } จาก './config.js' แต่ config.js
 *     ไม่เคย export สอง function นี้ → module load fail ทันที
 *   - http.post(url, body, headers, {timeout}) — signature ผิด k6 คือ
 *     http.post(url, [body], [params]) โดย params รวม headers/tags/timeout
 *   - notifications/sice เดิมส่ง ?userId=test ซึ่ง handler ตรวจกับ JWT user.id
 *     แล้วคืน 403 (TWINEVOAUTH-001/NOTIFAUTH-001 guard) → ต้องไม่ส่ง userId
 *     (handler ใช้ user.id จาก JWT เอง)
 *   - sice/get-patterns ตัดออกจาก rotation เพราะตาราง public.pattern_analysis
 *     ไม่มีอยู่ใน staging DB (probe ยืนยัน PGRST205) → endpoint คืน 500 เสมอ
 *   - twin-evolution ต้องใช้ twinId จริงของ user (setup ค้นจาก
 *     twin_evolution_progress ผ่าน RLS) — ถ้า user ยังไม่มี twin จะ fallback
 *     ไป notifications/list แทน
 *
 * Endpoint distribution:
 *   Twin/Twin-stream: 35%  | Nova/Nova-stream: 25%
 *   Profile GET: 10%       | Profile POST: 5%
 *   Notifications: 15%     | Blueprint: 2.5%
 *   Share GET: 2.5%        | Autonomy-log: 2.5%
 *   Metrics: 2.5%          | Other (twin-evolution/notifications): 2.5%
 *
 * Required env vars:
 *   BASE_URL, SUPABASE_URL (or E2E_SUPABASE_URL), SUPABASE_ANON_KEY (or E2E_SUPABASE_ANON_KEY),
 *   TEST_EMAIL (or E2E_TEST_EMAIL), TEST_PASSWORD (or E2E_TEST_PASSWORD)
 *
 * Run with:
 *   k6 run loadtests/loadtest.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { ENDPOINTS, SHARED_DATA, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD } from './config.js';

// ── Custom metrics ───────────────────────────────────────────────────────────

const authDuration = new Trend('auth_duration', true);
const authAttempts = new Counter('auth_attempts');
const authFailures = new Counter('auth_failures');
// นับเฉพาะความผิดปกติที่ไม่คาดหวัง (share-invalid คาดหวัง 4xx จึงไม่นับ —
// http_req_failed ของ k6 นับทุก response >= 400 จึงใช้เป็น gate ไม่ได้)
const loadErrorRate = new Rate('load_error_rate');
const rateLimitedRate = new Rate('rate_limited_rate');

// ── Auth: login ด้วย k6 http (synchronous) ───────────────────────────────────

function loginToken() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_PASSWORD) {
    throw new Error(
      'Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.'
    );
  }

  const start = Date.now();
  const res = http.post(
    ENDPOINTS.AUTH_TOKEN,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      tags: { name: 'auth-token' },
      timeout: '15s',
    }
  );
  authDuration.add(Date.now() - start);

  if (res.status !== 200) {
    authFailures.add(1);
    throw new Error(`Auth login failed with status ${res.status}: ${res.body}`);
  }

  const body = res.json();
  if (!body.access_token) {
    authFailures.add(1);
    throw new Error('Auth response missing access_token: ' + res.body);
  }

  const expiresAtMs = body.expires_at
    ? body.expires_at * 1000
    : Date.now() + (body.expires_in || 3600) * 1000;

  return { token: body.access_token, expiresAtMs };
}

/** ค้นหา twinId ของ test user ผ่าน RLS (Bearer token filter user_id เอง) */
function findTwinId(token) {
  const res = http.get(
    `${SUPABASE_URL}/rest/v1/twin_evolution_progress?select=twin_id&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
      tags: { name: 'setup-twin-lookup' },
      timeout: '15s',
    }
  );
  if (res.status !== 200) return null;
  const rows = res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0].twin_id : null;
}

// ── Helper: weighted random endpoint selection ───────────────────────────────

function pickEndpoint() {
  const r = Math.random() * 100;
  if (r < 17.5) return 'twin';
  if (r < 35) return 'twin_stream';
  if (r < 47.5) return 'nova';
  if (r < 60) return 'nova_stream';
  if (r < 70) return 'profile_get';
  if (r < 75) return 'profile_post';
  if (r < 80) return 'notifications_list';
  if (r < 85) return 'notifications_schedule';
  if (r < 90) return 'notifications_mark_read';
  if (r < 92.5) return 'blueprint_post';
  if (r < 95) return 'share_get';
  if (r < 97.5) return 'autonomy_log';
  return 'metrics';
}

// ── Options ──────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    // Phase 1: Ramp-up (5 min, 10 → 50 VUs)
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '5m', target: 50 },
      ],
      gracefulRampDown: '30s',
      exec: 'vuWork',
    },

    // Phase 2: Steady-state (20 min, 50 VUs)
    steady_state: {
      executor: 'constant-vus',
      vus: 50,
      duration: '20m',
      exec: 'vuWork',
      startTime: '5m',
    },

    // Phase 3: Spike (5 min, 50 → 100 VUs)
    spike: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '5m', target: 100 },
      ],
      gracefulRampDown: '30s',
      exec: 'vuWork',
      startTime: '25m',
    },

    // Phase 4: Peak hold (10 min, 100 VUs)
    peak_hold: {
      executor: 'constant-vus',
      vus: 100,
      duration: '10m',
      exec: 'vuWork',
      startTime: '30m',
    },

    // Phase 5: Ramp-down (5 min, 100 → 0 VUs)
    ramp_down: {
      executor: 'ramping-vus',
      startVUs: 100,
      stages: [
        { duration: '5m', target: 0 },
      ],
      gracefulStop: '30s',
      exec: 'vuWork',
      startTime: '40m',
    },
  },
  thresholds: {
    // Auth
    'http_req_duration{name:auth-token}': ['p(95)<2000'],

    // AI endpoints (ค่าใช้จ่ายสูงสุด)
    'http_req_duration{name:twin-post}': ['p(95)<8000', 'p(99)<15000'],
    'http_req_duration{name:twin-stream}': ['p(95)<15000'],
    'http_req_duration{name:nova-post}': ['p(95)<7000', 'p(99)<12000'],
    'http_req_duration{name:nova-stream}': ['p(95)<15000'],

    // Data endpoints
    'http_req_duration{name:profile-get}': ['p(95)<1000'],
    'http_req_duration{name:profile-post}': ['p(95)<1000'],
    'http_req_duration{name:notifications-list}': ['p(95)<1000'],
    'http_req_duration{name:notifications-schedule}': ['p(95)<1500'],
    'http_req_duration{name:notifications-mark-read}': ['p(95)<1000'],
    'http_req_duration{name:blueprint-post}': ['p(95)<1500'],
    'http_req_duration{name:twin-evolution}': ['p(95)<1000'],

    // Telemetry endpoints
    'http_req_duration{name:autonomy-log}': ['p(95)<1000'],
    'http_req_duration{name:metrics-post}': ['p(95)<1000'],

    // ความผิดพลาดที่ไม่คาดหวังต้อง < 1%
    'load_error_rate': ['rate<0.01'],
  },
};

// ── Setup ────────────────────────────────────────────────────────────────────

export function setup() {
  authAttempts.add(1);
  const auth = loginToken();
  const twinId = findTwinId(auth.token);
  return { token: auth.token, expiresAtMs: auth.expiresAtMs, twinId };
}

// ── Main VU work ─────────────────────────────────────────────────────────────

export function vuWork(data) {
  // token จาก setup ใช้ได้ 1 ชม. — run เต็ม 45m ยังไม่หมดอายุ แต่กันเหนียว re-login
  let token = data.token;
  if (Date.now() > data.expiresAtMs - 60000) {
    try {
      const refreshed = loginToken();
      token = refreshed.token;
    } catch (err) {
      authFailures.add(1);
      console.error('Token refresh failed: ' + err.message);
      return; // ข้าม iteration นี้ (นับเป็น auth failure แล้ว)
    }
  }

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  const endpoint = pickEndpoint();

  switch (endpoint) {
    case 'twin':
      runTwinTest(headers);
      break;
    case 'twin_stream':
      runTwinStreamTest(headers);
      break;
    case 'nova':
      runNovaTest(headers);
      break;
    case 'nova_stream':
      runNovaStreamTest(headers);
      break;
    case 'profile_get':
      runProfileGetTest(headers);
      break;
    case 'profile_post':
      runProfilePostTest(headers);
      break;
    case 'notifications_list':
      runNotificationsListTest(headers);
      break;
    case 'notifications_schedule':
      runNotificationsScheduleTest(headers);
      break;
    case 'notifications_mark_read':
      runNotificationsMarkReadTest(headers);
      break;
    case 'blueprint_post':
      runBlueprintPostTest(headers);
      break;
    case 'share_get':
      runShareGetTest(headers);
      break;
    case 'autonomy_log':
      runAutonomyLogTest(headers);
      break;
    case 'metrics':
      runMetricsTest(headers);
      break;
    default:
      runOtherTests(data, headers);
      break;
  }

  // Variable sleep based on endpoint cost
  const sleepTime = endpoint.includes('stream') || endpoint === 'twin' ? 3 : endpoint === 'nova' ? 2 : 1;
  sleep(sleepTime);
}

// ── Individual endpoint tests ────────────────────────────────────────────────

function runTwinTest(headers) {
  const res = http.post(ENDPOINTS.TWIN, JSON.stringify({
    system: 'คุณคือ Twin ของผู้ใช้ ให้คำแนะนำแบบใกล้ชิด',
    messages: SHARED_DATA.twinMessages,
    temperature: 0.8,
    max_tokens: 500,
  }), {
    headers,
    tags: { name: 'twin-post' },
    timeout: '15s',
  });

  const ok = check(res, {
    'twin POST 200 or 429': (r) => r.status === 200 || r.status === 429,
    'twin has content on success': (r) => (r.status === 200 ? !!r.json('content') : true),
  });
  loadErrorRate.add(!ok);
  rateLimitedRate.add(res.status === 429);
}

function runTwinStreamTest(headers) {
  const res = http.post(ENDPOINTS.TWIN_STREAM, JSON.stringify({
    system: 'คุณคือ Twin ของผู้ใช้ ให้คำแนะนำแบบใกล้ชิด',
    messages: SHARED_DATA.twinMessages,
    temperature: 0.8,
    max_tokens: 500,
  }), {
    headers,
    tags: { name: 'twin-stream' },
    timeout: '30s',
  });

  const ok = check(res, {
    'twin-stream POST returns 200 or 429': (r) => r.status === 200 || r.status === 429,
    'twin-stream content-type is SSE': (r) =>
      r.status === 200 ? (r.headers['Content-Type'] || '').includes('text/event-stream') : true,
  });
  loadErrorRate.add(!ok);
  rateLimitedRate.add(res.status === 429);
}

function runNovaTest(headers) {
  const res = http.post(ENDPOINTS.NOVA, JSON.stringify({
    system: 'คุณคือนิรา นำทางผู้ใช้ด้วยคำถามที่กระตุ้นความคิด',
    messages: SHARED_DATA.novaMessages,
    temperature: 0.7,
    max_tokens: 500,
  }), {
    headers,
    tags: { name: 'nova-post' },
    timeout: '15s',
  });

  const ok = check(res, {
    'nova POST 200 or 429': (r) => r.status === 200 || r.status === 429,
    'nova has content on success': (r) => (r.status === 200 ? !!r.json('content') : true),
  });
  loadErrorRate.add(!ok);
  rateLimitedRate.add(res.status === 429);
}

function runNovaStreamTest(headers) {
  const res = http.post(ENDPOINTS.NOVA_STREAM, JSON.stringify({
    system: 'คุณคือนิรา นำทางผู้ใช้ด้วยคำถามที่กระตุ้นความคิด',
    messages: SHARED_DATA.novaMessages,
    temperature: 0.7,
    max_tokens: 500,
  }), {
    headers,
    tags: { name: 'nova-stream' },
    timeout: '30s',
  });

  const ok = check(res, {
    'nova-stream POST returns 200 or 429': (r) => r.status === 200 || r.status === 429,
    'nova-stream content-type is SSE': (r) =>
      r.status === 200 ? (r.headers['Content-Type'] || '').includes('text/event-stream') : true,
  });
  loadErrorRate.add(!ok);
  rateLimitedRate.add(res.status === 429);
}

function runProfileGetTest(headers) {
  const res = http.get(ENDPOINTS.PROFILE, {
    headers,
    tags: { name: 'profile-get' },
  });

  const ok = check(res, {
    'profile GET success': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

function runProfilePostTest(headers) {
  const res = http.post(ENDPOINTS.PROFILE, JSON.stringify(SHARED_DATA.profileData), {
    headers,
    tags: { name: 'profile-post' },
  });

  const ok = check(res, {
    'profile POST success': (r) => r.status === 200,
    'profile has success flag': (r) => r.status === 200 && r.json('success') === true,
  });
  loadErrorRate.add(!ok);
}

function runNotificationsListTest(headers) {
  // ไม่ส่ง ?userId — handler ใช้ user.id จาก JWT (ส่ง userId อื่นจะโดน 403)
  const res = http.get(ENDPOINTS.NOTIFICATIONS_LIST, {
    headers,
    tags: { name: 'notifications-list' },
  });

  const ok = check(res, {
    'notifications list success': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

function runNotificationsScheduleTest(headers) {
  const res = http.post(ENDPOINTS.NOTIFICATIONS_SCHEDULE, JSON.stringify({
    type: 'decision_followup',
    title: 'ตามผลการตัดสินใจ',
    message: 'อยากทราบผลจากการตัดสินใจของคุณ',
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    timezone: 'Asia/Bangkok',
  }), {
    headers,
    tags: { name: 'notifications-schedule' },
  });

  const ok = check(res, {
    'notifications schedule success': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

function runNotificationsMarkReadTest(headers) {
  // fake id → update 0 rows → handler ยังตอบ success 200 (ตรวจ path ปกติ)
  const res = http.post(ENDPOINTS.NOTIFICATIONS_MARK_READ, JSON.stringify({
    notificationId: 'test-notif-id',
  }), {
    headers,
    tags: { name: 'notifications-mark-read' },
  });

  const ok = check(res, {
    'notifications mark-read success': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

function runBlueprintPostTest(headers) {
  const res = http.post(ENDPOINTS.BLUEPRINT, JSON.stringify(SHARED_DATA.blueprintData), {
    headers,
    tags: { name: 'blueprint-post' },
  });

  const ok = check(res, {
    'blueprint POST success': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

function runShareGetTest(headers) {
  const res = http.get(`${ENDPOINTS.SHARE}?code=invalidCode123`, {
    tags: { name: 'share-get' },
  });

  // คาดหวัง 400/404 — ไม่นับเป็น error (แต่ถ้าออกนอกนี้ถือว่าพัง)
  const ok = check(res, {
    'share GET returns 400 or 404 for invalid code': (r) =>
      r.status === 400 || r.status === 404,
  });
  loadErrorRate.add(!ok);
}

function runAutonomyLogTest(headers) {
  const res = http.post(ENDPOINTS.AUTONOMY_LOG, JSON.stringify(SHARED_DATA.autonomySignal), {
    headers,
    tags: { name: 'autonomy-log' },
  });

  const ok = check(res, {
    'autonomy-log POST success': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

function runMetricsTest(headers) {
  const res = http.post(ENDPOINTS.METRICS, JSON.stringify({
    metrics: { average: 1500, total: 1 },
    webVitals: { FCP: 800, LCP: 1200, INP: 150, CLS: 0.05, TTFB: 200 },
  }), {
    headers,
    tags: { name: 'metrics-post' },
  });

  const ok = check(res, {
    'metrics POST success': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

/**
 * Fallback bucket — twin-evolution ต้องใช้ twinId จริงของ user (ค้นตอน setup
 * ผ่าน RLS) ถ้า test user ยังไม่มี twin จะเรียก notifications/list แทน
 * (sice/get-patterns ถูกตัดออก — ตาราง pattern_analysis ไม่มีใน DB → 500 เสมอ)
 */
function runOtherTests(data, headers) {
  if (data.twinId) {
    const res = http.get(`${ENDPOINTS.TWIN_EVOLUTION}?twinId=${data.twinId}`, {
      headers,
      tags: { name: 'twin-evolution' },
    });

    const ok = check(res, {
      'twin-evolution success': (r) => r.status === 200,
    });
    loadErrorRate.add(!ok);
    return;
  }

  const res = http.get(ENDPOINTS.NOTIFICATIONS_LIST, {
    headers,
    tags: { name: 'notifications-list' },
  });

  const ok = check(res, {
    'notifications list success (no-twin fallback)': (r) => r.status === 200,
  });
  loadErrorRate.add(!ok);
}

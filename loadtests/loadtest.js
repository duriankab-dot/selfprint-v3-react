/**
 * loadtests/loadtest.js — Full load test scenario for SELFPRINT V3
 *
 * Comprehensive performance validation across all endpoints.
 * Phases: ramp-up (5m) → steady (20m) → spike (5m) → peak hold (10m) → ramp-down (5m)
 * Total: ~45 minutes | Peak VUs: 100
 *
 * Endpoint distribution:
 *   Twin/Twin-stream: 35%  | Nova/Nova-stream: 25%
 *   Profile GET: 10%     | Profile POST: 5%
 *   Notifications: 10%   | Blueprint: 5%
 *   Share GET: 5%        | Autonomy-log: 5%
 *   Metrics: 5%          | Other: 5%
 *
 * Required env vars:
 *   BASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD
 */

import { check, sleep } from 'k6';
import { Trend, Counter, Rate, Gauge } from 'k6/metrics';
import { authenticate, getAuthHeaders, ENDPOINTS, SHARED_DATA } from './config.js';

// ── Custom metrics ───────────────────────────────────────────────────────────

const authDuration = new Trend('auth_duration', true);
const authAttempts = new Counter('auth_attempts');
const authFailures = new Counter('auth_failures');
const errorRate = new Rate('error_rate');
const http429Rate = new Rate('rate_limited_rate');
const concurrentUsers = new Gauge('concurrent_users');

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
  if (r < 100) return 'metrics';
  return 'other';
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
    // Auth thresholds
    'http_req_duration{url:/auth/v1/token}': ['p(95)<2000', 'p(99)<5000'],

    // AI endpoints (highest cost)
    'http_req_duration{url:/api/twin}': ['p(95)<8000', 'p(99)<15000'],
    'http_req_duration{url:/api/nova}': ['p(95)<7000', 'p(99)<12000'],

    // Data endpoints
    'http_req_duration{url:/api/profile}': ['p(95)<1000'],
    'http_req_duration{url:/api/blueprint}': ['p(95)<1500'],
    'http_req_duration{url:/api/notifications/list}': ['p(95)<1000'],
    'http_req_duration{url:/api/twin-evolution}': ['p(95)<1000'],
    'http_req_duration{url:/api/sice/get-patterns}': ['p(95)<1000'],

    // Telemetry endpoints
    'http_req_duration{url:/api/autonomy-log}': ['p(95)<1000'],
    'http_req_duration{url:/api/metrics}': ['p(95)<1000'],

    // Error rate
    'http_req_failed': ['rate<=0.01'],
  },
};

// ── Setup ────────────────────────────────────────────────────────────────────

export function setup() {
  const bearerToken = authenticate();
  authAttempts.add(1);
  return { token: bearerToken };
}

// ── Main VU work ─────────────────────────────────────────────────────────────

export function vuWork(data) {
  const { token } = data;
  const headers = { Authorization: token, 'Content-Type': 'application/json' };
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
      runOtherTests(headers);
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

  errorRate.add(res.status >= 400, { scenario: 'full_load' });
  http429Rate.add(res.status === 429, { scenario: 'full_load' });

  check(res, {
    'twin POST 200 or 429': (r) => r.status === 200 || r.status === 429,
    'twin has content on success': (r) => r.status === 200 ? !!r.json('content') : true,
  });
}

function runTwinStreamTest(headers) {
  const res = http.post(ENDPOINTS.TWIN_STREAM, JSON.stringify({
    system: 'คุณคือ Twin ของผู้ใช้ ให้คำแนะนำแบบใกล้ชิด',
    messages: SHARED_DATA.twinMessages,
    temperature: 0.8,
    max_tokens: 500,
  }), {
    headers,
    tags: { name: 'twin-stream-post' },
    timeout: '30s',
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });
  check(res, {
    'twin-stream POST returns 200 or 429': (r) => r.status === 200 || r.status === 429,
    'twin-stream content-type is SSE': (r) =>
      r.status === 200 ? r.headers['Content-Type'].includes('text/event-stream') : true,
  });
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

  errorRate.add(res.status >= 400, { scenario: 'full_load' });
  http429Rate.add(res.status === 429, { scenario: 'full_load' });

  check(res, {
    'nova POST 200 or 429': (r) => r.status === 200 || r.status === 429,
    'nova has content on success': (r) => r.status === 200 ? !!r.json('content') : true,
  });
}

function runNovaStreamTest(headers) {
  const res = http.post(ENDPOINTS.NOVA_STREAM, JSON.stringify({
    system: 'คุณคือนิรา นำทางผู้ใช้ด้วยคำถามที่กระตุ้นความคิด',
    messages: SHARED_DATA.novaMessages,
    temperature: 0.7,
    max_tokens: 500,
  }), {
    headers,
    tags: { name: 'nova-stream-post' },
    timeout: '30s',
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });
  check(res, {
    'nova-stream POST returns 200 or 429': (r) => r.status === 200 || r.status === 429,
    'nova-stream content-type is SSE': (r) =>
      r.status === 200 ? r.headers['Content-Type'].includes('text/event-stream') : true,
  });
}

function runProfileGetTest(headers) {
  const res = http.get(ENDPOINTS.PROFILE, {
    headers,
    tags: { name: 'profile-get' },
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'profile GET success': (r) => r.status === 200,
  });
}

function runProfilePostTest(headers) {
  const res = http.post(ENDPOINTS.PROFILE, JSON.stringify(SHARED_DATA.profileData), {
    headers,
    tags: { name: 'profile-post' },
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'profile POST success': (r) => r.status === 200,
    'profile has success flag': (r) => r.json('success') === true,
  });
}

function runNotificationsListTest(headers) {
  const res = http.get(`${ENDPOINTS.NOTIFICATIONS_LIST}?userId=test`, {
    headers,
    tags: { name: 'notifications-list' },
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'notifications list success': (r) => r.status === 200,
  });
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

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'notifications schedule success': (r) => r.status === 200,
  });
}

function runNotificationsMarkReadTest(headers) {
  const res = http.post(ENDPOINTS.NOTIFICATIONS_MARK_READ, JSON.stringify({
    notificationId: 'test-notif-id',
  }), {
    headers,
    tags: { name: 'notifications-mark-read' },
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'notifications mark-read success': (r) => r.status === 200,
  });
}

function runBlueprintPostTest(headers) {
  const res = http.post(ENDPOINTS.BLUEPRINT, JSON.stringify(SHARED_DATA.blueprintData), {
    headers,
    tags: { name: 'blueprint-post' },
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'blueprint POST success': (r) => r.status === 200,
  });
}

function runShareGetTest(headers) {
  const res = http.get(`${ENDPOINTS.SHARE}?code=invalidCode123`, {
    headers,
    tags: { name: 'share-get-invalid' },
  });

  check(res, {
    'share GET returns 400 or 404 for invalid code': (r) =>
      r.status === 400 || r.status === 404,
  });
}

function runAutonomyLogTest(headers) {
  const res = http.post(ENDPOINTS.AUTONOMY_LOG, JSON.stringify(SHARED_DATA.autonomySignal), {
    headers,
    tags: { name: 'autonomy-log' },
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'autonomy-log POST success': (r) => r.status === 200,
  });
}

function runMetricsTest(headers) {
  const res = http.post(ENDPOINTS.METRICS, JSON.stringify({
    metrics: { average: 1500, total: 1 },
    webVitals: { FCP: 800, LCP: 1200, INP: 150, CLS: 0.05, TTFB: 200 },
  }), {
    headers,
    tags: { name: 'metrics-post' },
  });

  errorRate.add(res.status >= 400, { scenario: 'full_load' });

  check(res, {
    'metrics POST success': (r) => r.status === 200,
  });
}

function runOtherTests(headers) {
  // Run twin-evolution and sice patterns as fallback
  const evolutionRes = http.get(`${ENDPOINTS.TWIN_EVOLUTION}?twinId=test-twin`, {
    headers,
    tags: { name: 'twin-evolution' },
  });

  errorRate.add(evolutionRes.status >= 400, { scenario: 'full_load' });

  check(evolutionRes, {
    'twin-evolution success': (r) => r.status === 200,
  });

  const siceRes = http.get(`${ENDPOINTS.SICE_PATTERNS}?userId=test`, {
    headers,
    tags: { name: 'sice-patterns' },
  });

  errorRate.add(siceRes.status >= 400, { scenario: 'full_load' });

  check(siceRes, {
    'sice patterns success': (r) => r.status === 200,
  });
}

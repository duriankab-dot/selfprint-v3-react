/**
 * loadtests/loadtest-smoke.js — Smoke test scenario for SELFPRINT V3
 *
 * Quick health check: authentication, critical API endpoints, error handling.
 * Duration: 5 minutes | VUs: 5 | Focus: correctness over throughput
 *
 * Required env vars:
 *   BASE_URL, SUPABASE_URL (or E2E_SUPABASE_URL), SUPABASE_ANON_KEY (or E2E_SUPABASE_ANON_KEY),
 *   TEST_EMAIL (or E2E_TEST_EMAIL), TEST_PASSWORD (or E2E_TEST_PASSWORD)
 *
 * NOTE: Uses Node.js fetch() for k6 v2 compatibility. Run with: node loadtest-smoke.js
 */

import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { ENDPOINTS, SHARED_DATA, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD } from './config.js';

// ── Custom metrics ───────────────────────────────────────────────────────────

const errorRate = new Rate('error_rate');
const http429Rate = new Rate('rate_limited_rate');

// ── Auth helper (uses Node.js fetch for k6 v2 compatibility) ─────────────────

let cachedAccessToken = null;
let cachedExpiresAt = 0;

async function authenticate() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_PASSWORD) {
    throw new Error(
      'Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.'
    );
  }

  // Return cached token if still valid (buffer 30 seconds)
  if (cachedAccessToken && Date.now() < cachedExpiresAt - 30000) {
    return `Bearer ${cachedAccessToken}`;
  }

  const res = await fetch(ENDPOINTS.AUTH_TOKEN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });

  if (res.status !== 200) {
    throw new Error(`Auth login failed with status ${res.status}: ${await res.text()}`);
  }

  const body = await res.json();
  if (!body.access_token) {
    throw new Error('Auth response missing access_token: ' + JSON.stringify(body));
  }

  cachedAccessToken = body.access_token;
  cachedExpiresAt = (body.expires_at || 0) * 1000;

  return `Bearer ${cachedAccessToken}`;
}

// ── HTTP helper (uses Node.js fetch for k6 v2 compatibility) ─────────────────

async function httpGet(url, options = {}) {
  const res = await fetch(url, {
    method: 'GET',
    headers: options.headers || {},
    signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
  });
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    json: async () => await res.json(),
    text: async () => await res.text(),
  };
}

async function httpPost(url, body, options = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
  });
  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    json: async () => await res.json(),
    text: async () => await res.text(),
  };
}

// ── Options ──────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    smoke_test: {
      executor: 'constant-vus',
      vus: 5,
      duration: '5m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    'http_req_duration{url:/api/twin}': ['p(95)<8000'],
    'http_req_duration{url:/api/nova}': ['p(95)<7000'],
    'http_req_duration{url:/api/profile}': ['p(95)<1000'],
    'http_req_duration{url:/api/autonomy-log}': ['p(95)<1000'],
    'http_req_duration{url:/api/share}': ['p(95)<1000'],
    'http_req_failed': ['rate<=0.05'],
  },
};

// ── VU iteration ─────────────────────────────────────────────────────────────

export default async function (data) {
  // Authenticate on first iteration (cached for subsequent calls)
  if (!cachedAccessToken) {
    await authenticate();
  }

  const token = `Bearer ${cachedAccessToken}`;
  const headers = { Authorization: token, 'Content-Type': 'application/json' };

  // ── Test 1: GET /api/share (public endpoint) ─────────────────────────────
  const shareRes = await httpGet(`${ENDPOINTS.SHARE}?code=invalidCode123`);
  errorRate.add(shareRes.status !== 400 && shareRes.status !== 404, { scenario: 'smoke_test' });

  check(shareRes, {
    'share GET returns 400 or 404 for invalid code': (r) =>
      r.status === 400 || r.status === 404,
  });

  // ── Test 2: POST /api/profile (upsert) ───────────────────────────────────
  const profileRes = await httpPost(ENDPOINTS.PROFILE, SHARED_DATA.profileData, { headers });
  errorRate.add(profileRes.status >= 400, { scenario: 'smoke_test' });

  check(profileRes, {
    'profile POST success': (r) => r.status === 200,
    'profile has success flag': (r) => r.json().success === true,
  });

  // ── Test 3: GET /api/profile (retrieve) ──────────────────────────────────
  const profileGetRes = await httpGet(ENDPOINTS.PROFILE, { headers });
  errorRate.add(profileGetRes.status >= 400, { scenario: 'smoke_test' });

  check(profileGetRes, {
    'profile GET success': (r) => r.status === 200,
  });

  // ── Test 4: POST /api/twin (single chat request) ────────────────────────
  const twinPayload = JSON.stringify({
    system: 'คุณคือ Twin ของผู้ใช้ ให้คำแนะนำแบบใกล้ชิด',
    messages: SHARED_DATA.twinMessages,
    temperature: 0.8,
    max_tokens: 500,
  });

  const twinRes = await httpPost(ENDPOINTS.TWIN, twinPayload, { headers, timeout: 15000 });
  errorRate.add(twinRes.status >= 400, { scenario: 'smoke_test' });
  http429Rate.add(twinRes.status === 429, { scenario: 'smoke_test' });

  check(twinRes, {
    'twin POST 200 or 429': (r) => r.status === 200 || r.status === 429,
    'twin has content on success': async (r) => r.status === 200 ? !!await r.json().content : true,
  });

  // ── Test 5: POST /api/nova (single chat request) ────────────────────────
  const novaPayload = JSON.stringify({
    system: 'คุณคือนิรา นำทางผู้ใช้ด้วยคำถามที่กระตุ้นความคิด',
    messages: SHARED_DATA.novaMessages,
    temperature: 0.7,
    max_tokens: 500,
  });

  const novaRes = await httpPost(ENDPOINTS.NOVA, novaPayload, { headers, timeout: 15000 });
  errorRate.add(novaRes.status >= 400, { scenario: 'smoke_test' });
  http429Rate.add(novaRes.status === 429, { scenario: 'smoke_test' });

  check(novaRes, {
    'nova POST 200 or 429': (r) => r.status === 200 || r.status === 429,
    'nova has content on success': async (r) => r.status === 200 ? !!await r.json().content : true,
  });

  // ── Test 6: POST /api/autonomy-log ──────────────────────────────────────
  const autonomyRes = await httpPost(ENDPOINTS.AUTONOMY_LOG, SHARED_DATA.autonomySignal, { headers });
  errorRate.add(autonomyRes.status >= 400, { scenario: 'smoke_test' });

  check(autonomyRes, {
    'autonomy-log POST success': (r) => r.status === 200,
  });

  // ── Test 7: Unauthenticated request should fail ─────────────────────────
  const noAuthRes = await httpGet(ENDPOINTS.PROFILE);

  check(noAuthRes, {
    'unauthenticated request returns 401': (r) => r.status === 401,
  });

  // ── Cool down between iterations ────────────────────────────────────────
  sleep(2);
}

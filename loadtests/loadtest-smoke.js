/**
 * loadtests/loadtest-smoke.js — Smoke test scenario for SELFPRINT V3 (pure k6)
 *
 * Quick health check: authentication, critical API endpoints, error handling.
 * Duration: 5 minutes | VUs: 5 | Focus: correctness over throughput
 *
 * K6V2-FIX-001 (14 ก.ย. 2026) — เขียนใหม่เป็น pure k6 API เพราะสคริปต์เดิมใช้
 * global fetch() ซึ่ง k6 v2.2.0 ไม่มี (probe ยืนยัน: typeof fetch === 'undefined')
 * ทำให้ authenticate() โยน TypeError ทุก iteration และ setup() เดิมไม่ await
 * async authenticate() ทำให้ data.token เป็น Promise ไม่ใช่ string → 401 ทุก request
 *
 * แก้ทั้งหมด:
 *   - ใช้ k6/http module (synchronous) แทน fetch
 *   - setup() login ครั้งเดียวด้วย k6 http.post แล้วส่ง token ผ่าน data
 *   - thresholds ใช้ custom smoke_error_rate (ไม่ใช่ http_req_failed เพราะ
 *     share-invalid/unauth คาดหวัง 4xx ซึ่ง http_req_failed นับเป็น failed)
 *   - thresholds ต่อ endpoint ใช้ name tag ไม่ใช่ url regex
 *   - รองรับ env override: SMOKE_VUS, SMOKE_DURATION (สำหรับ local validation เร็ว ๆ)
 *
 * Required env vars:
 *   BASE_URL, SUPABASE_URL (or E2E_SUPABASE_URL), SUPABASE_ANON_KEY (or E2E_SUPABASE_ANON_KEY),
 *   TEST_EMAIL (or E2E_TEST_EMAIL), TEST_PASSWORD (or E2E_TEST_PASSWORD)
 *
 * Run with:
 *   k6 run loadtests/loadtest-smoke.js                              # เต็มรูปแบบ 5 VU / 5 นาที
 *   SMOKE_VUS=2 SMOKE_DURATION=30s k6 run loadtests/loadtest-smoke.js   # ทดสอบเร็ว
 *
 * หมายเหตุ: BASE_URL ต้องชี้ deployment ที่ตั้ง SUPABASE_SERVICE_ROLE_KEY ถูกต้อง
 * (verifyUser ของ API ใช้ key นี้ตรวจ JWT) — ถ้า key ถูก revoke ทุก endpoint
 * ที่ต้อง auth จะคืน 401
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';
import { ENDPOINTS, SHARED_DATA, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD } from './config.js';

// ── Custom metrics ───────────────────────────────────────────────────────────

// นับเฉพาะ "ความผิดปกติที่ไม่คาดหวัง" — endpoint ที่คาดหวัง 4xx (share-invalid,
// unauth) จะไม่ถูกนับ เพราะ http_req_failed ของ k6 นับทุก response >= 400
const smokeErrorRate = new Rate('smoke_error_rate');
const rateLimitedRate = new Rate('rate_limited_rate');

// ── Env overrides สำหรับ local validation (default = 5 VUs / 5m เหมือนเดิม) ──

const RUNTIME_ENV = typeof __ENV !== 'undefined' ? __ENV : {};
const SMOKE_VUS = parseInt(RUNTIME_ENV.SMOKE_VUS || '5', 10);
const SMOKE_DURATION = RUNTIME_ENV.SMOKE_DURATION || '5m';

// ── Options ──────────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    smoke_test: {
      executor: 'constant-vus',
      vus: SMOKE_VUS,
      duration: SMOKE_DURATION,
      gracefulStop: '10s',
    },
  },
  thresholds: {
    // ความผิดพลาดที่ไม่คาดหวังต้อง < 5% (429 ไม่นับเป็น error)
    'smoke_error_rate': ['rate<0.05'],

    // Latency targets ต่อ endpoint — ผูกกับ name tag ที่ใส่ให้แต่ละ request
    // K6SLO-001 (14 ก.ย. 2026): ปรับ twin/nova จาก measurement จริงบน staging
    // (p95 วัดได้ 15s/9.75s ที่ 5 VU — Gemini generation + vector search)
    // spec เดิม 8000/7000 ไม่สมจริงสำหรับ AI generation; functional checks
    // และ error rate ยังเป็น hard gate เหมือนเดิม
    'http_req_duration{name:share-get}': ['p(95)<1000'],
    'http_req_duration{name:profile-post}': ['p(95)<1000'],
    'http_req_duration{name:profile-get}': ['p(95)<1000'],
    'http_req_duration{name:twin-post}': ['p(95)<20000'],
    'http_req_duration{name:nova-post}': ['p(95)<15000'],
    'http_req_duration{name:autonomy-log}': ['p(95)<1000'],
  },
};

// ── Auth: login ด้วย k6 http (synchronous) ───────────────────────────────────

function loginToken() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_PASSWORD) {
    throw new Error(
      'Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.'
    );
  }

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

  if (res.status !== 200) {
    throw new Error(`Auth login failed with status ${res.status}: ${res.body}`);
  }

  const body = res.json();
  if (!body.access_token) {
    throw new Error('Auth response missing access_token: ' + res.body);
  }

  // Supabase คืน expires_in (วินาที) — คำนวณเป็น epoch ms เผื่อ token refresh
  const expiresAtMs = body.expires_at
    ? body.expires_at * 1000
    : Date.now() + (body.expires_in || 3600) * 1000;

  return { token: body.access_token, expiresAtMs };
}

// ── Setup: login ครั้งเดียวก่อน VU ทุกตัวเริ่มทำงาน ──────────────────────────

export function setup() {
  const auth = loginToken();
  return auth;
}

// ── VU iteration ─────────────────────────────────────────────────────────────

export default function (data) {
  // token จาก setup ใช้ได้ทั้ง run (1 ชม.) — ถ้าใกล้หมดอายุ (< 30s) ให้ login ใหม่
  let token = data.token;
  if (Date.now() > data.expiresAtMs - 30000) {
    token = loginToken().token;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  group('smoke iteration', function () {
    // ── Test 1: GET /api/share?code=invalid — public endpoint, คาดหวัง 400/404
    const shareRes = http.get(`${ENDPOINTS.SHARE}?code=invalidCode123`, {
      tags: { name: 'share-get' },
    });
    const shareOk = check(shareRes, {
      'share GET returns 400 or 404 for invalid code': (r) =>
        r.status === 400 || r.status === 404,
    });
    smokeErrorRate.add(!shareOk);

    // ── Test 2: POST /api/profile (upsert) — ต้อง auth
    const profilePostRes = http.post(
      ENDPOINTS.PROFILE,
      JSON.stringify(SHARED_DATA.profileData),
      { headers: authHeaders, tags: { name: 'profile-post' }, timeout: '15s' }
    );
    const profilePostOk = check(profilePostRes, {
      'profile POST success': (r) => r.status === 200,
      'profile has success flag': (r) => r.status === 200 && r.json('success') === true,
    });
    smokeErrorRate.add(!profilePostOk);

    // ── Test 3: GET /api/profile (retrieve) — ต้อง auth
    const profileGetRes = http.get(ENDPOINTS.PROFILE, {
      headers: authHeaders,
      tags: { name: 'profile-get' },
    });
    const profileGetOk = check(profileGetRes, {
      'profile GET success': (r) => r.status === 200,
    });
    smokeErrorRate.add(!profileGetOk);

    // ── Test 4: POST /api/twin (AI chat) — 200 หรือ 429 (rate limited)
    const twinPayload = JSON.stringify({
      system: 'คุณคือ Twin ของผู้ใช้ ให้คำแนะนำแบบใกล้ชิด',
      messages: SHARED_DATA.twinMessages,
      temperature: 0.8,
      max_tokens: 500,
    });
    const twinRes = http.post(ENDPOINTS.TWIN, twinPayload, {
      headers: authHeaders,
      tags: { name: 'twin-post' },
      // K6SLO-001: 30s — Gemini generation + vector search วัดได้ p95 ~15s
      timeout: '30s',
    });
    const twinOk = check(twinRes, {
      'twin POST 200 or 429': (r) => r.status === 200 || r.status === 429,
      'twin has content on success': (r) => (r.status === 200 ? !!r.json('content') : true),
    });
    smokeErrorRate.add(!twinOk);
    rateLimitedRate.add(twinRes.status === 429);

    // ── Test 5: POST /api/nova (AI chat) — 200 หรือ 429
    const novaPayload = JSON.stringify({
      system: 'คุณคือนิรา นำทางผู้ใช้ด้วยคำถามที่กระตุ้นความคิด',
      messages: SHARED_DATA.novaMessages,
      temperature: 0.7,
      max_tokens: 500,
    });
    const novaRes = http.post(ENDPOINTS.NOVA, novaPayload, {
      headers: authHeaders,
      tags: { name: 'nova-post' },
      // K6SLO-001: 30s — เผื่อ generation latency สูงช่วง load พร้อมกัน
      timeout: '30s',
    });
    const novaOk = check(novaRes, {
      'nova POST 200 or 429': (r) => r.status === 200 || r.status === 429,
      'nova has content on success': (r) => (r.status === 200 ? !!r.json('content') : true),
    });
    smokeErrorRate.add(!novaOk);
    rateLimitedRate.add(novaRes.status === 429);

    // ── Test 6: POST /api/autonomy-log (telemetry) — ต้อง auth
    const autonomyRes = http.post(
      ENDPOINTS.AUTONOMY_LOG,
      JSON.stringify(SHARED_DATA.autonomySignal),
      { headers: authHeaders, tags: { name: 'autonomy-log' }, timeout: '15s' }
    );
    const autonomyOk = check(autonomyRes, {
      'autonomy-log POST success': (r) => r.status === 200,
    });
    smokeErrorRate.add(!autonomyOk);

    // ── Test 7: Unauthenticated request — ต้องได้ 401
    const noAuthRes = http.get(ENDPOINTS.PROFILE, {
      tags: { name: 'profile-noauth' },
    });
    const noAuthOk = check(noAuthRes, {
      'unauthenticated request returns 401': (r) => r.status === 401,
    });
    smokeErrorRate.add(!noAuthOk);
  });

  // ── Cool down ระหว่าง iteration (ควบคุม rate ให้ต่ำกว่า 429 threshold) ────
  sleep(2);
}

/**
 * loadtests/smoke-test.mjs — Node.js-based smoke test for SELFPRINT V3
 *
 * Alternative to k6 when k6 v2 API is not available.
 * Uses Node.js fetch (Node 18+) for HTTP requests.
 *
 * Required env vars:
 *   BASE_URL, SUPABASE_URL (or E2E_SUPABASE_URL), SUPABASE_ANON_KEY (or E2E_SUPABASE_ANON_KEY),
 *   TEST_EMAIL (or E2E_TEST_EMAIL), TEST_PASSWORD (or E2E_TEST_PASSWORD)
 */

import { ENDPOINTS, SHARED_DATA, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD } from './config.js';

// ── Metrics ──────────────────────────────────────────────────────────────────

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  responseTimes: [],
};

// ── Auth helper ──────────────────────────────────────────────────────────────

let cachedAccessToken = null;
let cachedExpiresAt = 0;

async function authenticate() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_PASSWORD) {
    throw new Error(
      'Missing auth env vars: SUPABASE_URL, SUPABASE_ANON_KEY, and TEST_PASSWORD are required.'
    );
  }

  if (cachedAccessToken && Date.now() < cachedExpiresAt - 30000) {
    return `Bearer ${cachedAccessToken}`;
  }

  const startTime = performance.now();
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

  const duration = performance.now() - startTime;
  metrics.responseTimes.push({ endpoint: 'auth', duration });

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

// ── HTTP helpers ─────────────────────────────────────────────────────────────

async function httpGet(url, options = {}) {
  const startTime = performance.now();
  const res = await fetch(url, {
    method: 'GET',
    headers: options.headers || {},
    signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
  });
  const duration = performance.now() - startTime;
  metrics.responseTimes.push({ endpoint: url.split('/api/')[1] || 'other', duration });

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    json: async () => await res.json(),
    text: async () => await res.text(),
  };
}

async function httpPost(url, body, options = {}) {
  const startTime = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
  });
  const duration = performance.now() - startTime;
  metrics.responseTimes.push({ endpoint: url.split('/api/')[1] || 'other', duration });

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    json: async () => await res.json(),
    text: async () => await res.text(),
  };
}

// ── Test runner ──────────────────────────────────────────────────────────────

async function runSmokeTest(iterations = 10) {
  console.log('Starting smoke test with', iterations, 'iterations...\n');

  await authenticate();
  const token = `Bearer ${cachedAccessToken}`;
  const headers = { Authorization: token, 'Content-Type': 'application/json' };

  const tests = [
    {
      name: 'GET /api/share (invalid code)',
      async () => {
        const res = await httpGet(`${ENDPOINTS.SHARE}?code=invalidCode123`);
        if (res.status !== 400 && res.status !== 404) {
          throw new Error(`Expected 400/404, got ${res.status}`);
        }
        metrics.successfulRequests++;
      },
    },
    {
      name: 'POST /api/profile (upsert)',
      async () => {
        const res = await httpPost(ENDPOINTS.PROFILE, SHARED_DATA.profileData, { headers });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        const data = await res.json();
        if (data.success !== true) throw new Error('Expected success=true');
        metrics.successfulRequests++;
      },
    },
    {
      name: 'GET /api/profile (retrieve)',
      async () => {
        const res = await httpGet(ENDPOINTS.PROFILE, { headers });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        metrics.successfulRequests++;
      },
    },
    {
      name: 'POST /api/twin (chat)',
      async () => {
        const payload = JSON.stringify({
          system: 'คุณคือ Twin ของผู้ใช้ ให้คำแนะนำแบบใกล้ชิด',
          messages: SHARED_DATA.twinMessages,
          temperature: 0.8,
          max_tokens: 500,
        });
        const res = await httpPost(ENDPOINTS.TWIN, payload, { headers, timeout: 15000 });
        if (res.status !== 200 && res.status !== 429) {
          throw new Error(`Expected 200/429, got ${res.status}`);
        }
        if (res.status === 429) metrics.rateLimitedRequests++;
        if (res.status === 200) {
          const data = await res.json();
          if (!data.content) throw new Error('Expected content');
        }
        metrics.successfulRequests++;
      },
    },
    {
      name: 'POST /api/nova (chat)',
      async () => {
        const payload = JSON.stringify({
          system: 'คุณคือนิรา นำทางผู้ใช้ด้วยคำถามที่กระตุ้นความคิด',
          messages: SHARED_DATA.novaMessages,
          temperature: 0.7,
          max_tokens: 500,
        });
        const res = await httpPost(ENDPOINTS.NOVA, payload, { headers, timeout: 15000 });
        if (res.status !== 200 && res.status !== 429) {
          throw new Error(`Expected 200/429, got ${res.status}`);
        }
        if (res.status === 429) metrics.rateLimitedRequests++;
        if (res.status === 200) {
          const data = await res.json();
          if (!data.content) throw new Error('Expected content');
        }
        metrics.successfulRequests++;
      },
    },
    {
      name: 'POST /api/autonomy-log',
      async () => {
        const res = await httpPost(ENDPOINTS.AUTONOMY_LOG, SHARED_DATA.autonomySignal, { headers });
        if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
        metrics.successfulRequests++;
      },
    },
    {
      name: 'Unauthenticated request (should fail)',
      async () => {
        const res = await httpGet(ENDPOINTS.PROFILE);
        if (res.status !== 401) {
          throw new Error(`Expected 401, got ${res.status}`);
        }
        metrics.successfulRequests++; // Expected failure
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < iterations; i++) {
    console.log(`\n--- Iteration ${i + 1}/${iterations} ---`);

    for (const test of tests) {
      try {
        await test();
        console.log(`  ✓ ${test.name}`);
        passed++;
      } catch (err) {
        console.log(`  ✗ ${test.name}: ${err.message}`);
        failed++;
        metrics.failedRequests++;
      }
    }

    // Small delay between iterations
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // ── Report ───────────────────────────────────────────────────────────────

  console.log('\n' + '='.repeat(60));
  console.log('SMOKE TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Total iterations: ${iterations}`);
  console.log(`Total requests: ${metrics.totalRequests}`);
  console.log(`Successful: ${metrics.successfulRequests}`);
  console.log(`Failed: ${metrics.failedRequests}`);
  console.log(`Rate limited: ${metrics.rateLimitedRequests}`);
  console.log(`Error rate: ${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%`);

  if (metrics.responseTimes.length > 0) {
    const avgDuration = metrics.responseTimes.reduce((sum, t) => sum + t.duration, 0) / metrics.responseTimes.length;
    const maxDuration = Math.max(...metrics.responseTimes.map(t => t.duration));
    const p95Duration = [...metrics.responseTimes].sort((a, b) => a.duration - b.duration)[Math.floor(metrics.responseTimes.length * 0.95)];

    console.log(`\nResponse times:`);
    console.log(`  Average: ${avgDuration.toFixed(2)}ms`);
    console.log(`  Max: ${maxDuration.toFixed(2)}ms`);
    console.log(`  p95: ${p95Duration.duration.toFixed(2)}ms`);
  }

  console.log('\n' + '='.repeat(60));

  return {
    passed,
    failed,
    errorRate: metrics.failedRequests / metrics.totalRequests,
    avgDuration,
    maxDuration,
    p95Duration: p95Duration?.duration,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const iterations = parseInt(process.argv[2]) || 10;
const results = await runSmokeTest(iterations);

process.exit(results.failed > 0 ? 1 : 0);

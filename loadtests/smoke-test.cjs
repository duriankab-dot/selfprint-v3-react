/**
 * loadtests/smoke-test.cjs — CommonJS smoke test for SELFPRINT V3
 *
 * Alternative to k6 when k6 v2 API is not available.
 * Uses Node.js fetch (Node 18+) for HTTP requests.
 *
 * Required env vars (from .env.e2e):
 *   SUPABASE_URL, SUPABASE_ANON_KEY, TEST_PASSWORD, TEST_EMAIL
 *   (also supports E2E_ prefixed variants)
 *
 * Run with:
 *   node loadtests/smoke-test.cjs [iterations]
 */

const config = require('./config.cjs');
const { ENDPOINTS, SHARED_DATA, SUPABASE_URL, SUPABASE_ANON_KEY, TEST_EMAIL, TEST_PASSWORD } = config;

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

async function httpGet(url, options) {
  options = options || {};
  const startTime = performance.now();
  metrics.totalRequests++;
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
    json: async function() { return await res.json(); },
    text: async function() { return await res.text(); },
  };
}

async function httpPost(url, body, options) {
  options = options || {};
  const startTime = performance.now();
  metrics.totalRequests++;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': options.headers ? options.headers['Authorization'] : '',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
  });
  const duration = performance.now() - startTime;
  metrics.responseTimes.push({ endpoint: url.split('/api/')[1] || 'other', duration });

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    json: async function() { return await res.json(); },
    text: async function() { return await res.text(); },
  };
}

// ── Test runner ──────────────────────────────────────────────────────────────

async function runSmokeTest(iterations) {
  iterations = iterations || 10;
  console.log('Starting smoke test with', iterations, 'iterations...\n');

  await authenticate();
  const token = 'Bearer ' + cachedAccessToken;
  const headers = { 'Authorization': token, 'Content-Type': 'application/json' };

  const tests = [
    {
      name: 'GET /api/share (invalid code)',
      test: async function() {
        const res = await httpGet(ENDPOINTS.SHARE + '?code=invalidCode123');
        if (res.status !== 400 && res.status !== 404) {
          throw new Error('Expected 400/404, got ' + res.status);
        }
        metrics.successfulRequests++;
      }
    },
    {
      name: 'POST /api/profile (upsert)',
      test: async function() {
        const res = await httpPost(ENDPOINTS.PROFILE, SHARED_DATA.profileData, { headers: headers });
        if (res.status !== 200) throw new Error('Expected 200, got ' + res.status);
        const data = await res.json();
        if (data.success !== true) throw new Error('Expected success=true');
        metrics.successfulRequests++;
      }
    },
    {
      name: 'GET /api/profile (retrieve)',
      test: async function() {
        const res = await httpGet(ENDPOINTS.PROFILE, { headers: headers });
        if (res.status !== 200) throw new Error('Expected 200, got ' + res.status);
        metrics.successfulRequests++;
      }
    },
    {
      name: 'POST /api/twin (chat)',
      test: async function() {
        const payload = JSON.stringify({
          system: 'คุณคือ Twin ของผู้ใช้ ให้คำแนะนำแบบใกล้ชิด',
          messages: SHARED_DATA.twinMessages,
          temperature: 0.8,
          max_tokens: 500,
        });
        const res = await httpPost(ENDPOINTS.TWIN, payload, { headers: headers, timeout: 15000 });
        if (res.status !== 200 && res.status !== 429) {
          throw new Error('Expected 200/429, got ' + res.status);
        }
        if (res.status === 429) metrics.rateLimitedRequests++;
        if (res.status === 200) {
          const data = await res.json();
          if (!data.content) throw new Error('Expected content');
        }
        metrics.successfulRequests++;
      }
    },
    {
      name: 'POST /api/nova (chat)',
      test: async function() {
        const payload = JSON.stringify({
          system: 'คุณคือนิรา นำทางผู้ใช้ด้วยคำถามที่กระตุ้นความคิด',
          messages: SHARED_DATA.novaMessages,
          temperature: 0.7,
          max_tokens: 500,
        });
        const res = await httpPost(ENDPOINTS.NOVA, payload, { headers: headers, timeout: 15000 });
        if (res.status !== 200 && res.status !== 429) {
          throw new Error('Expected 200/429, got ' + res.status);
        }
        if (res.status === 429) metrics.rateLimitedRequests++;
        if (res.status === 200) {
          const data = await res.json();
          if (!data.content) throw new Error('Expected content');
        }
        metrics.successfulRequests++;
      }
    },
    {
      name: 'POST /api/autonomy-log',
      test: async function() {
        const res = await httpPost(ENDPOINTS.AUTONOMY_LOG, SHARED_DATA.autonomySignal, { headers: headers });
        if (res.status !== 200) throw new Error('Expected 200, got ' + res.status);
        metrics.successfulRequests++;
      }
    },
    {
      name: 'Unauthenticated request (should fail)',
      test: async function() {
        const res = await httpGet(ENDPOINTS.PROFILE);
        if (res.status !== 401) {
          throw new Error('Expected 401, got ' + res.status);
        }
        metrics.successfulRequests++; // Expected failure
      }
    },
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < iterations; i++) {
    console.log('\n--- Iteration ' + (i + 1) + '/' + iterations + ' ---');

    for (var j = 0; j < tests.length; j++) {
      var test = tests[j];
      try {
        await test.test();
        console.log('  ✓ ' + test.name);
        passed++;
      } catch (err) {
        console.log('  ✗ ' + test.name + ': ' + err.message);
        failed++;
        metrics.failedRequests++;
      }
    }

    // Small delay between iterations
    await new Promise(function(resolve) { setTimeout(resolve, 100); });
  }

  // ── Report ───────────────────────────────────────────────────────────────

  console.log('\n' + '='.repeat(60));
  console.log('SMOKE TEST RESULTS');
  console.log('='.repeat(60));
  console.log('Total iterations: ' + iterations);
  console.log('Total requests: ' + metrics.totalRequests);
  console.log('Successful: ' + metrics.successfulRequests);
  console.log('Failed: ' + metrics.failedRequests);
  console.log('Rate limited: ' + metrics.rateLimitedRequests);
  var errorPercent = metrics.totalRequests > 0
    ? ((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)
    : '0.00';
  console.log('Error rate: ' + errorPercent + '%');

  if (metrics.responseTimes.length > 0) {
    var avgDuration = metrics.responseTimes.reduce(function(sum, t) { return sum + t.duration; }, 0) / metrics.responseTimes.length;
    var maxDuration = Math.max.apply(null, metrics.responseTimes.map(function(t) { return t.duration; }));
    var sortedTimes = metrics.responseTimes.slice().sort(function(a, b) { return a.duration - b.duration; });
    var p95Index = Math.floor(metrics.responseTimes.length * 0.95);
    var p95Duration = sortedTimes[p95Index];

    console.log('\nResponse times:');
    console.log('  Average: ' + avgDuration.toFixed(2) + 'ms');
    console.log('  Max: ' + maxDuration.toFixed(2) + 'ms');
    console.log('  p95: ' + p95Duration.duration.toFixed(2) + 'ms');
  }

  console.log('\n' + '='.repeat(60));

  return {
    passed: passed,
    failed: failed,
    errorRate: metrics.failedRequests / metrics.totalRequests,
    avgDuration: avgDuration,
    maxDuration: maxDuration,
    p95Duration: p95Duration ? p95Duration.duration : null,
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

var iterations = parseInt(process.argv[2]) || 10;
var results = runSmokeTest(iterations).then(function(results) {
  process.exit(results.failed > 0 ? 1 : 0);
});

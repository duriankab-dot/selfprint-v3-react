import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://www.selfprint.one';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'loadtest@selfprint.one';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'LoadTest123!';

// Custom metrics
const apiResponseTime = new Trend('api_response_time');
const chatResponseTime = new Trend('chat_response_time');
const uploadTime = new Trend('upload_time');
const apiErrors = new Rate('api_errors');

export const options = {
  stages: [
    // Smoke Test: 5-10 minutes with 20-50 users
    {
      duration: '2m',
      target: 20,
      rampUp: '1m',
      name: 'Smoke Test Warm-up (0-20 users)',
    },
    {
      duration: '5m',
      target: 50,
      name: 'Smoke Test Peak (50 users)',
    },
    {
      duration: '3m',
      target: 50,
      name: 'Smoke Test Hold (50 users)',
    },

    // Ramp down smoke test
    {
      duration: '2m',
      target: 0,
      name: 'Smoke Test Cool-down',
    },

    // Actual Load Test: 39 minutes with 50->100 ramp
    {
      duration: '2m',
      target: 50,
      name: 'Load Test Start (50 users)',
    },
    {
      duration: '20m',
      target: 75,
      rampUp: '10m',
      name: 'Load Test Ramp (50-75 users over 20m)',
    },
    {
      duration: '10m',
      target: 100,
      rampUp: '5m',
      name: 'Load Test Peak Ramp (75-100 users over 10m)',
    },
    {
      duration: '5m',
      target: 100,
      name: 'Load Test Hold (100 users)',
    },

    // Cool-down
    {
      duration: '2m',
      target: 0,
      name: 'Load Test Cool-down',
    },
  ],
  thresholds: {
    'api_response_time': ['p(95)<300', 'p(99)<500'], // 95th percentile < 300ms
    'chat_response_time': ['p(95)<3000', 'p(99)<5000'], // 95th percentile < 3s
    'upload_time': ['p(95)<2000'], // 95th percentile < 2s
    'http_req_duration': ['p(95)<1000'], // General HTTP < 1s
    'http_req_failed': ['rate<0.05'], // Less than 5% failure rate
    'api_errors': ['rate<0.05'],
  },
  setupTimeout: '30s',
  teardownTimeout: '30s',
};

// Setup: Create test user session
export function setup() {
  console.log('🧪 Starting Load Test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Email: ${TEST_EMAIL}`);

  // Attempt login
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  const sessionToken = loginRes.cookies.sessionToken?.[0].value || '';

  return { sessionToken };
}

export default function (data) {
  const sessionToken = data.sessionToken || '';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionToken}`,
  };

  // Test 1: Home page load
  testHomePageLoad(headers);

  // Test 2: Twin chat message
  testTwinChat(headers);

  // Test 3: Decision logging
  testDecisionLogging(headers);

  // Test 4: API calls (SICE endpoints)
  testAPIEndpoints(headers);

  // Test 5: Image upload (simulated)
  testImageUpload(headers);

  // Random think time between requests
  sleep(__ENV.THINK_TIME ? parseInt(__ENV.THINK_TIME) : 2);
}

function testHomePageLoad(_headers) {
  const url = `${BASE_URL}/home`;

  const startTime = new Date().getTime();
  const res = http.get(url);
  const duration = new Date().getTime() - startTime;

  check(res, {
    'home page status 200': (_r) => _r.status === 200,
    'home page load < 1.5s': (_r) => duration < 1500,
  });

  if (res.status !== 200) {
    apiErrors.add(1);
  }
}

function testTwinChat(headers) {
  const url = `${BASE_URL}/api/twin`;
  const payload = {
    twinId: `test-twin-${__VU}`,
    message: `Load test message ${new Date().getTime()} from VU ${__VU}`,
  };

  const startTime = new Date().getTime();
  const res = http.post(url, JSON.stringify(payload), { headers });
  const duration = new Date().getTime() - startTime;

  chatResponseTime.add(duration);

  check(res, {
    'twin chat status 200': (r) => r.status === 200,
    'twin chat < 3s': (r) => duration < 3000,
  });

  if (res.status !== 200) {
    chatErrors.add(1);
  }
}

function testDecisionLogging(headers) {
  const url = `${BASE_URL}/api/decision`;
  const payload = {
    title: `Load test decision ${__VU}-${__ITER}`,
    world: 'career',
    decision: 'yes',
    context: 'Load testing scenario',
  };

  const startTime = new Date().getTime();
  const res = http.post(url, JSON.stringify(payload), { headers });
  const duration = new Date().getTime() - startTime;

  apiResponseTime.add(duration);

  check(res, {
    'decision save status 201/200': (r) => r.status === 201 || r.status === 200,
    'decision save < 200ms': (r) => duration < 200,
  });

  if (res.status > 299) {
    apiErrors.add(1);
  }
}

function testAPIEndpoints(headers) {
  const endpoints = [
    { method: 'GET', path: '/api/profile', name: 'Get Profile' },
    { method: 'GET', path: '/api/twin', name: 'Get Twin' },
    { method: 'GET', path: '/api/decisions', name: 'Get Decisions' },
  ];

  endpoints.forEach((endpoint) => {
    const url = `${BASE_URL}${endpoint.path}`;
    const startTime = new Date().getTime();

    const res =
      endpoint.method === 'GET'
        ? http.get(url, { headers })
        : http.post(url, '{}', { headers });

    const duration = new Date().getTime() - startTime;

    apiResponseTime.add(duration);

    check(res, {
      [`${endpoint.name} status 200`]: (r) => r.status === 200,
      [`${endpoint.name} < 300ms`]: (r) => duration < 300,
    });

    if (res.status !== 200) {
      apiErrors.add(1);
    }
  });
}

function testImageUpload(headers) {
  const url = `${BASE_URL}/api/upload`;

  // Simulate file upload
  const fileContent = 'fake-image-binary-data-' + __VU + '-' + __ITER;

  const startTime = new Date().getTime();
  const res = http.post(url, fileContent, {
    headers: {
      ...headers,
      'Content-Type': 'application/octet-stream',
    },
  });
  const duration = new Date().getTime() - startTime;

  uploadTime.add(duration);

  check(res, {
    'upload status 200/201': (r) => r.status === 200 || r.status === 201,
    'upload < 2s': (r) => duration < 2000,
  });

  if (res.status > 299) {
    apiErrors.add(1);
  }
}

export function teardown(data) {
  console.log('✅ Load test completed');
  console.log(`Session token used: ${data.sessionToken ? 'Yes' : 'No'}`);
}

export function handleSummary(data) {
  console.log('📊 Load Test Summary:');
  console.log(`Total VUs: ${__ENV.VUS || 100}`);
  console.log(`Total iterations: ${data.iterations || 'N/A'}`);

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'loadtest-report.json': JSON.stringify(data),
  };
}

// Simple text summary helper
function textSummary(data, options) {
  const indent = options?.indent || '';
  let summary = '\n' + indent + '=== Load Test Results ===\n';

  if (data.metrics) {
    Object.keys(data.metrics).forEach((metricName) => {
      const metric = data.metrics[metricName];
      if (metric.values) {
        summary += indent + `${metricName}: ${JSON.stringify(metric.values)}\n`;
      }
    });
  }

  return summary;
}

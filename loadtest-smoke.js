import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://www.selfprint.one';

const apiResponseTime = new Trend('api_response_time');
const apiErrors = new Rate('api_errors');

export const options = {
  stages: [
    {
      duration: '1m',
      target: 20,
      name: 'Ramp to 20 users',
    },
    {
      duration: '8m',
      target: 50,
      rampUp: '4m',
      name: 'Smoke test at 20-50 users',
    },
    {
      duration: '1m',
      target: 0,
      name: 'Ramp down',
    },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function () {
  // Test home page
  const homeRes = http.get(BASE_URL);
  check(homeRes, {
    'home status 200': (r) => r.status === 200,
    'home < 1.5s': (r) => r.timings.duration < 1500,
  });

  sleep(1);

  // Test API endpoint
  const apiRes = http.get(`${BASE_URL}/api/health`);
  apiResponseTime.add(apiRes.timings.duration);

  check(apiRes, {
    'api status 200': (r) => r.status === 200,
    'api < 300ms': (r) => r.timings.duration < 300,
  });

  if (apiRes.status !== 200) {
    apiErrors.add(1);
  }

  sleep(2);
}

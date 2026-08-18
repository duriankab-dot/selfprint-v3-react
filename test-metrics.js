/**
 * Performance Baseline Test
 * Tests /api/metrics endpoint in production
 */

const https = require('https');

function testMetrics() {
  const data = JSON.stringify({
    metrics: { total: 10, cls: 0.05, lcp: 2500, fid: 150 },
    webVitals: { CLS: 0.05, LCP: 2500, FID: 150 },
    timestamp: new Date().toISOString(),
  });

  const options = {
    hostname: 'www.selfprint.one',
    port: 443,
    path: '/api/metrics',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📊 Response:`, JSON.parse(body));
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
}

testMetrics();

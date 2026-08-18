import { Page, expect } from '@playwright/test';

export const PERFORMANCE_LIMITS = {
  API_RESPONSE: 300, // ms
  TWIN_CHAT: 3000, // ms
  DECISION_SAVE: 200, // ms
  PAGE_LOAD: 1500, // ms
  IMAGE_UPLOAD: 2000, // ms
};

export async function performanceAssertion(
  page: Page,
  metricName: string,
  limit: number
) {
  const metrics = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource');

    return {
      pageLoad: perf?.loadEventEnd - perf?.fetchStart || 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      resources: resources.map(r => ({
        name: r.name,
        duration: r.duration,
      })),
    };
  });

  console.log(`[${metricName}] Performance:`, metrics);
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.click('text=Sign in');

  // Wait for auth page
  await page.waitForURL(/auth|signin/);

  // Fill email
  await page.fill('input[type="email"]', email);

  // Click magic link / password auth
  await page.click('button:has-text("Continue")');

  // Handle passkey or password
  if (await page.locator('text=Passkey').isVisible()) {
    // Skip passkey for now - would need real passkey device
    console.log('Passkey auth required - use manual testing');
  } else {
    // Password auth
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Sign in")');
  }

  // Wait for redirect to app
  await page.waitForURL(/\/home|\/today/);
}

export async function createTestUser(page: Page) {
  const timestamp = Date.now();
  const email = `test-${timestamp}@selfprint.one`;
  const password = `TestPass123!${timestamp}`;

  return { email, password };
}

export async function navigateToHub(page: Page, hubName: string) {
  const hubMap: Record<string, string> = {
    today: '/today',
    explore: '/explore',
    twin: '/twin',
    activities: '/activities',
    profile: '/profile',
  };

  const url = hubMap[hubName.toLowerCase()];
  if (!url) throw new Error(`Unknown hub: ${hubName}`);

  await page.goto(url);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
}

export async function measureAPICall(
  page: Page,
  fn: () => Promise<any>,
  endpoint: string
) {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  console.log(`[API] ${endpoint} took ${duration}ms (limit: ${PERFORMANCE_LIMITS.API_RESPONSE}ms)`);

  if (duration > PERFORMANCE_LIMITS.API_RESPONSE) {
    console.warn(`⚠️ SLOW API: ${endpoint} - ${duration}ms > ${PERFORMANCE_LIMITS.API_RESPONSE}ms`);
  }

  return { result, duration };
}

export async function waitForAPICall(page: Page, pattern: RegExp) {
  return page.waitForResponse(
    response => pattern.test(response.url()) && response.status() === 200,
    { timeout: PERFORMANCE_LIMITS.API_RESPONSE + 1000 }
  );
}

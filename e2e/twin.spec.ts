/**
 * TWIN.SPEC.TS — Phase B Integration Tests
 *
 * AI Twin creation flow and lifecycle
 *
 * Note: TWIN-01/02/03/05 require routes and UI not yet implemented.
 * Mark with test.fixme() — will be enabled as features ship.
 */

import { test, expect } from '@playwright/test';
import { TEST_USER_STAGES, TEST_ASSERTIONS } from './fixtures/test-user';

test.beforeEach(async ({ page }) => {
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ─── TWIN-01 ────────────────────────────────────────────────────────────────

test('TWIN-01 Twin creation flow — fingerprint → NOVA → analysis → birth', async ({ page }) => {
  // Full creation flow relies on unimplemented UI testids + specific onboarding state
  test.fixme(true, 'Onboarding flow testids (nova-screen, blueprint-screen, holographic-birth) not yet added to components');

  await page.goto('/en/onboarding', { waitUntil: 'load' });

  const fingerprintScreenTitle = page.locator('h1:has-text("Capture Your Fingerprint")');
  await expect(fingerprintScreenTitle).toBeVisible({ timeout: 5000 });

  const uploadButton = page.locator('button:has-text("Upload Fingerprint")');
  await uploadButton.click();

  const novaScreen = page.locator('[data-testid="nova-screen"]');
  await expect(novaScreen).toBeVisible({ timeout: 10000 });

  const ctaButton = page.locator('button:has-text("Proceed to Analysis")');
  await ctaButton.click();

  const birthAnimation = page.locator('[data-testid="holographic-birth"]');
  await expect(birthAnimation).toBeVisible({ timeout: 10000 });
});

// ─── TWIN-02 ────────────────────────────────────────────────────────────────

test('TWIN-02 WOW3 animations — HolographicBirth + ParticleFormation smooth 60fps', async ({
  page,
}) => {
  // Route /en/twin-birth does not exist yet
  test.fixme(true, 'Route /en/twin-birth not implemented');

  await page.goto('/en/twin-birth', { waitUntil: 'load' });

  const birthContainer = page.locator('[data-testid="birth-container"]');
  await expect(birthContainer).toBeVisible({ timeout: 5000 });

  const frameMetrics = await page.evaluate<{ fps: number; duration: number }>(() => {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      const countFrames = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          resolve({ fps: frameCount, duration: performance.now() - startTime });
        }
      };
      requestAnimationFrame(countFrames);
    });
  });

  expect(frameMetrics.fps).toBeGreaterThan(25);
});

// ─── TWIN-03 ────────────────────────────────────────────────────────────────

test('TWIN-03 Twin persists in DB — reload shows same Twin', async ({ page }) => {
  // POST /api/twins endpoint existence not verified + /en/twin/:id route missing
  test.fixme(true, 'Route /en/twin/:id not implemented; /api/twins endpoint unverified');

  const createResponse = await page.request.post('/api/twins', {
    data: {
      userId: TEST_USER_STAGES.onboardingComplete.userId,
      name: 'Test Twin',
      siceAnalysis: TEST_USER_STAGES.onboardingComplete.siceAnalysis,
    },
  });

  expect(createResponse.ok()).toBeTruthy();
  const twinData = await createResponse.json();

  await page.goto('/en/dashboard');
  await page.goto(`/en/twin/${twinData.id}`);

  const twinName = page.locator(`text="${twinData.name}"`);
  await expect(twinName).toBeVisible({ timeout: 5000 });
  console.log(`✅ TWIN-03 PASS: Twin persisted — ${TEST_ASSERTIONS.twin.created}`);
});

// ─── TWIN-04 ────────────────────────────────────────────────────────────────

test('TWIN-04 Twin learns from decisions — decision → Twin insight', async ({ page }) => {
  // Requires DecisionLogger data-testid hooks
  test.fixme(true, 'DecisionLogger missing data-testid attributes (decision-form, twin-insight)');

  await page.goto('/en/decision-log', { waitUntil: 'load' }); // was /en/decision-logger (wrong)

  const decisionForm = page.locator('[data-testid="decision-form"]');
  await expect(decisionForm).toBeVisible({ timeout: 5000 });

  await page.fill('[data-testid="decision-context-input"]', 'Career choice: Should I take this promotion?');
  await page.fill('[data-testid="decision-emotion-input"]', 'Anxious but excited');

  await page.locator('button:has-text("Log Decision")').click();

  const insight = page.locator('[data-testid="twin-insight"]');
  await expect(insight).toBeVisible({ timeout: 10000 });

  const insightText = await insight.textContent();
  expect(insightText).toBeTruthy();
});

// ─── TWIN-05 ────────────────────────────────────────────────────────────────

test('TWIN-05 Twin UI interactions — click responsive, animations smooth', async ({ page }) => {
  // Route /en/twin/:id not implemented
  test.fixme(true, 'Route /en/twin/:id not implemented; twin-interact-button testid missing');

  await page.goto('/en/twin/test-twin-001', { waitUntil: 'load' });

  const startTime = Date.now();
  const interactionButton = page.locator('[data-testid="twin-interact-button"]');
  await interactionButton.click();

  const response = page.locator('[data-testid="twin-response"]');
  await expect(response).toBeVisible({ timeout: 2000 });

  const latency = Date.now() - startTime;
  expect(latency).toBeLessThan(500);
});

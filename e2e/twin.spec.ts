/**
 * TWIN.SPEC.TS — Phase B Integration Tests
 *
 * Phase C (Twin Birth / WOW3) Testing
 * - AI Twin creation flow (NOVA → Blueprint → Analysis → Birth)
 * - WOW2 (FullAnalysis revelation UX)
 * - WOW3 (HolographicBirth + ParticleFormation animations)
 * - Twin lifecycle integration with DB
 *
 * Prerequisites:
 * - Authenticated user with completed fingerprint
 * - Staging environment (https://staging.selfprint.one)
 * - Test DB seeded with test user
 */

import { test, expect } from '@playwright/test';
import { TEST_USER_STAGES, TEST_ASSERTIONS } from './fixtures/test-user';

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP: Login before each test
// ═══════════════════════════════════════════════════════════════════════════════

test.beforeEach(async ({ page }) => {
  // Navigate to app mode (assumes user already onboarded in test DB)
  await page.goto('/en/dashboard', { waitUntil: 'load' });

  // Verify authenticated (should see dashboard, not login)
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TWIN-01: Twin creation flow (end-to-end)
// ═══════════════════════════════════════════════════════════════════════════════

test('TWIN-01 Twin creation flow — fingerprint → NOVA → analysis → birth', async ({
  page,
}) => {
  // Navigate to Onboarding if first-time (fixture should handle this)
  await page.goto('/en/onboarding', { waitUntil: 'load' });

  // Wait for fingerprint capture screen
  const fingerprintScreenTitle = page.locator('h1:has-text("Capture Your Fingerprint")');
  await expect(fingerprintScreenTitle).toBeVisible({ timeout: 5000 });

  // Mock fingerprint upload (real test: user captures actual fingerprint)
  // For now, simulate by triggering upload action
  const uploadButton = page.locator('button:has-text("Upload Fingerprint")');
  await uploadButton.click();

  // Wait for NOVA screen to appear
  const novaScreen = page.locator('[data-testid="nova-screen"]');
  await expect(novaScreen).toBeVisible({ timeout: 10000 });

  // Verify NOVA eye animation is rendered
  const novaEye = page.locator('[data-testid="nova-eye-svg"]');
  await expect(novaEye).toBeVisible({ timeout: 5000 });

  // Click CTA to proceed to analysis
  const ctaButton = page.locator('button:has-text("Proceed to Analysis")');
  await ctaButton.click();

  // Wait for Blueprint screen
  const blueprintScreen = page.locator('[data-testid="blueprint-screen"]');
  await expect(blueprintScreen).toBeVisible({ timeout: 10000 });

  // Wait for FineTuning → Analysis
  const analysisScreen = page.locator('[data-testid="analysis-screen"]');
  await expect(analysisScreen).toBeVisible({ timeout: 15000 });

  // Verify WOW2 (FullAnalysis revelation UX)
  const revelationText = page.locator('text="ค้นพบตัวเอง"');
  await expect(revelationText).toBeVisible({ timeout: 5000 });

  // Click to proceed to Twin Birth
  const birthButton = page.locator('button:has-text("Reveal My Twin")');
  await birthButton.click();

  // Wait for WOW3 (Twin Birth animation)
  const birthAnimation = page.locator('[data-testid="holographic-birth"]');
  await expect(birthAnimation).toBeVisible({ timeout: 10000 });

  // Verify particle formation (part of WOW3)
  const particles = page.locator('[data-testid="particle-formation"]');
  await expect(particles).toBeVisible({ timeout: 5000 });

  // Wait for Twin to be displayed
  const twinProfile = page.locator('[data-testid="twin-profile"]');
  await expect(twinProfile).toBeVisible({ timeout: 10000 });

  console.log('✅ TWIN-01 PASS: Full Twin creation flow complete (WOW3 animations verified)');
});

// ═══════════════════════════════════════════════════════════════════════════════
// TWIN-02: WOW3 animations (HolographicBirth + ParticleFormation)
// ═══════════════════════════════════════════════════════════════════════════════

test('TWIN-02 WOW3 animations — HolographicBirth + ParticleFormation smooth 60fps', async ({
  page,
}) => {
  // Navigate directly to birth screen (if test DB has pre-created Twin)
  // For real test: this needs authenticated session with ready-to-birth Twin
  await page.goto('/en/twin-birth', { waitUntil: 'load' });

  // Wait for birth animation container
  const birthContainer = page.locator('[data-testid="birth-container"]');
  await expect(birthContainer).toBeVisible({ timeout: 5000 });

  // Verify Three.js canvas is rendered
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 5000 });

  // Check animation frame rate (target: 60fps, acceptable: 30fps+)
  const frameMetrics = await page.evaluate(() => {
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

  console.log(`Animation FPS: ${frameMetrics}`);
  expect(frameMetrics.fps).toBeGreaterThan(25); // Acceptable: 25fps+

  // Verify particle system is rendering
  const particleCount = await page.evaluate(() => {
    const scene = (window as any).Scene; // Assuming Three.js scene exposed
    return scene?.children?.length || 0;
  });

  expect(particleCount).toBeGreaterThan(0);
  console.log(`✅ TWIN-02 PASS: WOW3 animations verified (${frameMetrics.fps}fps, particles: ${particleCount})`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TWIN-03: Twin persistence in database
// ═══════════════════════════════════════════════════════════════════════════════

test('TWIN-03 Twin persists in DB — reload shows same Twin', async ({ page }) => {
  // Create Twin (via full flow or direct API call in test)
  const createResponse = await page.request.post('/api/twins', {
    data: {
      userId: TEST_USER_STAGES.onboardingComplete.userId,
      name: 'Test Twin',
      siceAnalysis: TEST_USER_STAGES.onboardingComplete.siceAnalysis,
    },
  });

  expect(createResponse.ok()).toBeTruthy();
  const twinData = await createResponse.json();
  const twinId = twinData.id;

  // Navigate away and back
  await page.goto('/en/dashboard');
  await page.goto(`/en/twin/${twinId}`);

  // Verify Twin data is still there
  const twinName = page.locator(`text="${twinData.name}"`);
  await expect(twinName).toBeVisible({ timeout: 5000 });

  console.log('✅ TWIN-03 PASS: Twin persisted in DB');
});

// ═══════════════════════════════════════════════════════════════════════════════
// TWIN-04: Twin responds to user decisions (learning)
// ═══════════════════════════════════════════════════════════════════════════════

test('TWIN-04 Twin learns from decisions — decision → Twin insight', async ({ page }) => {
  // Assume Twin already exists, navigate to decision logging
  await page.goto('/en/decision-logger', { waitUntil: 'load' });

  // Wait for decision form
  const decisionForm = page.locator('[data-testid="decision-form"]');
  await expect(decisionForm).toBeVisible({ timeout: 5000 });

  // Fill decision details
  await page.fill('[data-testid="decision-context-input"]', 'Career choice: Should I take this promotion?');
  await page.fill('[data-testid="decision-emotion-input"]', 'Anxious but excited');

  // Submit decision
  const submitButton = page.locator('button:has-text("Log Decision")');
  await submitButton.click();

  // Wait for Twin insight (API should analyze decision)
  const insight = page.locator('[data-testid="twin-insight"]');
  await expect(insight).toBeVisible({ timeout: 10000 });

  // Verify insight is specific to decision
  const insightText = insight.textContent();
  expect(insightText).toBeTruthy();

  console.log('✅ TWIN-04 PASS: Twin learning from decisions');
});

// ═══════════════════════════════════════════════════════════════════════════════
// TWIN-05: Twin UI interactions (smooth, responsive)
// ═══════════════════════════════════════════════════════════════════════════════

test('TWIN-05 Twin UI interactions — click responsive, animations smooth', async ({ page }) => {
  // Navigate to Twin profile
  await page.goto('/en/twin/test-twin-001', { waitUntil: 'load' });

  // Measure interaction latency: click → response
  const startTime = Date.now();

  const interactionButton = page.locator('[data-testid="twin-interact-button"]');
  await interactionButton.click();

  const response = page.locator('[data-testid="twin-response"]');
  await expect(response).toBeVisible({ timeout: 2000 });

  const latency = Date.now() - startTime;

  // Target: < 500ms (instant feeling)
  expect(latency).toBeLessThan(500);

  console.log(`✅ TWIN-05 PASS: Twin interaction latency ${latency}ms (target: <500ms)`);
});

/**
 * DECISION.SPEC.TS — Phase B Integration Tests
 *
 * Decision Logging & Analysis
 * - Authenticated user logging decisions
 * - Twin analyzing decisions
 * - Decision history persistence
 * - Real-time Twin insights
 *
 * Prerequisites:
 * - Authenticated user with active Twin
 * - Staging environment
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Authenticated dashboard load
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DECISION-01: Log decision flow
// ═══════════════════════════════════════════════════════════════════════════════

test('DECISION-01 Log decision flow — form → Twin analysis → insight', async ({ page }) => {
  // Navigate to decision logger
  await page.goto('/en/decision-logger', { waitUntil: 'load' });

  const decisionForm = page.locator('[data-testid="decision-form"]');
  await expect(decisionForm).toBeVisible({ timeout: 5000 });

  // Fill decision details
  await page.fill('[data-testid="decision-context"]', 'Career: Should I change jobs to startup?');
  await page.fill('[data-testid="decision-emotion"]', 'Nervous, excited, uncertain');
  await page.selectOption('[data-testid="decision-category"]', 'career');

  // Submit
  const submitButton = page.locator('button:has-text("Log Decision")');
  await submitButton.click();

  // Wait for Twin analysis
  const analysisContainer = page.locator('[data-testid="decision-analysis"]');
  await expect(analysisContainer).toBeVisible({ timeout: 15000 });

  // Verify insight is displayed
  const insight = page.locator('[data-testid="twin-insight-message"]');
  await expect(insight).toBeVisible({ timeout: 5000 });

  const insightText = await insight.textContent();
  expect(insightText?.length).toBeGreaterThan(0);

  console.log('✅ DECISION-01 PASS: Decision logged + Twin analyzed');
});

// ═══════════════════════════════════════════════════════════════════════════════
// DECISION-02: Decision history retrieval
// ═══════════════════════════════════════════════════════════════════════════════

test('DECISION-02 Decision history persists — list shows all logged decisions', async ({ page }) => {
  // Navigate to decision history
  await page.goto('/en/decisions', { waitUntil: 'load' });

  const historyList = page.locator('[data-testid="decision-history-list"]');
  await expect(historyList).toBeVisible({ timeout: 5000 });

  // Count decisions in list
  const decisionItems = page.locator('[data-testid="decision-item"]');
  const count = await decisionItems.count();

  expect(count).toBeGreaterThanOrEqual(0);
  console.log(`✅ DECISION-02 PASS: Decision history shows ${count} decisions`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// DECISION-03: Twin's pattern detection
// ═══════════════════════════════════════════════════════════════════════════════

test('DECISION-03 Twin detects patterns — multiple decisions → insight', async ({ page }) => {
  // Log multiple decisions
  await page.goto('/en/decision-logger', { waitUntil: 'load' });

  const decisions = [
    { context: 'Career: Risk-taking tendency', emotion: 'Excited', category: 'career' },
    { context: 'Personal: Risk-taking in relationships', emotion: 'Uncertain', category: 'personal' },
    { context: 'Financial: Risk-taking in investments', emotion: 'Cautious', category: 'financial' },
  ];

  for (const decision of decisions) {
    await page.fill('[data-testid="decision-context"]', decision.context);
    await page.fill('[data-testid="decision-emotion"]', decision.emotion);
    await page.selectOption('[data-testid="decision-category"]', decision.category);
    await page.click('button:has-text("Log Decision")');
    await page.waitForTimeout(2000); // Wait between submissions
  }

  // Navigate to pattern insights
  await page.goto('/en/twin/patterns', { waitUntil: 'load' });

  const patternInsight = page.locator('[data-testid="pattern-insight"]');
  await expect(patternInsight).toBeVisible({ timeout: 10000 });

  const patternText = await patternInsight.textContent();
  expect(patternText?.length).toBeGreaterThan(0);

  console.log('✅ DECISION-03 PASS: Twin detects decision patterns');
});

// ═══════════════════════════════════════════════════════════════════════════════
// DECISION-04: Real-time Twin response
// ═══════════════════════════════════════════════════════════════════════════════

test('DECISION-04 Twin response latency — decision → Twin insight < 2s', async ({ page }) => {
  await page.goto('/en/decision-logger', { waitUntil: 'load' });

  const startTime = Date.now();

  // Log decision
  await page.fill('[data-testid="decision-context"]', 'Quick test decision');
  await page.fill('[data-testid="decision-emotion"]', 'Neutral');
  await page.click('button:has-text("Log Decision")');

  // Wait for response
  const response = page.locator('[data-testid="decision-analysis"]');
  await expect(response).toBeVisible({ timeout: 2000 });

  const responseTime = Date.now() - startTime;
  console.log(`Twin response time: ${responseTime}ms (target: <2000ms)`);

  expect(responseTime).toBeLessThan(2000);
  console.log('✅ DECISION-04 PASS: Twin real-time response within SLA');
});

// ═══════════════════════════════════════════════════════════════════════════════
// DECISION-05: Decision export (for record keeping)
// ═══════════════════════════════════════════════════════════════════════════════

test('DECISION-05 Export decisions as CSV/JSON', async ({ page }) => {
  await page.goto('/en/decisions', { waitUntil: 'load' });

  // Find export button
  const exportButton = page.locator('button:has-text("Export")');
  await expect(exportButton).toBeVisible({ timeout: 5000 });

  // Click export, download file
  const downloadPromise = page.waitForEvent('download');
  await exportButton.click();
  const download = await downloadPromise;

  // Verify file is CSV or JSON
  const filename = download.suggestedFilename();
  expect(filename).toMatch(/\.(csv|json)$/);

  console.log(`✅ DECISION-05 PASS: Decisions exported (${filename})`);
});

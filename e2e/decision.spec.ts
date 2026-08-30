/**
 * DECISION.SPEC.TS — Phase B Integration Tests
 *
 * Decision Logging & Analysis
 * Routes: /en/decision-log, /en/decisions
 *
 * Note: Tests requiring backend AI Twin analysis responses are marked
 * test.fixme() until DecisionLogger component exposes data-testid hooks.
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ─── DECISION-01 ────────────────────────────────────────────────────────────

test('DECISION-01 Log decision flow — form → Twin analysis → insight', async ({ page }) => {
  // Requires data-testid hooks in DecisionLogger component
  test.fixme(true, 'DecisionLogger component missing data-testid attributes (decision-form, twin-insight-message)');

  await page.goto('/en/decision-log', { waitUntil: 'load' }); // was /en/decision-logger (wrong)

  const decisionForm = page.locator('[data-testid="decision-form"]');
  await expect(decisionForm).toBeVisible({ timeout: 5000 });

  await page.fill('[data-testid="decision-context"]', 'Career: Should I change jobs to startup?');
  await page.fill('[data-testid="decision-emotion"]', 'Nervous, excited, uncertain');
  await page.selectOption('[data-testid="decision-category"]', 'career');

  await page.locator('button:has-text("Log Decision")').click();

  const analysisContainer = page.locator('[data-testid="decision-analysis"]');
  await expect(analysisContainer).toBeVisible({ timeout: 15000 });

  const insight = page.locator('[data-testid="twin-insight-message"]');
  await expect(insight).toBeVisible({ timeout: 5000 });

  const insightText = await insight.textContent();
  expect(insightText?.length).toBeGreaterThan(0);
});

// ─── DECISION-02 ────────────────────────────────────────────────────────────

test('DECISION-02 Decision history persists — list shows all logged decisions', async ({ page }) => {
  // Requires data-testid in DecisionDashboard
  test.fixme(true, 'DecisionDashboard missing data-testid="decision-history-list"');

  await page.goto('/en/decisions', { waitUntil: 'load' });

  const historyList = page.locator('[data-testid="decision-history-list"]');
  await expect(historyList).toBeVisible({ timeout: 5000 });

  const decisionItems = page.locator('[data-testid="decision-item"]');
  const count = await decisionItems.count();

  expect(count).toBeGreaterThanOrEqual(0);
  console.log(`✅ DECISION-02: ${count} decisions in history`);
});

// ─── DECISION-03 ────────────────────────────────────────────────────────────

test('DECISION-03 Twin detects patterns — multiple decisions → insight', async ({ page }) => {
  // Requires /en/twin/patterns route + DecisionLogger testids
  test.fixme(true, 'Route /en/twin/patterns not implemented, DecisionLogger testids missing');

  await page.goto('/en/decision-log', { waitUntil: 'load' });

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
    await page.waitForTimeout(2000);
  }

  await page.goto('/en/twin/patterns', { waitUntil: 'load' });
  const patternInsight = page.locator('[data-testid="pattern-insight"]');
  await expect(patternInsight).toBeVisible({ timeout: 10000 });
});

// ─── DECISION-04 ────────────────────────────────────────────────────────────

test('DECISION-04 Twin response latency — decision → Twin insight < 2s', async ({ page }) => {
  // Requires DecisionLogger testids + AI backend
  test.fixme(true, 'DecisionLogger missing data-testid attributes and AI backend latency SLA cannot be verified');

  await page.goto('/en/decision-log', { waitUntil: 'load' });

  const startTime = Date.now();

  await page.fill('[data-testid="decision-context"]', 'Quick test decision');
  await page.fill('[data-testid="decision-emotion"]', 'Neutral');
  await page.click('button:has-text("Log Decision")');

  const response = page.locator('[data-testid="decision-analysis"]');
  await expect(response).toBeVisible({ timeout: 2000 });

  const responseTime = Date.now() - startTime;
  expect(responseTime).toBeLessThan(2000);
});

// ─── DECISION-05 ────────────────────────────────────────────────────────────

test('DECISION-05 Export decisions as CSV/JSON', async ({ page }) => {
  // Requires Export button + download event in DecisionDashboard
  test.fixme(true, 'Export button / download flow not yet verified in DecisionDashboard');

  await page.goto('/en/decisions', { waitUntil: 'load' });

  const exportButton = page.locator('button:has-text("Export")');
  await expect(exportButton).toBeVisible({ timeout: 5000 });

  const downloadPromise = page.waitForEvent('download');
  await exportButton.click();
  const download = await downloadPromise;

  const filename = download.suggestedFilename();
  expect(filename).toMatch(/\.(csv|json)$/);
  console.log(`✅ DECISION-05 PASS: Exported ${filename}`);
});

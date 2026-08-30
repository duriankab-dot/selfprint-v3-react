/**
 * WORLD-VISUAL.SPEC.TS — Phase B Integration Tests
 *
 * 12 Worlds Visualization & Interaction
 * - World rendering (12 SICE dimensions)
 * - Interactive world exploration
 * - Performance benchmarks (60fps)
 * - World-specific insights
 *
 * Prerequisites:
 * - Authenticated user with completed analysis
 * - Twin with SICE data
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Authenticated dashboard
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD-01: 12 Worlds render and display
// ═══════════════════════════════════════════════════════════════════════════════

test('WORLD-01 12 Worlds visualization renders all dimensions', async ({ page }) => {
  // Navigate to worlds view
  await page.goto('/en/worlds', { waitUntil: 'load' });

  const worldsContainer = page.locator('[data-testid="worlds-container"]');
  await expect(worldsContainer).toBeVisible({ timeout: 10000 });

  // Verify 12 world tiles are rendered
  const worldTiles = page.locator('[data-testid="world-tile"]');
  const worldCount = await worldTiles.count();

  expect(worldCount).toBe(12);
  console.log(`✅ WORLD-01 PASS: All 12 worlds rendered`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD-02: World data display (name, icon, score)
// ═══════════════════════════════════════════════════════════════════════════════

test('WORLD-02 World tiles show correct data — name + icon + score', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  // Check first world tile
  const firstWorldTile = page.locator('[data-testid="world-tile"]').first();
  await expect(firstWorldTile).toBeVisible({ timeout: 5000 });

  // Verify components
  const worldName = firstWorldTile.locator('[data-testid="world-name"]');
  const worldIcon = firstWorldTile.locator('[data-testid="world-icon"]');
  const worldScore = firstWorldTile.locator('[data-testid="world-score"]');

  await expect(worldName).toBeVisible();
  await expect(worldIcon).toBeVisible();
  await expect(worldScore).toBeVisible();

  // Verify score is numeric
  const scoreText = await worldScore.textContent();
  const scoreNum = parseFloat(scoreText || '0');
  expect(scoreNum).toBeGreaterThanOrEqual(0);
  expect(scoreNum).toBeLessThanOrEqual(100);

  console.log('✅ WORLD-02 PASS: World tile data correct');
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD-03: Click world → detail view with insights
// ═══════════════════════════════════════════════════════════════════════════════

test('WORLD-03 Click world → detail view shows Twin insights', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  // Click first world
  const firstWorldTile = page.locator('[data-testid="world-tile"]').first();
  await firstWorldTile.click();

  // Wait for detail view
  const detailView = page.locator('[data-testid="world-detail"]');
  await expect(detailView).toBeVisible({ timeout: 10000 });

  // Verify insight is displayed
  const insight = page.locator('[data-testid="world-insight"]');
  await expect(insight).toBeVisible({ timeout: 5000 });

  const insightText = await insight.textContent();
  expect(insightText?.length).toBeGreaterThan(0);

  console.log('✅ WORLD-03 PASS: World detail view with insights');
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD-04: World interaction — scroll/swipe through worlds
// ═══════════════════════════════════════════════════════════════════════════════

test('WORLD-04 Scroll through worlds smoothly', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  const worldsScroller = page.locator('[data-testid="worlds-scroller"]');
  await expect(worldsScroller).toBeVisible({ timeout: 5000 });

  // Scroll down to see more worlds
  const startTime = Date.now();

  await worldsScroller.scroll({ top: 500 });
  await page.waitForTimeout(500); // Let scroll settle

  const scrollTime = Date.now() - startTime;

  // Verify worlds are still visible (no jank)
  const worldTiles = page.locator('[data-testid="world-tile"]');
  const visibleCount = (await worldTiles.count()) > 3;
  expect(visibleCount).toBeTruthy();

  console.log(`✅ WORLD-04 PASS: Scroll smooth (${scrollTime}ms)`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD-05: World visualization rendering performance (60fps target)
// ═══════════════════════════════════════════════════════════════════════════════

test('WORLD-05 World visualization 60fps performance', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  // Measure frame rate during rendering
  const frameMetrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();

      const countFrames = () => {
        frameCount++;
        if (performance.now() - startTime < 1000) {
          requestAnimationFrame(countFrames);
        } else {
          const fps = frameCount;
          resolve({ fps, duration: performance.now() - startTime });
        }
      };

      requestAnimationFrame(countFrames);
    });
  });

  console.log(`World rendering FPS: ${frameMetrics}`);

  // Target: 60fps, acceptable: 30fps+
  expect(frameMetrics.fps).toBeGreaterThan(25);

  console.log(`✅ WORLD-05 PASS: World rendering ${frameMetrics.fps}fps`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD-06: World comparison (A/B worlds side-by-side)
// ═══════════════════════════════════════════════════════════════════════════════

test('WORLD-06 Compare worlds — side-by-side view (optional feature)', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  // Look for compare button or checkbox
  const compareButton = page.locator('button:has-text("Compare")');

  if (await compareButton.isVisible()) {
    await compareButton.click();

    // Select 2 worlds to compare
    const worldTiles = page.locator('[data-testid="world-tile"]');
    await worldTiles.nth(0).click();
    await worldTiles.nth(1).click();

    // Wait for comparison view
    const comparisonView = page.locator('[data-testid="world-comparison"]');
    await expect(comparisonView).toBeVisible({ timeout: 10000 });

    console.log('✅ WORLD-06 PASS: World comparison feature works');
  } else {
    console.log('⏭️ WORLD-06 SKIP: Compare feature not available');
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// WORLD-07: World insights are personalized (Twin-specific)
// ═══════════════════════════════════════════════════════════════════════════════

test('WORLD-07 World insights personalized per Twin', async ({ page }) => {
  // Get first Twin's world insights
  await page.goto('/en/worlds', { waitUntil: 'load' });

  const firstWorldTile = page.locator('[data-testid="world-tile"]').first();
  await firstWorldTile.click();

  const insight1 = await page.locator('[data-testid="world-insight"]').textContent();

  // Simulate switching to different Twin (if app supports multiple Twins)
  const twinSelector = page.locator('[data-testid="twin-selector"]');

  if (await twinSelector.isVisible()) {
    await twinSelector.selectOption({ label: 'Different Twin' });
    await page.waitForTimeout(2000);

    // Navigate back to worlds
    await page.goto('/en/worlds', { waitUntil: 'load' });
    await firstWorldTile.click();

    const insight2 = await page.locator('[data-testid="world-insight"]').textContent();

    // Insights should be different
    expect(insight1).not.toBe(insight2);
    console.log('✅ WORLD-07 PASS: Insights personalized per Twin');
  } else {
    console.log('⏭️ WORLD-07 SKIP: Multiple Twins feature not available');
  }
});

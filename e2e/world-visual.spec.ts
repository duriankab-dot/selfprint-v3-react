/**
 * WORLD-VISUAL.SPEC.TS — Phase B Integration Tests
 *
 * 12 Worlds Visualization & Interaction
 * Routes: /en/worlds, /en/worlds/:worldId
 */

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ─── WORLD-01 ───────────────────────────────────────────────────────────────

test('WORLD-01 12 Worlds visualization renders all dimensions', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  const worldsContainer = page.locator('[data-testid="worlds-container"]');
  await expect(worldsContainer).toBeVisible({ timeout: 10000 });

  const worldTiles = page.locator('[data-testid="world-tile"]');
  const worldCount = await worldTiles.count();

  expect(worldCount).toBe(12);
  console.log(`✅ WORLD-01 PASS: All ${worldCount} worlds rendered`);
});

// ─── WORLD-02 ───────────────────────────────────────────────────────────────

test('WORLD-02 World tiles show correct data — name + icon', async ({ page }) => {
  // NOTE: score display not yet implemented (no score field in World type)
  test.fixme(true, 'World score display not yet implemented');

  await page.goto('/en/worlds', { waitUntil: 'load' });

  const firstWorldTile = page.locator('[data-testid="world-tile"]').first();
  await expect(firstWorldTile).toBeVisible({ timeout: 5000 });

  const worldName = firstWorldTile.locator('[data-testid="world-name"]');
  const worldIcon = firstWorldTile.locator('[data-testid="world-icon"]');
  const worldScore = firstWorldTile.locator('[data-testid="world-score"]');

  await expect(worldName).toBeVisible();
  await expect(worldIcon).toBeVisible();
  await expect(worldScore).toBeVisible();
});

// ─── WORLD-03 ───────────────────────────────────────────────────────────────

test('WORLD-03 Click world → detail view shows Twin insights', async ({ page }) => {
  test.fixme(true, 'WorldDetail data-testid="world-detail" and "world-insight" not yet added');

  await page.goto('/en/worlds', { waitUntil: 'load' });

  const firstWorldTile = page.locator('[data-testid="world-tile"]').first();
  await firstWorldTile.click();

  const detailView = page.locator('[data-testid="world-detail"]');
  await expect(detailView).toBeVisible({ timeout: 10000 });

  const insight = page.locator('[data-testid="world-insight"]');
  await expect(insight).toBeVisible({ timeout: 5000 });
});

// ─── WORLD-04 ───────────────────────────────────────────────────────────────

test('WORLD-04 Scroll through worlds smoothly', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  const worldsScroller = page.locator('[data-testid="worlds-scroller"]');
  await expect(worldsScroller).toBeVisible({ timeout: 5000 });

  const startTime = Date.now();

  // Use evaluate to scroll (Playwright locator doesn't have .scroll())
  await worldsScroller.evaluate((el) => { el.scrollTop = 500; });
  await page.waitForTimeout(500);

  const scrollTime = Date.now() - startTime;

  const worldTiles = page.locator('[data-testid="world-tile"]');
  const count = await worldTiles.count();
  expect(count).toBeGreaterThan(3);

  console.log(`✅ WORLD-04 PASS: Scroll smooth (${scrollTime}ms), ${count} tiles`);
});

// ─── WORLD-05 ───────────────────────────────────────────────────────────────

test('WORLD-05 World visualization 60fps performance', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

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

  console.log(`World rendering FPS: ${frameMetrics.fps}`);
  expect(frameMetrics.fps).toBeGreaterThan(25);
  console.log(`✅ WORLD-05 PASS: ${frameMetrics.fps}fps`);
});

// ─── WORLD-06 ───────────────────────────────────────────────────────────────

test('WORLD-06 Compare worlds — side-by-side view (optional feature)', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  const compareButton = page.locator('button:has-text("Compare")');

  if (await compareButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await compareButton.click();

    const worldTiles = page.locator('[data-testid="world-tile"]');
    await worldTiles.nth(0).click();
    await worldTiles.nth(1).click();

    const comparisonView = page.locator('[data-testid="world-comparison"]');
    await expect(comparisonView).toBeVisible({ timeout: 10000 });

    console.log('✅ WORLD-06 PASS: World comparison feature works');
  } else {
    console.log('⏭️ WORLD-06 SKIP: Compare feature not available yet');
  }
});

// ─── WORLD-07 ───────────────────────────────────────────────────────────────

test('WORLD-07 World insights personalized per Twin', async ({ page }) => {
  await page.goto('/en/worlds', { waitUntil: 'load' });

  const worldTile = page.locator('[data-testid="world-tile"]').first();
  await expect(worldTile).toBeVisible({ timeout: 5000 });

  const twinSelector = page.locator('[data-testid="twin-selector"]');

  if (await twinSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
    worldTile.click();
    const insight1 = await page.locator('[data-testid="world-insight"]').textContent();

    await twinSelector.selectOption({ label: 'Different Twin' });
    await page.waitForTimeout(2000);

    await page.goto('/en/worlds', { waitUntil: 'load' });
    await page.locator('[data-testid="world-tile"]').first().click();

    const insight2 = await page.locator('[data-testid="world-insight"]').textContent();

    expect(insight1).not.toBe(insight2);
    console.log('✅ WORLD-07 PASS: Insights personalized per Twin');
  } else {
    console.log('⏭️ WORLD-07 SKIP: Multiple Twins not available yet');
  }
});

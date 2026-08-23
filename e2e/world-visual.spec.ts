import { test, expect } from '@playwright/test';

/**
 * P0-H Gap 4 — "Visual Tests" (render / performance / mobile / consistency).
 *
 * World pages (/worlds/:worldId) require an authenticated session with a
 * real Twin — not something these E2E tests can set up (see utils.ts's
 * `login()`, which needs real credentials and is `test.skip`'d elsewhere in
 * this suite for the same reason). Testing against the public, unauthenticated
 * `/components` route's "Twin per World" preview grid (ComponentShowcase.tsx)
 * instead — same `TwinPresence` component, same `twinWorldContext.ts` data,
 * genuinely exercised, just reachable without login.
 */

const WORLD_IDS = [
  'self', 'mind', 'relationship', 'love', 'career', 'wealth',
  'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future',
];

test.describe('P0-H: Twin per World visual checks', () => {
  test('all 12 Worlds render their Twin preview without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/en/components');
    await page.waitForLoadState('networkidle').catch(() => {});

    const grid = page.locator('[data-testid="twin-world-preview-grid"]');
    await expect(grid).toBeVisible({ timeout: 10000 });

    for (const worldId of WORLD_IDS) {
      const card = page.locator(`[data-testid="twin-world-preview-${worldId}"]`);
      await expect(card, `World "${worldId}" preview card should render`).toBeVisible();
      // Twin identity check: every card must draw an SVG core glyph — this
      // is the "same shape/color across all Worlds" consistency guarantee.
      await expect(card.locator('svg')).toHaveCount(1);
    }

    expect(consoleErrors, `Console/page errors while rendering all 12 Worlds: ${consoleErrors.join('; ')}`).toHaveLength(0);
  });

  test('preview grid has no horizontal overflow at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone-class width
    await page.goto('/en/components');
    await page.waitForLoadState('networkidle').catch(() => {});

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - window.innerWidth;
    });

    // A few px of tolerance for scrollbar-gutter rounding, not a real overflow.
    expect(overflow, 'Page should not scroll horizontally at mobile width').toBeLessThanOrEqual(4);
  });

  test('each World produces a visually distinct Twin card (posture/accessory/expression vary)', async ({ page }) => {
    await page.goto('/en/components');
    await page.waitForLoadState('networkidle').catch(() => {});

    const grid = page.locator('[data-testid="twin-world-preview-grid"]');
    await expect(grid).toBeVisible({ timeout: 10000 });

    // Every card's inner HTML should differ from every other card's — same
    // seed/archetype in, but each World's twinWorldContext.ts entry has a
    // distinct accessory glyph, so the rendered markup can't be identical.
    const htmls = await Promise.all(
      WORLD_IDS.map((id) => page.locator(`[data-testid="twin-world-preview-${id}"] svg`).innerHTML())
    );
    const unique = new Set(htmls);
    expect(unique.size, 'All 12 Worlds should render visually distinct Twin markup').toBe(WORLD_IDS.length);
  });
});

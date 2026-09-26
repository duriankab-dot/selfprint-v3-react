/**
 * worlds.spec.ts — TC-408: E2E tests for 12 Worlds navigation + detail
 *
 * Tests:
 * - WorldsHub loads all 12 world tiles
 * - Clicking a world navigates to WorldDetail
 * - WorldDetail shows correct world name, content, Twin presence
 * - All 12 worlds are accessible (no broken links)
 */

import { test, expect } from '@playwright/test';

const WORLDS = [
  { id: 'self', name: 'ตัวตน', emoji: '🪞' },
  { id: 'mind', name: 'จิตใจ', emoji: '🧠' },
  { id: 'relationship', name: 'ความสัมพันธ์', emoji: '🤝' },
  { id: 'love', name: 'ความรัก', emoji: '❤️' },
  { id: 'career', name: 'อาชีพ', emoji: '💼' },
  { id: 'wealth', name: 'ความร่ำรวย', emoji: '💰' },
  { id: 'life', name: 'ชีวิต', emoji: '🌍' },
  { id: 'growth', name: 'การเติบโต', emoji: '🌱' },
  { id: 'decision', name: 'การตัดสินใจ', emoji: '⚖️' },
  { id: 'purpose', name: 'เป้าหมาย', emoji: '🎯' },
  { id: 'wellbeing', name: 'ความสุข', emoji: '😊' },
  { id: 'future', name: 'อนาคต', emoji: '🔮' },
];

test.describe('Worlds Hub', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth for protected routes
    await page.goto('/th/worlds');
  });

  test('should display all 12 world tiles', async ({ page }) => {
    const tiles = page.getByTestId('world-tile');
    await expect(tiles).toHaveCount(12);
  });

  test('should show each world with correct name and emoji', async ({ page }) => {
    for (const world of WORLDS) {
      const tile = page.locator('[data-testid="world-tile"]').filter({
        has: page.getByText(world.emoji, { exact: true }),
      });
      await expect(tile).toBeVisible();
      
      const name = tile.getByTestId('world-name');
      await expect(name).toContainText(world.name);
    }
  });

  test('should navigate to world detail on tile click', async ({ page }) => {
    const firstTile = page.locator('[data-testid="world-tile"]').first();
    await firstTile.click();

    await expect(page.getByTestId('world-detail')).toBeVisible();
  });

  test('should show back button in world detail', async ({ page }) => {
    await page.locator('[data-testid="world-tile"]').first().click();
    
    const backBtn = page.locator('[class*="wd-back"], [class*="BackButton"]');
    await expect(backBtn).toBeVisible();
  });
});

test.describe('World Detail Pages', () => {
  for (const world of WORLDS) {
    test(`${world.id}: should load detail page`, async ({ page }) => {
      await page.goto(`/th/worlds/${world.id}`);

      await expect(page.getByTestId('world-detail')).toBeVisible();
      await expect(page.getByText(world.name)).toBeVisible();
      await expect(page.getByText(world.emoji)).toBeVisible();
    });

    test(`${world.id}: should have world article cards`, async ({ page }) => {
      await page.goto(`/th/worlds/${world.id}`);

      // Each world has 3 articles — check at least one card exists
      const articleCards = page.locator('[class*="article-card"], [role="button"]').filter({
        has: page.locator('[class*="article-excerpt"], [class*="article-meta"]'),
      });
      await expect(articleCards.first()).toBeVisible();
    });

    test(`${world.id}: should link to twin chat`, async ({ page }) => {
      await page.goto(`/th/worlds/${world.id}`);

      const chatLink = page.locator('a[href*="/chat/twin"][href*="world=' + world.id + '"]');
      await expect(chatLink).toBeVisible();
      await expect(chatLink).toHaveAttribute('href', /\/chat\/twin.*world=[a-z]+/);
    });
  }
});

test.describe('Worlds Navigation', () => {
  test('should navigate between worlds via back button', async ({ page }) => {
    // Start at worlds hub
    await page.goto('/th/worlds');
    await expect(page.getByTestId('worlds-container')).toBeVisible();

    // Enter first world
    await page.locator('[data-testid="world-tile"]').first().click();
    await expect(page.getByTestId('world-detail')).toBeVisible();

    // Go back
    const backBtn = page.locator('[class*="wd-back"], [class*="BackButton"], [aria-label*="All worlds"], [aria-label*="โลกทั้งหมด"]');
    await backBtn.first().click();

    // Should be back at hub
    await expect(page.getByTestId('worlds-container')).toBeVisible();
  });

  test('should handle invalid world ID gracefully', async ({ page }) => {
    await page.goto('/th/worlds/nonexistent-id');

    // Should redirect away or show error state
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    
    // Should not be on a 404-style broken page
    expect(currentUrl).not.toContain('nonexistent-id');
  });
});

test.describe('Worlds Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should render worlds grid on mobile', async ({ page }) => {
    await page.goto('/th/worlds');
    
    const grid = page.getByTestId('worlds-scroller');
    await expect(grid).toBeVisible();

    const tiles = page.getByTestId('world-tile');
    await expect(tiles).toHaveCount(12);
  });

  test('should scroll world cards on mobile', async ({ page }) => {
    await page.goto('/th/worlds');
    
    const scroller = page.getByTestId('worlds-scroller');
    const initialScroll = await scroller.evaluate(el => el.scrollLeft);
    
    // Scroll right
    await scroller.evaluate(el => el.scrollBy(100, 0));
    const newScroll = await scroller.evaluate(el => el.scrollLeft);
    
    expect(newScroll).toBeGreaterThan(initialScroll);
  });
});

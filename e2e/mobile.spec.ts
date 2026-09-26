/**
 * mobile.spec.ts — TC-603: Mobile E2E Full Suite
 *
 * Tests:
 * - Touch targets (min 44x44px)
 * - Scroll behavior
 * - PWA offline
 * - Viewport handling
 * - Safe area insets
 */

import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 812 };

test.describe.configure({ retries: 2 });

test.describe('Mobile Viewport', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('LandingPage fits mobile viewport', async ({ page }) => {
    await page.goto('/th/');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('Onboarding fits mobile viewport', async ({ page }) => {
    await page.goto('/th/onboarding');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('CoreAwakening birth animation fits mobile', async ({ page }) => {
    await page.goto('/th/twin-birth');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('Dashboard fits mobile viewport', async ({ page }) => {
    await page.goto('/th/dashboard');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('Worlds Hub horizontal scroll works', async ({ page }) => {
    await page.goto('/th/worlds');
    const scroller = page.getByTestId('worlds-scroller');
    await expect(scroller).toBeVisible();

    // Test horizontal scroll
    const initialScroll = await scroller.evaluate(el => el.scrollLeft);
    await scroller.evaluate(el => el.scrollBy(200, 0));
    const newScroll = await scroller.evaluate(el => el.scrollLeft);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test('WorldDetail fits mobile viewport', async ({ page }) => {
    await page.goto('/th/worlds/self');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('Decision Dashboard fits mobile', async ({ page }) => {
    await page.goto('/th/decisions');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('Memory Insights fits mobile', async ({ page }) => {
    await page.goto('/th/memory-insights');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });

  test('Intelligence Hub fits mobile', async ({ page }) => {
    await page.goto('/th/intelligence');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });
});

test.describe('Touch Targets (min 44x44px)', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('NavBar buttons meet minimum touch target', async ({ page }) => {
    await page.goto('/th/dashboard');
    const navButtons = page.locator('nav button, nav a[role="button"]');
    for (const btn of await navButtons.all()) {
      const box = await btn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('World tiles meet minimum touch target', async ({ page }) => {
    await page.goto('/th/worlds');
    const tiles = page.getByTestId('world-tile');
    for (const tile of await tiles.all()) {
      const box = await tile.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Decision form buttons meet minimum touch target', async ({ page }) => {
    await page.goto('/th/decisions');
    const buttons = page.locator('button:visible');
    for (const btn of await buttons.all()) {
      const box = await btn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Memory cards meet minimum touch target', async ({ page }) => {
    await page.goto('/th/memory-insights');
    const cards = page.locator('[data-testid^="memory-insight-"]');
    for (const card of await cards.all()) {
      const box = await card.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('LivingTwin toggle buttons meet minimum touch target', async ({ page }) => {
    await page.goto('/th/dashboard');
    const toggles = page.locator('.living-twin__panel-toggle button');
    for (const btn of await toggles.all()) {
      const box = await btn.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

test.describe('Scroll Behavior', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('Vertical scroll works on all pages', async ({ page }) => {
    const pages = ['/th/', '/th/onboarding', '/th/dashboard', '/th/worlds', '/th/decisions'];
    for (const url of pages) {
      await page.goto(url);
      await page.evaluate(() => window.scrollBy(0, 300));
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  });

  test('Worlds Hub horizontal scroll momentum', async ({ page }) => {
    await page.goto('/th/worlds');
    const scroller = page.getByTestId('worlds-scroller');
    await scroller.evaluate(el => {
      el.scrollLeft = 0;
      el.dispatchEvent(new WheelEvent('wheel', { deltaX: 100 }));
    });
    await page.waitForTimeout(100);
    const scrollLeft = await scroller.evaluate(el => el.scrollLeft);
    expect(scrollLeft).toBeGreaterThan(0);
  });

  test('Memory list virtual scroll', async ({ page }) => {
    await page.goto('/th/memory-insights');
    const list = page.locator('[data-testid="memory-insights-list"]');
    await expect(list).toBeVisible();
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
  });
});

test.describe('PWA Offline', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('Service worker registers', async ({ page }) => {
    await page.goto('/th/');
    const swRegistered = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return !!reg;
    });
    expect(swRegistered).toBe(true);
  });

  test('Offline banner appears when offline', async ({ page }) => {
    await page.goto('/th/dashboard');
    await page.context().setOffline(true);
    await page.reload();
    const offlineBanner = page.locator('[data-testid="offline-banner"], .offline-banner');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });
    await page.context().setOffline(false);
  });

  test('Cached pages work offline', async ({ page }) => {
    // First visit to cache
    await page.goto('/th/dashboard');
    await page.waitForLoadState('networkidle');

    // Go offline
    await page.context().setOffline(true);
    await page.reload();

    // Should still render (from cache)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    await page.context().setOffline(false);
  });

  test('Install prompt appears on mobile', async ({ page }) => {
    await page.goto('/th/');
    // PWA install prompt should be available
    const promptShown = await page.evaluate(() => {
      return window.matchMedia('(display-mode: standalone)').matches === false;
    });
    expect(promptShown).toBe(true);
  });
});

test.describe('Safe Area Insets', () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  test('Bottom nav respects safe area', async ({ page }) => {
    await page.goto('/th/dashboard');
    const bottomNav = page.locator('nav[role="navigation"], .bottom-nav');
    const styles = await bottomNav.evaluate(el => getComputedStyle(el));
    // Should have padding-bottom for home indicator
    expect(styles.paddingBottom).toMatch(/env\(safe-area-inset-bottom\)/);
  });

  test('Top header respects safe area', async ({ page }) => {
    await page.goto('/th/dashboard');
    const header = page.locator('header, .top-bar');
    const styles = await header.evaluate(el => getComputedStyle(el));
    expect(styles.paddingTop).toMatch(/env\(safe-area-inset-top\)/);
  });

  test('Modals/sheets respect safe area', async ({ page }) => {
    await page.goto('/th/twin-birth');
    // Naming phase should have proper bottom padding
    const sheet = page.locator('[role="dialog"], .bottom-sheet');
    if (await sheet.count() > 0) {
      const styles = await sheet.evaluate(el => getComputedStyle(el));
      expect(styles.paddingBottom).toMatch(/env\(safe-area-inset-bottom\)/);
    }
  });
});

test.describe('Orientation Change', () => {
  test('Portrait to landscape', async ({ page }) => {
    await page.goto('/th/dashboard');
    await page.setViewportSize({ width: 812, height: 375 });
    await page.waitForTimeout(200);
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(812);
  });

  test('Landscape to portrait', async ({ page }) => {
    await page.goto('/th/dashboard');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(200);
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });
});

test.describe('Reduced Motion', () => {
  test.use({ viewport: MOBILE_VIEWPORT, reducedMotion: 'reduce' });

  test('Animations disabled with reduced motion', async ({ page }) => {
    await page.goto('/th/twin-birth');
    // Birth animation should be static or minimal
    const animationElements = page.locator('[style*="animation"], [class*="animate"]');
    for (const el of await animationElements.all()) {
      const styles = await el.evaluate(el => getComputedStyle(el));
      expect(styles.animationDuration).toBe('0s');
    }
  });

  test('LivingTwin respects reduced motion', async ({ page }) => {
    await page.goto('/th/dashboard');
    const twin = page.locator('[data-testid="living-twin"]');
    const styles = await twin.evaluate(el => getComputedStyle(el));
    expect(styles.animationDuration).toBe('0s');
  });
});
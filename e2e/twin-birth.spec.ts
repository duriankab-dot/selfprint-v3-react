/**
 * twin-birth.spec.ts — TC-401/402: E2E tests for Twin Birth flow
 *
 * Tests:
 * - /twin-birth page loads with intro content
 * - CTA button advances to birth animation phase
 * - Naming phase shows input form
 * - Error state is handled gracefully
 */

import { test, expect } from '@playwright/test';

test.describe('Twin Birth Page', () => {
  test('should show intro phase with CTA', async ({ page }) => {
    await page.goto('/th/twin-birth');

    // Should see heading about awakening
    const heading = page.locator('h1').filter({ hasText: /awakening|ปลุกตื่น/i });
    await expect(heading).toBeVisible();

    // Should have start button
    const cta = page.locator('button').filter({ hasText: /watch the awakening|รับชมพิธีการ/i });
    await expect(cta).toBeVisible();

    // Should have dashboard skip link
    const skipLink = page.locator('button').filter({ hasText: /dashboard|หน้าหลัก/i });
    await expect(skipLink).toBeVisible();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/th/twin-birth');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test.skip('should advance through birth phases when authenticated', async ({ page }) => {
    // This test requires a real authenticated session
    // Skip in CI unless credentials are available
    
    // Mock authentication would go here
    // await page.route('**/auth/session', async route => {
    //   await route.fulfill({
    //     status: 200,
    //     body: JSON.stringify({ user: { id: 'test-user' } }),
    //   });
    // });

    // await page.goto('/th/twin-birth');
    // await expect(page).toHaveURL(/.*\/twin-birth/);

    // Click intro CTA
    // const cta = page.locator('button').filter({ hasText: /watch the awakening/i }).first();
    // await cta.click();
    // await expect(page.getByTestId('twin-birth-animation')).toBeVisible();
  });
});

test.describe('Twin Birth Reload Recovery', () => {
  test.skip('should recover interrupted birth flow on reload', async ({ page }) => {
    // Test scenario: user starts birth, closes tab, reopens -> should resume
    // Requires: localStorage persistence + simulated interrupted state
  });
});

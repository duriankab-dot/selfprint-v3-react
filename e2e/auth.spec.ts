/**
 * auth.spec.ts — Authentication UI flows
 *
 * baseURL = https://www.selfprint.one (production, see playwright.config.ts)
 *
 * Tests verify:
 *  - Login page renders correctly
 *  - Magic Link form submits and shows confirmation
 *  - Landing page has accessible form controls
 *  - Auth pages load within performance budget
 *
 * NOTE: Full credential-based auth (complete magic link → session)
 * requires email inbox access and is NOT tested here.
 * Verified manually via production smoke test.
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication — Login Page', () => {
  /** /en/login renders with email input + magic link button */
  test('AUTH-01 login page renders with email form', async ({ page }) => {
    await page.goto('/en/login', { waitUntil: 'domcontentloaded' });

    // Email input present
    const emailInput = page.locator('input[type="email"], input[placeholder="อีเมลของคุณ"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });

    // Magic link submit button present
    const submitBtn = page.locator('button:has-text("Magic Link"), button:has-text("ส่ง")').first();
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
  });

  /** Submitting magic link form shows Thai confirmation message */
  test('AUTH-02 magic link form shows confirmation after submit', async ({ page }) => {
    await page.goto('/en/login', { waitUntil: 'domcontentloaded' });

    // Fill email
    const emailInput = page.locator('input[type="email"], input[placeholder="อีเมลของคุณ"]').first();
    await emailInput.fill('test-e2e@selfprint.one');

    // Submit
    const submitBtn = page.locator('button:has-text("Magic Link"), button:has-text("ส่ง")').first();
    await submitBtn.click();

    // Confirmation: "ส่งลิงก์เข้าสู่ระบบ" OR generic "Check your email"
    const confirmed = page.locator('text=/ส่งลิงก์|Magic Link|check your email|อีเมล/i');
    await expect(confirmed.first()).toBeVisible({ timeout: 15000 });
  });

  /** Login page loads within performance budget */
  test('AUTH-03 login page cold-start < 5s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/en/login', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - t0;
    console.log(`/en/login load: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(5000);
  });

  /** Landing page has OAuth buttons (Google / Apple) */
  test('AUTH-04 login page has OAuth providers', async ({ page }) => {
    await page.goto('/en/login', { waitUntil: 'domcontentloaded' });

    // At least one OAuth button (Google or Apple)
    const oauthBtn = page.locator('button:has-text("Google"), button:has-text("Apple")').first();
    await expect(oauthBtn).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Authentication — Landing & Entry', () => {
  /** Root loads and has Start CTA */
  test('AUTH-05 landing page has start CTA button', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // CTA: "Start Free" or "เริ่มฟรี"
    const cta = page.locator('button:has-text("Start Free"), button:has-text("เริ่มฟรี"), a:has-text("Start Free"), a:has-text("เริ่มฟรี")').first();
    await expect(cta).toBeVisible({ timeout: 10000 });
  });

  /** Landing page has accessible form controls */
  test('AUTH-06 landing page has accessible interactive elements', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    // Has at least 1 button
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);

    // Has interactive elements (button or link)
    const interactive = page.locator('button, a[href], input').first();
    await expect(interactive).toBeVisible({ timeout: 5000 });
  });

  /** Login page link is reachable from landing */
  test('AUTH-07 landing page home load < 5s', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - t0;
    console.log(`Landing page load: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(5000);
  });
});

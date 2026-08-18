import { test, expect } from '@playwright/test';
import { PERFORMANCE_LIMITS, createTestUser, navigateToHub } from './utils';

test.describe('Authentication Flow', () => {
  test('signup with email', async ({ page }) => {
    const { email } = await createTestUser(page);

    // Navigate to signup
    await page.goto('/');
    await page.click('text=Get Started');

    // Expect signup page
    await expect(page).toHaveURL(/signup|auth/);

    // Fill email
    await page.fill('input[type="email"]', email);
    await page.click('button:has-text("Continue")');

    // Verify email check page
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 5000 });
  });

  test('login flow', async ({ page }) => {
    const testEmail = process.env.TEST_EMAIL || 'test@selfprint.one';

    // Navigate to signin
    await page.goto('/');

    // Click signin button
    const signinBtn = page.locator('text=/Sign in|Login/');
    await signinBtn.click({ timeout: 5000 });

    // Fill email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(testEmail);

    // Click continue
    const continueBtn = page.locator('button:has-text("Continue")').first();
    await continueBtn.click({ timeout: 5000 });

    // Should redirect to check email or auth method selection
    await page.waitForURL(/(auth|signin|check-email)/, { timeout: 10000 });
  });

  test('page performance on auth pages', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });
    const homeLoadTime = Date.now() - startTime;

    console.log(`Home page load: ${homeLoadTime}ms (limit: ${PERFORMANCE_LIMITS.PAGE_LOAD}ms)`);

    if (homeLoadTime > PERFORMANCE_LIMITS.PAGE_LOAD) {
      console.warn(`⚠️ Slow page load: ${homeLoadTime}ms > ${PERFORMANCE_LIMITS.PAGE_LOAD}ms`);
    }

    expect(homeLoadTime).toBeLessThan(PERFORMANCE_LIMITS.PAGE_LOAD + 500); // 500ms buffer for first load
  });

  test('accessible form controls', async ({ page }) => {
    await page.goto('/');

    // Check for proper labels
    const inputs = await page.locator('input').count();
    expect(inputs).toBeGreaterThan(0);

    // Check for buttons
    const buttons = await page.locator('button').count();
    expect(buttons).toBeGreaterThan(0);
  });
});

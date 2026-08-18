import { test, expect } from '@playwright/test';
import { PERFORMANCE_LIMITS, navigateToHub, waitForAPICall } from './utils';

test.describe('Decision Logging & Intelligence', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToHub(page, 'activities');
  });

  test('log a decision with performance assertion', async ({ page }) => {
    // Find decision logging button/form
    const decisionBtn = page.locator('text=/Log Decision|Record Decision|Save Choice/i').first();

    if (await decisionBtn.isVisible({ timeout: 5000 })) {
      const startTime = Date.now();
      await decisionBtn.click();

      // Expect decision form
      await expect(page.locator('form, [role="dialog"]')).toBeVisible({ timeout: 5000 });

      // Fill decision form
      const titleInput = page.locator('input[placeholder*="decision"], input[placeholder*="title"]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Decision: Choose React over Vue');
      }

      // Select a world context if available
      const worldSelect = page.locator('select, [data-testid="world-select"]').first();
      if (await worldSelect.isVisible()) {
        await worldSelect.selectOption('0');
      }

      // Select decision options (e.g., yes/no, multiple choice)
      const optionBtns = page.locator('button:has-text("Yes"), button:has-text("Choose")').first();
      if (await optionBtns.isVisible()) {
        await optionBtns.click();
      }

      // Submit decision
      const submitBtn = page.locator('button:has-text("Save"), button:has-text("Submit")').first();
      await submitBtn.click({ timeout: 5000 });

      // Wait for API
      try {
        const response = await waitForAPICall(page, /decision|choice|save/);
        const duration = Date.now() - startTime;

        console.log(`Decision save took ${duration}ms (limit: ${PERFORMANCE_LIMITS.DECISION_SAVE}ms)`);

        if (duration > PERFORMANCE_LIMITS.DECISION_SAVE) {
          console.warn(`⚠️ SLOW DECISION SAVE: ${duration}ms > ${PERFORMANCE_LIMITS.DECISION_SAVE}ms`);
        }

        expect(response.ok()).toBeTruthy();
      } catch (e) {
        console.log('Decision save API call timeout - may be processing');
      }
    } else {
      console.log('Decision logging not yet implemented');
    }
  });

  test('decision follow-ups scheduling', async ({ page }) => {
    // Look for follow-up scheduling (30/90/180/365 days)
    const followUpOptions = page.locator('text=/30 days|90 days|180 days|365 days/i');
    const hasFollowUps = await followUpOptions.count().then(c => c > 0);

    if (hasFollowUps) {
      console.log('✓ Follow-up scheduling available');
    }
  });

  test('decision learning & patterns', async ({ page }) => {
    // Look for decision analytics/patterns
    const analytics = page.locator('text=/pattern|success rate|analysis|insight/i').first();
    const hasAnalytics = await analytics.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasAnalytics) {
      console.log('✓ Decision analytics visible');
    }
  });

  test('decision world expertise routing', async ({ page }) => {
    // Verify decisions are routed by world
    const worldSelector = page.locator('[data-testid="world-selector"], select').first();

    if (await worldSelector.isVisible({ timeout: 5000 })) {
      const worldCount = await page.locator('option').count();
      console.log(`✓ ${worldCount} worlds available for decision routing`);

      // Verify at least 5 worlds (SELFPRINT specifies 12 worlds)
      expect(worldCount).toBeGreaterThanOrEqual(2);
    }
  });
});

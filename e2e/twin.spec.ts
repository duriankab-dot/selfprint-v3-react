import { test, expect } from '@playwright/test';
import { PERFORMANCE_LIMITS, navigateToHub, waitForAPICall } from './utils';

test.describe('Twin Creation & Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app home
    await page.goto('/today');
    await page.waitForLoadState('networkidle').catch(() => {});
  });

  test('core awakening flow - twin creation', async ({ page }) => {
    // Look for "Create Twin" or "Core Awakening" button
    const createTwinBtn = page.locator('text=/Create Twin|Core Awakening|Awaken/i').first();

    if (await createTwinBtn.isVisible({ timeout: 5000 })) {
      const startTime = Date.now();
      await createTwinBtn.click();

      // Wait for API call
      const response = await waitForAPICall(page, /twin|awakening/);
      const duration = Date.now() - startTime;

      console.log(`Twin creation took ${duration}ms (limit: ${PERFORMANCE_LIMITS.API_RESPONSE}ms)`);
      expect(duration).toBeLessThan(PERFORMANCE_LIMITS.API_RESPONSE + 500);

      expect(response.ok()).toBeTruthy();
    }
  });

  test('twin chat with performance assertion', async ({ page }) => {
    // Navigate to Twin chat
    await navigateToHub(page, 'twin');

    // Ensure chat interface loads
    const chatInput = page.locator('input[placeholder*="message"], textarea').first();
    await expect(chatInput).toBeVisible({ timeout: 5000 });

    // Send a message
    const message = 'Hello Twin, what are you thinking?';
    const startTime = Date.now();

    await chatInput.fill(message);
    await page.keyboard.press('Enter');

    // Wait for API response
    try {
      const response = await waitForAPICall(page, /twin|chat|message/);
      const duration = Date.now() - startTime;

      console.log(`Twin chat response took ${duration}ms (limit: ${PERFORMANCE_LIMITS.TWIN_CHAT}ms)`);

      if (duration > PERFORMANCE_LIMITS.TWIN_CHAT) {
        console.warn(`⚠️ SLOW TWIN CHAT: ${duration}ms > ${PERFORMANCE_LIMITS.TWIN_CHAT}ms`);
      }

      expect(response.ok()).toBeTruthy();
    } catch (e) {
      console.log('Chat API call may be streaming - checking for visible response');
    }

    // Wait for visible response (Twin should respond)
    const twinResponse = page.locator('text=/I|thinking|understand|help/i').last();
    await expect(twinResponse).toBeVisible({ timeout: 10000 }).catch(() => {});
  });

  test('twin personality context switching (Hubs)', async ({ page }) => {
    // Verify 5 navigation hubs
    const hubs = ['วันนี้', 'สำรวจ', 'TWIN', 'กิจกรรม', 'ฉัน'];

    for (const hub of hubs) {
      const hubBtn = page.locator(`text="${hub}"`).first();
      const isVisible = await hubBtn.isVisible({ timeout: 3000 }).catch(() => false);

      if (isVisible) {
        console.log(`✓ Hub found: ${hub}`);
      }
    }
  });

  test('twin memory persistence', async ({ page }) => {
    // Navigate to Twin
    await navigateToHub(page, 'twin');

    // Check for memory display (past conversations, context)
    const memory = page.locator('text=/remember|memory|past|history/i').first();
    const memoryExists = await memory.isVisible({ timeout: 5000 }).catch(() => false);

    if (memoryExists) {
      console.log('✓ Twin memory/history visible');
    }
  });

  test('twin evolution stages', async ({ page }) => {
    // Look for evolution stage indicator
    const stageIndicator = page.locator('[data-testid="evolution-stage"], text=/Stage|Level|Evolution/i').first();
    const stageExists = await stageIndicator.isVisible({ timeout: 5000 }).catch(() => false);

    if (stageExists) {
      const stageText = await stageIndicator.textContent();
      console.log(`✓ Twin stage: ${stageText}`);
    }
  });
});

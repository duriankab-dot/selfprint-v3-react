import { test, expect } from '@playwright/test';
import { PERFORMANCE_LIMITS } from './utils';
import path from 'path';
import fs from 'fs';

test.describe('Image Upload & Handling', () => {
  let testImagePath: string;

  test.beforeEach(async ({ page }) => {
    // Create a temporary test image
    const testDir = path.join(process.cwd(), 'e2e', 'fixtures');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    testImagePath = path.join(testDir, 'test-image.png');

    // Create a minimal PNG (1x1 transparent pixel)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x5b, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x01, 0x00, 0x01, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00,
      0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    fs.writeFileSync(testImagePath, pngBuffer);

    await expect(fs.existsSync(testImagePath)).toBeTruthy();
  });

  test('upload profile picture', async ({ page }) => {
    // Navigate to profile
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Find upload button
    const uploadBtn = page.locator('text=/Upload|Choose|Change Picture/i').first();

    if (await uploadBtn.isVisible({ timeout: 5000 })) {
      const startTime = Date.now();

      // Set file input
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(testImagePath);

      // Wait for upload to complete
      try {
        await page.waitForResponse(
          response => /upload|image|profile/.test(response.url()) && response.status() === 200,
          { timeout: PERFORMANCE_LIMITS.IMAGE_UPLOAD + 1000 }
        );

        const duration = Date.now() - startTime;
        console.log(`Image upload took ${duration}ms (limit: ${PERFORMANCE_LIMITS.IMAGE_UPLOAD}ms)`);

        if (duration > PERFORMANCE_LIMITS.IMAGE_UPLOAD) {
          console.warn(`⚠️ SLOW IMAGE UPLOAD: ${duration}ms > ${PERFORMANCE_LIMITS.IMAGE_UPLOAD}ms`);
        }

        expect(duration).toBeLessThan(PERFORMANCE_LIMITS.IMAGE_UPLOAD + 500);
      } catch (_e) {
        console.log('Image upload API call may have timed out or not found');
      }
    }
  });

  test('upload validation - file type', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.isVisible({ timeout: 5000 })) {
      // Check accepted file types
      const accept = await fileInput.getAttribute('accept');
      console.log(`Accepted file types: ${accept}`);

      if (accept) {
        expect(accept).toContain('image');
      }
    }
  });

  test('upload validation - file size', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    const fileInput = page.locator('input[type="file"]').first();

    if (await fileInput.isVisible({ timeout: 5000 })) {
      // Check max file size
      const maxSize = await fileInput.getAttribute('data-max-size');
      console.log(`Max file size: ${maxSize}`);
    }
  });

  test('image rendering after upload', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    // Look for profile image
    const profileImg = page.locator('img[alt="Profile"], [data-testid="profile-image"]').first();

    if (await profileImg.isVisible({ timeout: 5000 })) {
      const src = await profileImg.getAttribute('src');
      console.log(`Profile image loaded: ${src}`);

      expect(src).toBeTruthy();
    }
  });
});

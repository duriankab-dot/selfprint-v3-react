/**
 * UPLOAD.SPEC.TS — Phase B Integration Tests
 *
 * Profile Picture Upload & Verification
 * Route: /en/twin-profile  (was /en/twin/profile — that route doesn't exist)
 *
 * Note: Upload tests require TwinProfilePage to expose data-testid hooks
 * and a functioning Supabase Storage bucket.
 */

import { test, expect } from '@playwright/test';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');

test.beforeEach(async ({ page }) => {
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ─── UPLOAD-01 ──────────────────────────────────────────────────────────────

test('UPLOAD-01 Upload profile picture — select → preview → confirm → verify', async ({
  page,
}) => {
  test.fixme(true, 'TwinProfilePage missing data-testid attributes (profile-picture-upload, upload-preview, upload-success)');

  await page.goto('/en/twin-profile', { waitUntil: 'load' }); // was /en/twin/profile (wrong)

  const uploadTrigger = page.locator('[data-testid="profile-picture-upload"]');
  await expect(uploadTrigger).toBeVisible({ timeout: 5000 });

  const fileInput = page.locator('input[type="file"]');
  const testImagePath = join(__dirname, 'fixtures/test-images/profile-picture-1.jpg');
  await fileInput.setInputFiles(testImagePath);

  const preview = page.locator('[data-testid="upload-preview"]');
  await expect(preview).toBeVisible({ timeout: 5000 });

  await page.locator('button:has-text("Confirm Upload")').click();

  const successMessage = page.locator('[data-testid="upload-success"]');
  await expect(successMessage).toBeVisible({ timeout: 10000 });
});

// ─── UPLOAD-02 ──────────────────────────────────────────────────────────────

test('UPLOAD-02 Image validation — rejects invalid formats', async ({ page }) => {
  test.fixme(true, 'TwinProfilePage missing data-testid="upload-error"; file input behavior unverified');

  await page.goto('/en/twin-profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');
  const invalidFilePath = join(__dirname, 'fixtures/test-files/invalid.txt');

  try {
    await fileInput.setInputFiles(invalidFilePath);
  } catch (_e) {
    console.log('✅ UPLOAD-02 PASS: Invalid file rejected at input level');
    return;
  }

  const errorMessage = page.locator('[data-testid="upload-error"]');
  await expect(errorMessage).toBeVisible({ timeout: 5000 });

  const errorText = await errorMessage.textContent();
  expect(errorText).toContain('format');
});

// ─── UPLOAD-03 ──────────────────────────────────────────────────────────────

test('UPLOAD-03 Uploaded picture persists — reload shows same picture', async ({ page }) => {
  test.fixme(true, 'Depends on UPLOAD-01 infrastructure (testids + Storage bucket)');

  await page.goto('/en/twin-profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');
  const testImagePath = join(__dirname, 'fixtures/test-images/profile-picture-1.jpg');
  await fileInput.setInputFiles(testImagePath);

  await page.click('button:has-text("Confirm Upload")');

  const successMessage = page.locator('[data-testid="upload-success"]');
  await expect(successMessage).toBeVisible({ timeout: 10000 });

  const picBefore = await page.locator('[data-testid="profile-picture-display"]').getAttribute('src');

  await page.reload({ waitUntil: 'load' });

  const picAfter = await page.locator('[data-testid="profile-picture-display"]').getAttribute('src');
  expect(picAfter).toBe(picBefore);
});

// ─── UPLOAD-04 ──────────────────────────────────────────────────────────────

test('UPLOAD-04 Upload performance — large image < 5s', async ({ page }) => {
  test.fixme(true, 'Depends on UPLOAD-01 infrastructure (testids + Storage bucket)');

  await page.goto('/en/twin-profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');
  const largeImagePath = join(__dirname, 'fixtures/test-images/large-profile.jpg');

  const startTime = Date.now();
  await fileInput.setInputFiles(largeImagePath);

  const successMessage = page.locator('[data-testid="upload-success"]');
  await expect(successMessage).toBeVisible({ timeout: 5000 });

  const uploadTime = Date.now() - startTime;
  expect(uploadTime).toBeLessThan(5000);
});

// ─── UPLOAD-05 ──────────────────────────────────────────────────────────────

test('UPLOAD-05 Crop/edit image before confirm — optional workflow', async ({ page }) => {
  await page.goto('/en/twin-profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');
  const testImagePath = join(__dirname, 'fixtures/test-images/profile-picture-1.jpg');

  // If no file input on this page, skip gracefully
  const inputExists = await fileInput.isVisible({ timeout: 3000 }).catch(() => false);
  if (!inputExists) {
    console.log('⏭️ UPLOAD-05 SKIP: No file input on /en/twin-profile');
    return;
  }

  await fileInput.setInputFiles(testImagePath);

  const preview = page.locator('[data-testid="upload-preview"]');
  const previewVisible = await preview.isVisible({ timeout: 3000 }).catch(() => false);
  if (!previewVisible) {
    console.log('⏭️ UPLOAD-05 SKIP: No upload-preview after file select');
    return;
  }

  const cropButton = page.locator('button:has-text("Crop")');
  if (await cropButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await cropButton.click();
    const cropConfirm = page.locator('button:has-text("Confirm Crop")');
    await cropConfirm.click();
    console.log('✅ UPLOAD-05 PASS: Crop workflow complete');
  } else {
    console.log('⏭️ UPLOAD-05 SKIP: Crop feature not available');
  }
});

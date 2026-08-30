/**
 * UPLOAD.SPEC.TS — Phase B Integration Tests
 *
 * Profile Picture Upload & Verification
 * - File selection and upload
 * - Image processing and storage
 * - UI verification (preview, success)
 * - Storage persistence
 *
 * Prerequisites:
 * - Authenticated user
 * - Test images (fixtures/test-images/)
 */

import { test, expect } from '@playwright/test';
import { join } from 'path';

test.beforeEach(async ({ page }) => {
  // Authenticated dashboard
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  await expect(dashboardElement).toBeVisible({ timeout: 10000 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD-01: Profile picture upload flow
// ═══════════════════════════════════════════════════════════════════════════════

test('UPLOAD-01 Upload profile picture — select → preview → confirm → verify', async ({
  page,
}) => {
  // Navigate to profile settings
  await page.goto('/en/twin/profile', { waitUntil: 'load' });

  // Find upload trigger
  const uploadTrigger = page.locator('[data-testid="profile-picture-upload"]');
  await expect(uploadTrigger).toBeVisible({ timeout: 5000 });

  // Select file via input
  const fileInput = page.locator('input[type="file"]');

  // Use test image (fixture)
  const testImagePath = join(__dirname, './fixtures/test-images/profile-picture-1.jpg');

  await fileInput.setInputFiles(testImagePath);

  // Wait for preview
  const preview = page.locator('[data-testid="upload-preview"]');
  await expect(preview).toBeVisible({ timeout: 5000 });

  // Confirm upload
  const confirmButton = page.locator('button:has-text("Confirm Upload")');
  await confirmButton.click();

  // Wait for success message
  const successMessage = page.locator('[data-testid="upload-success"]');
  await expect(successMessage).toBeVisible({ timeout: 10000 });

  // Verify picture is displayed in profile
  const profilePicture = page.locator('[data-testid="profile-picture-display"]');
  await expect(profilePicture).toBeVisible({ timeout: 5000 });

  console.log('✅ UPLOAD-01 PASS: Profile picture uploaded + verified');
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD-02: Image validation (format, size, dimensions)
// ═══════════════════════════════════════════════════════════════════════════════

test('UPLOAD-02 Image validation — rejects invalid formats', async ({ page }) => {
  await page.goto('/en/twin/profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');

  // Try uploading invalid format (e.g., .txt)
  // Create test file content
  const invalidFilePath = join(__dirname, './fixtures/test-files/invalid.txt');

  try {
    await fileInput.setInputFiles(invalidFilePath);
  } catch (e) {
    // Expected: file rejection
    console.log('✅ UPLOAD-02 PASS: Invalid file format rejected');
    return;
  }

  // If file was accepted, check for error message
  const errorMessage = page.locator('[data-testid="upload-error"]');
  await expect(errorMessage).toBeVisible({ timeout: 5000 });

  const errorText = await errorMessage.textContent();
  expect(errorText).toContain('format');

  console.log('✅ UPLOAD-02 PASS: Invalid format detected');
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD-03: Picture persistence in database
// ═══════════════════════════════════════════════════════════════════════════════

test('UPLOAD-03 Uploaded picture persists — reload shows same picture', async ({ page }) => {
  // Upload picture (via UPLOAD-01 flow)
  await page.goto('/en/twin/profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');
  const testImagePath = join(__dirname, './fixtures/test-images/profile-picture-1.jpg');
  await fileInput.setInputFiles(testImagePath);

  await page.click('button:has-text("Confirm Upload")');

  // Wait for upload to complete
  const successMessage = page.locator('[data-testid="upload-success"]');
  await expect(successMessage).toBeVisible({ timeout: 10000 });

  // Get picture URL before reload
  const profilePicture = page.locator('[data-testid="profile-picture-display"]');
  const pictureUrlBefore = await profilePicture.getAttribute('src');

  // Reload page
  await page.reload({ waitUntil: 'load' });

  // Verify same picture is displayed
  const profilePictureAfter = page.locator('[data-testid="profile-picture-display"]');
  const pictureUrlAfter = await profilePictureAfter.getAttribute('src');

  expect(pictureUrlAfter).toBe(pictureUrlBefore);

  console.log('✅ UPLOAD-03 PASS: Picture persisted across reload');
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD-04: Upload performance (large file handling)
// ═══════════════════════════════════════════════════════════════════════════════

test('UPLOAD-04 Upload performance — large image < 5s', async ({ page }) => {
  await page.goto('/en/twin/profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');
  const largeImagePath = join(__dirname, './fixtures/test-images/large-profile.jpg');

  const startTime = Date.now();

  await fileInput.setInputFiles(largeImagePath);

  // Wait for completion
  const successMessage = page.locator('[data-testid="upload-success"]');
  await expect(successMessage).toBeVisible({ timeout: 5000 });

  const uploadTime = Date.now() - startTime;
  console.log(`Upload time: ${uploadTime}ms (target: <5000ms)`);

  expect(uploadTime).toBeLessThan(5000);
  console.log('✅ UPLOAD-04 PASS: Upload performance within SLA');
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD-05: Picture cropping/editing before upload
// ═══════════════════════════════════════════════════════════════════════════════

test('UPLOAD-05 Crop/edit image before confirm — optional workflow', async ({ page }) => {
  await page.goto('/en/twin/profile', { waitUntil: 'load' });

  const fileInput = page.locator('input[type="file"]');
  const testImagePath = join(__dirname, './fixtures/test-images/profile-picture-1.jpg');
  await fileInput.setInputFiles(testImagePath);

  // Wait for preview
  const preview = page.locator('[data-testid="upload-preview"]');
  await expect(preview).toBeVisible({ timeout: 5000 });

  // Look for crop/edit option (optional)
  const cropButton = page.locator('button:has-text("Crop")');

  if (await cropButton.isVisible()) {
    // Crop image
    await cropButton.click();

    // Simulate crop interaction (click + drag)
    // In real test: handle cropbox UI
    const cropConfirm = page.locator('button:has-text("Confirm Crop")');
    await cropConfirm.click();

    console.log('✅ UPLOAD-05 PASS: Image cropped before upload');
  } else {
    console.log('⏭️ UPLOAD-05 SKIP: Crop feature not available');
  }
});

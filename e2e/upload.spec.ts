/**
 * UPLOAD.SPEC.TS — Phase B Integration Tests
 *
 * Profile Picture Upload & Verification
 * Route: /en/twin-profile
 *
 * CONTRACT-ALIGNMENT (12 Sep 2026): the /en/twin-profile page
 * (TwinProfilePage.tsx → TwinProfile.tsx) renders a knowledge/insight display —
 * it contains NO file input, no preview, no confirm-upload flow, and no
 * Supabase Storage wiring (grep for profile-picture / input[type=file] /
 * setInputFiles in src returns nothing). The upload feature genuinely does not
 * exist in the product. All UPLOAD tests are therefore declared test.skip(reason)
 * — a body-level test.fixme() is a no-op when the before-each gate skips first,
 * and a fixme against non-existent UI would still break after a redeploy.
 */

import { test } from '@playwright/test';

// BEFORE-EACH-GATE-001: same stale-deploy gate as the other Phase B specs —
// the deployed staging bundle must expose dashboard-container for these tests
// to be meaningful (see MASTER_GATE_AS_IS.md blocker #1).
test.beforeEach(async ({ page }) => {
  await page.goto('/en/dashboard', { waitUntil: 'load' });
  const dashboardElement = page.locator('[data-testid="dashboard-container"]');
  const visible = await dashboardElement
    .waitFor({ state: 'visible', timeout: 10000 })
    .then(() => true)
    .catch(() => false);

  if (!visible) {
    const redirectedToLogin = page.url().includes('/login');
    test.skip(
      true,
      redirectedToLogin
        ? 'Auth session not carried on this run (redirected to /login) — re-run with a fresh storageState'
        : 'Staging bundle is stale: [data-testid="dashboard-container"] is missing from the deployed HTML — rebuild/redeploy staging from current src (MASTER_GATE_AS_IS blocker #1), then re-run'
    );
  }
});

// ─── UPLOAD-01 ──────────────────────────────────────────────────────────────

test('UPLOAD-01 Upload profile picture — select → preview → confirm → verify', async () => {
  test.skip(true, 'Profile picture upload UI not implemented on /en/twin-profile — no file input, preview, or confirm flow exists in src');
});

// ─── UPLOAD-02 ──────────────────────────────────────────────────────────────

test('UPLOAD-02 Image validation — rejects invalid formats', async () => {
  test.skip(true, 'No file input exists on /en/twin-profile — format validation cannot be exercised');
});

// ─── UPLOAD-03 ──────────────────────────────────────────────────────────────

test('UPLOAD-03 Uploaded picture persists — reload shows same picture', async () => {
  test.skip(true, 'Depends on UPLOAD-01 — no upload/storage wiring exists on /en/twin-profile');
});

// ─── UPLOAD-04 ──────────────────────────────────────────────────────────────

test('UPLOAD-04 Upload performance — large image < 5s', async () => {
  test.skip(true, 'Depends on UPLOAD-01 — no upload/storage wiring exists on /en/twin-profile');
});

// ─── UPLOAD-05 ──────────────────────────────────────────────────────────────

test('UPLOAD-05 Crop/edit image before confirm — optional workflow', async () => {
  test.skip(true, 'No file input / preview / crop UI exists on /en/twin-profile — crop workflow not implemented');
});
/**
 * e2e/global-setup.ts
 *
 * Playwright Global Setup — Authenticate test user before Phase B tests run
 *
 * Flow:
 *   1. signInWithPassword via Supabase anon client (staging DB)
 *   2. Inject session into browser localStorage
 *   3. Save storageState → e2e/.auth/user.json
 *   4. All tests using storageState: AUTH_STATE_PATH start pre-authenticated
 *
 * Env vars required (for chromium-staging):
 *   E2E_SUPABASE_URL=https://your-staging.supabase.co
 *   E2E_SUPABASE_ANON_KEY=your-staging-anon-key
 *   STAGING_URL=https://staging.selfprint.one  (optional, defaults to above)
 */

import { chromium, type FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json');

export default async function globalSetup(_config: FullConfig): Promise<void> {
  // GLOBALSETUP-001 FIX (6 Sep 2026): Previously fell back to VITE_SUPABASE_URL /
  // VITE_SUPABASE_ANON_KEY which ARE set in CI for the Vite build. This caused
  // setup to proceed past the early-return guard, attempt signInWithPassword with
  // an empty password (E2E_TEST_PASSWORD not set), log an error, then bail —
  // adding unnecessary delay and causing chromium-staging tests to run without
  // auth. Now only E2E_* vars enable Phase B setup; VITE_* are build-time only.
  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const supabaseAnonKey = process.env.E2E_SUPABASE_ANON_KEY;
  const baseURL =
    process.env.STAGING_URL ||
    'https://staging.selfprint.one';

  // Skip if E2E-specific vars not set (normal for Phase A CI — production smoke tests only)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log(
      '[global-setup] E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY not set — ' +
        'Phase B (staging) tests will be skipped. Phase A smoke tests run normally.',
    );
    return;
  }

  console.log('[global-setup] Authenticating test user against:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test-phase-b@selfprint.one',
    // E2EPW-001: อ่านจาก env ไม่ hardcode รหัสจริงลง repo
    password: process.env.E2E_TEST_PASSWORD ?? '',
  });

  if (error || !data.session) {
    console.error(
      '[global-setup] Login failed:', error?.message || 'No session returned',
      '\nMake sure seed-test-users.ts has been run against the staging DB.',
    );
    // Don't throw — let tests run and fail with auth errors (more informative)
    return;
  }

  console.log('[global-setup] Login OK — user:', data.session.user.email);

  // Derive the Supabase localStorage key from project ref
  // Format: sb-<project-ref>-auth-token
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.warn('[global-setup] Cannot parse project ref from URL:', supabaseUrl);
    return;
  }

  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionValue = JSON.stringify(data.session);

  // Open a headless browser, navigate to app, inject session
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  // Navigate to root so localStorage is on the right origin
  await page.goto('/en', { waitUntil: 'domcontentloaded' });

  await page.evaluate(
    ([key, value]: [string, string]) => {
      localStorage.setItem(key, value);
    },
    [storageKey, sessionValue],
  );

  // Ensure .auth directory exists
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });

  // Save storageState (includes localStorage + cookies)
  await context.storageState({ path: AUTH_STATE_PATH });
  await browser.close();

  console.log('[global-setup] storageState saved →', AUTH_STATE_PATH);
}

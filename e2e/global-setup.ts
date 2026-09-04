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
  const supabaseUrl =
    process.env.E2E_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.E2E_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  const baseURL =
    process.env.STAGING_URL ||
    process.env.BASE_URL ||
    'https://staging.selfprint.one';

  // Skip if env vars not configured (CI will have them; local dev may skip)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[global-setup] E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY not set — ' +
        'Phase B tests will run without auth (expect failures on authenticated routes)',
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

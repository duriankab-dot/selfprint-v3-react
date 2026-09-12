/**
 * e2e/global-setup.ts
 *
 * Playwright Global Setup — Authenticate test user before Phase B tests run
 *
 * Flow:
 *   1. signInWithPassword via Supabase REST API (staging DB)
 *   2. Inject session into browser localStorage
 *   3. Save storageState → e2e/.auth/user.json
 *   4. All tests using storageState: AUTH_STATE_PATH start pre-authenticated
 *
 * Env vars required (for chromium-staging):
 *   E2E_SUPABASE_URL=https://your-staging.supabase.co
 *   E2E_SUPABASE_ANON_KEY=your-staging-anon-key (short form: sb_publishable_* OR full JWT)
 *   STAGING_URL=https://staging.selfprint.one  (optional, defaults to above)
 *
 * FIX (2026-09-12): Supabase dashboard now provides short-form keys (sb_publishable_*).
 * REST API supports short-form keys directly; JS SDK requires full JWT.
 * Using fetch + REST API to avoid JWT format mismatch.
 */

import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json');

export default async function globalSetup(_config: FullConfig): Promise<void> {
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

  // Use REST API directly (supports short-form keys: sb_publishable_*)
  // Instead of JS SDK which requires full JWT (eyJhbGciOi...)
  const tokenUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test-phase-b@selfprint.one',
      password: process.env.E2E_TEST_PASSWORD ?? '',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[global-setup] Login failed: HTTP ${response.status}`,
      errorText,
      '\nMake sure seed-test-users.ts has been run against the staging DB.',
    );
    return;
  }

  const data = await response.json();

  if (!data.access_token) {
    console.error(
      '[global-setup] Login failed: No access_token in response',
      JSON.stringify(data),
    );
    return;
  }

  console.log('[global-setup] Login OK — user:', data.user?.email);

  // Build session object matching Supabase localStorage format
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    token_type: 'bearer',
    user: data.user,
  };

  // Derive the Supabase localStorage key from project ref
  // Format: sb-<project-ref>-auth-token
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.warn('[global-setup] Cannot parse project ref from URL:', supabaseUrl);
    return;
  }

  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionValue = JSON.stringify(session);

  // Open a headless browser, navigate to app, inject session
  const browser = await chromium.launch({ args: ['--headless=new'] });
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  // Navigate to root so localStorage is on the right origin
  await page.goto('/en', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.evaluate(
    ([key, value]: [string, string]) => {
      localStorage.setItem(key, value);
    },
    [storageKey, sessionValue],
  );

  console.log('[global-setup] Session injected into localStorage — reloading page to trigger auth resolution...');

  // Reload page so Supabase AuthContext reads the injected token via getSession()
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for auth to resolve: token present + valid user.id
  await page.waitForFunction(() => {
    const keys = Object.keys(localStorage);
    const tokenKey = keys.find(k => k.includes('auth-token'));
    if (!tokenKey) return false;
    try {
      const session = JSON.parse(localStorage.getItem(tokenKey) || '{}');
      return !!(session?.access_token && session?.user?.id);
    } catch {
      return false;
    }
  }, { timeout: 15000 });

  console.log('[global-setup] Auth resolved — verifying authenticated state...');

  // Ensure .auth directory exists
  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });

  // Save storageState (includes localStorage + cookies)
  await context.storageState({ path: AUTH_STATE_PATH });
  await browser.close();

  console.log('[global-setup] storageState saved →', AUTH_STATE_PATH);
}

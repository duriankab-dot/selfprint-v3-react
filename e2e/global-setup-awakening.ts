/**
 * e2e/global-setup-awakening.ts
 *
 * Playwright Global Setup — Authenticate AWAKENING test user for MG-05-01
 *
 * This creates a separate storageState for the user with lifecycle = AWAKENING
 * so that MG-05-01 can test the Birth Ceremony (HologramBirth canvas) without
 * being recovery-redirected to /dashboard.
 *
 * Env vars required:
 *   E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY (same as global-setup.ts)
 *   E2E_AWAKENING_PASSWORD=... (password of test-phase-awakening@selfprint.one)
 *   STAGING_URL=https://staging.selfprint.one (optional, defaults to above)
 */

import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AWAKENING_AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user-awakening.json');

const PLACEHOLDER_STATE: Record<string, unknown> = { cookies: [], origins: [] };

/**
 * HTTP header / URL values must be ASCII (ByteString in the fetch spec).
 * Throws a descriptive error naming the variable and the offending code
 * point — never the value itself (secret).
 */
function assertHeaderSafe(name: string, value: string, usage: string): void {
  const chars = [...value];
  for (let i = 0; i < chars.length; i++) {
    const cp = chars[i].codePointAt(0)!;
    if (cp > 255) {
      throw new Error(
        `[global-setup-awakening] BLOCKED: ${name} contains a non-ASCII character at ` +
          `index ${i} (U+${cp.toString(16).toUpperCase().padStart(4, '0')}) in ${usage}. ` +
          `HTTP header/URL values must be ASCII — this usually comes from copy-paste ` +
          `corruption (e.g. a Thai/Unicode character slipped into the value). ` +
          `Fix the value in .env.e2e.staging and re-run.`,
      );
    }
  }
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const supabaseAnonKey = process.env.E2E_SUPABASE_ANON_KEY;
  const stagingURL =
    process.env.STAGING_URL ||
    'https://selfprint-staging.pages.dev';

  fs.mkdirSync(path.dirname(AWAKENING_AUTH_STATE_PATH), { recursive: true });

  // ── No staging credentials ────────────────────────────────────────────────
  if (!supabaseUrl || !supabaseAnonKey) {
    // For MG-05-01, we still write a placeholder so the project doesn't fail
    // at config evaluation time. The test itself will skip if credentials absent.
    fs.writeFileSync(AWAKENING_AUTH_STATE_PATH, JSON.stringify(PLACEHOLDER_STATE));
    console.log(
      '[global-setup-awakening] E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY not set — wrote logged-out placeholder storageState.',
    );
    return;
  }

  assertHeaderSafe('E2E_SUPABASE_URL', supabaseUrl, 'the Supabase token URL');
  assertHeaderSafe('E2E_SUPABASE_ANON_KEY', supabaseAnonKey, 'the apikey / Authorization header');
  assertHeaderSafe('STAGING_URL', stagingURL, 'the browser baseURL');

  console.log('[global-setup-awakening] Authenticating AWAKENING test user against:', supabaseUrl);

  // Use REST API directly (supports short-form keys: sb_publishable_*)
  const tokenUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test-phase-awakening@selfprint.one',
      password: process.env.E2E_AWAKENING_PASSWORD ?? '',
    }),
  });

  if (!response.ok) {
    const isPaused = response.status === 404;
    throw new Error(
      `[global-setup-awakening] BLOCKED: staging login failed — HTTP ${response.status}. ` +
        (isPaused
          ? 'Supabase Free-tier project is likely paused (API returns 404). Resume it via ' +
            'npm run supabase:resume -- <project-ref> and re-run.'
          : '') +
        'Make sure seed-test-users.ts has been run against the staging DB ' +
        'and E2E_AWAKENING_PASSWORD is correct. Not proceeding with stale/absent auth state.',
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(
      '[global-setup-awakening] BLOCKED: staging login succeeded (HTTP 200) but the response ' +
        'contains no access_token. Not proceeding with stale/absent auth state.',
    );
  }

  console.log('[global-setup-awakening] Login OK — user:', data.user?.email);

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
    throw new Error(
      '[global-setup-awakening] BLOCKED: cannot parse project ref from E2E_SUPABASE_URL.',
    );
  }

  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionValue = JSON.stringify(session);

  // Open a headless browser, navigate to app, inject session
  const browser = await chromium.launch({ args: ['--headless=new'] });
  const context = await browser.newContext({ baseURL: stagingURL });
  const page = await context.newPage();

  // Navigate to root so localStorage is on the right origin
  await page.goto('/en', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await page.evaluate(
    ([key, value]: [string, string]) => {
      localStorage.setItem(key, value);
    },
    [storageKey, sessionValue],
  );

  console.log('[global-setup-awakening] Session injected into localStorage — reloading page to trigger auth resolution...');

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

  console.log('[global-setup-awakening] Auth resolved — verifying authenticated state...');

  // Save storageState (includes localStorage + cookies)
  await context.storageState({ path: AWAKENING_AUTH_STATE_PATH });
  await browser.close();

  console.log('[global-setup-awakening] storageState saved →', AWAKENING_AUTH_STATE_PATH);
}
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
 *   E2E_TEST_PASSWORD=... (password of test-phase-b@selfprint.one)
 *
 * Deterministic project behaviour (PLAYWRIGHTCFG-002, 12 Sep 2026):
 *   chromium-staging is defined unconditionally in playwright.config.ts.
 *   This file is the single source of truth for the storage state file:
 *     - credentials present      → authenticate, save real session state
 *     - credentials absent  AND  a staging run was requested (via
 *       `--project=chromium-staging` on the CLI, or no project filter at all)
 *       → FAIL with a clear error instead of silently hiding the project
 *     - credentials absent  AND  a Phase A-only run was requested
 *       (`--project=chromium`, `--project="Mobile Chrome"`, ...) → write a
 *       logged-out placeholder state and continue, so the project index
 *       never depends on file existence at config-evaluation time.
 *
 * ByteString guard (PLAYWRIGHTCFG-003, 12 Sep 2026):
 *   HTTP header values must be ASCII. A non-ASCII character — e.g. a Thai
 *   character pasted into E2E_SUPABASE_ANON_KEY by a chat/IME — makes `fetch`
 *   throw `Cannot convert argument to a ByteString ... character ... greater
 *   than 255`. We validate before calling fetch and report the variable name,
 *   the index and the code point WITHOUT printing the value.
 */

import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json');

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
        `[global-setup] BLOCKED: ${name} contains a non-ASCII character at ` +
          `index ${i} (U+${cp.toString(16).toUpperCase().padStart(4, '0')}) in ${usage}. ` +
          `HTTP header/URL values must be ASCII — this usually comes from copy-paste ` +
          `corruption (e.g. a Thai/Unicode character slipped into the value). ` +
          `Fix the value in .env.e2e.staging and re-run.`,
      );
    }
  }
}

/**
 * Decide whether the current run is going to execute chromium-staging.
 * config.argv is the runner process argv (see FullConfig.argv).
 * - No `--project` filter at all → the default full suite includes staging.
 * - A `--project` filter that names chromium-staging → staging requested.
 */
function isStagingRequested(argv: string[]): boolean {
  if (process.env.E2E_STAGING_RUN === '1') return true;
  let sawProjectFilter = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--project=')) {
      sawProjectFilter = true;
      const projects = arg.slice('--project='.length).split(',');
      if (projects.includes('chromium-staging')) return true;
    } else if (arg === '--project' && i + 1 < argv.length) {
      sawProjectFilter = true;
      const projects = argv[i + 1].split(',');
      if (projects.includes('chromium-staging')) return true;
      i++; // skip the value token
    } else if (arg === '--config' && i + 1 < argv.length) {
      i++; // skip config path token
    }
  }
  // Default run (no filter) still executes every project, staging included.
  return !sawProjectFilter;
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const supabaseAnonKey = process.env.E2E_SUPABASE_ANON_KEY;
  const stagingURL =
    process.env.STAGING_URL ||
    'https://staging.selfprint.one';

  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });

  // ── No staging credentials ────────────────────────────────────────────────
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isStagingRequested(config.argv)) {
      throw new Error(
        '[global-setup] BLOCKED: Phase B (chromium-staging) was requested, but ' +
          'E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY are not set. ' +
          'Point E2E_SUPABASE_URL and E2E_SUPABASE_ANON_KEY at the staging Supabase ' +
          'project (.env.e2e.staging), seed the users (npm run seed:test-users), then ' +
          're-run. Phase A smoke tests only need `--project=chromium`.',
      );
    }
    // Phase A-only run: keep project index stable with a logged-out state.
    fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify(PLACEHOLDER_STATE));
    console.log(
      '[global-setup] E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY not set and ' +
        'Phase B was not requested — wrote logged-out placeholder storageState. ' +
        'Phase A tests run normally.',
    );
    return;
  }

  assertHeaderSafe('E2E_SUPABASE_URL', supabaseUrl, 'the Supabase token URL');
  assertHeaderSafe('E2E_SUPABASE_ANON_KEY', supabaseAnonKey, 'the apikey / Authorization header');
  assertHeaderSafe('STAGING_URL', stagingURL, 'the browser baseURL');

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
    const isPaused = response.status === 404;
    throw new Error(
      `[global-setup] BLOCKED: staging login failed — HTTP ${response.status}. ` +
        (isPaused
          ? 'Supabase Free-tier project is likely paused (API returns 404). Resume it via ' +
            'npm run supabase:resume -- <project-ref> and re-run.'
          : '') +
        'Make sure seed-test-users.ts has been run against the staging DB ' +
        'and E2E_TEST_PASSWORD is correct. Not proceeding with stale/absent auth state.',
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(
      '[global-setup] BLOCKED: staging login succeeded (HTTP 200) but the response ' +
        'contains no access_token. Not proceeding with stale/absent auth state.',
    );
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
    throw new Error(
      '[global-setup] BLOCKED: cannot parse project ref from E2E_SUPABASE_URL.',
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

  // Save storageState (includes localStorage + cookies)
  await context.storageState({ path: AUTH_STATE_PATH });
  await browser.close();

  console.log('[global-setup] storageState saved →', AUTH_STATE_PATH);
}
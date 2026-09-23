/**
 * e2e/global-setup-combined.ts
 *
 * Combined Playwright Global Setup — Authenticates both test users:
 * 1. test-phase-b@selfprint.one (TWIN_ALIVE) — for all Phase B tests
 * 2. test-phase-awakening@selfprint.one (AWAKENING) — for MG-05-01 Birth Ceremony
 *
 * This replaces the individual global-setup.ts and global-setup-awakening.ts
 * to satisfy Playwright's single globalSetup constraint.
 */

import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json');
export const AWAKENING_AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user-awakening.json');

const PLACEHOLDER_STATE: Record<string, unknown> = { cookies: [], origins: [] };

// --- Load .env.e2e.staging (local development) ---------------------------
// Mirrors scripts/seed-test-users.ts:31-48 and e2e/run-staging.mjs:18-36
// This ensures global setup has access to E2E_* variables when invoked
// directly via `npx playwright test` without the run-staging.mjs wrapper.
const envFile = path.join(__dirname, '..', '.env.e2e.staging');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();
      if (key && !process.env[key]) process.env[key] = value;
    }
  });
}

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
        `[global-setup-combined] BLOCKED: ${name} contains a non-ASCII character at ` +
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
      if (projects.includes('chromium-staging') || projects.includes('chromium-staging-awakening')) return true;
    } else if (arg === '--project' && i + 1 < argv.length) {
      sawProjectFilter = true;
      const projects = argv[i + 1].split(',');
      if (projects.includes('chromium-staging') || projects.includes('chromium-staging-awakening')) return true;
      i++; // skip the value token
    } else if (arg === '--config' && i + 1 < argv.length) {
      i++; // skip config path token
    }
  }
  // Default run (no filter) still executes every project, staging included.
  return !sawProjectFilter;
}

async function authenticateUser(
  email: string,
  password: string,
  supabaseUrl: string,
  supabaseAnonKey: string,
  stagingURL: string,
  authStatePath: string,
  label: string,
): Promise<void> {
  console.log(`[${label}] Authenticating test user against:`, supabaseUrl);

  const tokenUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const isPaused = response.status === 404;
    throw new Error(
      `[${label}] BLOCKED: staging login failed — HTTP ${response.status}. ` +
        (isPaused
          ? 'Supabase Free-tier project is likely paused (API returns 404). Resume it via ' +
            'npm run supabase:resume -- <project-ref> and re-run.'
          : '') +
        `Make sure seed-test-users.ts has been run against the staging DB ` +
        `and password is correct. Not proceeding with stale/absent auth state.`,
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error(
      `[${label}] BLOCKED: staging login succeeded (HTTP 200) but the response ` +
        `contains no access_token. Not proceeding with stale/absent auth state.`,
    );
  }

  console.log(`[${label}] Login OK — user:`, data.user?.email);

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
      `[${label}] BLOCKED: cannot parse project ref from E2E_SUPABASE_URL.`,
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

  console.log(`[${label}] Session injected into localStorage — reloading page to trigger auth resolution...`);

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

  console.log(`[${label}] Auth resolved — verifying authenticated state...`);

  // Save storageState (includes localStorage + cookies)
  await context.storageState({ path: authStatePath });
  await browser.close();

  console.log(`[${label}] storageState saved →`, authStatePath);
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const supabaseAnonKey = process.env.E2E_SUPABASE_ANON_KEY;
  const stagingURL =
    process.env.STAGING_URL ||
    'https://selfprint-staging.pages.dev';

  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });
  fs.mkdirSync(path.dirname(AWAKENING_AUTH_STATE_PATH), { recursive: true });

  // ── No staging credentials ────────────────────────────────────────────────
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isStagingRequested(config.argv)) {
      throw new Error(
        '[global-setup-combined] BLOCKED: Phase B (chromium-staging / chromium-staging-awakening) was requested, but ' +
          'E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY are not set. ' +
          'Point E2E_SUPABASE_URL and E2E_SUPABASE_ANON_KEY at the staging Supabase ' +
          'project (.env.e2e.staging), seed the users (npm run seed:test-users), then ' +
          're-run. Phase A smoke tests only need `--project=chromium`.',
      );
    }
    // Phase A-only run: keep project index stable with a logged-out state.
    fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify(PLACEHOLDER_STATE));
    fs.writeFileSync(AWAKENING_AUTH_STATE_PATH, JSON.stringify(PLACEHOLDER_STATE));
    console.log(
      '[global-setup-combined] E2E_SUPABASE_URL / E2E_SUPABASE_ANON_KEY not set and ' +
        'Phase B was not requested — wrote logged-out placeholder storageState for both users. ' +
        'Phase A tests run normally.',
    );
    return;
  }

  assertHeaderSafe('E2E_SUPABASE_URL', supabaseUrl, 'the Supabase token URL');
  assertHeaderSafe('E2E_SUPABASE_ANON_KEY', supabaseAnonKey, 'the apikey / Authorization header');
  assertHeaderSafe('STAGING_URL', stagingURL, 'the browser baseURL');

  // ── Authenticate main TWIN_ALIVE user (test-phase-b) ──────────────────────
  const mainPassword = process.env.E2E_TEST_PASSWORD ?? '';
  if (!mainPassword) {
    throw new Error(
      '[global-setup-combined] BLOCKED: E2E_TEST_PASSWORD not set for test-phase-b@selfprint.one',
    );
  }
  await authenticateUser(
    'test-phase-b@selfprint.one',
    mainPassword,
    supabaseUrl,
    supabaseAnonKey,
    stagingURL,
    AUTH_STATE_PATH,
    'global-setup-combined:TWIN_ALIVE',
  );

  // ── Authenticate AWAKENING user (test-phase-awakening) for MG-05-01 ───────
  const awakeningPassword = process.env.E2E_AWAKENING_PASSWORD ?? '';
  if (!awakeningPassword) {
    throw new Error(
      '[global-setup-combined] BLOCKED: E2E_AWAKENING_PASSWORD not set for test-phase-awakening@selfprint.one',
    );
  }
  await authenticateUser(
    'test-phase-awakening@selfprint.one',
    awakeningPassword,
    supabaseUrl,
    supabaseAnonKey,
    stagingURL,
    AWAKENING_AUTH_STATE_PATH,
    'global-setup-combined:AWAKENING',
  );
}
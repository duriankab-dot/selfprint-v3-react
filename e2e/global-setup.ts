/**
 * e2e/global-setup.ts
 *
 * Playwright Global Setup - Authenticate test user before Phase B tests
 *
 * Flow:
 *   1. signInWithPassword via Supabase anon client (staging DB)
 *   2. Inject session into browser localStorage
 *   3. Save storageState to e2e/.auth/user.json
 *
 * Env vars required:
 *   E2E_SUPABASE_URL=https://your-staging.supabase.co
 *   E2E_SUPABASE_ANON_KEY=your-staging-anon-key
 *   STAGING_URL=https://staging.selfprint.one
 */

import { chromium, type FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

export const AUTH_STATE_PATH = path.join(__dirname, '.auth', 'user.json');

export default async function globalSetup(_config: FullConfig): Promise<void> {
  const supabaseUrl = process.env.E2E_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.E2E_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const baseURL = process.env.STAGING_URL || process.env.BASE_URL || 'https://staging.selfprint.one';

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
    password: 'Test@PhaseB123!',
  });

  if (error || !data.session) {
    console.error(
      '[global-setup] Login failed:', error?.message || 'No session returned',
      'Run seed-test-users.ts against staging DB first.',
    );
    return;
  }

  console.log('[global-setup] Login OK:', data.session.user.email);

  // Derive localStorage key from Supabase project ref
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.warn('[global-setup] Cannot parse project ref from URL:', supabaseUrl);
    return;
  }

  const storageKey = 'sb-' + projectRef + '-auth-token';
  const sessionValue = JSON.stringify(data.session);

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto('/en', { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    ([key, value]) => { localStorage.setItem(key, value); },
    [storageKey, sessionValue],
  );

  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });
  await context.storageState({ path: AUTH_STATE_PATH });
  await browser.close();

  console.log('[global-setup] storageState saved to', AUTH_STATE_PATH);
}

/**
 * e2e/run-staging.mjs
 *
 * Cross-platform runner for Phase B staging E2E tests.
 * Loads .env.e2e.staging into process.env, then spawns
 * `npx playwright test --project=chromium-staging` via shell
 * (shell:true lets Windows resolve npx.cmd correctly — the
 * `node --env-file=... node_modules/.bin/playwright.cmd` approach
 * fails because node tries to execute the .cmd batch file as JS).
 */

import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.e2e.staging');

if (!existsSync(envPath)) {
  console.error(`[run-staging] Missing ${envPath}`);
  process.exit(1);
}

const envFile = readFileSync(envPath, 'utf-8');
const env = { ...process.env };

for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  env[key] = value;
}

console.log('[run-staging] Loaded env from .env.e2e.staging, STAGING_URL =', env.STAGING_URL);

const result = spawnSync('npx', ['playwright', 'test', '--project=chromium-staging'], {
  stdio: 'inherit',
  shell: true,
  env,
  cwd: path.join(__dirname, '..'),
});

process.exit(result.status ?? 1);

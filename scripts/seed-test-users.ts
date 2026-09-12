/**
 * scripts/seed-test-users.ts
 *
 * Seeds test users + profiles + twins into STAGING Supabase for Phase B E2E.
 *
 * FIXES (audit 2026-09-11):
 *  - SEED-001: reads credentials from `.env.e2e.staging` (never hardcode in source)
 *  - SEED-002: uses auth.admin.createUser({ email_confirm: true }) so test users
 *              can actually sign in (client-side signUp left them unconfirmed)
 *  - SEED-003: writes profiles to `selfprint.users_profiles` (migration 002) via
 *              `.schema('selfprint')` — `public.profiles` does not exist (PGRST205)
 *  - SEED-004: writes twins to `public.twins` (migration 024)
 *  - SEED-005: no out-of-scope variable (`signInData`) — TS2304 fixed
 *
 * Usage:
 *   npx ts-node scripts/seed-test-users.ts
 *   npx ts-node scripts/seed-test-users.ts --clean   (delete test users before seeding)
 *
 * Required (in `.env.e2e.staging`):
 *   SUPABASE_URL / E2E_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (full service-role JWT) or E2E_SUPABASE_SECRET_KEY
 *
 * ⚠️  Safety: refuses URLs containing selfprint.one unless "staging" is present.
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// --- Load .env.e2e.staging (local development) ---------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

// --- Config ---------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.E2E_SUPABASE_URL;
// SEED-006: prefer the short-form `sb_secret_*` key — verified working against
// staging 2026-09-11. The full-JWT `SUPABASE_SERVICE_ROLE_KEY` in .env.e2e.staging
// is redacted/corrupt and returns "Invalid API key" from the admin endpoints.
const SERVICE_ROLE_KEY =
  process.env.E2E_SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.\n' +
      '   Set them in .env.e2e.staging (see README / docs/STAGING_SETUP_GUIDE_TH.md).',
  );
  process.exit(1);
}

if (SUPABASE_URL.includes('selfprint.one') && !SUPABASE_URL.includes('staging')) {
  console.error('❌ Safety check failed: SUPABASE_URL looks like production. Use staging DB only.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// --- Test users ----------------------------------------------------------

const TEST_USERS = [
  { email: 'test-phase-b@selfprint.one', name: 'Test User Phase B', stage: 'active' },
  { email: 'test-voice@selfprint.one', name: 'Test Voice User', stage: 'onboarding_voice' },
  { email: 'test-twin@selfprint.one', name: 'Test Twin User', stage: 'active' },
  { email: 'tech-buddy@selfprint.one', name: 'Tech Buddy', stage: 'active' },
  { email: 'mindful-leader@selfprint.one', name: 'Mindful Leader', stage: 'active' },
  { email: 'creative@selfprint.one', name: 'Creative User', stage: 'active' },
] as const;

/** Password for each test user — read from env (E2EPW-001: never hardcode). */
const TEST_PASSWORD_ENV: Record<string, string> = {
  'test-phase-b@selfprint.one': 'E2E_TEST_PASSWORD',
  'test-voice@selfprint.one': 'E2E_VOICE_PASSWORD',
  'test-twin@selfprint.one': 'E2E_TWIN_PASSWORD',
  'tech-buddy@selfprint.one': 'E2E_TECHBUDDY_PASSWORD',
  'mindful-leader@selfprint.one': 'E2E_MINDFULLEADER_PASSWORD',
  'creative@selfprint.one': 'E2E_CREATIVE_PASSWORD',
};

function passwordOf(email: string): string {
  const envName = TEST_PASSWORD_ENV[email];
  const value = envName ? process.env[envName] : undefined;
  if (!value) {
    console.error(`❌ Missing env var ${envName} for ${email} — set it in .env.e2e.staging`);
    process.exit(1);
  }
  return value;
}

// --- Helpers ---------------------------------------------------------------

async function deleteTestUsers(): Promise<void> {
  console.log('🧹 Cleaning existing test users...');
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) {
    console.error(`  ❌ listUsers failed: ${error.message}`);
    return;
  }
  for (const user of data?.users ?? []) {
    if (user.email && user.email.endsWith('@selfprint.one')) {
      const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
      console.log(`  🗑️  ${delError ? `FAILED ${delError.message}` : `Deleted: ${user.email}`}`);
    }
  }
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) return null;
  return data?.users?.find((u) => u.email === email)?.id ?? null;
}

async function seedAuthUser(email: string, password: string): Promise<string | null> {
  const existingId = await findUserIdByEmail(email);

  if (existingId) {
    // SEED-002: make sure the user is email-confirmed and has the expected
    // password so signInWithPassword works for Phase B tests.
    const { error: updError } = await supabase.auth.admin.updateUserById(existingId, {
      email_confirm: true,
      password,
    });
    console.log(`  ⚠️  User exists, ensured confirmed + password${updError ? ` (${updError.message})` : ''}`);
    return existingId;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email.split('@')[0] },
  });

  if (error) {
    // Race: another process created it between list and create.
    const racedId = await findUserIdByEmail(email);
    if (racedId) {
      console.log(`  ⚠️  Created concurrently, using existing: ${email}`);
      return racedId;
    }
    console.error(`  ❌ Auth error for ${email}: ${error.message}`);
    return null;
  }

  console.log(`  ✅ Auth user created + confirmed: ${email}`);
  return data.user?.id ?? null;
}

async function upsertProfile(userId: string, user: (typeof TEST_USERS)[number]): Promise<void> {
  // SEED-003: real table is selfprint.users_profiles (migration 002), keyed by user_id.
  // (selfprint.users_profiles.id is a surrogate key — not the auth uid.)
  const { error } = await supabase
    .schema('selfprint')
    .from('users_profiles')
    .upsert(
      { user_id: userId, initial_mood: 'calm' },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.log(`  ⚠️  Profile warning for ${user.email}: ${error.message}`);
  } else {
    console.log(`  ✅ Profile ready: ${user.email}`);
  }
}

async function seedTwin(userId: string, user: (typeof TEST_USERS)[number]): Promise<void> {
  if (user.stage !== 'active') return; // only active-stage users get a twin
  // SEED-004: twins live in public.twins (migration 024) — no schema prefix.
  const { error } = await supabase
    .from('twins')
    .upsert(
      {
        user_id: userId,
        name: `Digital Twin (${user.name})`,
        personality_type: 'test',
      },
      { onConflict: 'user_id' },
    );
  console.log(`  ${error ? `⚠️  Twin warning: ${error.message}` : `✅ Twin ready: ${user.name}`}`);
}

// --- Main ------------------------------------------------------------------

async function main(): Promise<void> {
  const isClean = process.argv.includes('--clean');

  console.log('\n🌱 Selfprint Staging — Seed Test Users');
  console.log(`📡 DB: ${SUPABASE_URL}`);
  console.log(`🔄 Mode: ${isClean ? 'clean + seed' : 'seed (upsert)'}\n`);

  if (isClean) await deleteTestUsers();

  let successCount = 0;
  let failCount = 0;

  for (const user of TEST_USERS) {
    console.log(`👤 Seeding: ${user.email}`);
    const password = passwordOf(user.email);
    const userId = await seedAuthUser(user.email, password);

    if (userId) {
      await upsertProfile(userId, user);
      await seedTwin(userId, user);
      successCount++;
    } else {
      failCount++;
    }
    console.log('');
  }

  console.log('─────────────────────────────────────');
  console.log(`✅ Users processed: ${successCount}`);
  if (failCount > 0) console.log(`❌ Failed:  ${failCount}`);
  console.log('\n📋 Test Credentials (from .env.e2e.staging):');
  TEST_USERS.forEach((u) => console.log(`  ${u.email} — password from ${TEST_PASSWORD_ENV[u.email]}`));
  console.log('\n🚀 Ready to run Phase B tests: npx playwright test --project=chromium-staging');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
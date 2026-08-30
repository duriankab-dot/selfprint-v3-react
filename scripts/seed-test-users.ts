/**
 * scripts/seed-test-users.ts
 *
 * Staging Environment Seeding Script
 * สร้าง test users + profiles + twins สำหรับ Phase B integration testing
 *
 * Usage:
 *   npx ts-node scripts/seed-test-users.ts
 *   npx ts-node scripts/seed-test-users.ts --clean
 *
 * Env vars required:
 *   SUPABASE_URL=https://your-staging.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *
 * Warning: Do NOT run against production DB
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

if (SUPABASE_URL.includes('selfprint.one') && !SUPABASE_URL.includes('staging')) {
  console.error('Safety check failed: SUPABASE_URL looks like production. Use staging DB only.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_USERS = [
  {
    email: 'test-phase-b@selfprint.one',
    password: 'Test@PhaseB123!',
    name: 'Test User Phase B',
    metadata: { stage: 'active', onboardingComplete: true },
    profile: { full_name: 'Test User Phase B', stage: 'active', onboarding_complete: true },
    createTwin: true,
    twinName: 'Digital Twin (Test Phase B)',
  },
  {
    email: 'test-voice@selfprint.one',
    password: 'Test@Voice123!',
    name: 'Test Voice User',
    metadata: { stage: 'onboarding_voice', onboardingComplete: false },
    profile: { full_name: 'Test Voice User', stage: 'onboarding_voice', onboarding_complete: false },
    createTwin: false,
  },
  {
    email: 'test-twin@selfprint.one',
    password: 'Test@Twin123!',
    name: 'Test Twin User',
    metadata: { stage: 'active', onboardingComplete: true },
    profile: { full_name: 'Test Twin User', stage: 'active', onboarding_complete: true },
    createTwin: true,
    twinName: 'Digital Twin (Test Twin User)',
  },
  {
    email: 'tech-buddy@selfprint.one',
    password: 'Test@TechBuddy123!',
    name: 'Tech Buddy',
    metadata: { stage: 'active', onboardingComplete: true },
    profile: { full_name: 'Tech Buddy', stage: 'active', onboarding_complete: true },
    createTwin: true,
    twinName: 'Digital Twin (Tech Buddy)',
  },
  {
    email: 'mindful-leader@selfprint.one',
    password: 'Test@Leader123!',
    name: 'Mindful Leader',
    metadata: { stage: 'active', onboardingComplete: true },
    profile: { full_name: 'Mindful Leader', stage: 'active', onboarding_complete: true },
    createTwin: true,
    twinName: 'Digital Twin (Mindful Leader)',
  },
  {
    email: 'creative@selfprint.one',
    password: 'Test@Creative123!',
    name: 'Creative User',
    metadata: { stage: 'active', onboardingComplete: true },
    profile: { full_name: 'Creative User', stage: 'active', onboarding_complete: true },
    createTwin: true,
    twinName: 'Digital Twin (Creative)',
  },
] as const;

async function deleteTestUsers(): Promise<void> {
  console.log('Cleaning existing test users...');
  for (const user of TEST_USERS) {
    const { data } = await supabase.auth.admin.listUsers();
    const existing = data?.users?.find((u) => u.email === user.email);
    if (existing) {
      await supabase.auth.admin.deleteUser(existing.id);
      console.log('Deleted: ' + user.email);
    }
  }
}

async function seedUser(user: (typeof TEST_USERS)[number]): Promise<string | null> {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { ...user.metadata, full_name: user.name },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === user.email);
      if (existing) return existing.id;
    }
    console.error('Auth error for ' + user.email + ': ' + authError.message);
    return null;
  }

  const userId = authData.user?.id;
  if (!userId) return null;

  await supabase.from('profiles').upsert({
    id: userId,
    email: user.email,
    ...user.profile,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return userId;
}

async function seedTwin(userId: string, twinName: string): Promise<void> {
  const ALL_WORLDS = ['self','mind','relationship','love','career','wealth','life','growth','decision','purpose','wellbeing','future'];
  await supabase.from('twins').upsert({
    user_id: userId,
    name: twinName,
    stage: 1,
    awakened_at: new Date().toISOString(),
    personality: {
      archetype: 'test',
      sice: { selfAwareness: 0.85, impulseControl: 0.72, competence: 0.91, empathy: 0.78 },
      worlds: ALL_WORLDS,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

async function main(): Promise<void> {
  const isClean = process.argv.includes('--clean');
  console.log('Selfprint Staging - Seed Test Users');
  console.log('DB: ' + SUPABASE_URL);

  if (isClean) await deleteTestUsers();

  let successCount = 0;
  let failCount = 0;

  for (const user of TEST_USERS) {
    const userId = await seedUser(user);
    if (userId) {
      if (user.createTwin) await seedTwin(userId, user.twinName as string);
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('Success: ' + successCount + ' users');
  if (failCount > 0) console.log('Failed: ' + failCount + ' users');
  console.log('Ready to run Phase B tests:');
  console.log('  BASE_URL=https://staging.selfprint.one npm run test:e2e -- --project=chromium-staging');
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });

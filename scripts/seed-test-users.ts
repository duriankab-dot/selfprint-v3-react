/**
 * scripts/seed-test-users.ts
 *
 * Staging Environment Seeding Script
 * สร้าง test users + profiles + twins สำหรับ Phase B integration testing
 *
 * Usage:
 *   npx ts-node scripts/seed-test-users.ts
<<<<<<< HEAD
 *   npx ts-node scripts/seed-test-users.ts --clean   (ลบ test users ก่อน seed ใหม่)
 *
 * ต้องตั้ง env vars ก่อนรัน:
 *   SUPABASE_URL=https://your-staging.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *
 * ⚠️  ห้ามรันกับ production DB
=======
 *   npx ts-node scripts/seed-test-users.ts --clean
 *
 * Env vars required:
 *   SUPABASE_URL=https://your-staging.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 *
 * Warning: Do NOT run against production DB
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
 */

import { createClient } from '@supabase/supabase-js';

<<<<<<< HEAD
// --- Config -----------------------------------------------------------

=======
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
<<<<<<< HEAD
  console.error('❌ Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
=======
  console.error('Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
  process.exit(1);
}

if (SUPABASE_URL.includes('selfprint.one') && !SUPABASE_URL.includes('staging')) {
<<<<<<< HEAD
  console.error('❌ Safety check failed: SUPABASE_URL looks like production. Use staging DB only.');
=======
  console.error('Safety check failed: SUPABASE_URL looks like production. Use staging DB only.');
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

<<<<<<< HEAD
// --- Test Users -------------------------------------------------------

=======
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
const TEST_USERS = [
  {
    email: 'test-phase-b@selfprint.one',
    password: 'Test@PhaseB123!',
    name: 'Test User Phase B',
    metadata: { stage: 'active', onboardingComplete: true },
<<<<<<< HEAD
    profile: {
      full_name: 'Test User Phase B',
      stage: 'active',
      onboarding_complete: true,
    },
=======
    profile: { full_name: 'Test User Phase B', stage: 'active', onboarding_complete: true },
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    createTwin: true,
    twinName: 'Digital Twin (Test Phase B)',
  },
  {
    email: 'test-voice@selfprint.one',
    password: 'Test@Voice123!',
    name: 'Test Voice User',
    metadata: { stage: 'onboarding_voice', onboardingComplete: false },
<<<<<<< HEAD
    profile: {
      full_name: 'Test Voice User',
      stage: 'onboarding_voice',
      onboarding_complete: false,
    },
=======
    profile: { full_name: 'Test Voice User', stage: 'onboarding_voice', onboarding_complete: false },
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    createTwin: false,
  },
  {
    email: 'test-twin@selfprint.one',
    password: 'Test@Twin123!',
    name: 'Test Twin User',
    metadata: { stage: 'active', onboardingComplete: true },
<<<<<<< HEAD
    profile: {
      full_name: 'Test Twin User',
      stage: 'active',
      onboarding_complete: true,
    },
=======
    profile: { full_name: 'Test Twin User', stage: 'active', onboarding_complete: true },
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    createTwin: true,
    twinName: 'Digital Twin (Test Twin User)',
  },
  {
    email: 'tech-buddy@selfprint.one',
    password: 'Test@TechBuddy123!',
    name: 'Tech Buddy',
    metadata: { stage: 'active', onboardingComplete: true },
<<<<<<< HEAD
    profile: {
      full_name: 'Tech Buddy',
      stage: 'active',
      onboarding_complete: true,
    },
=======
    profile: { full_name: 'Tech Buddy', stage: 'active', onboarding_complete: true },
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    createTwin: true,
    twinName: 'Digital Twin (Tech Buddy)',
  },
  {
    email: 'mindful-leader@selfprint.one',
    password: 'Test@Leader123!',
    name: 'Mindful Leader',
    metadata: { stage: 'active', onboardingComplete: true },
<<<<<<< HEAD
    profile: {
      full_name: 'Mindful Leader',
      stage: 'active',
      onboarding_complete: true,
    },
=======
    profile: { full_name: 'Mindful Leader', stage: 'active', onboarding_complete: true },
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    createTwin: true,
    twinName: 'Digital Twin (Mindful Leader)',
  },
  {
    email: 'creative@selfprint.one',
    password: 'Test@Creative123!',
    name: 'Creative User',
    metadata: { stage: 'active', onboardingComplete: true },
<<<<<<< HEAD
    profile: {
      full_name: 'Creative User',
      stage: 'active',
      onboarding_complete: true,
    },
=======
    profile: { full_name: 'Creative User', stage: 'active', onboarding_complete: true },
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    createTwin: true,
    twinName: 'Digital Twin (Creative)',
  },
] as const;

<<<<<<< HEAD
// --- Helpers ----------------------------------------------------------

async function deleteTestUsers(): Promise<void> {
  console.log('🧹 Cleaning existing test users...');
=======
async function deleteTestUsers(): Promise<void> {
  console.log('Cleaning existing test users...');
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
  for (const user of TEST_USERS) {
    const { data } = await supabase.auth.admin.listUsers();
    const existing = data?.users?.find((u) => u.email === user.email);
    if (existing) {
      await supabase.auth.admin.deleteUser(existing.id);
<<<<<<< HEAD
      console.log(`  🗑️  Deleted: ${user.email}`);
=======
      console.log('Deleted: ' + user.email);
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    }
  }
}

async function seedUser(user: (typeof TEST_USERS)[number]): Promise<string | null> {
<<<<<<< HEAD
  // 1. Create auth user
=======
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { ...user.metadata, full_name: user.name },
  });

  if (authError) {
<<<<<<< HEAD
    // User already exists → get their ID
    if (authError.message.includes('already been registered')) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === user.email);
      if (existing) {
        console.log(`  ⚠️  User already exists, skipping auth: ${user.email}`);
        return existing.id;
      }
    }
    console.error(`  ❌ Auth error for ${user.email}:`, authError.message);
=======
    if (authError.message.includes('already been registered')) {
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === user.email);
      if (existing) return existing.id;
    }
    console.error('Auth error for ' + user.email + ': ' + authError.message);
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    return null;
  }

  const userId = authData.user?.id;
  if (!userId) return null;
<<<<<<< HEAD
  console.log(`  ✅ Auth user created: ${user.email} (${userId})`);

  // 2. Create/upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
=======

  await supabase.from('profiles').upsert({
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    id: userId,
    email: user.email,
    ...user.profile,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

<<<<<<< HEAD
  if (profileError) {
    console.warn(`  ⚠️  Profile upsert warning for ${user.email}:`, profileError.message);
  } else {
    console.log(`  ✅ Profile created: ${user.email}`);
  }

=======
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
  return userId;
}

async function seedTwin(userId: string, twinName: string): Promise<void> {
<<<<<<< HEAD
  const ALL_WORLDS = [
    'self', 'mind', 'relationship', 'love', 'career', 'wealth',
    'life', 'growth', 'decision', 'purpose', 'wellbeing', 'future',
  ];

  const { error } = await supabase.from('twins').upsert({
=======
  const ALL_WORLDS = ['self','mind','relationship','love','career','wealth','life','growth','decision','purpose','wellbeing','future'];
  await supabase.from('twins').upsert({
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
    user_id: userId,
    name: twinName,
    stage: 1,
    awakened_at: new Date().toISOString(),
    personality: {
      archetype: 'test',
<<<<<<< HEAD
      sice: {
        selfAwareness: 0.85,
        impulseControl: 0.72,
        competence: 0.91,
        empathy: 0.78,
      },
=======
      sice: { selfAwareness: 0.85, impulseControl: 0.72, competence: 0.91, empathy: 0.78 },
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
      worlds: ALL_WORLDS,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
<<<<<<< HEAD

  if (error) {
    console.warn(`  ⚠️  Twin upsert warning for userId ${userId}:`, error.message);
  } else {
    console.log(`  ✅ Twin created: "${twinName}"`);
  }
}

// --- Main -------------------------------------------------------------

async function main(): Promise<void> {
  const isClean = process.argv.includes('--clean');

  console.log('\n🌱 Selfprint Staging — Seed Test Users');
  console.log(`📡 DB: ${SUPABASE_URL}`);
  console.log(`🔄 Mode: ${isClean ? 'clean + seed' : 'seed (upsert)'}\n`);

  if (isClean) {
    await deleteTestUsers();
    console.log('');
  }
=======
}

async function main(): Promise<void> {
  const isClean = process.argv.includes('--clean');
  console.log('Selfprint Staging - Seed Test Users');
  console.log('DB: ' + SUPABASE_URL);

  if (isClean) await deleteTestUsers();
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78

  let successCount = 0;
  let failCount = 0;

  for (const user of TEST_USERS) {
<<<<<<< HEAD
    console.log(`👤 Seeding: ${user.email}`);
    const userId = await seedUser(user);

    if (userId) {
      if (user.createTwin) {
        await seedTwin(userId, user.twinName as string);
      }
=======
    const userId = await seedUser(user);
    if (userId) {
      if (user.createTwin) await seedTwin(userId, user.twinName as string);
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78
      successCount++;
    } else {
      failCount++;
    }
<<<<<<< HEAD
    console.log('');
  }

  console.log('─────────────────────────────────────');
  console.log(`✅ Success: ${successCount} users`);
  if (failCount > 0) console.log(`❌ Failed:  ${failCount} users`);
  console.log('\n📋 Test Credentials:');
  console.log('  Main:           test-phase-b@selfprint.one / Test@PhaseB123!');
  console.log('  Voice stage:    test-voice@selfprint.one / Test@Voice123!');
  console.log('  Twin created:   test-twin@selfprint.one / Test@Twin123!');
  console.log('  Tech Buddy:     tech-buddy@selfprint.one / Test@TechBuddy123!');
  console.log('  Mindful Leader: mindful-leader@selfprint.one / Test@Leader123!');
  console.log('  Creative:       creative@selfprint.one / Test@Creative123!');
  console.log('\n🚀 Ready to run Phase B tests!');
  console.log('   BASE_URL=https://staging.selfprint.one npm run test:e2e -- --project=chromium-staging');
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
=======
  }

  console.log('Success: ' + successCount + ' users');
  if (failCount > 0) console.log('Failed: ' + failCount + ' users');
  console.log('Ready to run Phase B tests:');
  console.log('  BASE_URL=https://staging.selfprint.one npm run test:e2e -- --project=chromium-staging');
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1); });
>>>>>>> 00aabc7ee6e56ed53c9acc2c6859e5f0d6763b78

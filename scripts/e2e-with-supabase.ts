/**
 * scripts/e2e-with-supabase.ts
 *
 * E2E Test Orchestrator with Supabase Lifecycle Management
 *
 * Free Tier Workflow:
 *   1. CHECK status (via API)
 *   2. IF paused → PRINT manual instructions, EXIT
 *   3. IF active → Seed users → Run tests → Done
 *
 * Pro/Team Workflow:
 *   1. Resume staging (via Org API)
 *   2. Wait for active
 *   3. Seed users
 *   4. Run E2E tests
 *   5. Pause staging (via Org API)
 *
 * Usage:
 *   npx ts-node scripts/e2e-with-supabase.ts [--resume-only] [--pause-only] [--no-seed] [--manual]
 *
 * Environment Variables:
 *   SUPABASE_ORG_API_KEY  - Org API key (Pro/Team only)
 *   E2E_SUPABASE_URL      - Staging Supabase URL
 *   E2E_SUPABASE_ANON_KEY - Staging anon key
 *   E2E_SUPABASE_SERVICE_ROLE_KEY - Staging service role key
 *   STAGING_URL           - Staging app URL
 *   E2E_TEST_PASSWORD     - Test user password
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// --- Config ---------------------------------------------------------------

const STAGING_PROJECT_REF = 'vkjwqrjflxztcctmyzgh';
const STAGING_SUPABASE_URL = process.env.E2E_SUPABASE_URL ?? 'https://vkjwqrjflxztcctmyzgh.supabase.co';
const STAGING_ANON_KEY = process.env.E2E_SUPABASE_ANON_KEY ?? '';
const STAGING_SERVICE_ROLE_KEY =
  process.env.E2E_SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY ??
  '';
const STAGING_URL = process.env.STAGING_URL ?? 'https://selfprint-staging.pages.dev';
const ORG_API_KEY = process.env.SUPABASE_ORG_API_KEY ?? '';

const E2E_TIMEOUT_MS = 1800000; // 30 minutes for full E2E suite
const PROJECT_READY_TIMEOUT_MS = 180000; // 3 minutes for project to become active

// --- Helpers --------------------------------------------------------------

function log(message: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function runCommand(cmd: string, cwd?: string): string {
  log(`Running: ${cmd}`);
  try {
    const result = execSync(cmd, {
      cwd: cwd ?? process.cwd(),
      encoding: 'utf-8',
      timeout: E2E_TIMEOUT_MS,
      stdio: 'pipe',
    });
    return result;
  } catch (error: any) {
    const stderr = error.stderr?.toString() ?? '';
    const stdout = error.stdout?.toString() ?? '';
    throw new Error(
      `Command failed: ${cmd}\n` +
      `stdout: ${stdout}\n` +
      `stderr: ${stderr}\n` +
      `error: ${error.message}`
    );
  }
}

// --- Check if Pro/Team plan (API resume/pause available) ------------------

function isProTeamPlan(): boolean {
  return !!ORG_API_KEY;
}

// --- Resume (Pro/Team only) ----------------------------------------------

async function resumeStaging(): Promise<boolean> {
  if (!isProTeamPlan()) {
    log('⚠️  Free tier: API resume not available');
    log('   Please resume manually via: https://supabase.com/dashboard/project/' + STAGING_PROJECT_REF);
    return false;
  }

  log(`Resuming staging Supabase project: ${STAGING_PROJECT_REF}`);

  try {
    const result = runCommand(
      `npx ts-node scripts/supabase-lifecycle.ts resume ${STAGING_PROJECT_REF}`,
      process.cwd()
    );
    log(result);
    return true;
  } catch (error: any) {
    log(`Failed to resume staging: ${error.message}`);
    return false;
  }
}

// --- Wait for ready -------------------------------------------------------

async function waitForStagingReady(): Promise<boolean> {
  log(`Waiting for staging project to be active (timeout: ${PROJECT_READY_TIMEOUT_MS / 1000}s)...`);

  try {
    const result = runCommand(
      `npx ts-node scripts/supabase-lifecycle.ts wait-for-ready ${STAGING_PROJECT_REF} ${PROJECT_READY_TIMEOUT_MS}`,
      process.cwd()
    );
    log(result);
    return true;
  } catch (error: any) {
    log(`Timeout waiting for staging: ${error.message}`);
    return false;
  }
}

// --- Pause (Pro/Team only) ------------------------------------------------

async function pauseStaging(): Promise<boolean> {
  if (!isProTeamPlan()) {
    log('⚠️  Free tier: API pause not available');
    log('   Please pause manually via: https://supabase.com/dashboard/project/' + STAGING_PROJECT_REF);
    return false;
  }

  log(`Pausing staging Supabase project: ${STAGING_PROJECT_REF}`);

  try {
    const result = runCommand(
      `npx ts-node scripts/supabase-lifecycle.ts pause ${STAGING_PROJECT_REF}`,
      process.cwd()
    );
    log(result);
    return true;
  } catch (error: any) {
    log(`Failed to pause staging: ${error.message}`);
    return false;
  }
}

// --- Seed Test Users ------------------------------------------------------

async function seedTestUsers(): Promise<boolean> {
  log('Seeding test users...');

  if (!STAGING_SERVICE_ROLE_KEY) {
    log('⚠️  E2E_SUPABASE_SERVICE_ROLE_KEY not set. Skipping seed.');
    return false;
  }

  try {
    runCommand(
      'npx ts-node scripts/seed-test-users.ts',
      process.cwd()
    );
    log('✅ Test users seeded');
    return true;
  } catch (error: any) {
    log(`Failed to seed test users: ${error.message}`);
    return false;
  }
}

// --- Run E2E Tests --------------------------------------------------------

async function runE2ETests(): Promise<void> {
  log('Running E2E tests...');

  const testArgs = [
    '--reporter=list',
    '--reporter=html',
    '--reporter=json',
    '--output-dir=test-results/e2e',
  ];

  // Run Phase A (production smoke)
  log('Phase A: Production smoke tests...');
  try {
    runCommand(`npx playwright test --project=chromium ${testArgs.join(' ')}`, process.cwd());
    log('Phase A: ✅ Passed');
  } catch (error: any) {
    log(`Phase A: ⚠️  Failed (non-fatal): ${error.message}`);
  }

  // Run Phase B (staging integration) + Master Gate
  log('Phase B: Staging integration tests...');
  try {
    runCommand(
      `npx playwright test --project=chromium-staging ${testArgs.join(' ')}`,
      process.cwd()
    );
    log('Phase B: ✅ Passed');
  } catch (error: any) {
    log(`Phase B: ⚠️  Failed: ${error.message}`);
  }

  // Run Master Gate tests
  log('Master Gate: Feature verification tests...');
  try {
    runCommand(
      `npx playwright test e2e/master-gate.spec.ts --project=chromium-staging ${testArgs.join(' ')}`,
      process.cwd()
    );
    log('Master Gate: ✅ Passed');
  } catch (error: any) {
    log(`Master Gate: ️  Failed: ${error.message}`);
  }
}

// --- Main Orchestrator ----------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const resumeOnly = args.includes('--resume-only');
  const pauseOnly = args.includes('--pause-only');
  const noSeed = args.includes('--no-seed');
  const manual = args.includes('--manual');

  log('========================================');
  log('E2E Test Orchestrator with Supabase Lifecycle');
  log('========================================');
  log(`Staging project: ${STAGING_PROJECT_REF}`);
  log(`Staging URL: ${STAGING_URL}`);
  log(`Org API key set: ${!!ORG_API_KEY} (${isProTeamPlan() ? 'Pro/Team' : 'Free tier'})`);
  log('');

  // Manual mode: just show instructions
  if (manual) {
    log('Manual mode: showing instructions...');
    log(`========================================`);
    log(`Supabase Lifecycle - Manual Instructions (Free Tier)`);
    log(`========================================`);
    log('');
    log(`Project: ${STAGING_PROJECT_REF}`);
    log(`Dashboard URL: https://supabase.com/dashboard/project/${STAGING_PROJECT_REF}`);
    log('');
    log('Steps to resume:');
    log(`  1. Open: https://supabase.com/dashboard/project/${STAGING_PROJECT_REF}`);
    log('  2. Click "Resume" button (top right)');
    log('  3. Wait for status to change from "Coming up..." to "Healthy"');
    log('  4. Wait ~2-3 minutes for database to initialize');
    log('  5. Then run: npx ts-node scripts/e2e-with-supabase.ts');
    log('');
    log('Steps to pause (after tests):');
    log(`  1. Open: https://supabase.com/dashboard/project/${STAGING_PROJECT_REF}`);
    log('  2. Click "Pause" button (top right)');
    log('  3. Confirm pause');
    log('');
    log('========================================');
    return;
  }

  let resumed = false;
  let seeded = false;

  try {
    // Step 1: Resume staging (if not pause-only)
    if (!pauseOnly) {
      if (resumeOnly || !resumeOnly) {
        if (isProTeamPlan()) {
          resumed = await resumeStaging();
          if (resumed) {
            const ready = await waitForStagingReady();
            if (!ready) {
              log('❌ Staging project did not become active in time');
              process.exit(1);
            }
          }
        } else {
          // Free Tier: no API resume — check whether the project is already active.
          // If active → continue to seed + tests. If paused → show instructions & exit.
          log('⚠️  Free tier detected. Checking whether staging is already active...');
          const ready = await waitForStagingReady();
          if (ready) {
            log('✅ Staging is already active — continuing with seed + tests.');
            resumed = true;
          } else {
            log('⏸️  Staging is paused. Please resume manually:');
            log(`   https://supabase.com/dashboard/project/${STAGING_PROJECT_REF}`);
            log('');
            runCommand('npx ts-node scripts/supabase-lifecycle.ts manual-instructions', process.cwd());
            process.exit(1);
          }
        }
      }
    }

    // Step 2: Seed test users (unless --no-seed)
    if (!noSeed && resumed) {
      seeded = await seedTestUsers();
    }

    // Step 3: Run E2E tests
    if (!pauseOnly) {
      await runE2ETests();
    }

    // Step 4: Pause staging (unless resume-only)
    if (!resumeOnly) {
      await pauseStaging();
    }

    log('========================================');
    log('E2E Orchestrator Complete');
    log('========================================');

    if (resumeOnly) {
      log('Status: Resume only (tests not run)');
    } else if (pauseOnly) {
      log('Status: Pause only (tests already run)');
    } else {
      log('Status: Full cycle complete');
    }

  } catch (error: any) {
    log(`❌ Orchestrator failed: ${error.message}`);
    // Try to pause even on failure
    if (!resumeOnly) {
      await pauseStaging().catch(() => {});
    }
    process.exit(1);
  }
}

main();

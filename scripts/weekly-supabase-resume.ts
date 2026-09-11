/**
 * scripts/weekly-supabase-resume.ts
 *
 * Weekly Supabase Project Auto-Resume Scheduler
 *
 * This script is designed to be run via:
 *   - Windows Task Scheduler (weekly, e.g., Sunday 2 AM)
 *   - cron (Linux/Mac, weekly)
 *   - GitHub Actions schedule trigger
 *
 * Purpose:
 *   Free tier Supabase projects get PAUSED after ~24h of inactivity.
 *   This script auto-resumes staging before the weekly test window
 *   so E2E tests can run without manual intervention.
 *
 * Schedule:
 *   Every Sunday at 2:00 AM (local time)
 *   Resume staging project
 *   Wait for it to be active
 *   Log status
 *
 * Usage:
 *   npx ts-node scripts/weekly-supabase-resume.ts
 *
 * Environment Variables:
 *   SUPABASE_ORG_ID       - Org ID (default: tinszgkapdezqdgbywiu)
 *   SUPABASE_ORG_API_KEY  - Org API Key (required)
 *   STAGING_PROJECT_REF   - Project ref to resume (default: vkjwqrjflxztcctmyzgh)
 */

import { createClient } from '@supabase/supabase-js';

// --- Config ---------------------------------------------------------------

const ORG_ID = process.env.SUPABASE_ORG_ID ?? 'tinszgkapdezqdgbywiu';
const ORG_API_KEY = process.env.SUPABASE_ORG_API_KEY;
const STAGING_PROJECT_REF = process.env.STAGING_PROJECT_REF ?? 'vkjwqrjflxztcctmyzgh';
const SUPABASE_API_BASE = 'https://api.supabase.com';

// --- Org API Client -------------------------------------------------------

async function orgApiRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<{ data: any; error: any }> {
  if (!ORG_API_KEY) {
    throw new Error('SUPABASE_ORG_API_KEY not set');
  }

  const url = `${SUPABASE_API_BASE}/org/${ORG_ID}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': ORG_API_KEY,
    'Authorization': `Bearer ${ORG_API_KEY}`,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return { data: null, error: { message: data?.message ?? response.statusText, status: response.status } };
  }

  return { data, error: null };
}

// --- Resume Project -------------------------------------------------------

async function resumeProject(projectRef: string): Promise<{ success: boolean; message: string }> {
  console.log(`[weekly-resume] Resuming project: ${projectRef}`);

  const { data, error } = await orgApiRequest('POST', `/projects/${projectRef}/resume`);

  if (error) {
    console.error(`[weekly-resume] Failed to resume ${projectRef}:`, error.message);
    return { success: false, message: error.message };
  }

  console.log(`[weekly-resume] ✅ Project ${projectRef} resumed`);
  return { success: true, message: 'Resumed' };
}

// --- Wait for Ready -------------------------------------------------------

async function waitForReady(projectRef: string, maxWaitMs = 180000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const { data, error } = await orgApiRequest('GET', `/projects/${projectRef}`);

    if (error) {
      console.warn(`[weekly-resume] Status check failed:`, error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }

    const status = data?.project?.status ?? 'unknown';

    if (status === 'active' || status === 'running') {
      console.log(`[weekly-resume] ✅ Project ${projectRef} is active`);
      return true;
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`[weekly-resume] ⏳ Project ${projectRef}: ${status} (${elapsed}s / ${maxWaitMs / 1000}s)`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.error(`[weekly-resume] ❌ Timeout waiting for ${projectRef}`);
  return false;
}

// --- Main -----------------------------------------------------------------

async function main() {
  console.log('========================================');
  console.log('Weekly Supabase Auto-Resume');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Org: ${ORG_ID}`);
  console.log(`Project: ${STAGING_PROJECT_REF}`);
  console.log(`Org API Key set: ${!!ORG_API_KEY}`);
  console.log('========================================');
  console.log('');

  if (!ORG_API_KEY) {
    console.error('❌ SUPABASE_ORG_API_KEY is not set.');
    console.error('   Get it from: Supabase Dashboard > Settings > API > Org API Key');
    console.error('   Set it in your environment or .env file.');
    process.exit(1);
  }

  // Resume staging
  const result = await resumeProject(STAGING_PROJECT_REF);

  if (!result.success) {
    console.error(`\n❌ Failed to resume project: ${result.message}`);
    process.exit(1);
  }

  // Wait for active
  const ready = await waitForReady(STAGING_PROJECT_REF);

  if (!ready) {
    console.error('\n❌ Project did not become active in time');
    process.exit(1);
  }

  console.log('\n✅ Weekly resume complete. Staging is ready for E2E tests.');
  console.log('   Next resume: Sunday 2:00 AM (local time)');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

/**
 * scripts/supabase-lifecycle.ts
 *
 * Supabase Project Lifecycle Management (Free Tier Compatible)
 *
 * IMPORTANT: On Free tier, resume/pause is NOT available via API.
 * Must be done manually via Supabase Dashboard:
 *   https://supabase.com/dashboard/project/{project-ref}
 *
 * This script provides:
 *   1. Status checking (works on Free tier)
 *   2. Manual resume/pause instructions
 *   3. Wait-for-ready (works once project is resumed)
 *   4. Integration with E2E orchestrator
 *
 * On Pro/Team plan, resume/pause API is available:
 *   POST /org/{org_id}/projects/{project_ref}/resume
 *   POST /org/{org_id}/projects/{project_ref}/pause
 *
 * Usage:
 *   npx ts-node scripts/supabase-lifecycle.ts status <project-ref>
 *   npx ts-node scripts/supabase-lifecycle.ts wait-for-ready <project-ref> [maxMs]
 *   npx ts-node scripts/supabase-lifecycle.ts manual-instructions
 *
 * Environment Variables:
 *   SUPABASE_ORG_API_KEY  - Org API Key (for Pro/Team plan resume/pause)
 *   SUPABASE_ORG_ID       - Org ID (optional)
 */

import { createClient } from '@supabase/supabase-js';

// --- Config ---------------------------------------------------------------

const ORG_ID = process.env.SUPABASE_ORG_ID ?? 'tinszgkapdezqdgbywiu';
const ORG_API_KEY = process.env.SUPABASE_ORG_API_KEY;
const SUPABASE_API_BASE = 'https://api.supabase.com';

// Project refs (from Supabase Dashboard)
const PROJECTS = {
  production: 'orxteuufqeohtpbwkqx',
  staging: 'vkjwqrjflxztcctmyzgh',
  duk: 'tinszgkapdezqdgbywiu',
};

// --- Supabase Org API Client ---------------------------------------------

async function orgApiRequest(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<{ data: any; error: any }> {
  if (!ORG_API_KEY) {
    throw new Error(
      'SUPABASE_ORG_API_KEY not set. Get it from: ' +
      'Supabase Dashboard > Settings > API > Org API Key'
    );
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

// --- Status Check --------------------------------------------------------

export async function getProjectStatus(projectRef: string): Promise<{ status: string; details?: any }> {
  const { data, error } = await orgApiRequest('GET', `/projects/${projectRef}`);

  if (error) {
    // Fallback: try direct project API
    return getProjectStatusDirect(projectRef);
  }

  const project = data?.project ?? data;
  return {
    status: project?.status ?? 'unknown',
    details: {
      status: project?.status,
      region: project?.region,
      compute: project?.compute?.plan ?? 'unknown',
      database_size: project?.database_size,
    },
  };
}

async function getProjectStatusDirect(projectRef: string): Promise<{ status: string; details?: any }> {
  // Direct project API (works on Free tier)
  const anonKey = process.env.E2E_SUPABASE_ANON_KEY;
  if (!anonKey) {
    return { status: 'unknown', details: { error: 'E2E_SUPABASE_ANON_KEY not set' } };
  }

  const url = `${process.env.E2E_SUPABASE_URL ?? `https://${projectRef}.supabase.co`}/rest/v1/`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    });

    if (response.ok) {
      return { status: 'active', details: { api_responsive: true } };
    } else if (response.status === 404 || response.status === 503) {
      return { status: 'paused', details: { api_responsive: false } };
    }

    return { status: 'unknown', details: { http_status: response.status } };
  } catch (error: any) {
    if (error.message?.includes('fetch failed') || error.message?.includes('could not be resolved')) {
      return { status: 'paused', details: { error: 'DNS/Network not available (project likely paused)' } };
    }
    return { status: 'unknown', details: { error: error.message } };
  }
}

// --- Wait for project to be ready ----------------------------------------

export async function waitForProjectReady(
  projectRef: string,
  maxWaitMs = 120000,
  pollIntervalMs = 5000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const status = await getProjectStatus(projectRef);

    if (status.status === 'active' || status.status === 'running') {
      console.log(`[lifecycle] ✅ Project ${projectRef} is active`);
      return true;
    }

    if (status.status === 'coming_up' || status.status === 'provisioning') {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`[lifecycle] ⏳ Project ${projectRef} is ${status.status} (${elapsed}s elapsed, waiting...)`);
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      continue;
    }

    if (status.status === 'paused') {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`[lifecycle] ️ Project ${projectRef} is paused (elapsed: ${elapsed}s). Resume manually via dashboard.`);
      return false;
    }

    console.warn(`[lifecycle] ⚠️ Project ${projectRef} status: ${status.status}`);
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  console.error(`[lifecycle] ❌ Timeout waiting for project ${projectRef} to become active`);
  return false;
}

// --- Manual Instructions -------------------------------------------------

export function printManualInstructions() {
  console.log(`
========================================
Supabase Lifecycle - Manual Instructions (Free Tier)
========================================

On Free tier, resume/pause is NOT available via API.
You must do it manually via the Supabase Dashboard.

Project: ${PROJECTS.staging}
Dashboard URL: https://supabase.com/dashboard/project/${PROJECTS.staging}

Steps to resume:
  1. Open: https://supabase.com/dashboard/project/${PROJECTS.staging}
  2. Click "Resume" button (top right)
  3. Wait for status to change from "Coming up..." to "Healthy"
  4. Wait ~2-3 minutes for database to initialize
  5. Then run: npx ts-node scripts/e2e-with-supabase.ts

Steps to pause (after tests):
  1. Open: https://supabase.com/dashboard/project/${PROJECTS.staging}
  2. Click "Pause" button (top right)
  3. Confirm pause

Project: ${PROJECTS.production}
Dashboard URL: https://supabase.com/dashboard/project/${PROJECTS.production}

========================================
Alternative: Upgrade to Pro/Team plan
========================================

On Pro/Team plan, resume/pause IS available via API:
  POST /org/{org_id}/projects/{project_ref}/resume
  POST /org/{org_id}/projects/{project_ref}/pause

This enables automated lifecycle management in:
  - scripts/supabase-lifecycle.ts
  - scripts/e2e-with-supabase.ts
  - scripts/weekly-supabase-resume.ts

========================================
`);
}

// --- Main CLI ------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || args.length < 2) {
    if (command === 'manual-instructions') {
      printManualInstructions();
      return; // exit 0
    }
    printUsage();
    process.exit(1);
  }

  const projectRef = args[1];

  switch (command) {
    case 'status':
      const status = await getProjectStatus(projectRef);
      console.log(`Project ${projectRef}:`, JSON.stringify(status, null, 2));
      break;

    case 'wait-for-ready': {
      const maxWait = parseInt(args[2] ?? '120000');
      const ready = await waitForProjectReady(projectRef, maxWait);
      if (!ready) {
        console.log('\n💡 Manual resume required:');
        printManualInstructions();
      }
      process.exit(ready ? 0 : 1);
      break;
    }

    case 'manual-instructions':
      printManualInstructions();
      return; // exit 0 — critical for orchestrator subprocess calls
      break;

    case 'resume':
      console.error('❌ Resume via API not available on Free tier');
      console.error('   Please resume manually via: https://supabase.com/dashboard/project/' + projectRef);
      process.exit(1);
      break;

    case 'pause':
      console.error('❌ Pause via API not available on Free tier');
      console.error('   Please pause manually via: https://supabase.com/dashboard/project/' + projectRef);
      process.exit(1);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

function printUsage() {
  console.log(`
Supabase Lifecycle Management (Free Tier Compatible)

Usage:
  npx ts-node scripts/supabase-lifecycle.ts <command> [project-ref] [options]

Commands:
  status <ref>          Check project status (works on Free tier)
  wait-for-ready <ref> [maxMs]  Wait until project is active
  manual-instructions   Show manual resume/pause instructions

Environment Variables:
  SUPABASE_ORG_ID       Org ID (default: tinszgkapdezqdgbywiu)
  SUPABASE_ORG_API_KEY  Org API Key (for Pro/Team plan only)
  E2E_SUPABASE_URL      Staging Supabase URL
  E2E_SUPABASE_ANON_KEY Staging anon key

Project Refs:
  production: orxteuufqeohtpbwkqx (ap-northeast-1) - PAUSED on Free tier
  staging:    vkjwqrjflxztcctmyzgh (ap-northeast-2) - PAUSED on Free tier
  duk:        tinszgkapdezqdgbywiu (ap-southeast-1) - PAUSED on Free tier

IMPORTANT: On Free tier, resume/pause must be done manually via Dashboard.
See: npx ts-node scripts/supabase-lifecycle.ts manual-instructions
`);
}

main().catch(err => {
  console.error('[lifecycle] Fatal error:', err);
  process.exit(1);
});

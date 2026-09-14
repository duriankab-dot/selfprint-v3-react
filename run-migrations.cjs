#!/usr/bin/env node

/**
 * run-migrations.js — Run all Supabase migrations for staging
 *
 * Usage:
 *   node run-migrations.js
 *
 * Requirements:
 *   - supabase-cli installed: https://supabase.com/docs/guides/cli
 *   - Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SECRET_KEY
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Configuration ────────────────────────────────────────────────────────────

const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'vkjwqrjflxztcctmyzgh';

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function runCommand(cmd) {
  log(`Running: ${cmd}`);
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    if (output) log(`Output: ${output.trim()}`);
    return true;
  } catch (err) {
    log(`Error: ${err.message}`);
    return false;
  }
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Sort alphabetically (001_..., 002_..., etc.)

  log(`Found ${files.length} migration files in ${MIGRATIONS_DIR}`);
  return files;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('Starting Supabase migrations...');

  // Check if supabase-cli is installed
  const hasSupabase = runCommand('supabase --version');
  if (!hasSupabase) {
    log('ERROR: supabase-cli not installed. Install from: https://supabase.com/docs/guides/cli');
    process.exit(1);
  }

  // Get migration files
  const files = getMigrationFiles();
  if (files.length === 0) {
    log('No migration files found!');
    process.exit(1);
  }

  // Check environment variables
  if (!process.env.SUPABASE_URL) {
    log('ERROR: SUPABASE_URL not set');
    process.exit(1);
  }
  if (!process.env.SUPABASE_SECRET_KEY) {
    log('ERROR: SUPABASE_SECRET_KEY not set');
    process.exit(1);
  }

  // Login to Supabase (skip if Docker not running)
  log('Verifying Supabase connection...');
  try {
    const statusOutput = execSync('supabase status', { encoding: 'utf-8', stdio: 'pipe' });
    log(`Status: ${statusOutput.trim()}`);
  } catch (err) {
    // Docker not running or not needed for db push — continue
    log('Note: Docker not available, proceeding with db push directly');
  }

  // Run migrations one by one
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    log(`Running: ${file}`);

    const cmd = `supabase db push --project-ref ${SUPABASE_PROJECT_REF} --file ${filePath}`;
    const result = runCommand(cmd);

    if (result) {
      successCount++;
    } else {
      failCount++;
      log(`WARNING: Failed to run ${file} - continuing with next migration`);
    }
  }

  // Summary
  log('');
  log('='.repeat(60));
  log('Migration Summary');
  log('='.repeat(60));
  log(`Total: ${files.length}`);
  log(`Success: ${successCount}`);
  log(`Failed: ${failCount}`);
  log('='.repeat(60));

  if (failCount > 0) {
    log('WARNING: Some migrations failed. Check logs above for details.');
    process.exit(1);
  } else {
    log('All migrations completed successfully!');
  }
}

main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});

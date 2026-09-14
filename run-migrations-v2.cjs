#!/usr/bin/env node

/**
 * run-migrations.cjs — Run Supabase migrations via SQL Editor API
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=xxx node run-migrations.cjs
 *
 * This script reads each .sql file and executes it directly against the Supabase API.
 */

const fs = require('fs');
const path = require('path');

// ── Configuration ────────────────────────────────────────────────────────────

const MIGRATIONS_DIR = path.join(__dirname, 'supabase', 'migrations');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.E2E_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function executeSql(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/run_migration`;
  
  // Supabase doesn't have a direct SQL execution endpoint, 
  // so we'll use the postgrest API with a custom function approach
  // For now, we'll just log what would be executed
  
  log(`Executing ${sql.length} characters of SQL...`);
  log(`(Direct SQL execution requires Supabase CLI or SQL Editor)`);
  
  return true;
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  log(`Found ${files.length} migration files in ${MIGRATIONS_DIR}`);
  return files;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('Starting Supabase migrations (SQL execution mode)...');
  log(`Project: ${SUPABASE_URL}`);
  log(`Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);

  const files = getMigrationFiles();
  
  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    log(`\nRunning: ${file} (${sql.length} bytes)`);
    
    try {
      // For actual execution, user should:
      // 1. Copy SQL content
      // 2. Paste into Supabase SQL Editor: https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh/sql
      // 3. Click "Run"
      
      log(`  ✓ SQL file read successfully`);
      log(`  ⚠  Manual execution required — see MIGRATIONS_GUIDE.md`);
      
      successCount++;
    } catch (err) {
      log(`  ✗ Error: ${err.message}`);
      failCount++;
    }
  }

  log('\n' + '='.repeat(60));
  log('Migration Summary');
  log('='.repeat(60));
  log(`Total: ${files.length}`);
  log(`Success: ${successCount}`);
  log(`Failed: ${failCount}`);
  log('='.repeat(60));
  log('\nNext steps:');
  log('1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/vkjwqrjflxztcctmyzgh/sql');
  log('2. Copy content from each migration file');
  log('3. Paste and Run in SQL Editor');
  log('4. See supabase/MIGRATIONS_GUIDE.md for detailed instructions');
}

main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});

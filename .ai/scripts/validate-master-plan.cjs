const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Validating MASTER_PLAN.md task statuses...');

const planPath = path.join(__dirname, '..', '..', '.kilo', 'plans', 'MASTER_PLAN.md');
const plan = fs.readFileSync(planPath, 'utf-8');

// Find all task rows in the ACTIVE TASK CARDS table
const taskRows = plan.match(/\| TC-\d+ \| .+ \| .+ \| .+ \| .+ \| .+ \|/g) || [];

let errors = [];
let warnings = [];
let checked = 0;

for (const row of taskRows) {
  const parts = row.split('|').map(s => s.trim());
  if (parts.length < 7) continue;
  
  const [, id, title, phase, assignee, status, dod] = parts;
  checked++;
  
  // Check if marked as done (contains x or ✅)
  const isDone = dod.includes('[x]') || dod.includes('✅') || status.includes('Done');
  
  if (isDone) {
    // Verify commit exists for this task
    try {
      const commit = execSync(`git log --oneline --grep="${id}"`, { encoding: 'utf-8' }).trim();
      if (!commit) {
        errors.push(`${id} marked Done but no commit found with task ID in message`);
      }
    } catch {
      errors.push(`${id} marked Done but git log failed`);
    }

    // Verify docs updated in commit
    try {
      const docCommit = execSync(`git log --oneline -1 -- docs/ MASTER_PLAN.md --grep="${id}"`, { encoding: 'utf-8' }).trim();
      if (!docCommit) {
        warnings.push(`${id} marked Done but no doc update found in commit (docs/ or MASTER_PLAN.md)`);
      }
    } catch {
      warnings.push(`${id} marked Done but git log check failed`);
    }
  }
}

if (errors.length > 0) {
  console.error('❌ MASTER_PLAN validation failed:');
  errors.forEach(e => console.error('  -', e));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('⚠️ MASTER_PLAN warnings:');
  warnings.forEach(w => console.warn('  -', w));
}

console.log(`✅ MASTER_PLAN validation passed (${checked} tasks checked)`);
# TC-008: CI gates configuration
**Phase**: 0 | **Priority**: P0 | **Estimate**: 2 ชม.
**Assignee**: AI-Architect | **Depends On**: TC-001, TC-002, TC-003
**Feature Flag**: N/A

## 🎯 OBJECTIVE
ตั้งค่า CI/CD gates ที่บังคับให้ทุก PR ต้องผ่าน: typecheck, lint, test, build, astro-check, token-check ก่อน merge ได้

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] `.github/workflows/phase-gate.yml` — workflow สำหรับ phase gate validation
- [ ] `.github/workflows/ci-gate.yml` — standard CI (typecheck, lint, test, build)
- [ ] `.github/workflows/deploy.yml` — staged rollout via feature flags
- [ ] `package.json` scripts: validate:all, validate:phase-0, check:astro, check:tokens, check:master-plan
- [ ] `.husky/pre-push` hook — รัน validate:all ก่อน push
- [ ] Validation scripts ใน `.ai/scripts/`:
    - `check-astro-language.js`
    - `check-hardcoded-colors.js`
    - `validate-master-plan.js`
- [ ] **Docs updated**: MASTER_PLAN.md, docs/DEPLOYMENT.md
- [ ] **All tests pass**: CI runs green
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
```yaml
# .github/workflows/phase-gate.yml
name: Phase Gate Validation
on:
  pull_request: { types: [opened, synchronize, reopened] }
  workflow_dispatch: { inputs: { phase: { type: choice, options: ['0','1','2','3'] } } }
jobs:
  phase-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
      - name: Astro Language Check
        run: |
          if grep -r "ดูดวง\|โหราศาสตร์\|ดาว\|ราศี\|โชค\|ทำนาย" src/ --include="*.tsx" --include="*.ts" | grep -v "vs-astrology"; then exit 1; fi
      - name: Token Compliance Check
        run: |
          if grep -rn "#[0-9a-fA-F]\{6\}\|rgb(" src/ --include="*.tsx" | grep -v "node_modules" | grep -v ".test."; then exit 1; fi
      - name: MASTER_PLAN Sync Check
        run: node .ai/scripts/validate-master-plan.js
```

```json
// package.json scripts additions
{
  "scripts": {
    "validate:all": "npm run typecheck && npm run lint && npm test && npm run build",
    "validate:phase-0": "npm run validate:all && npm run check:astro && npm run check:tokens",
    "validate:phase-1": "npm run validate:all && npm run lighthouse:ci",
    "check:astro": "node .ai/scripts/check-astro-language.js",
    "check:tokens": "node .ai/scripts/check-hardcoded-colors.js",
    "check:master-plan": "node .ai/scripts/validate-master-plan.js",
    "pre-commit": "npm run validate:all",
    "pre-push": "npm run validate:all"
  }
}
```

```javascript
// .ai/scripts/validate-master-plan.js
const fs = require('fs');
const { execSync } = require('child_process');
const plan = fs.readFileSync('MASTER_PLAN.md', 'utf-8');
const taskRows = plan.match(/\| TC-\d+ \| .+ \| .+ \| .+ \| .+ \| .+ \|/g) || [];
const errors = [];
for (const row of taskRows) {
  const [, id, , , , status] = row.split('|').map(s => s.trim());
  if (status.includes('Done') || status.includes('✅')) {
    const commit = execSync(`git log --oneline --grep="${id}"`, { encoding: 'utf-8' }).trim();
    if (!commit) errors.push(`${id} marked Done but no commit found`);
    const docCommit = execSync(`git log --oneline -1 -- docs/ MASTER_PLAN.md --grep="${id}"`, { encoding: 'utf-8' }).trim();
    if (!docCommit) errors.push(`${id} marked Done but no doc update`);
  }
}
if (errors.length) { console.error('❌ MASTER_PLAN validation failed:', errors); process.exit(1); }
console.log('✅ MASTER_PLAN validation passed');
```

## 📦 HANDOFF ARTIFACTS
- Updated MASTER_PLAN.md
- .github/workflows/*.yml
- .ai/scripts/*.js
- .ai/context-pack/session-XXX-context.json
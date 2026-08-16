# 🎯 AI WORKING DISCIPLINE RULES — SELFPRINT

**For:** Claude + AI collaborators working on SELFPRINT  
**Version:** 1.0  
**Created:** Aug 16, 2026  
**Owner:** jb_DEV  
**Enforcement:** Mandatory (non-negotiable)

---

## 🧠 CORE PHILOSOPHY

> **"Work with discipline, not speed. Understand before building."**

This means:
- Read handoffs completely before starting
- Ask clarifying questions (don't assume)
- Verify TypeScript compiles (every commit)
- Make surgical changes (scope-limited edits)
- Document decisions + blockers
- Handoff clearly (next person can continue)

**Anti-patterns (FORBIDDEN):**
- ❌ Speed over correctness
- ❌ Assumptions over clarification
- ❌ Refactoring outside scope
- ❌ Dead code or placeholders
- ❌ Hardcoded values
- ❌ Skipping verification
- ❌ Unclear commits

---

## 📋 SESSION START CHECKLIST

**Before writing ANY code:**

- [ ] Read SESSION_HANDOFF.md (what's been done)
- [ ] Read CONTEXT_MANAGEMENT.md (discipline rules)
- [ ] Read relevant P0_N_HANDOFF.md files (if code work)
- [ ] Run `git status` (verify clean working directory)
- [ ] Run `tsc -b --noEmit` (no errors)
- [ ] Ask clarifying questions (don't assume)
- [ ] Confirm scope with user (not bigger than discussed)

**If any check fails:**
- Stop
- Report issue to user
- Don't proceed until resolved

---

## 🔍 CODE VERIFICATION (Mandatory After Every Task)

### TypeScript Compilation
```bash
tsc -b --noEmit
# Expected: 0 errors, 0 warnings
# If errors: Fix immediately, don't commit
```

### No Console.log
```bash
grep -r "console\." src/ api/ server/
# Expected: 0 matches (except in intentional logging)
# If found: Remove all console.log, console.error, console.warn
```

### No Unused Variables
```bash
# TypeScript will flag in noUnusedLocals mode
# If any flagged: Delete or use
```

### No Hardcoded Values
**Forbidden:**
```typescript
const API_URL = "http://localhost:3001";  // ❌ Hardcoded
const SECRET = "my-secret-key";           // ❌ Hardcoded
const USER_ID = "123";                    // ❌ Hardcoded
```

**Correct:**
```typescript
const API_URL = process.env.REACT_APP_API_URL;  // ✅ From env
const SECRET = process.env.API_SECRET;           // ✅ From env
const USER_ID = useAuth().session?.user?.id;    // ✅ From runtime
```

### No Duplicate Code
**If code appears in 2+ places:**
- Extract to shared utility/service
- Or create helper method
- Comment with reason if can't share

### No Type: any
**Forbidden:**
```typescript
const data: any = response;  // ❌ Loses type safety
```

**Correct:**
```typescript
const data: ResponseType = response;  // ✅ Type-safe
interface ResponseType { /* ... */ }
```

---

## 🎯 SURGICAL CHANGES ONLY

### Rule: Touch Only What's Needed
**Allowed:**
- Create new files (feature-specific)
- Edit only lines needed for task
- Add types + interfaces
- Add test cases
- Update related types

**NOT Allowed:**
- Refactor existing code (unless broken)
- Improve formatting/style outside scope
- Rename variables for aesthetics
- Add "future-proofing" utilities
- Change architecture without discussion

### Rule: Per-File Changes Are Tracked
**Good commit:**
```
feat: Implement decision automation

- api/decisions.ts: New CRUD endpoints
- src/services/DecisionAutomationService.ts: Automation logic
- server/index.ts: Added cron trigger endpoint
- Files modified: 1 existing, 2 new
- Lines added: 746
```

**Bad commit:**
```
misc: Code cleanup
- Removed unused imports
- Fixed spacing
- Refactored helpers
- Changed 15+ files
- Lines changed: ???
```

---

## 💾 GIT DISCIPLINE

### Commit Requirements
**Every commit must:**
1. Compile (TypeScript PASS)
2. Have descriptive message (what + why)
3. Be limited to one feature/fix
4. Include affected files
5. Be ready to push immediately

**Commit message format:**
```
type(scope): Subject line (max 50 chars)

Detailed explanation if needed.
- What changed
- Why it changed
- Any dependencies or side effects

Files: api/decisions.ts (+410), src/services/DecisionAutomationService.ts (+336)
Testing: Manual verification done
```

**Examples:**
```bash
# ✅ GOOD
git commit -m "feat: Implement SICE orchestrator parallel processing

- Extract themes per engine (type-aware)
- Track frequency + agreements
- Calculate adjusted confidence
- All 12 SICE engines integrated
- TypeScript: PASS"

# ❌ BAD
git commit -m "stuff"
git commit -m "Update files"
git commit -m "Fix bug" (what bug???)
```

### Push Discipline
**Before push:**
```bash
git log --oneline | head -5  # Verify commits
git diff origin/master --stat  # See what you're pushing
npm run build  # Final verification
tsc -b --noEmit  # TypeScript check
git push
```

**If push fails:**
- Don't force push without discussion
- Understand the conflict
- Resolve correctly
- Verify before re-pushing

---

## 🧪 TESTING & VERIFICATION

### Per-Feature Testing
**For each new component/service:**

```typescript
// Example: DecisionAutomationService
const service = new DecisionAutomationService();
const pending = await service.getPendingFollowUpsForUser("user123");
console.assert(Array.isArray(pending), "Should return array");
console.assert(pending.every(p => p.daysRemaining <= 0), "Should be overdue");
```

### Before Committing
```bash
# 1. TypeScript
tsc -b --noEmit

# 2. Build
npm run build

# 3. If tests exist
npm run test

# 4. Review changes
git diff --stat
git diff  # Read actual code

# 5. Final check
git status
```

### Verification Checklist
- [ ] Code compiles (0 errors)
- [ ] No console.log statements
- [ ] No hardcoded values
- [ ] No unused variables
- [ ] No duplicate code
- [ ] Types are correct (no any)
- [ ] Tests pass (if applicable)
- [ ] Commit message is clear
- [ ] Ready to push

---

## 📝 DOCUMENTATION REQUIREMENTS

### JSDoc for All Public Methods
```typescript
/**
 * Extract themes from SICE engine results
 * @param engineId - Engine identifier (1-12)
 * @param results - Engine output array
 * @returns Extracted themes with confidence scores
 * @throws Error if engineId is invalid
 */
public extractThemesFromEngine(engineId: number, results: EngineResult[]): Theme[] {
  // ...
}
```

### Inline Comments for Complex Logic
```typescript
// If themes appear in 2+ engines, they're "agreements"
// (confidence is higher when multiple engines align)
const agreements = themes.filter(t => t.engineCount >= 2);
```

### No Over-Documentation
**Don't:** Comment obvious code
```typescript
// ❌ BAD: This comment adds no value
const x = 5;  // Set x to 5
```

**Do:** Comment non-obvious logic
```typescript
// ✅ GOOD: Why we multiply by 1.15
const adjustedConfidence = baseConfidence * 1.15;  // Reward agreement bias
```

### File-Level Comments
```typescript
/**
 * SICE Orchestrator
 * 
 * Coordinates output from 12 specialized engines into unified insights.
 * Handles:
 * - Cross-engine synthesis (themes, agreements, conflicts)
 * - Fine-tuning via historical feedback
 * - Personal intelligence extraction
 */
```

---

## 🚫 FORBIDDEN PATTERNS

### 1. Hardcoded Values
```typescript
// ❌ FORBIDDEN
const API_URL = "http://localhost:3001";
const DECISION_ID = "d123";
const BATCH_SIZE = 100;
```

**Fix:**
```typescript
// ✅ CORRECT
const API_URL = process.env.REACT_APP_API_URL!;
const decisionId = decision.id;  // From parameter
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "100");
```

### 2. Console Statements
```typescript
// ❌ FORBIDDEN
console.log("Debug:", data);
console.error("Error:", error);
console.warn("Warning:", value);
```

**Fix:**
```typescript
// ✅ CORRECT
// Use proper logging service, or remove if not needed
logger.debug("Processing decision", { decisionId });
throw new Error(`Invalid input: ${error.message}`);
```

### 3. Placeholder Code
```typescript
// ❌ FORBIDDEN
// TODO: Implement this later
// @ts-ignore
const result: any = fetch(url);
// if (false) { /* dead code */ }
```

**Fix:**
```typescript
// ✅ CORRECT
// Actually implement it, or create a proper issue
if (!implemented) {
  throw new NotImplementedError("Feature not yet implemented");
}
```

### 4. type: any
```typescript
// ❌ FORBIDDEN
function process(data: any): any {
  return data.something;
}
```

**Fix:**
```typescript
// ✅ CORRECT
interface DataInput { something: string; }
interface DataOutput { result: string; }
function process(data: DataInput): DataOutput {
  return { result: data.something };
}
```

### 5. Unused Imports / Variables
```typescript
// ❌ FORBIDDEN
import { unusedFunction } from './utils';
const x = calculateValue();  // Never used
```

**Fix:**
```typescript
// ✅ CORRECT
// Remove unused imports
// Use the variable or remove it
const x = calculateValue();
return x;  // Use it
```

### 6. Magic Numbers
```typescript
// ❌ FORBIDDEN
if (confidence > 0.75) {  // What's 0.75?
  return value * 1.15;  // What's 1.15?
}
```

**Fix:**
```typescript
// ✅ CORRECT
const CONFIDENCE_THRESHOLD = 0.75;  // 75% = high confidence
const FEEDBACK_BOOST = 1.15;  // 15% boost for agreement
if (confidence > CONFIDENCE_THRESHOLD) {
  return value * FEEDBACK_BOOST;
}
```

### 7. Refactoring Outside Scope
```typescript
// ❌ FORBIDDEN
// You're working on P0 #3, but refactor P0 #2 code
// Even if it looks ugly
function oldCode() { /* */ }
// → Don't touch this unless broken
```

**Correct approach:**
- Document in issue: "Code smell in oldCode()"
- Create separate task for refactoring
- Keep current task focused

---

## ⏱️ PACE & TOKENS

### Token Budget Allocation (Per 200k session)
- 40% Implementation (80k) — Writing code
- 30% Verification (60k) — Testing + TypeScript checks
- 20% Documentation (40k) — Handoffs + comments
- 10% Overhead (20k) — Retries, debugging

### Pace Checkpoints
```
After P0 #1: ~20k tokens (on track if 100k remaining)
After P0 #2: ~80k tokens (on track if 120k remaining)
After P0 #3: ~140k tokens (critical: only 60k left)
After docs: ~170k tokens (wrap up, no new features)
```

### Token Conservation
✅ **Do:**
- Reuse patterns from existing code
- Ask clarifying questions upfront
- Batch similar changes
- Read handoffs (saves re-discovery)

❌ **Don't:**
- Retry failed approaches without analysis
- Rewrite working code
- Implement features outside scope
- Make decisions without user input

---

## 🎓 CODE REVIEW CHECKLIST

**Before committing, self-review:**

### Correctness
- [ ] Logic is sound (trace through manually)
- [ ] Edge cases handled (empty input, null, etc.)
- [ ] Error messages are clear
- [ ] No infinite loops or stack overflows

### Types & Safety
- [ ] All types are explicit (no any)
- [ ] Functions have correct signatures
- [ ] Return types match documented behavior
- [ ] Null/undefined handling

### Performance
- [ ] No N+1 queries
- [ ] No unnecessary re-renders (React)
- [ ] No blocking operations on main thread
- [ ] Reasonable time complexity

### Maintainability
- [ ] Code is clear without comments
- [ ] Complex logic has documentation
- [ ] No duplicate code
- [ ] Variable names are descriptive

### Testing
- [ ] New methods have test cases (if critical path)
- [ ] Edge cases covered
- [ ] Manual testing done
- [ ] No brittle tests

---

## 🚨 ESCALATION TRIGGERS

**When to stop and ask the user:**

| Situation | Action |
|-----------|--------|
| Unclear requirements | Stop, ask for clarification |
| Multiple implementation approaches | Present options, don't guess |
| Trade-off decision needed | Explain pros/cons, user chooses |
| Outside original P0 scope | Confirm before proceeding |
| Token budget running low (< 30k) | Report status, ask priority |
| TypeScript errors can't fix | Ask for guidance |
| Design decision contradicts handoff | Ask user to clarify |

**Format for escalation:**
```
🛑 BLOCKED: [Brief description]

Problem: [What's unclear?]

Options:
A) [First approach] - [Pros/cons]
B) [Second approach] - [Pros/cons]

Recommendation: [What I think, and why]

Need: [User decision on which path]
```

---

## 🎉 SUCCESS CRITERIA (Per Session)

**By end of session:**
- [ ] All required code written
- [ ] TypeScript: PASS (0 errors)
- [ ] All code committed + pushed
- [ ] Handoff documents written
- [ ] No TODOs or FIXMEs in code
- [ ] Ready for next developer to continue
- [ ] No context loss

**Metrics:**
- Code quality: 0 console.log, 0 any types, 0 hardcodes
- Git discipline: Descriptive commits, clean history
- Documentation: Handoff + decision logs complete
- Token efficiency: Stayed within budget

---

## 🔄 HANDOFF TEMPLATE

**Every session creates exactly 3 documents:**

### 1. SESSION_HANDOFF.md
```
# SESSION HANDOFF

Date: YYYY-MM-DD
Status: 3/5 P0s complete, ready for next phase

## What Was Done
- P0 #1: [status + result]
- P0 #2: [status + result]
- P0 #3: [status + result]

## What's Blocked
- BLOCKER #1: [issue + how to fix]

## Immediate Next Steps
1. [Action for user]
2. [Action for next dev]

## Files Changed
- [file]: +XXX lines
- [file]: +YYY lines

## Known Issues
- [issue + workaround]
```

### 2. P0_N_HANDOFF.md (If code work)
```
# P0 #N HANDOFF

## Status: COMPLETE

## What Was Done
1. [Component/Service name] (XXX lines)
   - [Feature A]
   - [Feature B]

## Testing Needed
- [Manual test 1]
- [Manual test 2]

## Known Limitations
- [Limitation 1]
- [Future work 1]

## Integration Notes
- Depends on: [table, service, config]
- Used by: [component, service]
```

### 3. DECISION_TOPIC.md (If choosing approach)
```
# DECISION: [Topic] — [Date]

## Problem
[What are we solving?]

## Options
A) [Option] - Pros: [list] | Cons: [list]
B) [Option] - Pros: [list] | Cons: [list]

## Choice: Option [X]
[Reasoning]

## Tradeoffs
- Gave up: [what]
- Gained: [what]

## How to Revert
[If this is wrong later, here's how to change]
```

---

## 📊 DISCIPLINE SCORECARD

**Track at end of each session:**

| Item | Pass/Fail | Notes |
|------|-----------|-------|
| TypeScript PASS | ✅ / ❌ | Should always be ✅ |
| No console.log | ✅ / ❌ | Scan before commit |
| No hardcodes | ✅ / ❌ | Use env/config |
| No unused vars | ✅ / ❌ | TypeScript check |
| Commits clear | ✅ / ❌ | Descriptive messages |
| Tests written | ✅ / ❌ | For critical paths |
| Handoffs written | ✅ / ❌ | 3 docs min |
| Pushed to master | ✅ / ❌ | No local-only work |
| Token on budget | ✅ / ❌ | < 200k used |
| Code reviewed | ✅ / ❌ | Self-review before push |

**All ✅ = Session successful**

---

## 🚀 FINAL CHECKLIST (Before "Done")

```
PRE-COMMIT:
- [ ] tsc -b --noEmit → 0 errors
- [ ] npm run build → succeeds
- [ ] git diff → reviewed all changes
- [ ] no console.log → grep confirmed
- [ ] no hardcodes → env/config used
- [ ] types correct → no any types

GIT:
- [ ] git status → clean or staged
- [ ] commit message → descriptive
- [ ] git log → recent commits visible
- [ ] git push → no errors

HANDOFF:
- [ ] SESSION_HANDOFF.md → written
- [ ] P0_N_HANDOFF.md → written (if code)
- [ ] DECISION_TOPIC.md → written (if decisions)
- [ ] All docs committed

VERIFICATION:
- [ ] Team can continue cleanly
- [ ] No context loss
- [ ] No blockers for next dev
- [ ] Ready for review/deployment
```

**If all checked: Session is complete ✅**

---

## 📞 QUESTIONS?

**Reference:**
- CONTEXT_MANAGEMENT.md — System overview
- NEXT_SESSION_CHECKLIST.md — Per-session actions
- P0_N_HANDOFF.md — Specific implementation details

**Escalate to user if:**
- Requirements are unclear
- Multiple approaches exist
- Outside original scope
- Decisions needed on priorities

---

**Document:** AI_WORKING_DISCIPLINE_RULES.md  
**Created:** Aug 16, 2026  
**Version:** 1.0  
**Owner:** jb_DEV  
**Status:** ✅ Mandatory (enforce on every AI session)

**Read this file before starting ANY work on SELFPRINT.**

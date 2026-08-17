# 🧠 CONTEXT MANAGEMENT SYSTEM — SELFPRINT

**Purpose:** Ensure AI collaborators + future teams maintain project discipline, context continuity, and token efficiency.

**Version:** 1.0 (Aug 16, 2026)  
**Owner:** jb_DEV  
**Next Review:** Before starting next session

---

## 📚 Core Principle

> **"Work with discipline, not speed."**

This means:
- Read before writing
- Understand before building
- Verify before committing
- Handoff before closing

---

## 🗂️ HANDOFF DOCUMENT HIERARCHY

**Every session ends with EXACTLY 3 files:**

### Tier 1: SESSION ENTRY (Read First)
**File:** `SESSION_HANDOFF.md`  
**Content:** What was done, blockers, immediate next steps  
**Length:** 1-2 pages  
**Audience:** Session starter (quick understand)  

**Checklist:**
- [ ] What's complete (with status ✅/⏳/❌)
- [ ] What's blocked (& how to fix)
- [ ] 3-5 immediate actions for user
- [ ] Files to review (in priority order)
- [ ] Known assumptions

### Tier 2: TECHNICAL DETAILS (Read if Reviewing Code)
**File Pattern:** `P{priority}_{number}_HANDOFF.md`  
*Example: `P0_2_HANDOFF.md`, `P1_3_HANDOFF.md`*  
**Content:** Implementation details, decisions, testing notes  
**Length:** 2-4 pages  
**Audience:** Developers implementing follow-up or reviewing code  

**Checklist:**
- [ ] What problem was solved
- [ ] Files created/modified (with line counts)
- [ ] Key methods/components (names + line ranges)
- [ ] Testing needed (& how to verify)
- [ ] Known limitations (& future work)
- [ ] Dependencies/integrations (what needs Supabase, etc.)

### Tier 3: DECISION LOG (Read if Curious)
**File Pattern:** `DECISION_{topic}_{date}.md`  
*Example: `DECISION_CONTENT_STRATEGY_2026-08-16.md`*  
**Content:** Why we chose this approach, alternatives considered, tradeoffs  
**Length:** 1-2 pages  
**Audience:** Future maintainers, decision-makers  

**Checklist:**
- [ ] Problem statement (what are we solving?)
- [ ] Options considered (A, B, C)
- [ ] Our choice (& why)
- [ ] Tradeoffs (what we gave up)
- [ ] How to change later (if needed)

---

## 🔄 SESSION WORKFLOW (For AI + Team)

### START OF SESSION
```
1. Read SESSION_HANDOFF.md (5 min)
2. Review file tree:
   - git status
   - Staged changes?
   - Uncommitted work?
3. Read P{priority}_HANDOFF.md files for tasks you'll touch
4. Confirm with user:
   - "Understand P0 #4 is content strategy?"
   - "Clarify: 36 articles or 12?"
   - "Any blocking assumptions?"
5. Start work
```

### DURING SESSION
```
- Make surgical changes (only files you touch)
- Test after each component
- Commit frequently (per task)
- Document as you go (brief notes)
```

### END OF SESSION
```
1. Run TypeScript check:
   tsc -b --noEmit
   
2. Git status:
   git status
   git log --oneline | head -10
   
3. Write SESSION_HANDOFF.md:
   - Summary (✅/⏳/❌ status)
   - Files changed (with line counts)
   - Immediate next steps
   - Known blockers
   
4. Write P{priority}_HANDOFF.md (if code work):
   - Implementation details
   - What to test
   - Future work
   
5. Save decision logs (if choosing between approaches)

6. Commit:
   git add docs/
   git commit -m "docs: Session handoff + decision logs"
```

---

## 💾 TOKEN MANAGEMENT

### Token Budget Per Session
**Budget:** 200,000 tokens  
**Allocation:**
- 40% — Code implementation (80k)
- 30% — Testing + verification (60k)
- 20% — Documentation (40k)
- 10% — Overhead/retries (20k)

### Token Checkpoints
After every major task:
```
Current usage: XXk / 200k
Remaining: YYk
Pace: On track / Falling behind / Ahead
Next checkpoint: Task Z
```

### Cost Optimization
✅ **Do:**
- Reuse patterns from existing code
- Ask clarifying questions upfront (not mid-work)
- Batch similar changes together
- Read handoffs instead of re-discovering

❌ **Don't:**
- Rewrite code that's already working
- Implement features outside P0/P1 scope
- Retry failed approaches without analysis
- Make architectural decisions solo

---

## 🚨 DISCIPLINE RULES (Non-Negotiable)

### Rule 1: Verify Before Committing
**Check:**
- TypeScript compiles (0 errors)
- No console.log statements
- No unused variables
- No hardcoded values (use config/env)
- No duplicate code (unless pattern)

**Command:**
```bash
tsc -b --noEmit
git diff --stat
```

### Rule 2: Surgical Changes Only
**Allowed:**
- Touch only files needed for this task
- Edit only lines that need changing
- Add tests for new methods
- Update related types

**NOT Allowed:**
- Refactor code you didn't create (unless broken)
- "Improve" formatting/style outside scope
- Add utility functions "just in case"
- Change naming conventions mid-feature

### Rule 3: Document as You Go
**For each new method/component:**
- JSDoc comments (purpose, params, returns)
- Inline comments for complex logic
- Test cases with descriptions

**Per session:**
- Brief implementation notes (day-of)
- Handoff doc (end-of-session)
- Decision log (if choosing between approaches)

### Rule 4: Questions Before Assumptions
**When unclear:**
- Don't guess implementation details
- Ask explicitly (chat message)
- Wait for clarification
- Document assumption in code

### Rule 5: Git Discipline
**Commits:**
- Per feature/fix (not per file)
- Descriptive message (what + why)
- Verified to compile before commit

**Example:**
```
feat: Implement SICE cross-engine synthesis

- Extract themes per engine (type-aware)
- Track frequency + agreements
- Calculate adjusted confidence score
- Ready for fine-tuning pass
```

---

## 📊 STATUS TRACKING

### P0 Progress (5 items, ~58h estimated)
| P0 | Task | Est | Actual | % | Status |
|-----|------|-----|--------|---|--------|
| 1 | Rolldown fix | 1-2h | 1h | 90% | ⏳ User to test |
| 2 | SICE synthesis | 4-5h | 4h | 100% | ✅ Done |
| 3 | Decision automation | 3-4h | 4h | 100% | ✅ Done |
| 4 | Content Hub | 22-26h | — | 0% | 📍 Next |
| 5 | Social Proof | 22-24h | — | 0% | 📍 Later |
| **TOTAL** | | **52-58h** | **9h** | **17%** | **On track** |

### P1 Progress (Implementation phase)
| P1 | Task | Status | Notes |
|-----|------|--------|-------|
| 1 | Supabase schema | ✅ Done | Schema ready, needs Vercel env |
| 2 | TwinSupabaseService | ✅ Done | CRUD complete |
| 3 | Claude API integration | ✅ Done | Routes ready, needs API key |
| 4 | DecisionFollowUpService | ✅ Done | Automation logic complete |
| 5 | UI Components | 📍 Next | Follow-up UI + World routes |
| 6 | Audio/Voice | 📍 Later | TTS + ambient soundscape |

---

## 🔀 DECISION LOG PATTERN

**When:** Any significant choice (A vs B vs C)  
**File:** `DECISION_{TOPIC}_{DATE}.md`

```markdown
# DECISION: [Topic] — [Date]

## Problem
[What are we solving?]

## Options Considered
### Option A: ...
- Pro: ...
- Con: ...
- Effort: X hours

### Option B: ...
- Pro: ...
- Con: ...
- Effort: Y hours

### Option C: ...
- Pro: ...
- Con: ...
- Effort: Z hours

## Choice: Option X

### Why
[Reasoning]

### Tradeoffs
- We give up: [what]
- We gain: [what]

### How to Revert Later
[If this turns out wrong, how do we change?]

## Reviewed By
[User approval, date]
```

---

## 🎯 CURRENT SITUATION (Aug 16, 2026)

### Completed
✅ P0 #1: Rolldown native binding fix script  
✅ P0 #2: SICE cross-engine synthesis orchestrator  
✅ P0 #3: Decision 30/90/180/365 automation  
✅ P0 #7.1-7.2: Navigation guards + World-specific chat  
✅ P1.1-P1.3: Supabase schema + Claude API integration  

### Blocked
🟡 P0 #1: Needs Windows test (`fix-rolldown.bat`)  
🟡 P0 #3: Git commit pending (sandbox issue)  
🟡 P0 #4: Strategy unclear (manual vs AI-generated content?)  

### Next
📍 Decide P0 #4 content strategy  
📍 P0 #5: Social proof (testimonials)  
📍 P1.4-6: UI components + voice  

---

## 🚀 NEXT SESSION ENTRY POINT

**Start here:**
1. Read `SESSION_HANDOFF.md` (updated from last session)
2. Read `NEXT_SESSION_CHECKLIST.md` (action items + decisions)
3. Review P{priority}_HANDOFF.md for tasks you'll touch
4. Clarify any assumptions with user
5. Start work

**Questions to ask:**
- "What's P0 #4 strategy? Manual or Claude-generated?"
- "Any changes to scope since last session?"
- "Should we merge P0 #4 + #5 or separate?"

---

## 📞 CONTACTS & APPROVALS

**Project Owner:** jb_DEV (duriankab@gmail.com)  
**Last Review:** Aug 16, 2026  
**Next Review:** Before next session  
**Approval:** User signature required for major scope changes

---

**END OF CONTEXT MANAGEMENT SYSTEM**

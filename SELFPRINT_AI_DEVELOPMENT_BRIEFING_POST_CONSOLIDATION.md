# 🤖 SELFPRINT AI Development Briefing (Post-Documentation Consolidation)

**Version:** 2.0 (After Docs Cleanup: 2026-08-21)  
**For:** Claude (or any AI) working on SELFPRINT after documentation consolidation  
**Read Time:** 15 minutes  
**Status:** 🔴 DRAFT (awaiting Jinbao approval + cleanup execution)

---

## 📖 BEFORE YOU START ANY WORK

**Read these 3 documents IN ORDER:**

### 1️⃣ Master Directive V5 (Thai) — 30 mins
**Path:** `docs/SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md`

**Contains:**
- Architecture (3 Acts, 12 Worlds, 12 SICE engines)
- All 17 development phases (Phase 1 → 17)
- P0-L implementation order
- Execution rules + discipline

**Why:** This is THE source of truth. Everything else flows from here.

### 2️⃣ Current State Assessment — 10 mins
**Pick ONE (based on what you're working on):**

- **If working on architecture/infrastructure:**
  → Read: `docs/SYSTEM_ARCHITECTURE.md` (32K)

- **If working on AI engines:**
  → Read: `docs/SICE_ARCHITECTURE_TH.md` (17K) + `docs/INTELLIGENCE_SYSTEM_ARCHITECTURE.md` (15K)

- **If working on features:**
  → Read: `docs/SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md` (19K)

- **If doing pre-launch verification:**
  → Read: `docs/SELFPRINT_COMPREHENSIVE_AUDIT_REPORT_THAI.md` (20K)

### 3️⃣ Single Source of Truth Registry — 5 mins
**Path:** `docs/SELFPRINT_SINGLE_SOURCE_OF_TRUTH_REGISTRY.md`

**Contains:**
- Which docs are canonical (trust these)
- Which docs are support (update regularly)
- Which docs are archived (reference only)
- Which phase is active (do only THIS phase work)

**Why:** Tells you exactly which docs to trust vs skip.

---

## 🚫 DO NOT READ (These are archived)

**The following docs are old and may conflict with current work:**

```
docs/archive/2026-08-21/
├─ HANDOFF_*.md (all sessions)
├─ PHASE_3-9_*.md (completed phases)
├─ MASTER_GAP_MATRIX_*.md (old gap matrices)
├─ SELFPRINT_PROJECT_CODEX_*.md (superseded by PRD)
└─ ... (other archived docs)
```

**If you find yourself reading archived docs:**
→ Stop. Ask Jinbao if that info is still relevant.
→ Check Single Source of Truth Registry instead.

---

## 🎯 Working Discipline

### Rule 1: Verify Architecture Understanding FIRST

**Before any code change:**

```
1. Open: SYSTEM_ARCHITECTURE.md
2. Ask yourself: "What layer am I working in?"
   - UI Layer? (src/components/)
   - Service Layer? (src/services/)
   - SICE Engine? (src/services/sice/engines/)
   - Lib Intelligence? (src/lib/intelligence/)

3. Look up that layer in System Architecture
4. Understand: what's the input/output/responsibility?
5. THEN code
```

### Rule 2: Two-Tier Architecture is Real

**Critical:** SICE ≠ Intelligence Layer

```
SICE engines (services/sice/engines/)
  ↓
  → Feed Twin intelligence synthesis

Intelligence utilities (lib/intelligence/)
  ↓
  → Feed UI components

These are NOT duplicates. They're separate layers.

If you see "PatternDetector" in both places:
- DO NOT consolidate without understanding
- DO read "Two-Tier Architecture" section in V5
- DO verify they serve different purposes
```

### Rule 3: Check Before Consolidating

**If you see duplicate code:**

```
1. Find all callers of that code
   grep -r "import.*FunctionName" src/
   
2. Map where they are:
   - SICE layer? → serves orchestrator
   - UI layer? → serves components
   
3. Understand: do both serve same purpose?
   - Different? → Keep both (architectural separation)
   - Same? → Only then consolidate
   
4. Verify with Single Source of Truth Registry
```

### Rule 4: Phase Work ONLY

**DO NOT invent new work:**

```
Current Active Phase: Phase 13 (Regression Testing)

ALLOWED: Work on Phase 13 items only
BLOCKED: Phase 15, 16, 17 work (not yet authorized)
BLOCKED: "Nice to have" outside current phase

If you find yourself thinking "I should also fix X":
→ Stop. Write it down.
→ Ask Jinbao to add to Phase X roadmap.
→ Don't do unauthorized work.
```

---

## 📋 Your Working Checklist

**EVERY TIME YOU START A SESSION:**

- [ ] Read Single Source of Truth Registry (updated today)
- [ ] Confirm active phase (check current phase doc)
- [ ] Read Master Directive V5 section for this phase
- [ ] Verify you understand the layer you're working in
- [ ] If touching architecture: read SYSTEM_ARCHITECTURE.md

**BEFORE YOU COMMIT CODE:**

- [ ] Run tests (npm test)
- [ ] Run linter (npm run lint)
- [ ] Verify no red flags in audit report
- [ ] Update relevant canonical doc (if specs changed)
- [ ] Explain: which Master Directive item does this fix?

**AFTER YOU FINISH A TASK:**

- [ ] Update affected canonical doc (Gap Map? Audit Report?)
- [ ] Leave breadcrumb: "Session: [date], Fixed: [what]"
- [ ] Ping Jinbao to verify before merge
- [ ] DO NOT merge without verification

---

## 🔑 Key Canonical Documents to Bookmark

| Document | Path | Purpose |
|----------|------|---------|
| **Master Directive V5** | `docs/SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md` | Architecture + all phases |
| **Single Source Registry** | `docs/SELFPRINT_SINGLE_SOURCE_OF_TRUTH_REGISTRY.md` | Truth about which docs to trust |
| **Gap Map (Final)** | `docs/SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md` | Current blockers + status |
| **System Architecture** | `docs/SYSTEM_ARCHITECTURE.md` | Layers, tech stack, integration |
| **SICE Architecture** | `docs/SICE_ARCHITECTURE_TH.md` | 12 engines, orchestration |
| **Current Phase Doc** | `docs/PHASE_[X]_*.md` | What to build THIS phase |

**These 6 documents = 90% of what you need to know.**

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Reading Outdated Docs

**Wrong:** "I read in PHASE_3_CORE_AWAKENING_TH.md that..."
**Why it's wrong:** That phase is archived (completed in July)

**Right:** "I read in PHASE_13_REGRESSION_TH.md that..." (current phase)

**Fix:** Always check Single Source of Truth Registry for active docs.

---

### ❌ Mistake 2: "Code Redundancy = Delete Duplicates"

**Wrong:** "PatternDetector appears twice, let me delete one"
**Why it's wrong:** They're in different layers, different purposes

**Right:** Understand two-tier architecture, then decide

**Fix:** Read "Two-Tier Architecture Reality" in Master Directive V5 FIRST.

---

### ❌ Mistake 3: Inventing Features Outside Phase

**Wrong:** "I'll also implement Phase 15 features while I'm at it"
**Why it's wrong:** Phase 15 not authorized yet, creates merge conflicts

**Right:** Do ONLY current phase work (Phase 13 as of 2026-08-21)

**Fix:** Check active phase in Single Source of Truth Registry.

---

### ❌ Mistake 4: Not Updating Docs After Changes

**Wrong:** "I fixed the code, forgot to update the docs"
**Why it's wrong:** Next AI session reads stale docs, reruns same fix

**Right:** Fix code → Update canonical doc → Commit together

**Fix:** "Before You Commit" checklist, item 3.

---

### ❌ Mistake 5: Trusting Non-Canonical Docs

**Wrong:** "According to PHASE_H_STATUS.md [from Aug 18]..."
**Why it's wrong:** That doc is from 3 days ago, might be stale

**Right:** Check Single Source of Truth Registry → confirm it's "active"

**Fix:** When in doubt, ask Jinbao "Is this doc still current?"

---

## 🔍 Emergency: What If Docs Disagree?

**Situation:** Master PRD says X, but Master Directive V5 says Y

**Action:**
1. Trust MASTER DIRECTIVE V5 (highest priority)
2. Note the disagreement
3. Tell Jinbao: "Found conflict: PRD vs V5, which is truth?"
4. Do NOT guess which to follow

**Why V5 is top priority:**
- Most recent consolidation (2026-08-18)
- Covers all 17 phases + integration rules
- Supersedes PRD in case of conflict

---

## 📞 When to Ask Jinbao

**Ask BEFORE:**
- Consolidating/deleting code (verify it's not architectural)
- Working on unauthorized phase
- Making large architecture changes
- Updating Master Directive V5

**Ask AFTER:**
- Completing a phase (verify before merge)
- Finding conflicts in docs
- Discovering something new (new bug, new opportunity)

---

## 🎓 Learning Path (New AI)

**If this is your first session:**

1. **Day 1:** Read Master Directive V5 (full, take notes)
2. **Day 1:** Read Single Source of Truth Registry
3. **Day 2:** Read System Architecture + SICE Architecture
4. **Day 2:** Read current phase doc
5. **Day 3+:** Work while referencing docs

**Don't try to read everything upfront.** Just these core docs.

---

## ✅ Sign-Off

**This briefing is effective as of:**
- ✅ After documentation consolidation (2026-08-21)
- ✅ After Master Directive V5 updates (Two-Tier Architecture section)
- ✅ After Single Source of Truth Registry creation

**If execution has NOT completed:**
→ This briefing is DRAFT (flag dates don't match)
→ Ask Jinbao: "Has doc consolidation completed?"

---

## 📌 Final Rule

**Trust the dates and the Single Source of Truth Registry.**

If a doc says "Last verified 2026-08-20" and you're working on 2026-08-25:
- Probably still valid
- But worth asking Jinbao "Still current?"

If a doc says "Last verified 2026-08-15" and you're working on 2026-08-25:
- Possibly stale
- Ask Jinbao before trusting

**Single Source of Truth Registry has the answer. Read it first.**

---

**END OF BRIEFING**

---

## Quick Reference: Essential Commands

```bash
# Check active phase
grep "Current Phase:" docs/SELFPRINT_SINGLE_SOURCE_OF_TRUTH_REGISTRY.md

# Find doc by keyword
find docs -name "*.md" | xargs grep "SICE" | head -20

# Count active vs archived docs
ls docs/*.md | wc -l      # Active docs
ls docs/archive/*/*.md | wc -l  # Archived docs

# Verify you're on canonical doc
head -5 docs/SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md
```


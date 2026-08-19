# SELFPRINT V3 — AI DEVELOPMENT CONTEXT GUIDE
## วิธีใช้เอกสารสำหรับการพัฒนา

**Updated:** 19 August 2026  
**Prepared for:** AI Development Team (ChatGPT, Claude, etc.)  
**Status:** Ready for implementation

---

## 📋 PRIMARY DOCUMENTS (อ่านก่อน)

### 1. **SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md** 
**📌 USE THIS FIRST**  
**Role:** Master unified document combining both directives + current status + priority queue

**Contains:**
- ✅ Master Directive V5 requirements
- ✅ Companion Directive (Entry Architecture, Smart Entry, Visual Intelligence)
- ✅ CLOSE ITEMS (7 critical things to fix)
- ✅ Current gap status (what's broken/incomplete)
- ✅ 3-phase priority queue with dependencies
- ✅ Success criteria per phase

**When to use:**
- First time review of project
- Understanding architecture
- Planning implementation
- Checking acceptance criteria
- Updating task status

**Structure:**
- Executive Summary (2 min read)
- Companion Directive (requirements overview)
- CLOSE ITEMS (what must be fixed NOW)
- Current Gap Status (what's broken)
- Priority Queue (ordered by dependency)
- Success Criteria (how to verify completion)

---

### 2. **AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md**
**📌 USE THIS DAILY**  
**Role:** Tactical checklist for developers

**Contains:**
- 7 CLOSE ITEMS with specific instructions
- File locations and line numbers
- Code examples (wrong vs. right)
- Step-by-step fix instructions
- Verification steps per item
- Test requirements
- Commit messages

**When to use:**
- Starting daily work
- Need exact location to fix
- Need before/after code examples
- Verifying fix is correct
- Ready to commit

**Structure:**
- Each item has: Current (WRONG) → Fix Required → Verification → Test → Commit
- Implementation order (16-27 hours total)
- Daily checklist

---

### 3. **MASTER DIRECTIVE V5** (Referenced, not updated)
**Role:** Architecture foundation (Twin Engine, SICE, Worlds)

**When to reference:**
- Understanding Twin lifecycle
- SICE engine architecture
- World system design
- Database schema

**Location:** (You should have this from previous session)

---

### 4. **Companion Directive** (In "SELFPRINT V3 & upgrade directiv.txt")
**Role:** New entry/visual/localization requirements

**When to reference:**
- Entry Architecture details (Guest/Returning/PWA)
- Visual Intelligence specification
- Localization requirements
- Smart Landing page

**Included in:** SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md § 1

---

## 🚀 QUICK START (5 minutes)

### If you're starting today:
1. Open: **SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md**
2. Read: **Section 0** (Executive Summary) — 2 minutes
3. Read: **Section 2** (CLOSE ITEMS) — 3 minutes
4. Grab: **AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md**
5. Start: **CLOSE ITEM #1** (Session Storage hack)

### If you're resuming work:
1. Open: **AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md**
2. Find: Your task under **DAILY CHECKLIST**
3. Check: Its verification steps
4. Verify: It meets acceptance criteria
5. Commit: With provided message

---

## 🎯 WHAT YOU MUST UNDERSTAND

### Entry Architecture (Companion Directive - NEW)
```
Guest → Landing
Existing + Twin → Twin (direct, not Landing)
Existing + incomplete → Resume State
PWA + Twin → Twin (not Landing)
PWA + incomplete → Resume State
```

**Key point:** Returning users with Twin DO NOT see Landing. This is NEW.

### CLOSE ITEMS (Must be fixed before Phase 2)
1. **Session Storage Hack** → Use Supabase (Twin doesn't persist now!)
2. **64 Test Failures** → Fix until 529/529 pass
3. **Decision Learning Loop** → Close 3 TODOs
4. **Rate Limiting** → Add middleware (security)
5. **Input Validation** → Complete for all endpoints (security)
6. **Entry Resolver** → Centralized routing logic (NEW)
7. **Service Documentation** → All 62 services documented

### Critical Blockers
- **#1 (Session Storage)** blocks: Can't test Twin
- **#2 (Test failures)** blocks: Can't verify anything
- **#7 (Entry Resolver)** blocks: Can't do Smart Entry

---

## 📊 DOCUMENT HIERARCHY

```
SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md
│
├─ Section 0: Executive Summary (quick ref)
├─ Section 1: Companion Directive (requirements)
├─ Section 2: CLOSE ITEMS (what to fix)
│    └─ Links to → AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md
├─ Section 3: Current Gap Status (context)
├─ Section 4: Priority Queue (timeline)
└─ Section 5: Success Criteria (how to verify)

AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md
│
├─ CLOSE ITEM #1: Session Storage
├─ CLOSE ITEM #2: Tests
├─ CLOSE ITEM #3: Decision Loop
├─ CLOSE ITEM #4: Rate Limiting
├─ CLOSE ITEM #5: Input Validation
├─ CLOSE ITEM #6: Service Documentation
├─ CLOSE ITEM #7: Entry Resolver
│
└─ Implementation Order + Daily Checklist
```

---

## 💾 TOKEN MANAGEMENT

**Budget:** Assume 15,000–200,000 tokens per session

### How to stay efficient:
1. **Read small sections at a time** (not whole document at once)
2. **Use section references** (Section 2.1, not full document)
3. **Link to documents** instead of copying text
4. **Ask for specific line numbers** if you need code context
5. **Reference CLOSE ITEMS checklist** for exact locations

### When to re-read:
- Starting new session? Read Executive Summary (§0) + your CLOSE ITEM
- Lost context? Quick scan of Current Status (§3)
- Forgot priority? Check Priority Queue (§4)

---

## ✅ BEFORE YOU START WORK EACH SESSION

**Checklist (2 minutes):**
- [ ] Read Executive Summary (SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md § 0)
- [ ] Find your CLOSE ITEM in checklist
- [ ] Copy file location from checklist
- [ ] Understand current (WRONG) code
- [ ] Understand required fix
- [ ] Know verification steps before starting
- [ ] Know expected test outcomes
- [ ] Know commit message

**Then:** Start work on ONE item at a time

---

## 📝 ACCEPTANCE CRITERIA PER PHASE

### PHASE 1: CLOSE ITEMS (2-4 days)
- [ ] 529/529 tests passing (was 465/529)
- [ ] Twin essence persists in Supabase (not sessionStorage)
- [ ] All 3 Decision TODOs closed
- [ ] Rate limiting middleware active
- [ ] Input validation on all endpoints
- [ ] Entry Resolver working (all 4 paths)
- [ ] All 62 services documented

### PHASE 2: INTEGRATION (3-5 days)
- [ ] SICE engines verified end-to-end (all 12)
- [ ] Twin Lifecycle E2E test passes
- [ ] World Routing E2E test passes
- [ ] Visual Architecture consistent
- [ ] English localization complete
- [ ] No mixed-language flows
- [ ] SEO schema + metadata complete

### PHASE 3: FINAL (2-3 days)
- [ ] Mobile QA documented
- [ ] E2E test suite 90%+ coverage
- [ ] Performance baselines set
- [ ] Production deployment ready

---

## 🔗 DOCUMENT LINKS

**In this folder (`docs/`):**
- `SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md` ← **START HERE**
- `AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md` ← **DAILY REFERENCE**
- `README_FOR_AI_DEVELOPMENT.md` ← **THIS FILE**

**Referenced (not included):**
- Master Directive V5 (from previous session)
- Companion Directive (text file, summarized above)
- Production Audit Report (referenced in gap map)

---

## 🎓 KEY CONCEPTS

### Entry Path State
When a user enters the system, track:
```typescript
{
  entry_path: 'full_journey' | 'quick_analysis' | 'returning_user' | 'pwa',
  journey_state: 'landing' | 'onboarding' | 'analysis' | ... | 'worlds',
  last_completed_step: string,
  twin_exists: boolean,
  preferred_entry: 'twin' | 'dashboard' | 'landing'
}
```

### Smart Entry Decision Logic
```
User enters
  ↓
Is authenticated? 
  ├─ No → Show Landing
  └─ Yes → Resolve entry path
       ├─ Has Twin? → Go to Twin
       ├─ Journey incomplete? → Resume
       └─ New session? → Dashboard
```

### Visual Intelligence Language
- Stack: React + CSS + SVG + Canvas 2D (NO full 3D)
- Layers: Background → Atmosphere → Environment → Lighting → Twin → Particles → UI
- Depth: scale, blur, opacity, shadow, parallax, perspective, movement

---

## 🆘 IF YOU GET STUCK

### "I don't know what to do next"
→ Open `AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md` → Daily Checklist → see your assigned day

### "I need to understand why something is broken"
→ SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md → Section 3 (Current Gap Status)

### "I need to know if my fix is correct"
→ Find your CLOSE ITEM → read "Verification Steps" section

### "How do I commit this?"
→ Find your CLOSE ITEM → read "Commit Message" section

### "I'm lost on architecture"
→ SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md → Section 0 or Section 1

### "Token budget getting high"
→ Ask for specific line numbers/sections instead of full reads  
→ Use links/references instead of copying text  
→ Re-read checklist instead of full gap map

---

## 📅 RECOMMENDED SESSION FLOW

**Each 2-4 hour session:**

1. **Start (5 min):** Read Executive Summary (gap map § 0)
2. **Pick task (5 min):** Open CLOSE ITEMS checklist, find your item
3. **Understand (10 min):** Read the item's "Current Code" + "Fix Required" sections
4. **Implement (60-120 min):** Write the fix
5. **Verify (15 min):** Run verification steps
6. **Test (15 min):** Run tests
7. **Commit (5 min):** Use provided commit message
8. **Update (2 min):** Mark item completed in daily checklist
9. **Document (5 min):** Note any blockers for next session

**Result per session:** 1-2 CLOSE ITEMS completed

---

## 🎯 SUCCESS LOOKS LIKE

**End of Phase 1 (4 days):**
- All 7 CLOSE ITEMS checked off
- 529/529 tests passing
- Entry Resolver working
- Commit history shows clean, focused commits
- No blockers for Phase 2

**End of Project:**
- SELFPRINT V3 production-ready
- All tests passing
- All 12 SICE engines verified
- Full user journey working
- Mobile-responsive
- SEO complete
- Security hardened
- Localized (Thai + English)

---

**READY TO START?**

Open: `SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md`  
Read: Section 0 (Executive Summary)  
Then: Open `AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md`  
Start: CLOSE ITEM #1 (Session Storage hack)

**Questions?** Reference the section numbers in this guide.

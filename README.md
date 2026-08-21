# 🌟 Selfprint v3 — Personal Decision Intelligence

**AI-powered decision-making companion** สำหรับการติดตามการตัดสินใจและการเรียนรู้จากประสบการณ์
# 🚀 SELFPRINT V3 — START HERE (สำหรับ Claude AI Developer)
## เอกสารต้นทาง: การส่งมอบจากการออดิท

**อ่านไฟล์นี้ก่อน!**

---

## 📖 ลำดับการอ่าน (ตรวจสอบแล้ว)

### 🔴 Tier 1 - MUST READ BEFORE STARTING (บังคับ)

อ่านตามลำดับนี้อย่างเคร่งครัด:

#### 1️⃣ SELFPRINT_HANDOFF_SESSION_NEXT.md (อ่านก่อน)
- **ระยะเวลา:** 15-20 นาที
- **ทำไม:** เข้าใจภาพรวม + เตรียมตัวจิตใจ
- **ส่วนที่ต้องอ่าน:** ทั้งหมด
- **Action:** หลังอ่าน = เข้าใจ "ของคุณต้องทำอะไร"

#### 2️⃣ SELFPRINT_AUDIT_REPORT_20260821.md (ความเข้าใจ Status)
- **ระยะเวลา:** 10-15 นาที
- **ทำไม:** เห็นว่าต้อง fix อะไร + state ปัจจุบัน
- **ส่วนที่ต้องอ่าน:** Sections 1-3 (gap analysis)
- **Action:** หลังอ่าน = เข้าใจ "อะไรขาดไป"

#### 3️⃣ SELFPRINT_MASTER_COMMAND_AI_DEV.md (รายละเอียด)
- **ระยะเวลา:** 40-60 นาที
- **ทำไม:** รายละเอียดการทำแต่ละ task (P0-A through P0-L)
- **ส่วนที่ต้องอ่าน:** Sections 1-9 (everything)
- **Action:** หลังอ่าน = เข้าใจ "ยังไงจึงจะ Fix"

---

### 🟡 Tier 2 - OFFICIAL DIRECTIVES (Reference while working)

**อ่านพร้อม ๆ ขณะทำงาน (bookmark ไว้):**

#### SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md
- **ที่อยู่:** Repo root หรือ `/uploads/`
- **อ่านเมื่อ:** ต้องตัดสินใจ architecture / uncertain
- **ส่วนสำคัญ:**
  - Section 0: Authority + evidence hierarchy
  - Sections 3-10: Core features (lifecycle, twin, world)
  - Section 21: API lock (12 endpoints only)
  - Sections 23-30: Implementation order + definition of done

#### Selfprint_seniour_DEV_SKILL.txt
- **ที่อยู่:** Repo root หรือ `/uploads/`
- **อ่านเมื่อ:** ต้องทำให้ "verified" / uncertain about quality
- **ส่วนสำคัญ:**
  - Sections 1-3: Persona + tech stack
  - Sections 25-28: Batch execution + verification + hygiene
  - Rule 27: 100% Verification Mandate (ต้อง pass 5 layers)

---

## ⚡ TL;DR (ถ้าเร่งเวลา)

**Absolute Minimum (15 นาที):**
1. Read: HANDOFF_SESSION_NEXT.md (Sections: "YOUR JOB" + "IMMEDIATE ACTIONS")
2. Run: `git clone + npm install + npm run verify`
3. Start: P0-A per MASTER_COMMAND (Section "P0-A")

**Better (45 นาที):**
1. Read: All 3 files (Handoff + Audit + Command)
2. Run: local setup + tests
3. Start: P0-A with full understanding

**Best (2 hours):**
1. Read: All 3 files + V5 Directive + SKILL.txt
2. Setup: local environment completely
3. Start: P0-A with complete context

---

## 🎯 YOUR MISSION (ในคำเดียว)

```
Fix 40-50% incomplete implementation
→ Become 100% Production Ready
→ Pass all 34 Definition of Done checkboxes

Timeline: 40-60 hours (5-7 days intensive)
```

---

## 📋 DOCUMENTS IN THIS PACKAGE

| ไฟล์ | ขนาด | ระยะเวลา | Purpose |
|-----|------|----------|---------|
| **README_START_HERE.md** (ตัวนี้) | 2 KB | 5 นาที | Navigation guide |
| **SELFPRINT_HANDOFF_SESSION_NEXT.md** | 15 KB | 15-20 นาที | High-level handoff + immediate actions |
| **SELFPRINT_AUDIT_REPORT_20260821.md** | 12 KB | 10-15 นาที | Current state + gaps + issues |
| **SELFPRINT_MASTER_COMMAND_AI_DEV.md** | 25 KB | 40-60 นาที | Detailed implementation roadmap (P0-A thru P0-L) |
| **SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md** | 32 KB | 30-45 นาที | Official directive (reference) |
| **Selfprint_seniour_DEV_SKILL.txt** | 28 KB | 20-30 นาที | Development rules (reference) |

**Total reading time:** 2-3 hours (depending on depth)

---

## 🎬 QUICK START (3 STEPS)

### Step 1: Read Handoff (15 min)
```
Open: SELFPRINT_HANDOFF_SESSION_NEXT.md
Focus: "YOUR JOB" + "IMMEDIATE ACTIONS" + "THINGS YOU MUST KNOW"
Output: Understand what needs to be done
```

### Step 2: Setup (30 min)
```bash
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react
npm install
npm run verify    # Check current state
npm run test      # See what's broken
```

### Step 3: Read Command + Start (2-3 hours)
```
Open: SELFPRINT_MASTER_COMMAND_AI_DEV.md
Focus: P0-A section (detailed implementation)
Then: git checkout -b p0-a/restore-lifecycle
Then: Start implementing per MASTER_COMMAND
```

---

## 🚀 BEFORE YOU CODE

**Check these 3 things:**

### 1. Authority Hierarchy (ต้องรู้)
```
🔴 OFFICIAL (use to decide):
├─ SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md (V5 Sections 0-30)
├─ Selfprint_seniour_DEV_SKILL.txt (Rules 1-28)
├─ SELFPRINT_AUDIT_REPORT_20260821.md (current state)
└─ SELFPRINT_MASTER_COMMAND_AI_DEV.md (tasks A-L)

🟡 REFERENCE (check if stuck):
├─ Code in repository
└─ Database schema

❌ DEPRECATED (ignore):
├─ P2_HANDOFF_* (old)
├─ P3_HANDOFF_* (old)
└─ Old status documents
```

### 2. Verification Mandate (5 layers)
```
EVERY task must pass:
[ ] Static: npm run type-check (TypeScript 0 errors)
[ ] Unit: npm run test:unit (tests pass)
[ ] Integration: npm run test:integration (integration pass)
[ ] E2E: npm run test:e2e (critical journey pass)
[ ] Build: npm run build (compiles successfully)

NO shortcuts ❌
NO "probably works" ❌
```

### 3. Git Discipline (บังคับ)
```
✅ Create branch per task: git checkout -b p0-a/restore-lifecycle
✅ Test locally before push
✅ Clear commit messages (what + why)
✅ Update docs after each task
✅ Push when COMPLETE + VERIFIED
```

---

## ⚠️ CRITICAL WARNINGS

### 🔴 DO NOT:
```
❌ Ignore the handoff document (read it first)
❌ Skip reading V5 Directive (official source of truth)
❌ Add new features (only fix existing + implement incomplete)
❌ Create API #13 (12 APIs are locked)
❌ Report "complete" without 5-layer verification
❌ Trust old documentation as source (check code first)
❌ Ignore TypeScript errors (fix all before continuing)
❌ Push without running tests (all tests must pass)
```

### 🟡 BE AWARE:
```
⚠️  Project is 40-50% implemented (not 100%)
⚠️  Multiple handoff docs exist (causes confusion)
⚠️  Some services are stubs (need completion)
⚠️  Database schema exists but not all tested
⚠️  Build currently broken (TypeScript errors)
⚠️  Tests partial (30-80% coverage)
⚠️  Production NOT ready (gaps to close)
```

### ✅ DO:
```
✅ Read handoff document completely
✅ Understand authority hierarchy
✅ Follow git discipline exactly
✅ Test everything 5 layers
✅ Update docs after each task
✅ Commit + push when verified
✅ Create clear handoff if blocking (don't let context waste)
```

---

## 🛠️ ESSENTIAL COMMANDS

```bash
# Setup
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react
npm install

# Development
npm run dev           # Start dev server
npm run type-check    # TypeScript check
npm run lint          # Code quality
npm run format        # Format code

# Testing
npm run test          # All tests
npm run test:unit     # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e      # E2E tests

# Verify (5-layer check)
npm run verify        # Custom script (if exists)
# Or run manually:
npm run type-check && npm run test:unit && npm run test:integration && npm run test:e2e && npm run build

# Git
git checkout -b p0-a/restore-lifecycle  # New branch per task
git add .
git commit -m "P0-A: Description (with verification proof)"
git push origin p0-a/restore-lifecycle
```

---

## 📊 EXPECTED STATE AFTER EACH TASK

| Task | When Complete | Success Looks Like |
|------|---|---|
| P0-A | Day 1 | Lifecycle connected ✅, E2E passes, no dead-ends |
| P0-B | Day 1-2 | User resume working ✅, state persists |
| P0-C | Day 2-3 | Twin intelligent ✅, has grounded context |
| P0-D | Day 3 | World routing ✅, 12 worlds accessible |
| P0-E | Day 4 | NOVA/TWIN separated ✅, prompts distinct |
| P0-F | Day 4-5 | Prompt builder ✅, modular system |
| P0-G | Day 5 | All 12 worlds tested ✅, context works |
| P0-H | Day 5-6 | Visuals integrated ✅, smooth transitions |
| P0-I | Day 6 | Memory/decision ✅, learning loop works |
| P0-J | Day 6-7 | Security/perf/i18n ✅, all verified |
| P0-K | Day 7 | E2E smoke test ✅, production ready |
| P0-L | Day 7 | Docs locked ✅, archive old files |

**Final State: PRODUCTION READY ✅** (all 34 checkboxes)

---

## 💬 HOW TO ASK FOR HELP

If stuck, provide:
```
1. What task (P0-A, P0-B, etc.)
2. What you're trying to do
3. What error/behavior you got
4. What you expected
5. Relevant code snippet (if applicable)
6. V5 Directive section (if unsure about requirement)
7. SKILL.txt rule (if unsure about code quality)
```

**Better to ask clearly than waste 2 hours guessing.**

---

## ✅ FINAL CHECKLIST

Before starting work:

```
[ ] 1. Downloaded all 4 documents (or opened from repo)
[ ] 2. Understand: this is 40-60 hour sprint (intensive)
[ ] 3. Understand: authority hierarchy (V5 > SKILL > Code)
[ ] 4. Understand: must pass 5-layer verification EVERY task
[ ] 5. Understand: git discipline (1 branch = 1 task)
[ ] 6. Read: HANDOFF_SESSION_NEXT.md completely
[ ] 7. Understand: YOUR JOB + IMMEDIATE ACTIONS
[ ] 8. Understand: 17 gaps + 34 checkboxes to close
[ ] 9. Setup: local clone + npm install
[ ] 10. Ready: to start P0-A
```

---

## 🎯 ONE SENTENCE

```
You have 3 documents + official directives.
Read handoff → Understand state → Start P0-A.
No shortcuts. Verify everything. Production waits. 🚀
```

---


## 🧠 Architecture

**Frontend:** React 19 + TypeScript + Vite + Tailwind CSS  
**State:** Zustand + React Query  
**Backend:** Express.js (Node)  
**Database:** Supabase (PostgreSQL + Auth)  
**AI:** 12 SICE (Selfprint Intelligence Core Engines) + Claude API  
**Payment:** Stripe  
**Deploy:** Vercel  

---

## 🗺️ 5-Navigation Architecture

| # | Tab | Purpose |
|---|-----|---------|
| 1 | วันนี้ | Dynamic Personal Home |
| 2 | สำรวจ | Discover yourself |
| 3 | **TWIN** | **Chat with AI Twin (center)** |
| 4 | กิจกรรม | Do / Reflect / Practice |
| 5 | ฉัน | Personal control |

---

## 🔑 Environment Variables

See `.env.example` for required environment variables.

---

## 📞 Contact & Links

- **GitHub:** https://github.com/duriankab-dot/selfprint-v3-react
- **Production:** https://selfprint.one
- **Documentation Authority:** See [SELFPRINT_MASTER_DIRECTIVE_TH_CONSOLIDATED_v4.md](docs/SELFPRINT_MASTER_DIRECTIVE_TH_CONSOLIDATED_v4.md) (LEVEL 1)
- **Current Status:** See [SELFPRINT_PRODUCTION_STATUS_TH.md](docs/SELFPRINT_PRODUCTION_STATUS_TH.md) (LEVEL 2)

**Created:** 21 สิงหาคม 2026  
**For:** Claude AI Developer  
**Status:** ✅ Ready to Work  
**Next:** Open SELFPRINT_HANDOFF_SESSION_NEXT.md

# 🤝 SELFPRINT V3 — HANDOFF Document (Session ถัดไป)
## เอกสารส่งมอบ: Audit Complete → Ready for Implementation

**วันที่:** 21 สิงหาคม 2026  
**จาก:** Verification Session  
**ถึง:** AI Development Session (Next)  
**สถานะ:** ✅ Audit Complete — Ready to Work  
**ขอบเขต:** P0-A through P0-L (Intensive 40-60 hour sprint)

---

## 📚 เอกสารที่ต้องอ่านก่อนเริ่มงาน

**บังคับ (อ่านให้เข้าใจ):**

### 1️⃣ SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md
- ขนาด: ~1,200 บรรทัด
- ระยะเวลา: 30-45 นาที
- **ต้องอ่าน:** Sections 0, 3-10, 23-30
- **เพราะว่า:** นี่คือ Official Directive ที่ override เอกสารเก่าทั้งหมด
- **Takeaway:** ทำไมต้อง fix + target state คืออะไร

### 2️⃣ Selfprint_seniour_DEV_SKILL.txt
- ขนาด: ~1,000 บรรทัด
- ระยะเวลา: 20-30 นาที
- **ต้องอ่าน:** Rules 1-28, ให้เน้น 25-28
- **เพราะว่า:** Development discipline + verification mandate
- **Takeaway:** "ยังไงถึงจะ valid การทำงาน" + "ห้ามทำอะไร"

### 3️⃣ SELFPRINT_AUDIT_REPORT_20260821.md
- ขนาด: ~400 บรรทัด
- ระยะเวลา: 10-15 นาที
- **ต้องอ่าน:** Sections 1-3 (Gap analysis)
- **เพราะว่า:** เห็นว่าต้อง fix อะไร
- **Takeaway:** Status matrix + 17 gaps ที่ต้อง close

### 4️⃣ SELFPRINT_MASTER_COMMAND_AI_DEV.md
- ขนาด: ~1,500 บรรทัด (ตัวนี้เอง)
- ระยะเวลา: 40-60 นาที
- **ต้องอ่าน:** Sections 1-7 (ทั้งหมด)
- **เพราะว่า:** รายละเอียดการทำ P0-A through P0-L
- **Takeaway:** สิ่งที่ต้องสร้าง + test + verify สำหรับแต่ละ task

---

## 🎯 YOUR JOB (ของคุณต้องทำ)

### PRIMARY MISSION
```
ปิด 17 Carry-Forward Gaps จาก V5 Section 25
ให้ครบ 34 checkboxes จาก Definition of Done (V5 Section 28)
Verify 100% ตาม Selfprint_seniour_DEV_SKILL.txt

ผลสำเร็จ = Production Ready ✅
```

### SCOPE
```
✅ ต้องทำ: 12 tasks (P0-A through P0-L)
❌ ห้ามทำ: Feature ใหม่ หรือ API #13
✅ ต้องทำ: Verify 5 layers (Type + Unit + Integration + E2E + Build)
```

### TIME ESTIMATE
```
P0-A: 6-8 hours   (Lifecycle restoration)
P0-B: 4-6 hours   (User recovery)
P0-C: 8-12 hours  (Twin birth intelligence)
P0-D: 8-10 hours  (World routing)
P0-E: 6-8 hours   (NOVA/TWIN separation)
P0-F: 6-8 hours   (Prompt builder)
P0-G: 8-10 hours  (12 world testing)
P0-H: 6-8 hours   (Visual integration)
P0-I: 8-12 hours  (Memory/decision loop)
P0-J: 8-12 hours  (Security/perf/SEO/i18n)
P0-K: 6-8 hours   (E2E + smoke test)
P0-L: 4-6 hours   (Documentation lock)

TOTAL: 40-60 hours intensive work
ประมาณ: 5-7 วัน working 8-10 ชม/วัน
```

---

## 🏃 IMMEDIATE ACTIONS (ทำต่อ)

### First 30 minutes:
```
[ ] 1. Clone/update repo locally
      git clone https://github.com/duriankab-dot/selfprint-v3-react.git
      cd selfprint-v3-react
      npm install

[ ] 2. Read 4 directive documents (ซ้อมตาม checklist ด้านบน)

[ ] 3. Run current status
      npm run verify    # See what's broken

[ ] 4. Create working branch
      git checkout -b p0-all/integrated-fix

[ ] 5. Understand current architecture
      - Look at src/services/
      - Look at src/stores/
      - Check database schema
```

### First Hour:
```
[ ] 6. Read + understand Audit Report
      - Know 17 gaps
      - Know 34 checklist items
      - Know what's missing

[ ] 7. Set up local environment
      npm run dev        # Start dev server
      npm run test:unit  # See failing tests
```

### First 2 Hours:
```
[ ] 8. Start P0-A (Restore Lifecycle)
      - Find: components/core-awakening/, components/twin/
      - Understand: current flow
      - Identify: missing connection points

[ ] 9. Create test cases for P0-A
      - tests/e2e/lifecycle.spec.ts (new file)
      - Write: journey test (Login → Worlds)
```

---

## ⚠️ THINGS YOU MUST KNOW

### 1. Repository Status
```
✅ Setup: Done (Node.js, npm, TypeScript)
✅ Database: Supabase configured
✅ API: 12 endpoints defined (but some stub)
🔴 Build: Currently broken (TypeScript errors)
🔴 Tests: ~30-50% passing
🔴 Production: NOT ready (40% implementation only)
```

### 2. Authority Chain (บังคับปฏิบัติ)
```
IF conflict between documents:
  1. Use V5 Directive (Section relevant)
  2. Use SKILL.txt (Rule relevant)
  3. Use code in repo (actual truth)
  
NOT: Old README or old status docs
```

### 3. Testing Mandate
```
✅ EVERY task must pass 5-layer verification:
  1. Static: npm run type-check
  2. Unit: npm run test:unit
  3. Integration: npm run test:integration
  4. E2E: npm run test:e2e
  5. Build: npm run build

❌ NO "probably works" or "should be fine"
```

### 4. Git Discipline
```
✅ 1 task = 1 branch (p0-a/*, p0-b/*, etc.)
✅ Clear commit messages (describe what + why)
✅ Push after each task complete + verified
✅ Update docs after each task
```

### 5. Context Management (ส่ำคัญมาก)
```
IF token running low (~80% of budget):
  1. Stop current task (commit + push)
  2. Create HANDOFF_SESSION_[DATE].md
     ├─ What completed (with proof)
     ├─ What's blocked (why)
     ├─ What's next (detailed)
     └─ Key insights
  3. Archive this understanding
  
❌ DON'T push incomplete half-done work
❌ DON'T lose context by ignoring token limit
```

---

## 📊 WHAT YOU'LL FIND

### Code Structure
```
src/
├── components/       ← UI components
│   ├── auth/         ✅ Working
│   ├── onboarding/   ✅ Working
│   ├── analysis/     ✅ Working
│   ├── core-awakening/ 🔴 Incomplete (no Twin connection)
│   ├── twin/         🔴 Stub only (no intelligence)
│   └── worlds/       🔴 Partial (not full-screen)
├── services/         ← Business logic
│   ├── auth.service.ts ✅
│   ├── analysis.service.ts ✅
│   ├── twin.service.ts 🔴 (need to complete)
│   ├── world.service.ts 🔴 (need to complete)
│   └── nova.service.ts 🟡 (mixed with twin)
├── stores/           ← Zustand state
│   └── twin.store.ts 🔴 (incomplete)
└── lib/
    └── prompts/      🔴 (need to create prompt builders)

tests/
├── unit/             ✅ 80% coverage (partial)
├── integration/      🔴 Incomplete
└── e2e/              🔴 30% only

API (Supabase)
├── auth API          ✅ Working
├── twin-birth API    🔴 Stub (need intelligence)
├── world API         🔴 Incomplete
└── memory API        🔴 Schema only
```

### Key Files to Focus On
```
MUST TOUCH:
- src/components/core-awakening/  ← Connect to Twin
- src/components/twin/            ← Make intelligent
- src/components/worlds/          ← Full-screen routing
- src/services/twin.service.ts    ← Twin logic
- src/services/world.service.ts   ← World context
- src/lib/prompts/                ← Create prompt builders
- tests/e2e/                      ← Write comprehensive E2E

MUST UNDERSTAND:
- Database schema (supabase/*)
- API structure (api/*)
- Current state stores (src/stores/)
```

---

## 🚀 HOW TO WORK SYSTEMATICALLY

### Per Task Pattern (P0-A, P0-B, etc.):

```
1. UNDERSTAND
   [ ] Read the task description in MASTER_COMMAND
   [ ] Understand inputs + expected outputs
   [ ] Check existing code/services
   
2. PLAN
   [ ] Break down into smaller steps
   [ ] Identify files to create/modify
   [ ] Write test cases first (TDD approach)
   
3. IMPLEMENT
   [ ] Code the feature
   [ ] Keep tests in mind
   [ ] No shortcuts or hacks
   
4. TEST
   [ ] Run unit tests
   [ ] Run integration tests
   [ ] Write E2E test if critical journey
   
5. VERIFY (5-layer check)
   [ ] Static: npm run type-check ✅
   [ ] Unit: npm run test:unit ✅
   [ ] Integration: npm run test:integration ✅
   [ ] E2E: npm run test:e2e ✅
   [ ] Build: npm run build ✅
   
6. COMMIT
   [ ] git add .
   [ ] git commit -m "P0-X: [clear message]"
   [ ] Include: what changed, why, tests pass
   
7. UPDATE DOCS
   [ ] PROJECT_STATUS.md: mark task ✅
   [ ] MASTER_GAP_MATRIX.md: mark gaps closed
   
8. PUSH + CONTINUE
   [ ] git push origin p0-x/[branch-name]
   [ ] Move to next task
```

---

## 🛑 WHEN TO STOP & HANDOFF

**Stop working IF:**
```
1. Build won't compile (TypeScript errors)
2. Critical test failing (blocking other tasks)
3. Database connection broken
4. API endpoint not responding
5. Git merge conflict + can't resolve
```

**Create Handoff Document:**
```markdown
# HANDOFF: Session [Date]

## ✅ Completed
- P0-A: Lifecycle ✅ (verified all 5 layers)
- P0-B: User Recovery ✅ (tests pass)

## 🔴 Blocked
- P0-C: Twin Birth 🔴
  - Reason: Can't access analysis data
  - Issue: Analysis service returns null
  - Next: Debug + fix analysis context
  - Blocker: Line 42 in src/services/analysis.service.ts

## 📁 Key Files Modified
- src/components/core-awakening/index.tsx (+50 lines)
- src/services/twin.service.ts (+100 lines)
- tests/e2e/lifecycle.spec.ts (new)

## 🎯 Next Session
1. Fix analysis context issue (P0-C blocker)
2. Complete P0-C (Twin Birth intelligence)
3. Continue P0-D (World routing)

## 💡 Key Insights
- Twin initialization requires all 3 inputs (onboarding + analysis + visual-dna)
- World context must be passed separately from Twin identity
- Prompts must be separated (NOVA vs TWIN)
```

**Then stop coding + wait for next session**

---

## 📞 IF YOU GET STUCK

### Checklist for solving issues:

```
1. Check V5 Directive (Section 0-10 covers most concepts)
2. Check SKILL.txt (Rule 22-28 cover code quality)
3. Read the Audit Report (know exactly what's missing)
4. Check existing code patterns in repo
5. Check database schema matches expectations
6. Check test files to understand expected behavior
7. If still stuck:
   - Write clear description of problem
   - Show code + error message
   - Show what you expect vs what you get
   - Ask specifically what step is unclear
```

### Common Issues & Fixes:

```
❌ "TypeScript error: Cannot find module 'X'"
✅ Fix: npm install [@types/X] or check imports

❌ "Test failing: undefined is not a function"
✅ Fix: Check if service is initialized, mock it in test

❌ "Can't connect to database"
✅ Fix: Check .env.local has SUPABASE_URL + ANON_KEY

❌ "Twin not getting context from analysis"
✅ Fix: Check analysis.store has data before calling twin.service

❌ "World context not affecting prompt"
✅ Fix: Check world.store is updated before building prompt
```

---

## ✅ FINAL CHECKLIST BEFORE STARTING

```
[ ] 1. All 4 directive documents downloaded/saved
[ ] 2. GitHub repo cloned locally
[ ] 3. npm install completed without errors
[ ] 4. .env.local created with SUPABASE credentials
[ ] 5. npm run dev works (dev server starts)
[ ] 6. Current test status documented (npm run test)
[ ] 7. TypeScript errors listed (npm run type-check)
[ ] 8. Understood: authority chain (V5 > SKILL > Code)
[ ] 9. Understood: verification mandate (5 layers required)
[ ] 10. Understood: git discipline (1 task = 1 branch)
[ ] 11. Ready to start P0-A
[ ] 12. Context understood: this is intensive 40-60 hour sprint
```

---

## 🎯 SUCCESS LOOKS LIKE

### After P0-A (1st day):
```
✅ Lifecycle connected: Full Analysis → Core Awakening → Twin Birth
✅ No dead-ends in flow
✅ E2E test passes: user completes full journey
✅ Code merged to master
✅ PROJECT_STATUS updated
```

### After P0-D (2-3 days):
```
✅ All 4 priority-1 tasks complete (A, B, C, D)
✅ World routing full-screen working
✅ 12 worlds accessible
✅ Twin adapts per world
✅ Tests: E2E for critical journey pass
```

### After P0-L (5-7 days):
```
✅ All 12 tasks complete
✅ All 34 checkboxes from Definition of Done: ✅
✅ All 17 gaps from Carry-Forward: CLOSED
✅ 5-layer verification PASS on everything
✅ Build successful
✅ Tests >80% coverage
✅ Production gates verified
✅ Documentation synchronized
✅ PRODUCTION READY ✅
```

---

## 🏁 READY?

**Start immediately with:**
```bash
# 1. Setup
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react
npm install

# 2. Verify current state
npm run verify
npm run test

# 3. Read all 4 documents (checklist above)

# 4. Create working branch
git checkout -b p0-a/restore-lifecycle

# 5. Start implementing P0-A per MASTER_COMMAND
```

---

## 📬 HANDOFF COMPLETE

**From:** Verification Agent  
**To:** AI Development Agent  
**Status:** ✅ Ready to Work  
**Date:** 21 สิงหาคม 2026  
**Documents:** 3 files (Audit + Command + Handoff)  

**คำหนึ่ง:** ไปทำเลยครับ Production รอคุณอยู่ 🚀

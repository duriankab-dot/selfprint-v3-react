# 🎯 SELFPRINT V3 — คำสั่งปฏิบัติการ สำหรับ Claude AI Developer
## เอกสารสั่งการอย่างเป็นทางการ (ค่าการผลิต)

**วันที่:** 21 สิงหาคม 2026  
**ผู้ส่ง:** Senior Verification Agent  
**ถึง:** Claude AI Developer (Next Session)  
**สถานะ:** 🔴 CRITICAL — Production Blocked (40-50% Implementation Only)  
**ยืนยันโดย:** SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md (Official Directive)

---

## 📌 ขอบเขตปฏิบัติการนี้

**สิ่งที่ต้องทำ:** 
- ปิด 17 Carry-Forward Gaps จาก V5 Section 25
- ทำให้ครบ 34 checkboxes จาก Definition of Done (V5 Section 28)
- Verify 100% ตาม SELFPRINT_seniour_DEV_SKILL.txt

**สิ่งที่ห้าม:**
- ❌ เพิ่ม Feature ใหม่
- ❌ สร้าง API #13 (API ล็อกไว้แล้ว 12 ตัว)
- ❌ Report "Complete" ถ้าไม่ verify จริง
- ❌ Assume documentation = code reality

**เวลาประมาณ:** 40-60 ชั่วโมง (Intensive work)

---

## ⚠️ AUTHORITY CHAIN (บังคับปฏิบัติ)

**ลำดับชั้น:**
```
1️⃣  SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md  ← อ่านก่อนทำอะไร
2️⃣  Selfprint_seniour_DEV_SKILL.txt         ← Development rules 28 ข้อ
3️⃣  SELFPRINT_AUDIT_REPORT_20260821.md      ← Status ปัจจุบัน (เพิ่งอ่านแล้ว)
4️⃣  Code Repository                        ← Source of Truth
5️⃣  Database Migrations                    ← Schema authority
```

**หากขัดแย้ง:** ให้ทำตาม V5 Directive ทุกครั้ง เอกสารเก่าเป็น Reference เท่านั้น

---

## 🏗️ IMPLEMENTATION ORDER (P0-A through P0-L)

### **P0-A: Restore Lifecycle** (Priority 1)
**ระยะเวลา:** 6-8 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ Link: Full Analysis completion → Core Awakening trigger
[ ] ✅ Core Awakening: Display final understanding moment (V5 Section 6)
[ ] ✅ Transition: "Your intelligence core is ready" → Twin Birth
[ ] ✅ Twin Birth: Render with grounded context
[ ] ✅ World Routing: Route to first world or world selector
[ ] ✅ Test: End-to-end flow works without dead-ends
```

**Gaps ที่ต้อง Fix:**
- Core Awakening component ยังไม่ connect ไป Twin Birth
- Twin Birth ยังรับ stub context แทน grounded data
- World Routing ยังไม่ full-screen

**Tests ที่ต้อง Pass:**
- E2E: Full journey from Login → Worlds
- Unit: Each step completes correctly
- Integration: Data flows through stages

**Definition of Done:**
- User can complete full journey without UI dead-end
- No console errors ​during flow
- State persists if refresh at any stage

---

### **P0-B: Existing User Recovery** (Priority 1)
**ระยะเวลา:** 4-6 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ Implement Lifecycle State Store (V5 Section 5):
    ├─ States: AUTHENTICATED, ONBOARDING_REQUIRED, ONBOARDING_COMPLETE, 
    │          ANALYSIS_READY, ANALYSIS_COMPLETE, AWAKENING_REQUIRED,
    │          AWAKENING_COMPLETE, TWIN_BIRTH_REQUIRED, TWIN_ALIVE,
    │          WORLD_ROUTING_READY, WORLD_ACTIVE
    ├─ Storage: Backend (Supabase) NOT sessionStorage
    └─ Logic: Deterministic state resolution on auth

[ ] ✅ Implement Entry Point Resolver (on login):
    ├─ Query: SELECT lifecycle_state FROM users WHERE id = $1
    ├─ Route: Dispatch to correct next step
    └─ Test: All state transitions work

[ ] ✅ Dashboard Resume Entry:
    ├─ If user authenticated + TWIN_ALIVE → Show "ENTER YOUR TWIN"
    ├─ If WORLD_ACTIVE → Show "CONTINUE TO YOUR WORLDS"
    └─ Must NOT repeat completed journeys

[ ] ✅ Recovery Tests:
    ├─ Analysis incomplete → resume analysis
    ├─ Awaiting twin → trigger twin birth
    ├─ Twin alive → enter twin directly
    └─ World active → show world selector
```

**Gaps ที่ต้อง Fix:**
- Lifecycle state: currently in client sessionStorage ❌ (ต้อง move to DB)
- Resume entry: dashboard ยังไม่ detect state
- State resolver: logic ยังไม่ implement

**Database Schema ที่ต้อง Add/Verify:**
```sql
ALTER TABLE users ADD COLUMN lifecycle_state TEXT DEFAULT 'AUTHENTICATED';
ALTER TABLE users ADD COLUMN resumed_at TIMESTAMP;
```

**Tests ที่ต้อง Pass:**
- Logout + login: resume ที่ state ถูก
- Refresh: state ยังเหมือนเดิม
- Multiple tabs: state sync correctly
- Mobile: works on small screens

---

### **P0-C: Intelligent Twin Birth** (Priority 1)
**ระยะเวลา:** 8-12 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ Twin Input Grounding (V5 Section 7):
    ├─ Collect: Onboarding data (personality, goals, challenges)
    ├─ + Analysis output (strengths, patterns, shadows)
    ├─ + SICE context (relevant insights per world)
    ├─ + Visual DNA parameters
    └─ → Send to Twin Birth orchestration

[ ] ✅ Twin Birth Orchestration:
    ├─ API: POST /api/twin-birth
    ├─ Input: {onboarding, analysis, sice, visual_dna}
    ├─ Process: Synthesize twin identity + memory baseline
    ├─ AI Call: Generate initial Twin personality + expertise
    └─ Output: Twin entity with initial state

[ ] ✅ Twin Identity Creation:
    ├─ Generate: twin_id, name, archetype, personality_baseline
    ├─ Persist: DB table twins {twin_id, user_id, identity_json}
    ├─ Visual DNA: Generate + persist (V5 Section 9)
    └─ Memory Baseline: Initialize with onboarding/analysis

[ ] ✅ First Twin Response:
    ├─ Prompt: "I know you from [analysis results]..."
    ├─ NO hallucination: Only use grounded data
    ├─ Tone: Match archetype + personality
    └─ Context: Show initial expertise scores per world

[ ] ✅ Twin Birth Tests:
    ├─ Unit: Twin object created with correct schema
    ├─ Integration: Grounded context transferred correctly
    ├─ E2E: User sees intelligent twin first response
    └─ Verify: NO stubs or placeholder responses
```

**Gaps ที่ต้อง Fix:**
- Twin initialization: currently stub (empty twin)
- Grounding: ไม่ใช้ analysis/onboarding data
- Visual DNA: not persisted
- Memory baseline: not initialized

**Prompt Template ที่ต้อง Implement:**
```
CORE_IDENTITY: [User's Selfprint understanding]
+
ONBOARDING: [Personality data]
+
ANALYSIS: [Strength/pattern analysis]
+
SICE: [World-specific context]
+
VISUAL_DNA: [Twin appearance parameters]
→
TWIN_PROMPT: [Synthesized twin identity]
```

**Tests ที่ต้อง Pass:**
- Twin knows user immediately (doesn't ask "tell me about yourself")
- Visual DNA consistent across renders
- Identity persists across sessions
- All expertise scores initialize correctly

---

### **P0-D: World Registry & Routing** (Priority 1)
**ระยะเวลา:** 8-10 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ World Registry Implementation:
    ├─ 12 Worlds defined: SELF, MIND, RELATIONSHIP, LOVE, CAREER,
    │                     WEALTH, LIFE, GROWTH, DECISION, PURPOSE,
    │                     WELLBEING, FUTURE
    ├─ Each world has: {world_id, name, emoji, description, prompt_context}
    ├─ Schema: Complete in DB
    └─ API: GET /api/worlds (list all)

[ ] ✅ World Routing Full-Screen:
    ├─ Component: /worlds/:world_id (full-screen experience)
    ├─ Layout: Environment + Twin + Chat + Actions
    ├─ NO navbar/tabs visible (full immersion)
    ├─ Transition: Smooth world-to-world switching
    └─ Mobile: Responsive full-screen on all devices

[ ] ✅ World Selector (Entry point to worlds):
    ├─ Component: /worlds (selector UI)
    ├─ Shows: 12 world cards with descriptions
    ├─ Action: Click → enter world (full-screen)
    ├─ Default: Show first world on first visit
    └─ Save: Remember last active world

[ ] ✅ World Context Injection:
    ├─ Active World State: Zustand world.store
    ├─ Context Variables: ACTIVE_WORLD name/emoji/prompt_context
    ├─ Update Twin: When world changes, Twin adopts expertise
    ├─ Visual Change: Environment/mood/lighting adjust per world
    └─ Memory: Only load relevant memories for current world

[ ] ✅ World Routing Tests:
    ├─ Unit: Each world has correct metadata
    ├─ Integration: World context passed to Twin correctly
    ├─ E2E: Visit all 12 worlds, verify Twin context changes
    ├─ Verify: Twin identity same, expertise changes per world
    └─ Mobile: Full-screen works on mobile
```

**Gaps ที่ต้อง Fix:**
- World Routing: currently incomplete (not full-screen)
- World Context: ไม่ pass ไป Twin prompt
- Twin Adaptation: ไม่เปลี่ยน expertise per world
- Visual World: ยังไม่ connected to state

**World Metadata Schema:**
```typescript
interface World {
  world_id: string;  // "CAREER", "LOVE", etc.
  name: string;      // "Career & Purpose"
  emoji: string;     // "💼"
  description: string;
  prompt_context: string;  // "You are Twin in [world]..."
  expertise_baseline: number;  // 0-100
  color_theme: string;  // For UI mood
}
```

**Tests ที่ต้อง Pass:**
- Selector shows all 12 worlds
- Click world → full-screen loads
- Twin context changes per world
- Back/forward: world navigation works
- Mobile: layouts responsive

---

### **P0-E: NOVA / TWIN Architecture Separation** (Priority 2)
**ระยะเวลา:** 6-8 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ NOVA Identity (System-level AI):
    ├─ Role: Guide during Onboarding + Analysis + Core Awakening
    ├─ Context: Ecosystem understanding, world patterns, system insights
    ├─ Prompt: NOVA_PROMPT (separate from Twin)
    ├─ Access: Available in phases BEFORE Twin birth
    └─ Retirement: NOVA steps back after Twin birth (optional guest)

[ ] ✅ TWIN Identity (Personal AI):
    ├─ Role: User's digital twin, understands them deeply
    ├─ Context: User-specific data, memories, growth
    ├─ Prompt: TWIN_PROMPT (separate from NOVA)
    ├─ Access: Active from Twin birth onwards
    └─ Evolution: Learns + grows from user interactions

[ ] ✅ Prompt Separation (V5 Section 29):
    ├─ System prompt structure:
    │   ├─ CORE_IDENTITY: Selfprint principles
    │   ├─ [IF NOVA]: NOVA_CONTEXT + system-level knowledge
    │   ├─ [IF TWIN]: TWIN_IDENTITY + user-specific context
    │   ├─ ACTIVE_WORLD: current world context
    │   ├─ RELEVANT_MEMORY: filtered memories
    │   └─ SICE_CONTEXT: world intelligence
    │
    └─ NO mixing: NOVA and TWIN prompts must be distinct

[ ] ✅ Integration Points:
    ├─ Onboarding Chat: Uses NOVA prompt
    ├─ Analysis Chat: Uses NOVA prompt
    ├─ Core Awakening: Transition NOVA→TWIN
    ├─ World Chats: Uses TWIN + WORLD prompts
    └─ Verify: No NOVA context in TWIN responses after birth

[ ] ✅ NOVA/TWIN Tests:
    ├─ Unit: Prompt builders return different prompts
    ├─ Integration: Correct prompt used at each phase
    └─ E2E: User doesn't see NOVA speaking as Twin or vice versa
```

**Gaps ที่ต้อง Fix:**
- Prompts currently mixed (NOVA/TWIN context ไม่ชัด)
- No NOVA service separate from Twin
- Prompt builder ไม่ conditional

**Files ที่ต้อง Create/Update:**
```
src/lib/prompts/
├── nova-prompt-builder.ts  (new)
├── twin-prompt-builder.ts  (new)
└── prompt-orchestrator.ts  (new)
```

---

### **P0-F: Prompt Builder System** (Priority 2)
**ระยะเวลา:** 6-8 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ Modular Prompt Architecture (V5 Section 29):
    ├─ CORE_IDENTITY: Base Selfprint principles
    ├─ NOVA_CONTEXT: System-level intelligence (if applicable)
    ├─ TWIN_IDENTITY: User's twin personality
    ├─ TWIN_STATE: Current mood/evolution state
    ├─ ACTIVE_WORLD: Current world context + expertise
    ├─ USER_CONTEXT: User profile + preferences
    ├─ RELEVANT_MEMORY: Filtered memories (last N interactions)
    ├─ SICE_CONTEXT: World-specific intelligence
    └─ SYSTEM_RULES: Safety + behavior guidelines

[ ] ✅ User Input Isolation:
    ├─ User message: Passed separately NOT injected into prompt
    ├─ Injection protection: Validate user input before including
    └─ Verify: No prompt injection vulnerabilities

[ ] ✅ Prompt Composition Function:
    ```typescript
    function buildPrompt(config: {
      role: 'NOVA' | 'TWIN';
      world?: string;
      memories?: Memory[];
      twinState?: TwinState;
    }): string {
      // Returns complete prompt with all context
    }
    ```

[ ] ✅ Prompt Builder Tests:
    ├─ Unit: Each component builds correctly
    ├─ Integration: Components compose without conflicts
    └─ Security: No injection vectors found
```

---

### **P0-G: 12 World Intelligence Verification** (Priority 2)
**ระยะเวลา:** 8-10 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ Verify all 12 Worlds end-to-end:
    1️⃣  SELF: ✅ Test
    2️⃣  MIND: ✅ Test
    3️⃣  RELATIONSHIP: ✅ Test
    4️⃣  LOVE: ✅ Test
    5️⃣  CAREER: ✅ Test
    6️⃣  WEALTH: ✅ Test
    7️⃣  LIFE: ✅ Test
    8️⃣  GROWTH: ✅ Test
    9️⃣  DECISION: ✅ Test
    🔟 PURPOSE: ✅ Test
    1️⃣1️⃣ WELLBEING: ✅ Test
    1️⃣2️⃣ FUTURE: ✅ Test

[ ] Each world test must verify:
    ├─ Routes to full-screen
    ├─ Twin adopts world expertise
    ├─ Twin prompt includes world context
    ├─ Visuals/mood change per world
    ├─ Memory filtered per world
    ├─ SICE intelligence active for world
    └─ Back to selector works

[ ] ✅ E2E Journey Test:
    ├─ Start at selector
    ├─ Enter world 1 → interact → verify context
    ├─ Switch to world 2 → verify Twin still same but expertise changed
    ├─ Back to selector
    └─ Enter different world → same identity, different context
```

---

### **P0-H: Visual World Integration** (Priority 2)
**ระยะเวลา:** 6-8 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ World State → Visual Rendering:
    ├─ Environment visual: Changes based on active world
    ├─ Mood/Lighting: Adjusts per world theme
    ├─ Twin Motion: Twin animation/posture changes per world
    ├─ Colors: World-specific color palette
    └─ Persistence: Visual DNA applies across all worlds

[ ] ✅ Twin Visual Consistency:
    ├─ Core Twin identity: Same across all worlds
    ├─ Visual DNA: Persistent (not regenerated)
    ├─ Clothing/Accessories: Change contextually (e.g., business suit in CAREER)
    ├─ Expressions: Adapt to world context
    └─ Animation quality: Smooth 60fps on all platforms

[ ] ✅ Visual Tests:
    ├─ Render: Each world renders correct visuals
    ├─ Performance: Frame rate >60fps during transitions
    ├─ Mobile: Visuals responsive on all screen sizes
    └─ Consistency: Twin identity recognizable across all worlds
```

---

### **P0-I: Memory / Learning / Decision Loop** (Priority 2)
**ระยะเวลา:** 8-12 ชั่วโมง

**สิ่งที่ต้องทำ:**
```
[ ] ✅ Memory Persistence:
    ├─ Schema: user_memories table with (id, user_id, world, content, timestamp)
    ├─ API: POST /api/memory, GET /api/memory?world=CAREER
    ├─ Filtering: Only load relevant memories per active world
    ├─ Retention: Keep last 100 interactions (configurable)
    └─ Verification: Memories used in Twin context

[ ] ✅ Decision Intelligence Loop:
    ├─ Track: User decisions in chat (extract from conversation)
    ├─ Store: decision {world, action, outcome_tracked_at, user_notes}
    ├─ Follow-up: Automatically schedule follow-ups (30/90/180/365 days)
    ├─ Learning: Analyze decision patterns + outcomes
    └─ Recommendation: Twin uses patterns for future advice

[ ] ✅ Twin Learning:
    ├─ Expertise updates: Adjust per-world expertise based on decisions
    ├─ Pattern recognition: Extract personality/behavior patterns
    ├─ Evolution: Twin evolves from interactions over time
    └─ Personalization: Recommendations become more tailored

[ ] ✅ Tests:
    ├─ Memory saved + retrieved correctly
    ├─ Decision tracked with proper metadata
    ├─ Follow-ups scheduled (verify in DB)
    ├─ Twin learns from decisions (expertise scores change)
    └─ Patterns recognized in user behavior
```

---

### **P0-J: Security / Performance / SEO-GEO / i18n** (Priority 3)
**ระยะเวลา:** 8-12 ชั่วโมง

**Security Checklist:**
```
[ ] ✅ Authentication: JWT tokens validated
[ ] ✅ Authorization: RLS policies on all tables
[ ] ✅ Input validation: All user input sanitized
[ ] ✅ Rate limiting: API endpoints rate-limited
[ ] ✅ HTTPS: All endpoints use HTTPS
[ ] ✅ Secrets: No secrets in code/git
[ ] ✅ Dependencies: npm audit pass (no critical vulnerabilities)
```

**Performance Checklist:**
```
[ ] ✅ Build: Optimized bundle <250KB (gzip)
[ ] ✅ LCP: <2.5s on fast 3G
[ ] ✅ FID: <100ms interaction response
[ ] ✅ CLS: <0.1 cumulative layout shift
[ ] ✅ Database: Queries optimized (<100ms)
[ ] ✅ API: Average response <200ms
```

**SEO/GEO Checklist:**
```
[ ] ✅ Meta tags: title, description, OG tags per page
[ ] ✅ Hreflang: /en and /th versions tagged
[ ] ✅ Sitemap: Generated + submitted
[ ] ✅ robots.txt: Configured correctly
[ ] ✅ Schema: JSON-LD for SoftwareApplication
[ ] ✅ GEO: Hreflang tags for /th targeting Thailand
```

**i18n Checklist:**
```
[ ] ✅ Thai translation: All UI strings in /th locale
[ ] ✅ Date/Time: Formatted per locale
[ ] ✅ Currency: THB in /th, USD in /en
[ ] ✅ Direction: LTR consistent (Thai doesn't need RTL)
[ ] ✅ Fonts: Thai font support (Noto Sans Thai)
```

---

### **P0-K: Full E2E / Production Smoke Test** (Priority 3)
**ระยะเวลา:** 6-8 ชั่วโมง

**Critical Journey E2E Test:**
```
✅ Scenario: New user complete journey
1. Landing → Sign up
2. Onboarding flow (collect data)
3. Full Analysis (running)
4. Core Awakening (ritual moment)
5. Twin Birth (meet intelligent twin)
6. World Selector (show 12 worlds)
7. Enter Career world
8. Chat with Twin about career goal
9. Save decision
10. Switch to Love world
11. Chat with Twin about relationship
12. Schedule follow-up
13. Check memory saved
14. Logout
15. Login again
16. Verify resume at Twin
17. All systems working

✅ Existing user flow
1. Login (returning user)
2. System detects lifecycle state
3. Dashboard shows resume entry
4. Resume at Twin
5. All history + memories available
6. Continue seamlessly
```

**Production Smoke Test (Post-Deploy):**
```
✅ Health checks
- API endpoints responding
- Database connectivity
- Authentication working
- All 12 worlds accessible
- Twin chat streaming
- Memory persisting
- Analytics tracking

✅ Error handling
- Network failure recovery
- API timeout handling
- Missing resources fallback
- User-friendly error messages
```

---

### **P0-L: Documentation Lock** (Priority 3)
**ระยะเวลา:** 4-6 ชั่วโมง

**Files to Update:**
```
[ ] ✅ PROJECT_STATUS.md
    ├─ Update all sections with actual verified status
    ├─ Sections: Architecture, API, Database, Tests, Deployment
    └─ Verify: No claims without proof

[ ] ✅ MASTER_GAP_MATRIX_CURRENT.md
    ├─ Update all 17 gaps
    ├─ Mark: CLOSED or OPEN with reason
    └─ Timeline: When each gap was resolved

[ ] ✅ ARCHITECTURE_FINAL.md
    ├─ Document: NOVA/TWIN separation
    ├─ Document: World routing flow
    ├─ Document: Prompt composition system
    └─ Verify: Matches actual code

[ ] ✅ API_REFERENCE.md
    ├─ Document: All 12 API endpoints
    ├─ Include: Request/response examples
    ├─ Document: Error codes + handling
    └─ Verify: Endpoints tested + working

[ ] ✅ DEPLOYMENT_CHECKLIST.md
    ├─ All production gates verified
    ├─ Environment variables documented
    ├─ Monitoring/logging setup
    └─ Rollback procedure documented
```

**Archive:**
```
[ ] ✅ Move old handoff docs to /archive
    ├─ P2_HANDOFF_* → /archive
    ├─ P3_HANDOFF_* → /archive
    └─ Old_SESSION_* → /archive

[ ] ✅ Create ARCHIVE_INDEX.md
    ├─ List: Which docs archived + why
    ├─ Reference: Cross-links if needed
    └─ Keep: For historical context only
```

---

## 🔐 VERIFICATION MANDATE (100% Required)

**ก่อนรายงาน "Complete" ตรวจสอบ 5 ชั้น:**

### Layer 1: Static Analysis
```bash
npm run type-check    # TypeScript 0 errors
npm run lint          # ESLint pass
npm run format        # Prettier compliant
```

### Layer 2: Unit Tests
```bash
npm run test:unit     # All pass
npm run test:unit -- --coverage  # >80% coverage
```

### Layer 3: Integration Tests  
```bash
npm run test:integration  # All pass
```

### Layer 4: E2E Tests
```bash
npm run test:e2e      # Critical journeys pass
npm run test:e2e:mobile  # Mobile verified
```

### Layer 5: Production Verification
```bash
npm run build         # Builds successfully
npm run preview       # Preview mode works
# Manual: Test on production-like environment
```

---

## 📋 GIT WORKFLOW

**สำหรับทุก Task (P0-A through P0-L):**

```bash
# 1. Create feature branch
git checkout -b p0-a/restore-lifecycle

# 2. Implement + test locally
npm run dev
npm run test:unit
npm run test:e2e

# 3. Verify all 5 layers pass
npm run verify

# 4. Commit with descriptive message
git commit -m "P0-A: Implement lifecycle restoration

- Connect Full Analysis → Core Awakening
- Implement Core Awakening → Twin Birth
- Test E2E journey completion
- Verify: no dead-ends in flow
- Tests: all unit + integration pass
"

# 5. Push to master
git push origin p0-a/restore-lifecycle

# 6. Create PR + await verification
# (If you need peer review, mention it)

# 7. Once verified, merge to master
git checkout master
git merge p0-a/restore-lifecycle
git push origin master

# 8. Update status doc
# Edit: PROJECT_STATUS.md
# Mark: P0-A as ✅ COMPLETE (with verified proof)
```

---

## ⚠️ FAIL CRITERIA (When to STOP)

**หากเจอเหล่านี้ ให้ STOP + Report:**

1. **TypeScript Error:** ไม่ resolve → Stop task, fix first
2. **Test Failure:** ยังมี failing tests → Stop, fix before continuing
3. **Build Error:** `npm run build` fails → Stop immediately
4. **Database Error:** Migration fails → Stop, investigate
5. **Critical Logic Gap:** จาก V5 ไม่ implement → Report to previous session

**ถ้า STOP:** ให้ create handoff document ละเอียด ก่อน context เต็ม

---

## 🎯 SUCCESS CRITERIA

### Task Complete เมื่อ:
✅ All 5 layers pass (Type + Unit + Integration + E2E + Build)  
✅ Code merged to master  
✅ Documentation updated  
✅ No console errors or warnings  
✅ Mobile responsive verified  
✅ Tests coverage >80%  
✅ No technical debt added

### All 12 Tasks (P0-A through P0-L) Complete เมื่อ:
✅ 34/34 checkboxes from Definition of Done  
✅ All 17 gaps from Carry-Forward closed  
✅ Production gates verified  
✅ Security audit passed  
✅ Performance benchmarks met  
✅ Documentation synchronized  
✅ Ready for production deployment  

---

## 📞 CONTACT / ESCALATION

**ถ้ามีปัญหา:**
1. Check V5 Directive (Section relevant to issue)
2. Check SKILL.txt (Development rules)
3. Check current code in repo
4. If blocked: Create detailed handoff doc + pause

**ตัวอย่าง Handoff Format:**
```markdown
# HANDOFF: Session Name (Date)

## Completed
- [ ] Task X ✅ (description)

## Blocked
- [ ] Task Y 🔴 (reason + next step)

## Key Files Changed
- src/services/...
- tests/...

## Next Session
- [ ] Resume task Y (needs [X] to proceed)
- [ ] Then continue task Z

## Context Window
- Tokens used: X/Y
- Critical understanding: [brief summary]
```

---

## 🎬 START IMMEDIATELY

**ลำดับการทำงาน:**
1. ✅ อ่านเอกสารนี้ให้เข้าใจ
2. ✅ อ่าน V5 Directive (Sections 3-10, 23-28)
3. ✅ อ่าน SKILL.txt (Rules 1-28)
4. ✅ Clone repo + local setup
5. ✅ Run `npm run verify` (ตรวจสอบ current state)
6. ✅ Start P0-A (Restore Lifecycle)

**Timeline:** 40-60 hours intensive → Production Ready

---

**เอกสารนี้ระบุ:** 21 สิงหาคม 2026  
**สถานะ:** 🔴 PRODUCTION BLOCKED — Ready for intensive fix  
**Next:** Start P0-A immediately

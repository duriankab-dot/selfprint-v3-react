# 🚀 SELFPRINT v3.2 Phase 3 Integration - Team Update
**Date:** 2026-08-07  
**Language:** ไทย  
**Status:** Phase 3 Ready (Pending Brain Gateway)  
**All Teams:** Action Required Today  

---

## 📊 EXECUTIVE SUMMARY

| Component | Status | Owner | Timeline | Blocker? |
|-----------|--------|-------|----------|----------|
| Phase 2: Nova System Prompts | ✅ DONE | AI/ML | Complete | ❌ No |
| Phase 3: Brain Gateway Activation | ⏳ READY | Astrovera | Day 1 (Aug 8) | ⚠️ YES |
| Phase 3: Frontend Landing + Onboarding | 🟡 START | Frontend | Week 1 | ❌ No |
| Phase 3: Design Tokens + Themes | 🟡 START | Design | Week 1 | ❌ No |
| Phase 4: SCIE Baseline | 📋 QUEUE | Backend/AI | Week 3 | ❌ No |

**Bottom Line**: ทีม Astrovera ต้องจบ Day 1 ไม่งั้น Phase 3 cascade delay

---

## 🎯 WHAT'S DONE (Phase 1-2)

✅ 11 Hubs × 6 Moods × 18 Archetypes  
✅ Nova system prompts: 1,296 combinations  
✅ Token budget: 603-722 avg (verified)  
✅ getNovaPrompt.ts: Zero compilation errors  
✅ Test suite: All 6 functions passing  
✅ selfprintChat.ts: API wrapper ready  

---

## ⚠️ CRITICAL PATH (BLOCKER)

### Brain Gateway System Prompt Injection
**Status:** Code ready, awaiting Astrovera deploy  
**What:** Add `system` parameter to POST `/api/chat`  
**Effort:** 15 minutes  
**Impact:** Everything Phase 3+ blocked if not done  

```javascript
// File: D:\astrovera-v2\api\gateway.js
// Change: 5 lines only

const { messages, system, model = '...', temperature = 0.7 } = req.body;

if (system) {
  claudeRequest.system = system;
}
```

**Astrovera Action (TODAY Aug 7):**
1. ✅ Review code change above
2. ✅ Update gateway.js + commit
3. ✅ Run 2 tests (with/without system)
4. ✅ Deploy to staging by EOD
5. ✅ Notify SelfPrint team when ready

---

## 📋 TEAM-BY-TEAM ACTION ITEMS

### 🔴 ASTROVERA BACKEND (HIGH PRIORITY)

**Deadline:** Aug 8 EOD  
**Effort:** 2-3 hours  

**Tasks:**
- [ ] Code review: Brain Gateway changes (5 lines)
- [ ] Update `gateway.js` + commit
- [ ] Add unit tests (with/without system)
- [ ] Deploy to staging
- [ ] Manual test (5 scenarios):
  ```
  Test 1: Without system → Generic response ✓
  Test 2: Identity hub system → Focused response ✓
  Test 3: Decision hub system → Focused response ✓
  Test 4: Mood=stressed → Grounding tone ✓
  Test 5: Mood=ready → Energetic tone ✓
  ```
- [ ] Ping SelfPrint: "Brain Gateway ready"

**Success:** POST `/api/chat` accepts optional `system` param + returns personalized response

---

### 🟡 SELFPRINT FRONTEND (MEDIUM PRIORITY)

**Deadline:** Aug 14  
**Effort:** 3-4 days  

**Task 1: Landing Page (MEMO V2) - Days 1-3**
- [ ] Emotion selector: Interactive (6 moods)
  - User sees moods before hero text
  - Mood selection changes theme immediately
- [ ] Progressive CTAs: Add to each section
  - Each section has own CTA (not just hero)
  - Track which CTA user clicked
- [ ] Birth data: Move from top → end
- [ ] Context tracking: Remember CTA section
- **Deliverable:** Landing MEMO-compliant, emotion selector live

**Task 2: Design Tokens (CSS) - Day 1**
- [ ] Hub theme overrides (11 files):
  - colors, motion, typography per hub
- [ ] Mood theme overrides (6 files):
  - accent, speed, behavior per mood
- [ ] Test: Change `data-hub` attribute → colors update
- **Deliverable:** Theme switching working via CSS

**Task 3: Onboarding (MEMO V4) - Days 4-7**
- [ ] Emotion selector (same as landing)
- [ ] Nova conversation (guides birth data, not form)
- [ ] Birth data input: DOB + optional time/place
- [ ] AI Creation Sequence animation (2-3 sec)
- [ ] Initial blueprint display (60-70%)
- [ ] Fine-tuning flow (4 questions, 60%→85%)
- **Deliverable:** Full onboarding flow end-to-end

**Wait For:** Astrovera Brain Gateway ready (Day 1)  
**Unblock Yourself:** Can design locally, test with mock prompts

---

### 🎨 DESIGN (LOW PRIORITY)

**Deadline:** Aug 9  
**Effort:** 1-2 days  

**Tasks:**
- [ ] Finalize hub×mood color palette (66 combos)
  - Sample check: 10 combos look good?
- [ ] Export tokens.css with all overrides
- [ ] Approve AI Creation Sequence animation
  - Replaces loading screen (2-3 sec)
  - Nova announces: "Created your AI Twin, 60-70% clear"
- [ ] Approve progress meter design
  - 60% (amber) → 85% (gold) → 95% (green)

**Deliverable:** tokens.css + animation specs approved

---

### ✅ QA / PM (MONITORING)

**Deadline:** Aug 10  
**Effort:** Planning (no code)  

**Tasks:**
- [ ] Create testing checklist (TESTING_CHECKLIST_TH.md)
- [ ] Define happy paths (5+ user journeys)
- [ ] Plan E2E scenarios:
  - All 6 moods on landing
  - All 66 hub×mood combos (spot check 10+)
  - Error cases (invalid dates, network failures)
- [ ] Performance targets:
  - FCP < 2s, LCP < 4s
  - Latency p95 < 3s
- [ ] Accessibility checks (WCAG AA)

**Deliverable:** Test plan ready before Week 2

---

## 📅 TWO-WEEK TIMELINE

### WEEK 1 (Aug 8-14): FOUNDATION

| Day | Astrovera | Frontend | Design | Milestone |
|-----|-----------|----------|--------|-----------|
| 8 | 🔧 Brain Gateway update | 🟡 Landing start | ✅ Colors | Gateway ready |
| 9 | 🧪 Staging test | 🟡 Landing + tokens | 🎨 Animation approve | Tokens CSS done |
| 10 | ✅ Staging verified | 🟡 Landing finish | 📋 Review | Landing live |
| 11 | 📊 Monitor | 🟡 Onboarding start | 📊 Support | Onboarding begins |
| 12 | 📊 Monitor | 🟡 Onboarding mid | 📊 Support | — |
| 13 | 🟢 Deploy prod prep | 🟡 Onboarding finish | 📊 Support | Creation sequence ready |
| 14 | ✅ Prod ready | ✅ E2E working | 📊 Final review | Week 1 done |

**Week 1 Win:** Landing + Onboarding foundation live, Brain Gateway connected, theme system working

---

### WEEK 2 (Aug 15-21): AI TWIN CREATION

| Day | Frontend | Backend | QA | Milestone |
|-----|----------|---------|-----|-----------|
| 15 | 🟡 AI Creation anim | 📋 SCIE start | 🧪 E2E test | Animation live |
| 16 | 🟡 Blueprint display | 🟡 SCIE progress | 🧪 E2E test | 60-70% blueprint works |
| 17 | 🟡 Fine-tuning flow | 🟡 SCIE progress | 🧪 Integration test | Fine-tuning UI ready |
| 18 | 🟡 Fine-tuning finish | 🟡 SCIE progress | 🧪 Full flow test | 60%→85%→95% works |
| 19 | 🟢 Bug fixes | 🟡 SCIE progress | 🧪 Accessibility | — |
| 20 | 🟢 Performance tune | 🟡 SCIE progress | 🧪 Final check | — |
| 21 | ✅ Launch ready | 📋 SCIE queued | ✅ Sign-off | Phase 3 DONE ✅ |

**Week 2 Win:** Full onboarding MEMO-aligned, AI Twin created in 40 sec, user in Home, Phase 3 complete

---

## 📋 DELIVERABLES (Files to Create)

**Frontend:**
- [ ] `src/pages/LandingPage.tsx` (update)
- [ ] `src/pages/Onboarding.tsx` (update)
- [ ] `src/styles/tokens.css` (new)
- [ ] `src/services/nova-ai.ts` (update)
- [ ] `.env` (add REACT_APP_BRAIN_GATEWAY_URL)

**Documentation:**
- [ ] `01_LANDING_PAGE_MEMO_IMPLEMENTATION_TH.md` (by Aug 8)
- [ ] `02_ONBOARDING_FLOW_MEMO_IMPLEMENTATION_TH.md` (by Aug 8)
- [ ] `03_DESIGN_TOKENS_IMPLEMENTATION_TH.md` (by Aug 9)
- [ ] `TESTING_CHECKLIST_TH.md` (by Aug 10)

**Backend:**
- [ ] `D:\astrovera-v2\api\gateway.js` (update)
- [ ] `D:\astrovera-v2\tests\gateway.test.js` (update)

---

## ✅ SUCCESS CRITERIA (PHASE 3 DONE)

### Technical
- [ ] Brain Gateway accepts system prompt
- [ ] selfprintChat end-to-end working
- [ ] Landing emotion selector interactive + theme changes
- [ ] Onboarding full flow: Emotion → Birth → Creation → Blueprint → Fine-tune → Home
- [ ] Initial blueprint (60-70%) displaying correctly
- [ ] Fine-tuning animates smoothly (60%→85%→95%)
- [ ] All 66 hub×mood combos tested (spot check 10+)
- [ ] Dark mode working
- [ ] Mobile responsive
- [ ] Zero console errors

### Product (MEMO Alignment)
- [ ] User feels emotion selector is engaging, not "form start"
- [ ] User gets "First Aha" (AI Twin born, 60%) within 40 seconds
- [ ] User feels "Nova teaches" not "I fill survey"
- [ ] Birth data feels natural + optional
- [ ] User feels "watching AI Twin born" not "filling form"

### QA
- [ ] 10+ happy paths tested end-to-end
- [ ] Error handling working (invalid dates, network failures)
- [ ] WCAG AA accessible
- [ ] Performance: FCP < 2s, LCP < 4s, p95 latency < 3s

---

## 🔄 DEPENDENCY CHAIN

```
1. Brain Gateway System Param ⏱️ 15 min (Astrovera Day 1)
   ↓ BLOCKER
2. Landing MEMO V2 📅 3 days (Frontend Day 1-3)
   ↓
3. Onboarding MEMO V4 📅 4 days (Frontend Day 4-7)
   ↓
4. Initial Blueprint + Fine-tuning 📅 2 days (Frontend Day 8-9)
   ↓
5. Testing + Bug Fixes 📅 2 days
   ↓
✅ PHASE 3 LAUNCH READY (Week 2 EOD)
   ↓
6. Phase 4: SCIE Baseline (Concurrent Week 3)
```

---

## 📞 COMMUNICATION

**Daily Standup (Start Aug 8)**
- Time: 9:00 AM BKT
- Duration: 15 minutes
- Attendees: Astrovera lead, SelfPrint lead, Design, QA

**Checklist Each Day:**
- Astrovera: Brain Gateway status?
- SelfPrint: Blocked on anything?
- Design: Token feedback?
- QA: Testing ready?

**Escalation Path:**
- Blocker? → @Astrovera immediately
- Technical question? → @SelfPrint lead
- Design decision? → @Design

---

## 🚨 CRITICAL DATES

| Date | Event | Owner | Action |
|------|-------|-------|--------|
| Aug 7 (TODAY) | Phase 3 kickoff | All | Review this doc + confirm capacity |
| Aug 8 AM | Team standup #1 | All | Confirm start time |
| Aug 8 EOD | Brain Gateway ready | Astrovera | **HARD DEADLINE** |
| Aug 10 | Landing done | Frontend | Demo to team |
| Aug 14 | Onboarding done | Frontend | E2E test |
| Aug 21 EOD | Phase 3 launch | All | All systems go ✅ |

---

## 💾 WHERE TO FIND DOCS

**Project Root:** `D:\selfprint-v3-react\docs\`

```
00_CURRENT_STATUS_IMPLEMENTATION_PLAN_TH.md
  ├─ Full status + implementation plan
  └─ Reference: Current vs planned features

ASTROVERA_TO_SELFPRINT_MIGRATION_PLAN_TH.md
  ├─ Backend integration spec
  ├─ Testing strategy
  └─ Rollback procedures

TEAM_UPDATE_SELFPRINT_v3.2_PHASE3_INTEGRATION_TH.md ← THIS FILE
  ├─ Action items by team
  ├─ Timeline + dependencies
  └─ Send to all stakeholders daily

PHASE2_TO_PHASE3_QUICK_START.md
  └─ Quick reference for devs

INTEGRATION_SPEC_V1_PRELIMINARY.md
  └─ API contract (share with Astrovera)
```

---

## ✨ KEY PRINCIPLES (Remember)

1. **MEMO First** → Value before form, emotion before data
2. **Nova Always** → Conversation, not survey
3. **Backward Compatible** → Old clients still work
4. **Test First** → 5 scenarios before deploy
5. **Communicate** → Daily sync, escalate fast

---

## 🎯 WHAT WE'RE BUILDING

```
User Journey (40 seconds)
  ↓
Landing: "What's your mood?" (6 choices)
  ↓
Click CTA: "Let's create your AI Twin"
  ↓
Onboarding: "Tell me about you" (Nova guides)
  ↓
Nova: "Creating AI Twin... 60-70% clear"
  ↓
Blueprint: "Here's what I understand"
  ↓
"Help me know you better" (4 questions)
  ↓
"You're 85% clear now"
  ↓
Home: "I'll learn from every decision"
```

**That's Phase 3.** Ready? Let's go. 🚀

---

## 📝 SIGN-OFF CHECKLIST

**Before Aug 8 standup, confirm:**

- [ ] Astrovera: Ready to update Brain Gateway
- [ ] Frontend: Ready to start Landing + tokens
- [ ] Design: Color palette + animation approved
- [ ] QA: Test plan drafted
- [ ] PM: Timeline realistic? Resources allocated?

**If any "❌ No":** Stop here, sync with team

---

**Prepared by:** jb_DEV  
**Date:** 2026-08-07  
**Version:** 1.0 (Consolidated Team Update)  
**Status:** 🚀 Ready to share with all teams  
**Next Update:** Aug 8 EOD (end-of-day status)

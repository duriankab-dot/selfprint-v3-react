MASTER_PLAN.md — แผนจัดการโครงการ SELFPRINT v3 (Multi-AI Orchestration)
VERSION: 4.0 | LAST_UPDATED: 2026-09-26 | CURRENT_PHASE: 6 (COMPLETE)
BASELINE_TAG: baseline-eb26e59-1727251200
KNOWN_GOOD_COMMIT: eb26e59 (typecheck/functions typecheck/1050 tests/build ผ่านทั้งหมด)
RELEASE_COMMIT: cefd647 (HEAD, all phases complete)

🎯 PROJECT NORTH STAR
สร้าง Living Personal Intelligence Platform ที่:
(1) วิเคราะห์พฤติกรรม 12 มิติ (SICE) จากข้อมูลจริง ไม่ใช่โหราศาสตร์
(2) สร้าง AI Twin ที่ ไม่ซ้ำกันทุกคน (DNA deterministic จากวัน/เวลา/สถานที่เกิด + userId)
(3) Twin เรียนรู้และพัฒนาไปพร้อมผู้ใช้ผ่าน pipeline เดียว (v1→v2→v3) ไม่ใช่ analyze ใหม่ซ้ำ
(4) ลดล้างภาษา "ดูดวง/โหราศาสตร์" เปลี่ยนเป็น "Behavioral Science / Decision Intelligence"
(5) SEO/AEO/GEO-ready ทุกหน้า เพื่อจับคีย์เวิร์ด "AI Twin ไทย", "วิเคราะห์นิสัย AI", "Blind Spots การตัดสินใจ"

📊 CURRENT STATE SNAPSHOT
รายการ	สถานะ
Phase	6 (ALL PHASES COMPLETE — READY FOR RELEASE)
Active Feature Flags	LIVING_DIAGRAM=false, UNIFIED_PIPELINE=false, NO_ASTRO_LANG=true, TWIN_BIRTH_ROUTES=true, DECISION_INTELLIGENCE=true, WORLDS_V2=true
Baseline Commit	eb26e59 (known-good)
Open Tasks	None — all TC-001..607 complete
Blockers	ไม่มี
Last Session	session-009 (2026-09-26T13:00) — Phase 4-6 docs sync, MASTER_PLAN updated, release prep

🗺️ PHASE ROADMAP
Phase 0: Foundation + Critical Fixes + Technical SEO (Week 0) — ✅ COMPLETE
 TC-001 Baseline tag + Feature flags infrastructure
 TC-002 Astro language audit + replacement list (grep ทุกคำ запрет)
 TC-003 Token conflict audit (hardcoded colors ใน .tsx)
 TC-004 Twin DNA spec finalize (review ร่วมทีม)
 TC-005 Language switcher relocation (NavBar always-action area)
 TC-006 Sitemap.xml auto-generation + build script
 TC-007 Schema.org library (typed builders)
 TC-008 CI gates (typecheck + test + build + lint + stylelint + astro-check + token-check)
Phase 0 Gate (ต้องผ่านก่อนเข้ Phase 1):
✅ ทุก TC-00x ใน Phase 0: Tests pass + Docs updated + MASTER_PLAN updated
✅ npm run typecheck && npm test && npm run build ✅
✅ grep -r "ดูดวง\|โหราศาสตร์\|ดาว\|ราศี\|โชค\|ทำนาย" src/ → 0 ผลลัพธ์ (ยกเว้น /vs-astrology)
✅ stylelint → 0 hardcoded color violations
✅ Feature flags ทำงานใน local + staging
✅ MASTER_PLAN.md สะท้อนสถานะจริง

Phase 1: Living Diagram + Twin DNA + AEO Schemas (Week 1) — ✅ COMPLETE
 TC-101 twinVisualDNA.ts — deterministic unique DNA generator
 TC-102 SVGCore extraction (pure SVG components จาก EvolutionaryVisualSystem)
 TC-103 LivingDiagram wrapper + 3 drivers (Scroll/Step/Data)
 TC-104 LandingPage integration (mode=landing + DNA from DOB hash)
 TC-105 Onboarding integration (mode=onboarding + DNA refinement)
 TC-106 Dashboard integration (mode=dashboard + live DNA)
 TC-107 TwinProfilePage ใช้ DNA สำหรับ avatar
 TC-108 WorldEnvironment อ่าน DNA สำหรับ theme
 TC-109 LandingPage: Speakable + HowTo schema
 TC-110 Onboarding: QAPage schema สำหรับ Nova conversation
 TC-111 Dashboard: SoftwareApplication schema
Phase 1 Gate:
✅ 5 users → 5 distinct twin shapes (visual diff)
✅ Same user = same DNA across sessions
✅ ไม่มี hardcoded colors ใน components ใหม่
✅ Language switcher ข้าง audio button ทำงาน
✅ LCP < 2.5s, ไม่มี forced reflow (Lighthouse)
✅ AEO schemas render ถูกต้อง (Rich Results Test)

Phase 2: Unified Pipeline + Copy Rewrite + GEO Content (Week 2) — ✅ COMPLETE
 TC-201 AnalysisEngine.analyze(input, context, version) — merge v1/v2/v3
 TC-202 TwinStore layers architecture (v1_landing, v2_onboarding, v3_living + mergeLayers + evolutionLog)
 TC-203 VersionManager v1→v2→v3 triggers
 TC-204 useTwinInput accumulator hook
 TC-205 LivingDiagram ← twinStore.current + DNA (animate diff on version up)
 TC-206 Copy rewrite: Astro → Behavioral Science (จาก audit list)
 TC-207 VsAstrologyPage: Comparison table + Disclaimer Banner + FAQ schema
 TC-208 Global token migration (replace all violations)
 TC-209 GEO-Ready Fact interface + Entity Dictionary
 TC-210 Twin output → AIContentBlock (every insight citable)
 TC-211 DailyBriefPage: Speakable + Fact schema
Phase 2 Gate:
✅ Zero astrology terms in production build (grep)
✅ Zero hardcoded colorsใน .tsx (stylelint)
✅ Twin confidence progression: 20% → 65% → 85%+ มองเห็นใน LivingDiagram
✅ ทุกหน้า render ถูกต้องใน TH/EN, dark/light
✅ GEO entities consistent ทุกหน้า

Phase 3: Content Pages + Full Schema Coverage + Rollout (Week 3) — ✅ COMPLETE
 TC-301 Mobile: SVG sticky + bottom sheet ทุก 3 modes
 TC-302 Performance: LCP < 2s, TBT < 150ms (lazy-mount, preload fonts)
 TC-303 Accessibility: prefers-reduced-motion, ARIA labels, contrast
 TC-304 Remove dead code: EvolutionaryVisualSystem, old components
 TC-305 Flag rollout: 10% → 50% → 100% (Vercel/Cloudflare)
 TC-306 BlogArticle: BlogPosting + citations + entities
 TC-307 SciencePage: TechArticle + ScholarlyArticle citations
 TC-308 PricingPage: Product + Offer + AggregateRating
 TC-309 FAQPage: FAQPage + QAPage dual schema
 TC-310 AboutPage: Organization + Person schema
 TC-311 ContactPage: ContactPage + LocalBusiness
 TC-312 Lighthouse CI: SEO > 95, AEO checks
 TC-313 Docs: ARCHITECTURE.md, TWIN_DNA_SPEC.md, SEO_AEO_GEO_SPEC.md, CHANGELOG.md
Phase 3 Gate (Production Ready):
✅ All Phase Gates PASS
✅ Staging = production parity (feature flags only)
✅ Rollback tested (< 30 seconds via flag toggle)
✅ Team handoff complete

Phase 4: Core Missing Domains (P0) — Twin Birth, Decision, Worlds Core — ✅ COMPLETE
  TC-401 Twin Birth Routes — /twin-birth, /twin/:id, /twin/patterns ✅ DONE
  TC-402 Twin Birth Flow — CoreAwakening → TwinBirth transition, persistence, reload recovery ✅ DONE
  TC-403 Decision Core — Decision form (context + Twin context), persistence (Supabase), history ✅ DONE
  TC-404 Decision Intelligence — Compare alternatives, tradeoffs analysis, AI insight SLA ✅ DONE
  TC-405 Decision Export — CSV/JSON export, shareable links ✅ DONE
  TC-406 Worlds Visual Layer — 12 World tiles (WorldsHub), WorldDetail page with intelligence panels ✅ DONE
  TC-407 World-Twin Integration — World-specific intelligence, Twin relationship, data input per world ✅ DONE
  TC-408 Worlds E2E — E2E tests for all 12 worlds navigation + detail ✅ DONE

Phase 4 Gate:
✅ TC-401..408: All tests pass + Docs updated
✅ Twin Birth routes accessible + functional
✅ Decision form → persistence → history working
✅ 12 Worlds tiles + detail views navigable
✅ All Phase 4 E2E tests PASS
✅ MASTER_PLAN updated with Phase 4 completion

Phase 5: Living Twin, Memory, Evolution, Session Persistence — ✅ COMPLETE
  TC-501 LivingTwin Dashboard — MemoryPanel, EvolutionTimeline, InsightCards integrated ✅ DONE
  TC-502 MemoryInsights Page — search, filter, relevance scoring, context preview ✅ DONE
  TC-503 EvolutionVisualization — timeline, trigger attribution, version diff (v2→v3) ✅ DONE
  TC-504 IntelligenceHub — Decision/World/Memory dashboard panels + Twin panels ✅ DONE
  TC-505 Session Persistence — auth restore, route state, cross-tab sync ✅ DONE
  TC-506 Hooks — useMemoryInsights, useEvolution, useSessionPersistence ✅ DONE
  TC-507 CSS Tokens — --color-version-1/2/3 for evolution stages ✅ DONE

Phase 5 Gate:
✅ TC-501..507: All tests pass + Docs updated
✅ LivingTwin components render + integrate with TwinContext
✅ MemoryInsights page functional (search, filter, preview)
✅ EvolutionVisualization shows timeline + diff
✅ IntelligenceHub aggregates all panels
✅ Session persistence works across tabs
✅ MASTER_PLAN updated with Phase 5 completion

Phase 6: Cross-domain Tests, Negative Cases, Mobile E2E, Performance, Security, Docs — ✅ COMPLETE
  TC-601 Cross-domain Integration Tests — Birth → Memory → Evolution → Decision → Worlds ✅ DONE
  TC-602 Negative/Edge Case Coverage — Auth, empty states, errors, network, inputs ✅ DONE
  TC-603 Mobile E2E Suite — Touch targets, scroll, PWA offline, viewport, safe area ✅ DONE
  TC-604 Performance Baselines — LCP<TBT<CLS<FID, bundle size, resource loading ✅ DONE
  TC-605 Security Audit — RLS, auth boundaries, secrets, rate limits, XSS/CSRF ✅ DONE
  TC-606 Documentation Sync — Specs v1.2+, CHANGELOG, API, DB, Architecture ✅ DONE
  TC-607 Final Closure Gates — 29 domains, 8 gates, sign-off ✅ DONE

Phase 6 Gate (RELEASE READY):
✅ TC-601..607: All tests pass + Docs updated
✅ Cross-domain E2E: 100% critical paths covered
✅ Negative cases: all error boundaries + fallbacks tested
✅ Mobile E2E: PWA offline, touch, viewport PASS
✅ Performance: budgets defined, CI gates ready
✅ Security: RLS verified, no secrets in code, rate limits active
✅ Docs: all specs current, CHANGELOG updated
✅ MASTER_PLAN updated with Phase 6 completion
✅ 100% Closure Book achieved (29/29 domains CLOSED)

🎫 ACTIVE TASK CARDS (All Phases Complete)
ID	Title	Phase	Priority	Estimate	DoD Checklist
TC-401	Twin Birth Routes	4	P0	8h	[✅] TwinBirthPage [✅] TwinProfileDetailPage [✅] TwinPatternsPage [✅] App.tsx routing [✅] Build pass
TC-402	Twin Birth Flow	4	P0	16h	[✅] CoreAwakening→TwinBirth transition [✅] Persistence [✅] Reload recovery [✅] Tests
TC-403	Decision Core	4	P0	24h	[✅] Decision form [✅] Supabase persistence [✅] History [✅] Tests
TC-404	Decision Intelligence	4	P0	16h	[✅] Compare alternatives [✅] Tradeoffs analysis [✅] AI insight SLA [✅] Tests
TC-405	Decision Export	4	P1	8h	[✅] CSV/JSON export [✅] Shareable links [✅] Tests
TC-406	Worlds Visual Layer	4	P0	24h	[✅] 12 World tiles [✅] WorldDetail page [✅] Intelligence panels [✅] Tests
TC-407	World-Twin Integration	4	P0	16h	[✅] World-specific intelligence [✅] Twin relationship [✅] Data input per world [✅] Tests
TC-408	Worlds E2E	4	P1	8h	[✅] E2E all 12 worlds [✅] Navigation + detail [✅] Tests
TC-501	LivingTwin Dashboard	5	P0	16h	[✅] MemoryPanel [✅] EvolutionTimeline [✅] InsightCards [✅] Integration [✅] Tests
TC-502	MemoryInsights Page	5	P0	16h	[✅] Search [✅] Filter [✅] Relevance scoring [✅] Context preview [✅] Tests
TC-503	EvolutionVisualization	5	P0	16h	[✅] Timeline [✅] Trigger attribution [✅] Version diff [✅] Tests
TC-504	IntelligenceHub	5	P0	16h	[✅] Decision/World/Memory panels [✅] Twin panels [✅] Tests
TC-505	Session Persistence	5	P0	12h	[✅] Auth restore [✅] Route state [✅] Cross-tab sync [✅] Tests
TC-506	Hooks (Memory/Evolution/Session)	5	P0	8h	[✅] useMemoryInsights [✅] useEvolution [✅] useSessionPersistence [✅] Tests
TC-507	CSS Tokens (Evolution)	5	P1	4h	[✅] --color-version-1/2/3 [✅] Tests
TC-601	Cross-domain Integration Tests	6	P0	16h	[✅] Birth→Memory→Evolution→Decision→Worlds [✅] Tests
TC-602	Negative/Edge Case Coverage	6	P0	16h	[✅] Auth [✅] Empty states [✅] Errors [✅] Network [✅] Inputs [✅] Tests
TC-603	Mobile E2E Suite	6	P0	16h	[✅] Touch targets [✅] Scroll [✅] PWA offline [✅] Viewport [✅] Safe area [✅] Tests
TC-604	Performance Baselines	6	P0	12h	[✅] LCP/TBT/CLS/FID [✅] Bundle size [✅] Resource loading [✅] Tests
TC-605	Security Audit	6	P0	12h	[✅] RLS [✅] Auth boundaries [✅] Secrets [✅] Rate limits [✅] XSS/CSRF [✅] Tests
TC-606	Documentation Sync	6	P0	8h	[✅] Specs v1.2+ [✅] CHANGELOG [✅] API [✅] DB [✅] Architecture [✅] Tests
TC-607	Final Closure Gates	6	P0	8h	[✅] 29 domains [✅] 8 gates [✅] Sign-off [✅] Tests

📋 PHASE GATE DEFINITIONS (บังคับ)
Phase 0 Gate → Phase 1
✅ All Phase 0 TCs: Tests pass + Docs updated + MASTER_PLAN updated
✅ npm run typecheck && npm test && npm run build → PASS
✅ Astro language check → 0 violations (except /vs-astrology)
✅ Token compliance check → 0 hardcoded colors
✅ Feature flags functional (local + staging)
✅ MASTER_PLAN.md reflects actual state

Phase 1 Gate → Phase 2
✅ All Phase 1 TCs: Tests pass + Docs updated + MASTER_PLAN updated
✅ Visual uniqueness verified (5 users = 5 distinct twins)
✅ DNA deterministic (same user = same DNA)
✅ LCP < 2.5s, no forced reflow
✅ AEO schemas valid (Rich Results Test)
✅ Mobile sticky + bottom sheet working

Phase 2 Gate → Phase 3
✅ All Phase 2 TCs: Tests pass + Docs updated + MASTER_PLAN updated
✅ Zero astrology terms, zero hardcoded colors
✅ Pipeline v1→v2→v3 working end-to-end
✅ Twin confidence visible progression
✅ GEO entities consistent

Phase 3 Gate → Production
✅ All Phase 3 TCs: Tests pass + Docs updated + MASTER_PLAN updated
✅ Lighthouse CI: SEO>95, Perf>90, A11y>95, BP>90
✅ Staging parity verified
✅ Rollback < 30s tested
✅ All docs current (ARCHITECTURE, TWIN_DNA_SPEC, SEO_AEO_GEO_SPEC, CHANGELOG)

Phase 4 Gate → Phase 5
✅ TC-401..408: All tests pass + Docs updated
✅ Twin Birth routes functional + E2E PASS
✅ Decision CRUD + compare + export PASS
✅ 12 Worlds tiles + detail + E2E PASS
✅ MASTER_PLAN updated with Phase 4 completion

Phase 5 Gate → Phase 6
✅ TC-501..507: All tests pass + Docs updated
✅ LivingTwin components render + integrate with TwinContext
✅ MemoryInsights page functional (search, filter, preview)
✅ EvolutionVisualization shows timeline + diff
✅ IntelligenceHub aggregates all panels
✅ Session persistence works across tabs
✅ MASTER_PLAN updated with Phase 5 completion

Phase 6 Gate → RELEASE
✅ TC-601..607: All tests pass + Docs updated
✅ Cross-domain E2E: 100% critical paths covered
✅ Negative cases: all error boundaries + fallbacks tested
✅ Mobile E2E: PWA offline, touch, viewport PASS
✅ Performance: budgets defined, CI gates ready
✅ Security: RLS verified, no secrets in code, rate limits active
✅ Docs: all specs current, CHANGELOG updated
✅ MASTER_PLAN updated with Phase 6 completion
✅ 100% Closure Book achieved (29/29 domains CLOSED)

🔄 SESSION HANDOFF PROTOCOL (บังคับทุก Session)
On Session Start:
# 1. อ่านสถานะปัจจุบัน
cat MASTER_PLAN.md
cat .ai/context-pack/$(ls -t .ai/context-pack/ | head -1)

# 2. เลือก Task ถัดไปจาก ACTIVE TASK CARDS
# 3. สร้าง/อัพเดท Task Card
cp .ai/task-cards/TEMPLATE.md .ai/task-cards/TC-XXX.md
# แก้ไข TC-XXX.md ให้เฉพาะเจาะจง

# 4. สร้าง work branch
git checkout -b task/TC-XXX-description
During Work (ทุก micro-step):
เขียน code + tests
อัพเดท docs ที่เกี่ยวข้อง (ARCHITECTURE.md, specs)
รัน: npm run typecheck && npm run lint && npm test
Task Complete (ก่อน commit):
✅ Verify ทุก DoD checkboxes ใน TC-XXX.md
✅ อัพเดท MASTER_PLAN.md:
Task status → Done
Phase progress
Decisions/blockers ใหม่ (ถ้ามี)
✅ อัพเดท docs/ (ถ้ามีการเปลี่ยนแปลง)
✅ รัน FULL CI locally: npm run typecheck && npm run lint && npm test && npm run build
✅ Commit (atomic, 1 task = 1 commit):
git add -A
git commit -m "feat(scope): description — TC-XXX

- Changes...
- Updated: ARCHITECTURE.md, MASTER_PLAN.md"
✅ Push + PR:
git push origin task/TC-XXX-description
gh pr create --title "TC-XXX: Title" --body "$(cat .ai/task-cards/TC-XXX.md)"
Session End (บังคับ):
# 1. เขียน Context Pack
cat > .ai/context-pack/session-XXX-context.json << 'EOF'
{
  "sessionId": "session-XXX",
  "timestamp": "2026-09-25T...",
  "phase": 0,
  "completedTasks": ["TC-XXX"],
  "currentState": { "featureFlags": {...}, "baselineTag": "...", "lastCommit": "..." },
  "nextTasks": [{"id": "TC-XXX", "title": "...", "phase": 0, "priority": "P0"}],
  "blockers": [],
  "decisions": [...],
  "filesModified": [...],
  "testResults": { "typecheck": "pass", "lint": "pass", "test": "pass (XXX/XXX)", "build": "pass" }
}
EOF

# 2. เขียน Session Log
cat > .ai/sessions/session-XXX-log.md << 'EOF'
# Session XXX Log
**Date**: 2026-09-25
**Duration**: XX min
**Phase**: 0
**Completed**: TC-XXX
**Decisions**: [...]
**Next**: TC-XXX
EOF

# 3. Commit handoff
git add .ai/context-pack/ .ai/sessions/ MASTER_PLAN.md
git commit -m "chore(session-XXX): handoff — plan + context updated"
git push
🤖 AI AGENT COORDINATION PROTOCOL
Agent Roles (ต่อ Session)
Agent	Role	Scope	Handoff Artifact
AI-Architect	Technical design, API contracts, architecture docs	Cross-cutting	docs/ARCHITECTURE.md, API_CONTRACTS.md
AI-Frontend	React components, LivingDiagram, UI integration	src/components/, src/pages/	Component APIs, Storybook
AI-Pipeline	AnalysisEngine, TwinStore, data flow	src/lib/, src/store/, src/hooks/	Type definitions, engine specs
AI-SEO	Schema.org, AEO/GEO, content structure	src/lib/schemas.ts, page schemas	SEO_AEO_GEO_SPEC.md
AI-Docs	Documentation sync, Thai translation, changelog	docs/, MASTER_PLAN.md, CHANGELOG.md	All docs current
Parallel Work Rules:
หนึ่ง agent ต่อ task card — ห้ามทับซ้อน
Shared dependencies → API contracts ก่อน (AI-Architect กำหนด, อื่นๆ implement)
Daily sync ผ่าน MASTER_PLAN.md — แต่ละ agent อัพเดท task row ของตน
Conflict = ยกให้มนุษย์ตัดสินใจ — ห้ามเดา
🛡️ QUALITY GATES (Automated Enforcement)
// package.json scripts
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
Validation Scripts (สร้างใน .ai/scripts/):
check-astro-language.js — grep คำ запрет ใน src/ (ยกเว้น vs-astrology)
check-hardcoded-colors.js — grep hex/rgb ใน .tsx (ยกเว้น test files)
validate-master-plan.js — ตรวจ MASTER_PLAN.md task statuses match git commits + doc updates
generate-sitemap.ts — อ่าน App.tsx routes, generate sitemap.xml + hreflang
📁 DIRECTORY STRUCTURE (สร้างทันที)
selfprint-v3-react/
├── MASTER_PLAN.md                 ← 🔴 SINGLE SOURCE OF TRUTH
├── .ai/
│   ├── context-pack/              ← Session handoff packages
│   ├── task-cards/                ← Atomic work units
│   ├── phase-gates/               ← Gate definitions
│   ├── sessions/                  ← Session logs
│   └── scripts/                   ← Validation scripts
├── docs/
│   ├── ARCHITECTURE.md            ← Technical architecture
│   ├── TWIN_DNA_SPEC.md           ← Twin uniqueness spec
│   ├── SEO_AEO_GEO_SPEC.md        ← Search specs
│   ├── API_CONTRACTS.md           ← Internal APIs
│   └── DEPLOYMENT.md              ← Deploy procedures
└── .github/workflows/
    ├── ci-gate.yml
    ├── phase-gate.yml
    └── deploy.yml
🎯 IMMEDIATE NEXT STEPS (RELEASE PREP)
# 1. Product Owner demo & sign-off (Gate 7)
# 2. Tag v4.0.0 release: git tag v4.0.0 && git push origin v4.0.0
# 3. Production deploy: npm run deploy:production
# 4. Post-release monitoring: k6 smoke, error tracking, user feedback

📌 ENFORCEMENT CHECKLIST (พิมพ์ไว้หน้าจอ)
✅ MASTER_PLAN.md มีอยู่และเป็นปัจจุบัน
✅ ทุก task มี Task Card พร้อม DoD
✅ ทุก commit: Tests pass + Docs updated + MASTER_PLAN updated
✅ ทุก session: Context pack + Session log committed
✅ ทุก phase: Gate validation PASS ก่อน phase ถัดไป
✅ ไม่มีภาษาดูดวง/โหราศาสตร์ ในหน้า non-comparison
✅ ไม่มี hardcoded colors ใน .tsx files
✅ Feature flags ควบคุม features ใหม่ทั้งหมด
✅ CI รันทุก PR + block merge ถ้า fail
✅ Staging = feature flag subset, ไม่ใช่ branch แยก
🤝 ข้อตกลง: "This Is The Way"
ตั้งแต่ตอนนี้: ไม่มีงานเริ่มโดยไม่มี Task Card, ไม่มี commit โดยไม่มี DoD, ไม่มี phase advance โดยไม่มี Gate, ไม่มี session จบโดยไม่มี Handoff. MASTER_PLAN.md คือความจริงเพียงอย่างเดียว.

📝 TASK CARD TEMPLATE (ใช้สำหรับทุก Task)
# TC-XXX: Task Title
**Phase**: X | **Priority**: P0/P1/P2 | **Estimate**: Xh
**Assignee**: AI-X | **Depends On**: TC-XXX / Phase X Gate
**Feature Flag**: FLAG_NAME

## 🎯 OBJECTIVE
[คำอธิบายสั้นๆ ว่าทำอะไร ทำไม จบแล้วได้อะไร]

## 📋 DEFINITION OF DONE (ALL REQUIRED)
- [ ] Deliverable 1 (เฉพาะเจาะจง: ไฟล์, ฟังก์ชัน, metric)
- [ ] Deliverable 2
- [ ] Unit tests: scope + coverage
- [ ] Storybook stories (ถ้าเป็น UI component)
- [ ] **Docs updated**: docs/XXX.md (section ใด)
- [ ] **MASTER_PLAN.md updated**: Task status, phase progress
- [ ] **All tests pass**: `npm test -- <scope>`
- [ ] **Build passes**: `npm run build`

## 🔧 IMPLEMENTATION NOTES
[รายละเอียดเทคนิค: source files, interfaces, algorithms, gotchas]

## 🧪 TEST SPEC
```typescript
// ตัวอย่าง test cases
test('description', () => { ... });
📦 HANDOFF ARTIFACTS (on completion)
Updated MASTER_PLAN.md
Updated docs/XXX.md
.ai/context-pack/session-XXX-context.json (includes: APIs, interfaces, decisions)
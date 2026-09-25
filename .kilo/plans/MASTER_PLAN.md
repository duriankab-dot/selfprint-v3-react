# MASTER_PLAN.md — แผนจัดการโครงการ SELFPRINT v3 (Multi-AI Orchestration)
**VERSION: 2.1 | LAST_UPDATED: 2026-09-25 | CURRENT_PHASE: 0**  
**BASELINE_TAG: baseline-eb26e59-1727251200**  
**KNOWN_GOOD_COMMIT: eb26e59 (typecheck/functions typecheck/1050 tests/build ผ่านทั้งหมด)**

---

## 🎯 จุดหมายโครงการ (PROJECT NORTH STAR)
สร้าง **Living Personal Intelligence Platform** ที่:  
(1) วิเคราะห์พฤติกรรม 12 มิติ (SICE) จากข้อมูลจริง **ไม่ใช่โหราศาสตร์**  
(2) สร้าง **AI Twin** ที่ **ไม่ซ้ำกันทุกคน** (DNA deterministic จากวัน/เวลา/สถานที่เกิด + userId)  
(3) Twin เรียนรู้และพัฒนาไปพร้อมผู้ใช้ผ่าน pipeline เดียว (v1→v2→v3) **ไม่ใช่ analyze ใหม่ซ้ำ**  
(4) ลดล้างภาษา "ดูดวง/โหราศาสตร์" เปลี่ยนเป็น "Behavioral Science / Decision Intelligence"  
(5) SEO/AEO/GEO-ready ทุกหน้า เพื่อจับคีย์เวิร์ด "AI Twin ไทย", "วิเคราะห์นิสัย AI", "Blind Spots การตัดสินใจ"

---

## 📊 สถานะปัจจุบัน (CURRENT STATE SNAPSHOT)
| รายการ | สถานะ |
|----------|-------|
| **Phase** | 0 (Foundation) |
| **Active Feature Flags** | `LIVING_DIAGRAM=false`, `UNIFIED_PIPELINE=false`, `NO_ASTRO_LANG=true` |
| **Baseline Commit** | `eb26e59` (known-good) |
| **Open Tasks** | TC-001 ถึง TC-010 (Phase 0) |
| **Blockers** | ไม่มี |
| **Last Session** | session-013 (2026-09-25T13:45) — TC-006 complete: sitemap generator |

---

## 🗺️ แผนงานแบบทีละขั้น (PHASE ROADMAP)

### Phase 0: Foundation + Critical Fixes + Technical SEO (Week 0) — 🟡 IN PROGRESS
- [ ] **TC-001** Baseline tag + Feature flags infrastructure
- [ ] **TC-002** Astro language audit + replacement list (grep ทุกคำ запрет)
- [ ] **TC-003** Token conflict audit (hardcoded colors ใน .tsx)
- [ ] **TC-004** Twin DNA spec finalize (review ร่วมทีม)
- [ ] **TC-005** Language switcher relocation (NavBar always-action area)
- [ ] **TC-006** Sitemap.xml auto-generation + build script
- [ ] **TC-007** Schema.org library (typed builders)
- [ ] **TC-008** CI gates (typecheck + test + build + lint + stylelint + astro-check + token-check)
- [ ] **TC-009** Narrative spine spec: LivingDiagram เป็นเส้นเรื่องราวเดียวครอบ Landing→Onboarding→Dashboard/Webboard
- [ ] **TC-010** Curiosity progression design: Astrology hook → Behavioral Science reveal → Self-development retention

**Phase 0 Gate (ต้องผ่านก่อนเข้ Phase 1):**
- [ ] ทุก TC-00x ใน Phase 0: Tests pass + Docs updated + MASTER_PLAN updated
- [ ] `npm run typecheck && npm test && npm run build` ✅
- [ ] `grep -r "ดูดวง\|โหราศาสตร์\|ดาว\|ราศี\|โชค\|ทำนาย" src/` → 0 ผลลัพธ์ (ยกเว้น `/vs-astrology`)
- [ ] `stylelint` → 0 hardcoded color violations
- [ ] Feature flags ทำงานใน local + staging
- [ ] MASTER_PLAN.md สะท้อนสถานะจริง

---

### Phase 1: Living Diagram + Twin DNA + AEO Schemas (Week 1) — ⏳ PENDING
- [ ] **TC-101** `twinVisualDNA.ts` — deterministic unique DNA generator
- [ ] **TC-102** SVGCore extraction (pure SVG components จาก EvolutionaryVisualSystem)
- [ ] **TC-103** LivingDiagram wrapper + 3 drivers (Scroll/Step/Data)
- [ ] **TC-104** LandingPage integration (mode=landing + DNA from DOB hash)
- [ ] **TC-105** Onboarding integration (mode=onboarding + DNA refinement)
- [ ] **TC-106** Dashboard integration (mode=dashboard + live DNA)
- [ ] **TC-107** TwinProfilePage ใช้ DNA สำหรับ avatar
- [ ] **TC-108** WorldEnvironment อ่าน DNA สำหรับ theme
- [ ] **TC-109** LandingPage: Speakable + HowTo schema
- [ ] **TC-110** Onboarding: QAPage schema สำหรับ Nova conversation
- [ ] **TC-111** Dashboard: SoftwareApplication schema

**Phase 1 Gate:**
- [ ] 5 users → 5 distinct twin shapes (visual diff)
- [ ] Same user = same DNA across sessions
- [ ] ไม่มี hardcoded colors ใน components ใหม่
- [ ] Language switcher ข้าง audio button ทำงาน
- [ ] LCP < 2.5s, ไม่มี forced reflow (Lighthouse)
- [ ] AEO schemas render ถูกต้อง (Rich Results Test)

---

### Phase 2: Unified Pipeline + Copy Rewrite + GEO Content (Week 2) — ⏳ PENDING
- [ ] **TC-201** `AnalysisEngine.analyze(input, context, version)` — merge v1/v2/v3
- [ ] **TC-202** TwinStore layers architecture (v1_landing, v2_onboarding, v3_living + mergeLayers + evolutionLog)
- [ ] **TC-203** VersionManager v1→v2→v3 triggers
- [ ] **TC-204** `useTwinInput` accumulator hook
- [ ] **TC-205** LivingDiagram ← twinStore.current + DNA (animate diff on version up)
- [ ] **TC-206** Copy rewrite: Astro → Behavioral Science (จาก audit list)
- [ ] **TC-207** VsAstrologyPage: Comparison table + Disclaimer Banner + FAQ schema
- [ ] **TC-208** Global token migration (replace all violations)
- [ ] **TC-209** GEO-Ready Fact interface + Entity Dictionary
- [ ] **TC-210** Twin output → AIContentBlock (every insight citable)
- [ ] **TC-211** DailyBriefPage: Speakable + Fact schema

**Phase 2 Gate:**
- [ ] Zero astrology terms in production build (grep)
- [ ] Zero hardcoded colorsใน .tsx (stylelint)
- [ ] Twin confidence progression: 20% → 65% → 85%+ มองเห็นใน LivingDiagram
- [ ] ทุกหน้า render ถูกต้องใน TH/EN, dark/light
- [ ] GEO entities consistent ทุกหน้า

---

### Phase 3: Content Pages + Full Schema Coverage + Rollout (Week 3) — ⏳ PENDING
- [ ] **TC-301** Mobile: SVG sticky + bottom sheet ทุก 3 modes
- [ ] **TC-302** Performance: LCP < 2s, TBT < 150ms (lazy-mount, preload fonts)
- [ ] **TC-303** Accessibility: prefers-reduced-motion, ARIA labels, contrast
- [ ] **TC-304** Remove dead code: EvolutionaryVisualSystem, old components
- [ ] **TC-305** Flag rollout: 10% → 50% → 100% (Vercel/Cloudflare)
- [ ] **TC-306** BlogArticle: BlogPosting + citations + entities
- [ ] **TC-307** SciencePage: TechArticle + ScholarlyArticle citations
- [ ] **TC-308** PricingPage: Product + Offer + AggregateRating
- [ ] **TC-309** FAQPage: FAQPage + QAPage dual schema
- [ ] **TC-310** AboutPage: Organization + Person schema
- [ ] **TC-311** ContactPage: ContactPage + LocalBusiness
- [ ] **TC-312** Lighthouse CI: SEO > 95, AEO checks
- [ ] **TC-313** Docs: ARCHITECTURE.md, TWIN_DNA_SPEC.md, SEO_AEO_GEO_SPEC.md, CHANGELOG.md

**Phase 3 Gate (Production Ready):**
- [ ] All Phase Gates PASS
- [ ] Staging = production parity (feature flags only)
- [ ] Rollback tested (< 30 seconds via flag toggle)
- [ ] Team handoff complete

---

## 🎫 บัตรงานที่กำลังดำเนินการ (ACTIVE TASK CARDS - Phase 0)

| ID | Title | Phase | Priority | Estimate | DoD Checklist |
|----|-------|-------|----------|----------|---------------|
| TC-001 | Baseline tag + Feature flags infra | 0 | P0 | 30 นาที | [x] git tag [x] featureFlags.ts [x] env vars [x] MASTER_PLAN updated |
| TC-002 | Astro language audit + replace list | 0 | P0 | 1 ชม. | [x] astro-audit.txt [x] replacement-map.csv [x] MASTER_PLAN updated |
| TC-003 | Token conflict audit | 0 | P0 | 1 ชม. | [x] token-violations.txt [x] token-fix-list.csv [x] MASTER_PLAN updated |
| TC-004 | Twin DNA spec finalize | 0.5 | P0 | 2 ชม. | [x] TWIN_DNA_SPEC.md [x] team review [x] MASTER_PLAN updated |
| TC-005 | Language switcher relocation | 0 | P1 | 1 ชม. | [x] NavBar.tsx updated [x] LanguageSwitcher compact variant [x] MASTER_PLAN updated |
| TC-006 | Sitemap generator | 0 | P1 | 2 ชม. | [x] generate-sitemap.ts [x] build script [x] public/sitemap.xml [x] MASTER_PLAN updated |
| TC-007 | Schema.org library | 0 | P1 | 3 ชม. | [ ] schemas.ts (typed builders) [ ] tests [ ] MASTER_PLAN updated |
| TC-008 | CI gates configuration | 0 | P0 | 2 ชม. | [ ] phase-gate.yml [ ] pre-push hook [ ] validate scripts [ ] MASTER_PLAN updated |
| TC-009 | Narrative spine spec | 0 | P0 | 2 ชม. | [ ] LIVING_DIAGRAM_SPEC.md [ ] MASTER_PLAN updated |
| TC-010 | Curiosity progression design | 0 | P0 | 2 ชม. | [ ] CURIOSITY_PROGRESSION.md [ ] MASTER_PLAN updated |

---

## 📋 กฎเกณฑ์ประตูคุณภาพ (PHASE GATE DEFINITIONS - บังคับ)

### Phase 0 Gate → Phase 1
```
☐ ทุก TC ใน Phase 0: Tests pass + Docs updated + MASTER_PLAN updated
☐ npm run typecheck && npm test && npm run build → PASS
☐ Astro language check → 0 violations (ยกเว้น /vs-astrology)
☐ Token compliance check → 0 hardcoded colors
☐ Feature flags ทำงานได้ (local + staging)
☐ MASTER_PLAN.md สะท้อนสถานะจริง
```

### Phase 1 Gate → Phase 2
```
☐ ทุก TC ใน Phase 1: Tests pass + Docs updated + MASTER_PLAN updated
☐ Visual uniqueness verified (5 users = 5 distinct twins)
☐ DNA deterministic (same user = same DNA)
☐ LCP < 2.5s, ไม่มี forced reflow
☐ AEO schemas valid (Rich Results Test)
☐ Mobile sticky + bottom sheet working
```

### Phase 2 Gate → Phase 3
```
☐ ทุก TC ใน Phase 2: Tests pass + Docs updated + MASTER_PLAN updated
☐ Zero astrology terms, zero hardcoded colors
☐ Pipeline v1→v2→v3 working end-to-end
☐ Twin confidence visible progression
☐ GEO entities consistent
```

### Phase 3 Gate → Production
```
☐ ทุก TC ใน Phase 3: Tests pass + Docs updated + MASTER_PLAN updated
☐ Lighthouse CI: SEO>95, Perf>90, A11y>95, BP>90
☐ Staging parity verified
☐ Rollback < 30s tested
☐ All docs current (ARCHITECTURE, TWIN_DNA_SPEC, SEO_AEO_GEO_SPEC, CHANGELOG)
```

---

## 🔄 โปรโตคอลการมอบงานระหว่าง Session (SESSION HANDOFF PROTOCOL - บังคับทุก Session)

### On Session Start (เริ่ม Session):
```bash
# 1. อ่านสถานะปัจจุบัน
cat MASTER_PLAN.md
cat .ai/context-pack/$(ls -t .ai/context-pack/ | head -1)

# 2. เลือก Task ถัดไปจาก ACTIVE TASK CARDS
# 3. สร้าง/อัพเดท Task Card
cp .ai/task-cards/TEMPLATE.md .ai/task-cards/TC-XXX.md
# แก้ไข TC-XXX.md ให้เฉพาะเจาะจง

# 4. สร้าง work branch
git checkout -b task/TC-XXX-description
```

### During Work (ระหว่างทำงาน - ทุก micro-step):
- เขียน code + tests
- อัพเดท docs ที่เกี่ยวข้อง (ARCHITECTURE.md, specs)
- รัน: `npm run typecheck && npm run lint && npm test`

### Task Complete (ก่อน commit):
1. ✅ Verify **ทุก** DoD checkboxes ใน TC-XXX.md
2. ✅ อัพเดท MASTER_PLAN.md:
   - Task status → Done
   - Phase progress
   - Decisions/blockers ใหม่ (ถ้ามี)
3. ✅ อัพเดท docs/ (ถ้ามีการเปลี่ยนแปลง)
4. ✅ รัน FULL CI locally: `npm run typecheck && npm run lint && npm test && npm run build`
5. ✅ Commit (atomic, 1 task = 1 commit):
   ```bash
   git add -A
   git commit -m "feat(scope): description — TC-XXX
   
   - Changes...
   - Updated: ARCHITECTURE.md, MASTER_PLAN.md"
   ```
6. ✅ Push + PR:
   ```bash
   git push origin task/TC-XXX-description
   gh pr create --title "TC-XXX: Title" --body "$(cat .ai/task-cards/TC-XXX.md)"
   ```

### Session End (จบ Session - บังคับ):
```bash
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
**Duration**: XX นาที
**Phase**: 0
**Completed**: TC-XXX
**Decisions**: [...]
**Next**: TC-XXX
EOF

# 3. Commit handoff
git add .ai/context-pack/ .ai/sessions/ MASTER_PLAN.md
git commit -m "chore(session-XXX): handoff — plan + context updated"
git push
```

---

## 🤖 โปรโตคอลการประสานงาน AI Agents (AI AGENT COORDINATION PROTOCOL)

### Agent Roles (บทบาทต่อ Session)

| Agent | Role | Scope | Handoff Artifact |
|-------|------|-------|------------------|
| **AI-Architect** | Technical design, API contracts, architecture docs | Cross-cutting | `docs/ARCHITECTURE.md`, `API_CONTRACTS.md` |
| **AI-Frontend** | React components, LivingDiagram, UI integration | `src/components/`, `src/pages/` | Component APIs, Storybook |
| **AI-Pipeline** | AnalysisEngine, TwinStore, data flow | `src/lib/`, `src/store/`, `src/hooks/` | Type definitions, engine specs |
| **AI-SEO** | Schema.org, AEO/GEO, content structure | `src/lib/schemas.ts`, page schemas | `SEO_AEO_GEO_SPEC.md` |
| **AI-Docs** | Documentation sync, Thai translation, changelog | `docs/`, `MASTER_PLAN.md`, `CHANGELOG.md` | All docs current |

### Parallel Work Rules (กฎทำงานขนาน):
1. **หนึ่ง agent ต่อ task card** — ห้ามทับซ้อน
2. **Shared dependencies → API contracts ก่อน** (AI-Architect กำหนด, อื่นๆ implement)
3. **Daily sync ผ่าน MASTER_PLAN.md** — แต่ละ agent อัพเดท task row ของตน
4. **Conflict = ยกให้มนุษย์ตัดสินใจ** — ห้ามเดา

---

## 🛡️ QUALITY GATES (Automated Enforcement - ประตูคุณภาพอัตโนมัติ)

```json
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
```

### Validation Scripts (สร้างใน `.ai/scripts/`):
- `check-astro-language.js` — grep คำ запрет ใน src/ (ยกเว้น vs-astrology)
- `check-hardcoded-colors.js` — grep hex/rgb ใน .tsx (ยกเว้น test files)
- `validate-master-plan.js` — ตรวจ MASTER_PLAN.md task statuses match git commits + doc updates
- `generate-sitemap.ts` — อ่าน App.tsx routes, generate sitemap.xml + hreflang

---

## 📁 โครงสร้างไดเรกทอรี (DIRECTORY STRUCTURE - สร้างทันที)

```
selfprint-v3-react/
├── MASTER_PLAN.md                 ← 🔴 SINGLE SOURCE OF TRUTH (แหล่งความจริงเดียว)
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
│   ├── LIVING_DIAGRAM_SPEC.md     ← LivingDiagram narrative spine spec
│   ├── CURIOSITY_PROGRESSION.md   ← Curiosity progression design
│   └── DEPLOYMENT.md              ← Deploy procedures
└── .github/workflows/
    ├── ci-gate.yml
    ├── phase-gate.yml
    └── deploy.yml
```

---

## 🎯 ขั้นตอนถัดไปที่ต้องทำวันนี้ (IMMEDIATE NEXT STEPS)

```bash
# 1. สร้าง MASTER_PLAN.md (ไฟล์นี้)
# 2. สร้าง directory structure
mkdir -p .ai/{context-pack,task-cards,phase-gates,sessions,scripts} docs .github/workflows

# 3. สร้าง Feature Flag lib (TC-001)
# 4. รัน Astro audit (TC-002) → astro-audit.txt
# 5. รัน Token audit (TC-003) → token-violations.txt
# 6. สร้าง Task Cards TC-001 ถึง TC-010
# 7. Commit: "chore: master plan v2.1 + orchestration infra + audits"
```

---

## 📌 CHECKLIST บังคับ (พิมพ์ไว้หน้าจอ - ENFORCEMENT CHECKLIST)

```
☐ MASTER_PLAN.md มีอยู่และเป็นปัจจุบัน
☐ ทุก task มี Task Card พร้อม DoD
☐ ทุก commit: Tests pass + Docs updated + MASTER_PLAN updated
☐ ทุก session: Context pack + Session log committed
☐ ทุก phase: Gate validation PASS ก่อน phase ถัดไป
☐ ไม่มีภาษาดูดวง/โหราศาสตร์ ในหน้า non-comparison
☐ ไม่มี hardcoded colors ใน .tsx files
☐ Feature flags ควบคุม features ใหม่ทั้งหมด
☐ CI รันทุก PR + block merge ถ้า fail
☐ Staging = feature flag subset, ไม่ใช่ branch แยก
```

---

## 🤝 ข้อตกลง: "This Is The Way"

> **ตั้งแต่ตอนนี้: ไม่มีงานเริ่มโดยไม่มี Task Card, ไม่มี commit โดยไม่มี DoD, ไม่มี phase advance โดยไม่มี Gate, ไม่มี session จบโดยไม่มี Handoff. MASTER_PLAN.md คือความจริงเพียงอย่างเดียว.**

---

## 📝 TEMPLATE บัตรงาน (TASK CARD TEMPLATE - ใช้สำหรับทุก Task)

```markdown
# TC-XXX: Task Title
**Phase**: X | **Priority**: P0/P1/P2 | **Estimate**: Xh
**Assignee**: AI-X | **Depends On**: TC-XXX / Phase X Gate
**Feature Flag**: FLAG_NAME

## 🎯 OBJECTIVE
[คำอธิบายสั้นๆ ว่าทำอะไร ทำไม จบแล้วได้อะไร]

## 📋 DEFINITION OF DONE (ALL REQUIRED - บังคับทุกข้อ)
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
```

## 📦 HANDOFF ARTIFACTS (on completion - ส่งมอบเมื่อเสร็จ)
- Updated MASTER_PLAN.md
- Updated docs/XXX.md
- .ai/context-pack/session-XXX-context.json (includes: APIs, interfaces, decisions)
```
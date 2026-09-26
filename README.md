# 🌟 SELFPRINT — Living Intelligence Platform

แพลตฟอร์ม AI Twin ที่เรียนรู้รูปแบบพฤติกรรมของคุณผ่าน 12 มิติปัญญา / 16 SICE engines
*(An AI-powered "living Twin awakening" system for self-understanding, learning, and growth.)*

---

## Current Status

| Metric | Status | Evidence |
|--------|--------|----------|
| Build | ✅ PASS | `npm run build` — exit 0 (verified 19 ก.ย. 2026) |
| Typecheck (app) | ✅ PASS | `npm run typecheck` (`tsc -b`) — 0 errors |
| Typecheck (functions) | ✅ PASS | `npm run typecheck:functions` — ผ่าน 19 ก.ย. 2026 หลังเปลี่ยน tsconfig.functions.json เป็น `module esnext + moduleResolution bundler + moduleDetection force` (tooling-only fix; runtime ถูก build ด้วย esbuild/bundler semantics บน CF Pages อยู่แล้ว) |
| Lint | ✅ PASS | `npm run lint` (oxlint) — exit 0 (warnings only) |
| Unit / Integration Tests | ✅ PASS | `npm test` — **1102/1102** (67–72 files) |
| E2E Phase B staging (final) | ✅ 95 / 0 / 5 | full suite (Phase A + B, 100 tests) แบบ CI-parity: workers=1 + retries=1 vs selfprint-staging.pages.dev (20 ก.ย. 2026 19:04 ICT) — 0 FAIL · 0 flaky |
| E2E Phase A production | ✅ 51/51 | `--project=chromium` + mobile vs selfprint.one (20 ก.ย. 2026 re-verified: chromium 27/27) |
| Master Gate | ✅ **CLOSED** | 38 PASS / 0 FAIL / 11 SKIP — policy-valid inventory |
| CI (GitHub Actions) | ✅ **GREEN — run #411 (e730cd7, 22 ก.ย. 2026)** | Unit 1102/1102 · Deploy Staging success · E2E Tests success · Report success. Pipeline: push master → `deploy-staging` (build exact commit ด้วย `VITE_SUPABASE_*` จาก secrets → `wrangler@4.131.2 pages deploy dist --project-name selfprint-staging --commit-hash=$SHA`) → `e2e-tests` (`needs: deploy-staging` — ไม่เริ่มก่อน deploy ของ commit เดียวกันสำเร็จ). History: #406 STAGING_URL fix (20 ก.ย.) · #409/รุ่น #411 staging 17-FAIL root cause = CI build ไม่มี VITE env (CI-BUILD-ENV-001 → แก้ใน `e730cd7`) · **Runtime:** project Node 22 (`node-version: '22'`) · GitHub Actions runtime node24 native (bump v4→v5/v6/v7 ในรอบ maintenance นี้) · **Annotation:** ยังเหลือ warning "Node.js 20 is deprecated" ของ actions v4 (เป็น deprecation warning ไม่ใช่ test failure; กำลังแก้ด้วย bump action major version) + notice ubuntu-latest → Ubuntu 26 (ไม่แตะรอบนี้) + Slack `exit code 3` failure annotation (known behavior ตาม `.github/secrets-setup.md`) |
| Supabase migrations | ✅ 35 files | ล่าสุด `040_create_user_lifecycle_table.sql` |

> **Master Gate ≠ product-completeness.** ตัวเลข Master Gate เป็น test metric แยกต่างหาก
> ไม่ใช่การรับรองว่า product "100% complete" — ดูรายละเอียดใน Known Deferred Items ด้านล่าง

---

## Product Reality

ประสบการณ์การใช้งาน (flow จริงในโค้ด):

```
Onboarding → SICE blueprint → Core Awakening (birth ceremony)
→ Nova → chat (NovaChat → ImmersiveTwinChat) → Twin living space
→ 12 Worlds · Decision · Profile · Upload · Intelligence · Evolution
```

- **Twin creation** — `/core-awakening` (CoreAwakening + HologramBirth + CoreAwakeningService.initializeTwin → `twins` INSERT + 9 parallel writes + compensating rollback)
- **Twin persistence** — client-side creation ไปยัง Supabase tables (design ตาม 12-API constraint)
- **Twin interaction** — `/chat/twin` (ImmersiveTwinChat, world-aware, memory + SICE context)
- **Route aliases (intentional shared architecture):**
  - `/twin-birth` → `/core-awakening`
  - `/twin/:id` → `/twin-profile`
  - `/twin/patterns` → `/intelligence`
  - `/twin` → `/chat/twin`

---

## Architecture

```text
React 19 + TypeScript (strict) · Vite · Tailwind v4 · react-router v7
Supabase (Postgres + Auth + Storage) · Cloudflare Pages Functions
OpenRouter (AI model routing, cost-aware: nemotron → qwen → deepseek fallback; claude explicitly forbidden per MODEL-SWITCH-001)
Zustand · TanStack React Query · three.js 0.186.0 (HIGH fidelity renderer)
PWA (vite-plugin-pwa, injectManifest) · Playwright E2E · Vitest unit
```

Stack detail: `docs/TECH_STACK.md` · `docs/ARCHITECTURE.md` · `docs/SYSTEM_ARCHITECTURE.md`

---

## Route Map

| Route | Page / Component | Note |
|-------|------------------|------|
| `/`, `/th/`, `/en/` | LandingPage | HomeRoute |
| `/onboarding` | Onboarding | 7 steps → claim account |
| `/core-awakening` | CoreAwakening | SICE + birth ceremony |
| `/chat` | → `/chat/nova` | redirect |
| `/chat/nova` | NovaChat (NovaProvider) | onboarding chat |
| `/chat/twin` | ImmersiveTwinChat | Twin living space |
| `/twin` | → `/chat/twin` | redirect |
| `/twin-birth` | → `/core-awakening` | alias (shared surface) |
| `/twin/patterns` | → `/intelligence` | alias |
| `/twin/:id` | → `/twin-profile` | alias |
| `/twin-profile` | TwinProfilePage | 6 sections + upload |
| `/dashboard` | Dashboard | ExecutiveSummary, LivingTwin, Today, DecisionLog… |
| `/intelligence` | IntelligenceHub | Patterns, Growth, IntelligencePanel… |
| `/analysis` | AnalysisPage | Full analysis |
| `/explore` | ExplorePage | I Ching, Self Question, Self Analysis + 12 activities |
| `/decisions` | DecisionDashboard | table + filter + export + compare |
| `/decision-log` | DecisionLoggerPage | decision form + history |
| `/worlds` / `/worlds/:worldId` | WorldsHub / WorldDetail | protected · 12 worlds |
| `/voice` | VoiceChatPage | browser STT/TTS + nova |
| `/settings/passkeys` | PasskeySettings | register / list / delete |
| `/share/:code` | Share | provenience share |
| `/privacy` | PrivacyCenter | GDPR + data |
| `/pricing` (+ `/pricing/success`) | PricingPage | Stripe |
| `/brief` | DailyBriefPage | daily brief |
| `/badges` | BadgePage | badge journey |
| `/life-hubs` | LifeHubsPage | |
| `/activities` | ActivitiesPage | summary |
| `/me` | MePage | account |
| `/menu` | FeatureMenu | |
| `/twin/settings` `/twin/personality` | TwinSettings/Personality | protected |
| `/tarot` `/palmistry` `/community` | Tarot/Palmistry/Community | Phase B |
| `/blog` `/blog/:slug` | BlogList/BlogArticle | SEO |
| `/about` `/science` `/contact` `/terms` `/faq` `/vs-astrology` | marketing/SEO | |

Full route source of truth: `src/App.tsx` (getLanguagePrefixedRoutes + protected routes).

---

## API Surface

Cloudflare Pages Functions (จาก current code — `functions/api/`):

| Endpoint group | Handler | Note |
|----------------|---------|------|
| `/api/*` (module routes) | `[[route]].ts` → `api/unified-handler.ts` | KNOWN_MODULES: `notifications` `twin-evolution` `sice` `stripe` `profile` `blueprint` + exact `/api/share` |
| `/api/twin` | `functions/api/twin.ts` | Twin chat (OpenRouter with nemotron/qwen/deepseek chain, world-aware) |
| `/api/twin-stream` | `functions/api/twin-stream.ts` | streaming |
| `/api/nova` | `functions/api/nova.ts` | Nova chat |
| `/api/nova-stream` | `functions/api/nova-stream.ts` | streaming |
| `/api/og` | `functions/api/og.ts` | Open Graph image |
| `/api/autonomy-log` | `functions/api/autonomy-log.ts` | |
| `/api/metrics` | `functions/api/metrics.ts` | |

> **ไม่มี `/api/coach`** — AskCoach capability ถูกแทนที่ด้วย flow:
> Explore "Decision coach" activity → `/chat/twin` (initialMessage) → `callTwinAPI` → `/api/twin`.

> **API count reconciliation (19 ก.ย. 2026):** implementation ปัจจุบัน expose **14 verified
> endpoints/modules** (7 dedicated functions + 7 catch-all module routes). spec ยังมี
> "API surface = 12 — LOCKED" เป็น architectural constraint (DOMAIN W) — เป็น **constraint
> เดิม สำหรับ unified-design ที่ยังไม่ reconcile** เป็น 14. Architecture reconciliation
> pending — ไม่ได้ตัดเองว่า 12 ผิด/14 ถูก
> อย่าสร้าง `/api/coach` โดยไม่มี product decision แยก

---

## Core Services (`src/`)

| Service | Location | Purpose |
|---------|----------|---------|
| SICE Orchestrator (16 engines) | `src/services/sice/SICEOrchestrator.ts` | PersonalContextBuilder → WellnessEngine (id 1-16) |
| TwinSupabaseService | `src/services/TwinSupabaseService.ts` | twins/essence/state writes |
| CoreAwakeningService | `src/services/CoreAwakeningService.ts` | birth flow orchestration |
| TwinAPIService | `src/services/TwinAPIService.ts` | `/api/twin` chat + validation |
| DecisionService | `src/services/DecisionService.ts` | decisions & outcomes |
| DecisionInsightService | `src/services/DecisionInsightService.ts` | SLA panel (client-side) |
| FileUploadService | `src/lib/storage/FileUploadService.ts` | Storage upload/retrieve/delete |
| PersonalContextBuilder | `src/lib/intelligence/PersonalContextBuilder.ts` | context assembly |
| DecisionIntelligenceEngine | `src/lib/intelligence/DecisionIntelligenceEngine.ts` | bias/framework checklists (client-side, **ไม่มี AI backend**) |
| modelRouter | `src/lib/ai/modelRouter.ts` | OpenRouter tier selection |

---

## Twin

- **Creation** — A (ครบขั้นตอน: SICE → CoreAwakening → birth canvas → completed)
- **Persistence** — A (`twins` + essence + state + world_preferences + personality + capabilities)
- **Lifecycle / Navigation** — A (Onboarding → awakening → chat; aliases C)
- **Profile** — A (TwinProfile 6 sections; `/twin/:id` alias)
- **Visual** — A (fidelity-adaptive facade: FALLBACK/LOW/MEDIUM-SVG/HIGH-Three.js; **HIGH = TwinThreeRenderer มีจริง**)
- **E2E** — TWIN-01..04 PASS; TWIN-05 = legacy testids ของ standalone page ที่ไม่มี (interaction ผ่าน chat lane; alias/superseded)

## Decision

- Create / history / persistence — A
- Dashboard — A (table, filter, outcome)
- Insight — A **client-side** (DecisionIntelligenceEngine + SLA panel) — **ไม่มี AI backend decision endpoint**
- Compare — A (DecisionCompare, 4-way)
- Export — A (CSV / JSON)
- E2E — DECISION-01/02/03/05 PASS; DECISION-04 = **2s AI-backend SLA test contract** ที่ current spec ไม่ require (DOMAIN Q: "AI insight SLA **where specified**" — ยังไม่มีค่าที่ specify)

## Upload

- UI / validation / preview / progress — A (FileUploadUI; type + ≤5MB)
- Persistence / retrieval / delete — A (Supabase Storage `profiles/`, 512px WebP optimize)
- **crop/edit — ไม่มี** → UPLOAD-05 deferred (DOMAIN J required list ไม่มี crop)

## Worlds

- Hub / tiles / detail / rendering / environment / context — A (WorldsHub, WorldEnvironment, WorldDetail, per-world prompt/expertise)
- Personalization — A (world-insight คำนวณจาก Twin context)
- **compare (WORLD-06) — ไม่มี** → out of scope (DOMAIN R ไม่มี compare)
- WORLD-04 = timing precondition skip, ไม่ใช่ product gap

---

## Database / Migrations

Supabase migrations: `supabase/migrations/` — **35 files, ล่าสุด `040_create_user_lifecycle_table.sql`**
(หมายเลขไม่ต่อเนื่องแบบเรียงลำดับปกติ; 035 = forensic consolidation; 038-040 = storage/insights/lifecycle)

Schema core: profiles · blueprints · twins · twin_essence · twin_state · decision tables ·
world_preferences · chat_messages · intelligence core · subscriptions · push · passkey · community

Reference: `docs/DATABASE_SCHEMA_TH.md` · `MIGRATION_GUIDE.md` (root)

---

## Testing

| Suite | Command | Result (verified) |
|-------|---------|-------------------|
| Unit / Integration (Vitest) | `npm test` | **1102/1102** · 67–72 files |
| E2E full (Playwright) | `npm run test:e2e` | multi-project (Phase A smoke + Phase B staging) |
| E2E staging | `npm run test:e2e:staging` | requires `.env.e2e.staging` |
| k6 load | `k6 run loadtests/…` | **manual only** (`workflow_dispatch`); staging PASS 792/792 checks (14 ก.ย. 2026) — ไม่ใช่ Master Gate criteria |

Playwright config: `playwright.config.ts` — projects `chromium` (Phase A), `chromium-staging` (Phase B), mobile × 2 — workers: `undefined` (local) / `1` (CI); retries: `0` (local) / `1` (CI).

## Master Gate

```text
MASTER GATE = CLOSED
38 PASS / 0 FAIL / 11 SKIP (run 07:22 UTC 18 ก.ย. 2026) — inventory complete
```

11 skips (MASTER_GATE_AS_IS.md — full inventory):

| Class | Count | Items |
|-------|-------|-------|
| STATIC — FNI / VALID-SKIP | 5 | DECISION-04 (AI SLA contract), TWIN-05 (legacy testids), UPLOAD-05 (crop — ไม่ใช่ required), WORLD-06 (compare — out of scope), LIFE-15 (duplicate ของ SK-05) |
| CONDITIONAL — chat-route precondition | 4 | MG-01-02, MG-02-01, MG-05-02, MG-06-02 |
| CONDITIONAL — beforeEach timing guard | 2 | TWIN-01, WORLD-04 |
| Invalid | 0 | — |

**ห้ามเปลี่ยน Master Gate metric โดยไม่มี evidence ใหม่** และห้ามแอบเปลี่ยน SKIP → PASS

---

## Deployment

- **Production:** https://selfprint.one — Cloudflare Pages (Dashboard config build, Git-connected)
- **Staging:** https://selfprint-staging.pages.dev — **auto-deploy จาก CI** (job `deploy-staging`); active E2E target
- **Staging alias (dead):** https://staging.selfprint.one — Cloudflare 525 (DNS issue; ไม่ใช้)
- **Staging deploy flow:** push master → CI builds exact commit (`VITE_SUPABASE_*` จาก secrets) → `wrangler@4.131.2 pages deploy dist --project-name selfprint-staging --branch <ref> --commit-hash <sha>` → verify alias HTTP 200 → `e2e-tests` เริ่มต่อ (needs: deploy-staging)
- Deployment config: Cloudflare Pages (Dashboard build settings; `wrangler.toml` เป็น config พื้นฐาน, nodejs_compat ผ่าน Dashboard Compatibility flags)
- CI secrets ที่ต้องมี (repo-level Actions): `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` · `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` (+ E2E_*/TEST/PRODUCTION_URL/SLACK) — ดู `.github/secrets-setup.md`
- k6 ต้องการ env (manual runs): `SUPABASE_SERVICE_ROLE_KEY` (sb_secret_) + `OPENROUTER_API_KEY`

## Operational Commands

```bash
npm install
npm run dev                  # local dev (vite)
npm run typecheck            # tsc -b
npm run typecheck:functions  # PASS (19 ก.ย. 2026 — esnext/bundler)
npm run lint                 # oxlint
npm test                     # vitest 1102/1102
npm run build                # tsc -b && vite build
npm run test:e2e             # playwright full
npm run test:e2e:staging     # staging Phase B (ต้อง .env.e2e.staging)
npx playwright test --project=chromium  # Phase A production
```

Env: ดู `.env.example` (VITE_* client vars + E2E_* + server secrets ผ่าน CF Pages)

---

## Known Deferred Items

| Item | Status | Why |
|------|--------|-----|
| UPLOAD-05 crop/edit | Deferred | DOMAIN J required list ไม่มี |
| WORLD-06 world compare | Out of scope | DOMAIN R ไม่มี |
| DECISION-04 AI-backend 2s SLA | Deferred / legacy test contract | insight เป็น client-side; spec ใช้ "where specified" |
| Passkey rename | Deferred | ไม่ใช่ requirement |
| AskCoach component | Deferred — idle (rollout=0) | capability ถูกแทนโดย Explore "Decision coach" → /api/twin; ต้อง product decision (เปิด/ลบ) |
| D-05 Accessibility audit | Deferred | spec row |
| D-06 Performance audit | Deferred | spec row |
| D-07 RLS (selfprint schema) | Deferred | spec row |

## Known Documentation Caveats

- ~~`typecheck:functions` FAIL~~ → **ปิดแล้ว 19 ก.ย. 2026** (tsconfig.functions.json: `esnext + bundler + force`)
  หลัง fix นี้ `MASTER_GATE_EVIDENCE.md:61` ที่อ้าง PASS เป็นข้อเท็จจริงอีกครั้งสำหรับ functions gate
- **`useTwinFidelity.ts:18-23` comment ยังบอก "HIGH reserved, not implemented"** — ขัดกับโค้ดจริง (Twin.tsx:260-279 + TwinThreeRenderer.tsx ใช้งานได้) — stale comment, แยกเป็น cleanup task
- **MASTER_PRD.md (4 ก.ย. 2026)** เป็นเอกสาร PRD baseline — ข้อมูลบางอย่าง superseded โดย closure book (18 ก.ย.); อ้างอิงด้วยความระวัง

## Single Source of Truth hierarchy

```text
CURRENT PRODUCT SPEC (docs/SELFPRINT MASTER PRODUCT SPEC & 100% CLOSURE BOOK.md)
  ↓
CURRENT CODE (src/** · functions/** · migrations/**)
  ↓
CURRENT TEST/RUNTIME EVIDENCE (MASTER_GATE_AS_IS.md · FINAL_TEST_CLOSURE_REPORT.md)
  ↓
README.md (ไฟล์นี้)
  ↓
SPECIALIZED DOCS (docs/*)
```

---

## License

SELFPRINT — Living Intelligence Platform
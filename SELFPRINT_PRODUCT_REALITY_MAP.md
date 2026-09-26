# SELFPRINT — PRODUCT REALITY MAP (TH)

**Audit ณ:** 23 กันยายน 2026 · HEAD `d3c37f4`
**หลักการ:** สร้างจาก CODE จริงเท่านั้น (ไม่ถือ README/เอกสารเก่าเป็นความจริง) · "มีไฟล์" ≠ "implemented" — ต้อง trace Route → Component → Service → DB → UI
**แทนที่:** `.kilo/plans/SELFPRINT_REALITY_MAP.md` (stale ณ e3edda5, 13 ก.ย.)

---

## 1. REPOSITORY IDENTITY

| Field | Value |
|-------|-------|
| Name | selfprint-v3-react |
| Framework | React 19 + TypeScript strict · Vite · Tailwind v4 (ไม่ compile — ใช้ custom CSS) |
| Router | react-router-dom 7 (BrowserRouter, `/en` `/th` prefix) |
| State | Zustand 5 + TanStack React Query |
| Database | Supabase (`vkjwqrjflxztcctmyzgh` staging, ap-northeast-2) |
| AI | OpenRouter (model router: nemotron → qwen → deepseek; claude explicitly forbidden per MODEL-SWITCH-001) |
| Runtime | Cloudflare Pages + Pages Functions (nodejs_compat) |
| Auth | Supabase Auth — OAuth Google/Apple · Magic Link · Passkey/WebAuthn |
| Payments | Stripe (checkout · portal · webhook) |
| Testing | Vitest (1102/1102 unit) · Playwright (100 E2E, 5 projects) · k6 (manual) |
| 3D | Three.js 0.186 (HIGH fidelity tier เท่านั้น) |
| PWA | vite-plugin-pwa + injectManifest (src/sw.js) |

---

## 2. FEATURE INVENTORY (36 — พิสูจน์จาก code จริง)

| # | Feature | Route/Entry | Component หลัก | Service/API | DB | สถานะ |
|---|---------|-------------|----------------|-------------|-----|-------|
| 1 | Landing | `/`, `/th`, `/en` | LandingPage | — | — | ✅ |
| 2 | Auth (email/OAuth/magic) | `/login` | Login, AuthContext | Supabase Auth | auth.users | ✅ |
| 3 | Passkey | `/settings/passkeys` | PasskeySettings | PasskeyProvider | passkey_challenges | ✅ |
| 4 | Onboarding 7-step | `/onboarding` | Onboarding (46KB) | SICE + checkpoints | user_lifecycle, onboarding_checkpoints | ✅ |
| 5 | Voice onboarding/voice chat | `/voice` | VoiceChatPage | NovaAPIService | — | 🧪 (มี implement ไม่มี E2E) |
| 6 | SICE Analysis | `/analysis` | AnalysisPage (49KB) | SICEOrchestratorImpl (16 engines) | personal_profiles | ✅ |
| 7 | Core Awakening intro | `/core-awakening` | CoreAwakening | CoreAwakeningService | awakening_essence | ✅ |
| 8 | Twin Birth (HologramBirth) | `/core-awakening` phase=birth | Twin variant="birth" → HologramBirth | initializeTwin() 9-parallel writes | twins, twin_state, twin_personality, twin_capabilities, world_preferences, twin_memories, twin_sice_scores, personal_contexts link | ✅ |
| 9 | Twin naming → TWIN_ALIVE | `/core-awakening` phase=naming | TwinNaming | setTwinCreated() | user_lifecycle.twin_id, status=TWIN_ALIVE | ✅ |
| 10 | Twin Profile | `/twin-profile` (+ alias `/twin/:id`) | TwinProfilePage (6 sections) | TwinSupabaseService | twins, twin_state | ✅ |
| 11 | Twin Settings/Personality | `/twin/settings`, `/twin/personality` | TwinSettingsPage, TwinPersonalityPage | TwinSupabaseService | twin_personality | ✅ |
| 12 | Twin visual (fidelity-adaptive) | (ฝังทุกหน้า) | Twin facade: FALLBACK/LOW/MEDIUM-SVG/HIGH-Three.js | useTwinFidelity + VisualDNAService | twin_visual_dna | ✅ |
| 13 | Twin Evolution | (overlay/scene) | TwinEvolution, EvolutionContext | TwinEvolutionService | twin_evolution_history/progress | 🧪 (MG-03-01 เท่านั้น) |
| 14 | Twin Chat (immersive) | `/chat/twin` | ImmersiveTwinChat (33KB) | twin.ts / twin-stream.ts | twin_memories, conversations | ✅ |
| 15 | Nova Chat | `/chat/nova` | NovaChat | nova.ts / nova-stream.ts | twin_memories | ✅ |
| 16 | Streaming chat | (ภายใน chat) | SSE consumers | nova-stream.ts, twin-stream.ts | — | ✅ |
| 17 | Dashboard | `/dashboard` | Dashboard + dashboard components | supabase-service | decision_log, twin_memories | ✅ |
| 18 | Daily Brief | `/brief` | DailyBriefPage | — | daily_briefs | 🧪 |
| 19 | Intelligence Hub | `/intelligence` | IntelligenceHub | — | personal_profiles | 🧪 |
| 20 | Worlds Hub | `/worlds` | WorldsHub | WorldExpertiseService | world_preferences, twin_world_expertise | ✅ |
| 21 | World Detail | `/worlds/:worldId` | WorldDetail (16KB) | world prompts/expertise | world_stats | ✅ |
| 22 | World transition (drawer) | `/chat/twin?world=X` | WorldDrawer + world-transitions.css | computeTransition | — | ✅ |
| 23 | Decision create | `/decision-log` | DecisionLoggerPage | DecisionService | decision_log | ✅ |
| 24 | Decision dashboard/history | `/decisions` | DecisionDashboard | DecisionService | decision_log, decision_outcomes | ✅ |
| 25 | Decision insight (client-side) | `/decisions` | DecisionIntelligenceEngine | — (ไม่มี AI backend ตาม spec) | decision_insights_cache | ✅ |
| 26 | Decision export | `/decisions` | DecisionDashboard | CSV/JSON | — | ✅ |
| 27 | Follow-up scheduler | (บริการ) | FollowUpScheduler | — | follow_up_schedule | ✅ (unit) |
| 28 | Upload avatar | `/me`, `/twin-profile` | FileUploadUI | FileUploadService | Storage profiles/ (038) | ✅ |
| 29 | MePage/account | `/me` | MePage | — | users_profiles | ✅ |
| 30 | Intelligence panel/patterns | `/intelligence` (+ alias `/twin/patterns`) | IntelligenceHub | patternDetection | behavioral_patterns | 🧪 |
| 31 | Explore/activities | `/explore`, `/activities` | ExplorePage (43KB) | — | — | ✅ |
| 32 | Life Hubs | `/life-hubs` | LifeHubsPage | — | — | 🧪 |
| 33 | Tarot / Palmistry | `/tarot`, `/palmistry` | TarotPage, PalmistryPage | — | — | 🧪 |
| 34 | Community | `/community` | CommunityPage | CommunityService | community_insights | 🧪 |
| 35 | Share | `/share/:code` | Share | unified-handler share module | share_links | ✅ |
| 36 | Privacy Center | `/privacy` | PrivacyCenter (30KB) | privacy-boundary | privacy_consent | 🧪 |
| 37 | Pricing/Stripe | `/pricing` (+ success) | PricingPage | stripe module + stripeService | subscriptions | 🧪 (มี unit, ไม่มี E2E) |
| 38 | Blog | `/blog`, `/blog/:slug` | BlogListPage, BlogArticle | — | — | 🧪 |
| 39 | Marketing/SEO | about/science/contact/terms/faq/vs-astrology | หน้าแยก + OG (og.ts) | structuredData | — | ✅ |
| 40 | Notifications/Push | (บริการ) | PushScheduler, NotificationAnalytics | notifications module | notification_queue/schedule | 🧪 |
| 41 | PWA/Offline | (global) | sw.js, OfflineBanner, PWAInstallPrompt | — | — | ✅ |
| 42 | Lifecycle/Recovery | (global) | RecoveryRouteHandler, useRecoveryRoute, entryResolver | lifecycleStore | user_lifecycle (040) | ✅ |
| 43 | Personal Context | (บริการ) | PersonalContextBuilder/Initializer | TwinStateEngine | personal_context | ✅ |

**สรุปนับ:** ✅ IMPLEMENTED = 30 · 🧪 IMPLEMENTED+TEST-GAP = 13 · 🔴 MISSING = 0 · ⚠️ BLOCKED = 0
*(หมายเหตุ: การนับรวมเป็น "36 required capabilities" ใน CLOSURE BOOK — จัดกลุ่ม features ที่แชร์ implementation เข้ากลุ่มเดียวกัน)*

---

## 3. ROUTE MAP (จาก App.tsx + LangRedirect)

```text
Public:  / · /th · /en · /onboarding · /login · /core-awakening · /blog(/:slug) ·
         about · science · contact · terms · faq · vs-astrology · share/:code · pricing(/success)
Protected: dashboard · chat/nova · chat/twin · worlds(/:id) · analysis · intelligence ·
         decisions · decision-log · explore · activities · life-hubs · me · menu ·
         brief · badges · twin-profile · twin/settings · twin/personality ·
         settings/passkeys · privacy · voice · tarot · palmistry · community
Aliases (intentional): /twin → /chat/twin · /twin-birth → /core-awakening ·
         /twin/patterns → /intelligence · /twin/:id → /twin-profile · /chat → /chat/nova
Recovery (TWIN_ALIVE): /core-awakening → /dashboard (useRecoveryRoute)
Recovery (AWAKENING):  อยู่ /core-awakening ได้ (MG-05-01 fixture ยืนยัน)
```

---

## 4. API SURFACE (functions/api — implement จริง 14 endpoints/modules)

| Endpoint | Handler | หมายเหตุ |
|----------|---------|----------|
| /api/twin · /api/twin-stream | twin.ts, twin-stream.ts | Twin chat + SSE |
| /api/nova · /api/nova-stream | nova.ts, nova-stream.ts | Nova chat + SSE |
| /api/og | og.ts | OpenGraph image |
| /api/autonomy-log | autonomy-log.ts | — |
| /api/metrics | metrics.ts | ห้ามลบ (architectural gate — memory) |
| /api/* modules | [[route]].ts → unified-handler | notifications · twin-evolution · sice · stripe · profile · blueprint · share |
| ❌ /api/coach | ไม่มี | แทนด้วย Explore "Decision coach" → /api/twin — ห้ามสร้างโดยไม่มี product decision |

**API 12-vs-14:** spec เดิมล็อก 12 · implement = 14 — reconciliation pending (บันทึกใน DOC DRIFT)

---

## 5. DATABASE (migrations = source of truth)

```text
35 files · ล่าสุด 040_create_user_lifecycle_table.sql
Core: 024 twins · 025 awakening_essence · 029 phase_a core · 030 extended ·
      035 forensic consolidation (70KB) · 040 user_lifecycle
Intelligence: 010 personal_profiles/memory/patterns/context · 034 twin_full_analysis
Decision: 001 + 020 (+ 039 insights cache)
Worlds: 021 world_preferences · 031 world_stats · 036 twin_visual_dna
Auth/Security: 012 credentials · 017 rate limits · 018 passkeys · 014 privacy consent
Ops: 007 analytics · 013 journal_queue · 015 push · 016 subscriptions · 019 daily_briefs ·
     033 community · 038 storage profiles bucket · 037 onboarding checkpoints
RLS: public.* = auth.uid() · twin-scoped = FK chain · selfprint.* = service_role (API layer)
```

---

## 6. TEST ARCHITECTURE ณ HEAD

```text
Playwright (100 tests / 9 files / 5 projects):
  chromium (27)                    — production smoke/auth/journey (public)
  chromium-staging (48)            — Phase B + MG (ยกเว้น MG-05-01, grepInvert)
  chromium-staging-awakening (1)   — MG-05-01 AWAKENING fixture
  Mobile Chrome / Safari (12+12)   — smoke

globalSetup = e2e/global-setup-combined.ts
  → auth test-phase-b (TWIN_ALIVE) → e2e/.auth/user.json
  → auth test-phase-awakening (AWAKENING) → e2e/.auth/user-awakening.json
Seed: scripts/seed-test-users.ts (TEST_USERS 7 ราย — stage: active×5, awakening×1, onboarding_voice×1)

Vitest: 1102/1102 tests / 67–72 files
k6: loadtests/ (manual workflow_dispatch)

⚠️ CI E2E gate = ไม่ STABLE (พิสูจน์แล้ว):
  #413 RED · #415 GREEN · #416 RED — code เดียวกัน (docs-only diff ระหว่าง #415/#416)
  สาเหตุที่พิสูจน์ = flaky test ไม่ใช่ product:
    UPLOAD-04  — state pollution: UPLOAD-03 persist avatar → FileUploadUI สลับเป็น
                 preview mode → การรอแต่ dropzone race กับ async currentUrl
                 → แก้แล้วด้วย waitForUploadReady() (รอทั้งสอง state, assertion คงเดิม)
                 upload suite ผ่าน 2 รอบติดกัน (32.2s, 28.2s)
    MG-07-01 / TWIN-04 / WORLD-01 — timing/data-dependent (ล้มเป็นครั้งคราว, retries=1
                 ช่วยได้เมื่อล้ม ≤1 attempt; UPLOAD-04 ใน #416 ล้มทั้ง 2 → run ตก)
  กฎ: เห็น CI แดง → ตรวจ artifact/replicate ก่อนสรุป — ห้ามสรุปจากชื่อ commit
```

---

## 7. STATE MODEL

```text
lifecycleStore (sync user_lifecycle): ONBOARDING → ANALYSIS → AWAKENING → TWIN_ALIVE → WORLD_ACTIVE
twinState (TwinStateEngine จาก personal_context): awakening(0-4) → aware(5-12) →
  connected(13-22) → reflective(23-34) → insightful(35-50) → aligned(51+)
สองระบบนี้ INDEPENDENT — lifecycle=TWIN_ALIVE + twinState=awakening อยู่ร่วมได้ (forensic 5.8/5.9)
Seed test-phase-b: TWIN_ALIVE + personal_context ว่าง → twinState=awakening (representation
  mismatch — เป็นงาน Phase 5.12 enrich seed, ไม่ใช่ product bug)
```

---

## 8. KNOWN ISSUES / GAPS (แยกประเภทตาม CLOSURE BOOK §6)

```text
🔴 Product Gap (0)   : —
🧪 Test Gap (17)     : ดู SELFPRINT_CURRENT_STATE §E
⚪ Deferred by spec  : DECISION-04 · UPLOAD-05 · WORLD-06 · TWIN-05 · LIFE-15 · D-05 · D-06 · D-07
📚 Doc Drift (5)     : useTwinFidelity comment · API 12-vs-14 · MASTER_PRD superseded ·
                       MASTER_GATE_EVIDENCE (historical) · REALITY_MAP เก่า (ไฟล์นี้แทน)
⚠️ Env (2)           : staging.selfprint.one 525 · Tailwind ไม่ compile
Historical ปิดแล้ว   : CI #406 STAGING_URL · CI-BUILD-ENV-001 · MG-05-01 redirect ·
                       E2E_AWAKENING_PASSWORD CI wiring · lifecycle downgrade ·
                       typecheck:functions · k6 scripts · migration 011 breakpoint ·
                       staging service key · UPLOAD-04 flaky (state pollution — แก้
                       waitForUploadReady, รอ CI verify)
ยังเปิด (test-only) : MG-07-01 · TWIN-04 · WORLD-01 — intermittent timing, แยก forensic ต่อ
```

---

## 9. SOURCE OF TRUTH HIERARCHY (หลังวันนี้)

```text
1. CODE (src/** · functions/** · supabase/migrations/**)
2. TEST/RUNTIME (CI runs · playwright --list · npm test)
3. SELFPRINT_100_PERCENT_CLOSURE_BOOK.md   ← product closure
4. SELFPRINT_CURRENT_STATE.md              ← snapshot ณ HEAD
5. SELFPRINT_100_GATE_EVIDENCE.md          ← evidence log
6. SELFPRINT_PRODUCT_REALITY_MAP.md        ← ไฟล์นี้
7. README.md / docs/*                      ← รอง
8. archive/ · เอกสารวันที่เก่า             ← HISTORICAL เท่านั้น
```

**คำตอบเดียว:** agent ทุกตัวหลังจากนี้ให้เริ่มอ่านที่ `SELFPRINT_CURRENT_STATE.md` แล้วไล่ลงมาตามลำดับข้างบน
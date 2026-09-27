# FORENSIC PHASE 01 — REPOSITORY RECONSTRUCTION (Repository Map)

**วันที่ตรวจ:** 27 กันยายน 2026  
**วิธีตรวจ:** read-only (`git ls-files`, grep import tracing, file reads)  
**สถานะเอกสาร:** 🟢 VERIFIED สำหรับสิ่งที่มีหลักฐาน import/usage จริง · 🟤/🟣 สำหรับ candidate ที่ยัง trace ไม่ครบ  
**หมายเหตุ:** เอกสารนี้คือแผนที่ + candidate list — **ยังไม่ตัดสิน dead จนกว่า Phase 9 trace usage ครบ**

---

## 1. Repository Map (Top-Level)

```
D:/selfprint-v3-react
├── .ai/                  scripts สำหรับ CI gate (astro-check, token-check, master-plan) + session logs + task cards
├── .github/              5 CI workflows + secrets-setup.md
├── .husky/               pre-push hook → npm run validate:all
├── .kilo/                plan documents + task cards (AI orchestration state)
├── .wrangler/            local wrangler state (ignored)
├── api/                  ⚠️ Vercel-style handler (unified-handler.ts + _utils/)
├── dist/                 build output (ignored, present)
├── docs/                 35 main docs + archive/ + OLD/ + reference/ + verification/ + development/
├── e2e/                  Playwright specs (19 files) + fixtures + global setups
├── functions/            Cloudflare Pages Functions (functions/api/*)
├── loadtests/            k6 load test scripts
├── memory/               AI memory handoff docs
├── playwright-report/    E2E reports (ignored, present)
├── public/               static assets (audio 72, blog 90, icons, OG images, sitemap, llms.txt)
├── scripts/              supabase lifecycle, seed, sitemap, e2e runner
├── src/                  React application (หลัก)
├── supabase/             migrations (35) + functions (13 edge) + config
├── test-results/         E2E results (ignored, present)
└── tests/                tests/e2e/user-recovery.spec.ts (1 ไฟล์ — แยกจาก e2e/)
```

**File counts (git ls-files):**

| Category | Count |
|----------|-------|
| Total tracked files | 1,161 |
| TS/TSX source+test | 555 |
| Test/spec files (`*.test.*` / `*.spec.*`) | 92 |
| Backend (api/ + functions/ + supabase/) code files | 59 |
| Docs + e2e + tests files (md/ts/json/txt) | 147 |

---

## 2. Module Map — src/

### 2.1 Entry & Routing

- `src/main.tsx` → App.tsx
- `src/App.tsx` (470 บรรทัด) — Router + Provider stack ทั้งหมด + route table ผ่าน `getLanguagePrefixedRoutes()`
- Route structure: `/en/*` + `/th/*` คู่ขนาน (publicPages forEach), catch-all → `/th/`
- Lazy loading ทุก page ผ่าน `React.lazy` (A2-LAZY / A3-LAZY / PRVLAZY-001 optimization comments)
- Marketing path gate: `MARKETING_PATH_RE` (App.tsx:348) — skip provider stack บนหน้า public

### 2.2 Pages (43 ไฟล์, lazy-import ใน App.tsx ยกเว้น Onboarding.test.tsx)

รายการ route ที่ register จริง (App.tsx:201-293):

| Path | Page |
|------|------|
| `/` `/en/` `/th/` | LandingPage (HomeRoute) |
| `/onboarding` | Onboarding |
| `/core-awakening` | CoreAwakening |
| `/chat` → redirect | `/chat/nova` |
| `/chat/nova` | NovaChat (NovaProvider scoped) |
| `/chat/twin` | ImmersiveTwinChat |
| `/twin` → redirect | `/chat/twin` |
| `/twin-birth` | TwinBirthPage (TC-401) |
| `/twin/patterns` 🔒 | TwinPatternsPage |
| `/twin/:id` 🔒 | TwinProfileDetailPage |
| `/dashboard` | Dashboard |
| `/intelligence` | IntelligenceHub |
| `/analysis` | AnalysisPage |
| `/privacy` | PrivacyCenter |
| `/share/:code` | Share |
| `/brief` | DailyBriefPage |
| `/badges` | BadgePage |
| `/pricing` | PricingPage |
| `/pricing/success` | PricingSuccessPage |
| `/login` | Login |
| `/settings/passkeys` | PasskeySettings |
| `/explore` | ExplorePage |
| `/activities` | ActivitiesPage |
| `/me` | MePage |
| `/voice` | VoiceChatPage |
| `/twin-profile` | TwinProfilePage |
| `/life-hubs` | LifeHubsPage |
| `/decisions` | DecisionDashboard |
| `/decision-log` | DecisionLoggerPage |
| `/memory-insights` 🔒 | MemoryInsightsPage (TC-503) |
| `/faq` | FAQPage |
| `/vs-astrology` | VsAstrologyPage |
| `/menu` | FeatureMenu |
| `/tarot` | TarotPage |
| `/palmistry` | PalmistryPage |
| `/community` | CommunityPage |
| `/about` `/science` `/contact` `/terms` | SEO pages |
| `/blog` | BlogListPage |
| `/blog/:slug` | BlogArticle |
| `/twin/settings` 🔒 | TwinSettingsPage |
| `/twin/personality` 🔒 | TwinPersonalityPage |
| `/worlds` 🔒 | WorldsHub |
| `/worlds/:worldId` 🔒 | WorldDetail |

🔒 = ProtectedRoute

### 2.3 State Layer

- **Contexts (15):** AI, Audio, Auth, Emotion, Environment, Evolution, Experience, Hub, Language, Nova, Popup, Subscription, Theme, Twin, World
- **Zustand stores (5):** analysisStore, decisionStore, lifecycleStore, twinStore, userStore
- **Provider mounting (App.tsx):** Emotion + Twin + Language mount ทุก visitor; AI/Hub/World/Subscription/Experience/Audio/SFX/Environment/Evolution/Popup lazy + session-gated

### 2.4 Services (35 ไฟล์) + SICE engines (17 ไฟล์)

- Services: TwinAPIService, NovaAPIService, Decision* (5 ตัว), TwinEvolutionService, SICEOrchestratorImpl (deprecated), CoreAwakeningService, FeedbackService, stripeService, analytics, ฯลฯ
- `src/services/sice/SICEOrchestrator.ts` — live orchestrator (16 engines registered)
- `src/services/sice/engines/*` — 17 engine files

### 2.5 Libs (intelligence / experience / visual / twin / twinBirth / memory / storage / auth / story / entry / geo / prompts / worlds)

รายละเอียดใน Phase 0 แล้ว ประเด็นใหม่ดูหัวข้อ 4 (Duplication) ด้านล่าง

---

## 3. Dependency / Usage Map (สำคัญ)

### 3.1 Intelligence engine มี 2 ชุด และ "ชุด deprecated" คือชุดที่ถูกใช้จริง

**🟠 ค้นพบสำคัญ:** `src/lib/intelligence/index.ts` ประกาศตัวเองว่า DEPRECATED (15 ก.ย. 2026) และบอกให้ migrate ไป `@/services/sice/engines/*` — แต่ **import จริงใน codebase ยังชี้ไปที่ lib/intelligence เป็นหลัก:**

| Engine | lib/intelligence (deprecated) imports | sice/engines imports |
|--------|--------------------------------------|---------------------|
| TwinStateEngine | 7 imports (useTwinIdentity, ExperienceContext, LivingTwin, TwinSynthesis, TwinEvolution) | 2 (SICEOrchestrator, SICEEngines.test) |
| PatternDetector | 4+ (IntelligencePanel, GrowthSpace, ExecutiveSummary, SICEBridge) | 2 (SICEOrchestrator, test) |
| PersonalContextBuilder | 4+ (IntelligencePanel, ExecutiveSummary, TwinEvolution, useTwinIdentity, BiasDetectionDashboard) | 2 (SICEOrchestrator, TwinPersonalityPage, test) |
| AIFeedbackLoop | 3+ (IntelligencePanel, ExecutiveSummary, DailyInsightsList) | 2 (SICEOrchestrator, test) |
| InsightEngine | 2+ (ExecutiveSummary, useWorldRecommendation, TwinContext, analysisStore, CoreAwakeningService) | 1 (SICEOrchestrator) |
| BadgeEngine | 2 (BadgeGallery, SICEBridge) | 2 (SICEOrchestrator, test) |
| ExperienceEngine | — | 2 (SICEOrchestrator, test) |

**สถานะ:** 🟠 INCOMPLETE MIGRATION — `SICEOrchestrator` ใช้ชุด sice/engines จริง แต่ consumer ส่วนใหญ่ (pages, components, hooks, contexts) ยัง import ชุด lib/intelligence (deprecated) โดยตรง = มี engine instance 2 ชุดทำงานคู่ขนานใน runtime เดียว (SICEBridge ทำหน้าที่เชื่อม 2 ชุด)

### 3.2 TwinStateEngine — 3 ไฟล์ซ้ำ

| ไฟล์ | Import จริง |
|------|------------|
| `src/lib/intelligence/TwinStateEngine.ts` | ✅ 7 consumers |
| `src/lib/experience/TwinStateEngine.ts` | ⚠️ ไม่มี import จริง (มีแค่ comment ใน TwinPresence.tsx) |
| `src/services/sice/engines/TwinStateEngine.ts` | ✅ ผ่าน SICEOrchestrator + tests |

### 3.3 twinVisualDNA — 2 ไฟล์ "ซ้ำชื่อ ไม่ซ้ำ API"

| ไฟล์ | API | Consumers |
|------|-----|-----------|
| `src/lib/twinVisualDNA.ts` | saveTwinDNA/loadTwinDNA/generateTwinDNA/refineTwinDNA/dnaPrimaryColor... | ✅ 15+ consumers (pages, living/, twinBirth/) |
| `src/lib/twin/twinVisualDNA.ts` | getTwinVisualDNA/TwinCoreShape | ✅ 5 consumers (HologramBirth, TwinThreeRenderer, TwinPresence, Twin, useTwinIdentity) |

**สถานะ:** 🟡 DUPLICATE-BY-NAME — สองไฟล์ชื่อเดียวคนละหน้าที่ ทำให้ confusion สูง (Phase 9 ต้องเทียบเนื้อหาว่า overlap กันแค่ไหน)

### 3.4 SICEOrchestratorImpl (deprecated, self-declared)

- `src/services/SICEOrchestratorImpl.ts` header: `@deprecated ... No longer imported anywhere. Kept for reference only.`
- **ยืนยัน:** grep ทั้ง repo พบ import 0 ที่ (มีแค่ self-reference) → 🟤 ORPHAN (self-declared, verified)

---

## 4. Candidate Legacy / Orphan / Duplicate List (ยังไม่ตัดสินสุดท้าย — Phase 9 ตัดสิน)

### 🟤 ORPHAN / DEAD candidates (ไม่พบ consumer)

| ไฟล์ | หลักฐาน |
|------|---------|
| `src/hooks/useAudioDucking.ts` | มีเฉพาะ self-reference |
| `src/hooks/useNotificationEngagement.ts` | มีเฉพาะ self-reference |
| `src/hooks/usePasskey.ts` | **ไม่พบ import จริงใน src/** (PasskeyLogin ใช้ passkeyProvider ตรง ๆ) |
| `src/hooks/usePrivacy.ts` | **ไม่พบ import จริง** — migration 035 เองเขียนว่า "importer เดียวคือ usePrivacy.ts ที่ไม่มีใครใช้" |
| `src/hooks/sfx.ts` | **ไม่พบ import** (`hooks/sfx` ไม่มี consumer) |
| `src/components/features/HubSwitcher.tsx` | EnvironmentContext comment ระบุ "only imported by a commented-out route and a route that was removed" — export ผ่าน features/index.ts แต่ไม่พบ consumer จริง |
| `src/lib/entry/journeyResume.ts` | ไม่พบ import (ต่างจาก entryResolver ที่ lifecycleStore ใช้ type) |
| `src/hooks/useSessionPersistence.ts` | self-reference ใน interface เท่านั้น |
| `src/hooks/useDecisionCache.ts` | ไม่พบ import ใน src (มีแค่ self) |
| `src/lib/experience/TwinStateEngine.ts` | ไม่มี import จริง (ดู 3.2) |
| `src/services/SICEOrchestratorImpl.ts` | self-declared deprecated + ยืนยันแล้ว |
| `src/components/composites/Skeleton.tsx` vs `src/components/ui/Skeleton.tsx` | ซ้ำซ้อน 2 ชุด (ยังไม่ trace) |

### 🟡 DUPLICATE candidates (มีหลาย implementation ของ concept เดียว)

| Concept | ไฟล์ | สถานะ |
|---------|------|-------|
| SICE engines | lib/intelligence/* (deprecated) vs services/sice/engines/* (live) | 🟠 สองชุด active ใน runtime |
| TwinStateEngine | 3 ไฟล์ | 🟠 |
| twinVisualDNA | 2 ไฟล์ | 🟡 |
| Skeleton component | 2 ไฟล์ | ⚪ ต้อง trace |
| EnvironmentEngine / ExperienceEngine | lib/experience + sice/engines | 🟡 (ผูกกับ F3 duplication เดียวกัน) |
| Migration runner | run-migrations.cjs/v2/v3 | 🟡 3 ชุดใน root |

### 🔍 SUSPICIOUS / ARTIFACTS

| ไฟล์ | เหตุผล |
|------|--------|
| `npx` (root, 0 bytes) | Windows artifact, committed โดยไม่ตั้งใจ |
| `src/constants/testwrite.tmp` | temp file ติด track |
| `src/package.json` + `src/package-lock.json` | manifest ซ้อนใน src (ใช้ไม่ใช้ต้อง trace — npm ไม่ควรอ่าน) |
| `src/BITEMEBABY_PRODUCT_REALITY_MAP.md` | **OUT OF SCOPE** (Bitemebaby project) |
| `src/P0A_GAP_ANALYSIS.md`, `src/PHASE2_IMPLEMENTATION_STATUS.md`, `src/STATUS_TRACKER.md` | เอกสารติดใน source dir |
| `build-output.txt`, `astro-audit.txt`, `token-violations.txt`, `migration_*.txt`, `lighthouse-*.json` | working artifacts ติด track ใน git |
| `memory/HANDOFF_2026-08-23.md` | AI memory ติด repo (อาจตั้งใจ) |

---

## 5. Feature Flags (จาก src/lib/featureFlags.tsx)

Flags ที่ระบบรู้จัก (featureFlags.tsx:62-83):

| Flag | Default | ที่ตรวจพบ consumer |
|------|---------|--------------------|
| `LIVING_DIAGRAM` | ROLLOUT=100 → **on** | Dashboard.tsx, Onboarding.tsx, TwinProfilePage.tsx, WorldEnvironment.tsx (TC-106/107/108) |
| `UNIFIED_PIPELINE` | ROLLOUT=100 → **on** | (ต้อง trace ต่อ Phase 2/3) |
| `NO_ASTRO_LANG` | `!== 'false'` → **on** | (เป็น policy flag) |
| `TWIN_BIRTH` | ROLLOUT=100 → **on** | (trace ต่อ) |
| `DECISION_INTELLIGENCE` | ROLLOUT=100 → **on** | (trace ต่อ) |
| `WORLDS_V2` | ROLLOUT=100 → **on** | (trace ต่อ) |
| `COACH_ROLLOUT_PERCENT` | 0 → **off** | AskCoach.tsx — comment: `/api/coach ยังไม่มี handler บน Cloudflare Pages` |

**สรุปเบื้องต้น:** flags เกือบทั้งหมด default-on ด้วย ROLLOUT=100 (rollback-only); AskCoach เป็น flag เดียวที่ปิดจริงเพราะ backend ขาด

---

## 6. TODO/FIXME/Debug Artifacts

- TODO จริง: `src/services/__tests__/CoreAwakeningService.phase3.test.ts:304-312` (Phase 10 — test.skip แบบ honest)
- `console.log` production paths: `api/unified-handler.ts` (stripe webhook logging), `scripts/weekly-supabase-resume.ts` — ไม่พบ debug console.log ค้างใน src UI code (มีใน e2e ซึ่งปกติ)
- DEBUGLEAK-001 fix อยู่ใน unified-handler.ts:827,965 (แก้แล้ว)
- `src/__tests__/nova-prompts.test.ts:265` บังคับ prompt ไม่มี TODO/FIXME (guard test)

---

## 7. Unknown Areas (สำหรับ Phase 2+)

1. `api/unified-handler.ts` vs `functions/api/[[route]].ts` — เส้นทางใด deploy จริงบน Cloudflare Pages (vite.config/wrangler ชี้ไป functions/)
2. `src/lib/astrovera-brain/` (psychology JS module) — ใครใช้ (พบ astrovera-edge ใน supabase functions + astrovera-adapter)
3. `src/lib/worlds/` + `src/services/world-routing/` + `src/lib/worldRecommender.ts` + `worldSystemPromptBuilder.ts` — 3 ชั้น world logic ต้อง trace data flow
4. `src/sw.js` (hand-written service worker) — push/sync behavior จริง
5. `loadtests/` — k6 scripts ที่ถูกเรียกจาก CI (testing.yml) เท่านั้น
6. `memory/` directory — ใช้โดย AI session ไม่ใช่ product runtime (ต้องยืนยัน)
7. `src/features/chat/hooks/useChat.ts` — consumer ใคร (FloatingSelfprintChat?)
8. `src/lib/entry/entryResolver.ts` — ใช้ type ใน lifecycleStore — runtime ใช้หรือไม่

---

## 8. Phase 1 Conclusion

### ✅ Verified

- โครงสร้าง repository สมบูรณ์: 1,161 tracked files, 555 TS/TSX, 92 test files
- Route table ทั้ง 43 routes ยืนยันจาก App.tsx จริง (ไม่ใช่จาก docs)
- พบ duplication ที่เป็นระบบ: intelligence engines 2 ชุด (deprecated แต่ถูกใช้มากกว่า), TwinStateEngine ×3, twinVisualDNA ×2, Skeleton ×2
- Orphan candidates 11 รายการ (hooks 6 + libs 3 + services 1 + components 2) — รอ Phase 9 trace สุดท้าย
- Feature flags ระบุจาก code จริง (featureFlags.tsx) — AskCoach off, อื่น ๆ default-on

### 🟠 Key Contradiction (สำคัญ)

- `lib/intelligence/index.ts` ประกาศ DEPRECATED แต่ **codebase ยังใช้มันเป็นหลัก** — migration ไป sice/engines ไม่เสร็จ (SICEBridge เชื่อม 2 ชุดไว้แทน) ตรงกับคำว่า "F3 — Duplicate intelligence engine layers" ใน comment เอง

### ⚪ ยังไม่ verified

- dead/orphan สุดท้าย (ต้อง trace เชิง runtime + Phase 9)
- ความแตกต่างเนื้อหาของไฟล์ duplicate ทั้งหมด (คู่ไหนต่างกันจริง)

### 🛑 STOP

รอคำสั่งดำเนิน Phase 2 (Architecture Reconstruction)

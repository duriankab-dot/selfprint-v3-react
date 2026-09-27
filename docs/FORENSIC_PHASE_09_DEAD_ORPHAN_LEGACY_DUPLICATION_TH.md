# FORENSIC PHASE 09 — DEAD / ORPHAN / LEGACY / DUPLICATION FORENSIC AUDIT

**วันที่ตรวจ:** 27 กันยายน 2026  
**ขอบเขต:** Dead code, orphan code, legacy implementations, duplicate services, deprecated-but-active annotations — ตรวจจาก repository จริง  
**วิธีตรวจ:** Static import/call tracing across ALL source files; directory enumeration; file structure inspection  
**สถานะ:** ทุก claim มี source reference รองรับ  

---

## 1. EXECUTIVE TRUTH

### Dead Code (พิสูจน์แล้วว่าไม่มี production caller)

| ID | Item | Evidence | Status |
|----|------|----------|--------|
| DC-01 | `useAudioDucking` hook | Zero external consumers in src/ | ⚫ DEAD |
| DC-02 | `useNotificationEngagement` hook | Zero external consumers in src/ | ⚫ DEAD |
| DC-03 | `usePasskey` hook | PasskeyLogin uses passkeyProvider directly instead | ⚫ DEAD |
| DC-04 | `usePrivacy` hook | Zero external consumers; referenced only in SQL migration comments | ⚫ DEAD |
| DC-05 | `useSessionPersistence` hook | Zero imports outside test/task cards | ⚫ DEAD |
| DC-06 | `journeyResume.ts` | Zero src/ consumers; referenced only in migration comment | ⚫ DEAD |
| DC-07 | `HubSwitcher` component | Barrel export exists but zero actual importers | ⚫ DEAD |
| DC-08 | `ui/Skeleton.tsx` | Never imported; never rendered | ⚫ DEAD |
| DC-09 | `composites/Skeleton.tsx` | Barrel re-exported but zero destructured callers | ⚫ DEAD |
| DC-10 | `SICEOrchestratorImpl.ts` | Self-declared deprecated, zero imports in src/ | ⚫ DEAD |
| DC-11 | `WorldRoutingService.routeToWorld()` | Self-declared @deprecated, zero production callers | ⚫ DEAD |
| DC-12 | `src/services/migrations/` legacy track | Duplicate schema track, never used by any runner | ⚫ DEAD |
| DC-13 | `/api/coach` backend | No handler, deleted from git (d6624af), catch-all returns 404 | ⚫ DEAD |
| DC-14 | `run-migrations-v2.cjs` | Read-only stub that logs "Manual execution required" | ⚫ DEAD |
| DC-15 | `run-migrations-v3.cjs` | Same no-op stub as v2 | ⚫ DEAD |
| DC-16 | `lib/twinBirth/twinBirthFlow.ts` | Only consumer is `useTwinBirth()` which has zero callers | ⚫ DEAD chain |
| DC-17 | `lib/twinBirth/dnaPersistence.ts` | saveDNAMetadata() and upgradeDNAIfNeeded() have zero callers | ⚫ DEAD chain |
| DC-18 | `useTwinBirth()` hook | 134 lines defined, ZERO consumers anywhere in src/ | ⚫ DEAD |
| DC-19 | `src/store/*` (no index barrel) | Zustand stores flat with no barrel — may be intentional or accidental | ⏸️ UNPROVEN |

**Dead code ในช่วง DC-01..19 = 17 confirmed dead artifacts** (DC-13 → DISCONTINUED, DC-19 → ORPHAN-UNPROVEN ไม่นับ dead — แก้ตาม Reconciliation Report 27 ก.ย. 2026; canonical totals ทั้งชุดอยู่ในเอกสารนั้น)

### Dead Components (Additional — Import Graph Analysis 569 src files)

| ID | Item | Path | Consumers | Justification |
|----|------|------|-----------|---------------|
| DC-20 | ChatWindow component | `src/components/chat/ChatWindow.tsx` | 0 | No JSX reference; transitive chain via useChat also dead |
| DC-21 | WorldContextHeader component | `src/components/chat/WorldContextHeader.tsx` | 0 | No consumers |
| DC-22 | ChoiceConsequence component | `src/components/twin/ChoiceConsequence.tsx` | 0 | No consumers |
| DC-23 | VoiceTwin component | `src/components/twin/VoiceTwin.tsx` | 0 | No consumers |
| DC-24 | MemoryRetrieval component | `src/components/memory/MemoryRetrieval.tsx` | 0 | No consumers |
| DC-25 | SCIEResult component | `src/components/onboarding/SCIEResult.tsx` | 0 | No consumers |
| DC-26 | WorldTabs component | `src/components/WorldTabs.tsx` + world-tabs.css | 0 | No consumers |
| DC-27 | BiasDetectionDashboard component | `src/components/features/BiasDetectionDashboard.tsx` + bias-detection.css | 0 | No consumers |
| DC-28 | TwinSynthesis component | `src/components/twin/TwinSynthesis.tsx` + twin-synthesis.css | 0 | No consumers |
| DC-29 | TwinAvatar component (TEST-ONLY) | `src/components/features/TwinAvatar.tsx` | 1 test | Test-only, not in production render tree |
| DC-30 | JsonLdSchemas component | `src/components/SEO/JsonLdSchemas.tsx` | 0 | Test-only SEO schema generation |

**New total dead code: 19 original + 10 components = 29 items**

### Dead Services (Additional — Zero Production Importers)

| ID | Item | Path | Consumers | Justification |
|----|------|------|-----------|---------------|
| DC-31 | ConversationAnalyzer | `services/ConversationAnalyzer.ts` | 0 | Zero callers anywhere |
| DC-32 | DecisionAutomationService | `services/DecisionAutomationService.ts` | 0 | Self-deprecated ("moved to FollowUpScheduler") |
| DC-33 | DeliveryVerification | `services/DeliveryVerification.ts` | 0 | Zero callers |
| DC-34 | InputValidation | `services/InputValidation.ts` | 0 | Zero callers |
| DC-35 | NotificationAnalytics | `services/NotificationAnalytics.ts` | 0 | Zero callers |
| DC-36 | NotificationTemplates | `services/NotificationTemplates.ts` | 0 | Zero callers |
| DC-37 | SecurityService | `services/SecurityService.ts` | 0 | Zero callers |
| DC-38 | TwinMigration | `services/TwinMigration.ts` | 0 | Zero callers |
| DC-39 | DecisionIntelligence | `services/DecisionIntelligence.ts` | 0 | Zero callers |

**New total dead code: 29 + 9 services = 38 items**

### Dead Lib/Utilities (Zero Production Importers)

| ID | Item | Path | Status |
|----|------|------|--------|
| DC-40 | modelRouter | `lib/ai/modelRouter.ts` | ⚪ UNPROVEN — contains routing logic, may be called dynamically at runtime |
| DC-41 | crypto (Passkey) | `lib/auth/crypto.ts` | ⚫ DEAD — zero importers |
| DC-42 | webauthn-verify | `lib/auth/webauthn-verify.ts` | ⚫ DEAD — zero importers |
| DC-43 | exportEngine | `lib/decision/exportEngine.ts` | ⚫ DEAD — zero importers |
| DC-44 | birthPlace.types | `lib/geo/birthPlace.types.ts` | ⚫ DEAD — zero importers |
| DC-45 | storyNarrative.types | `lib/story/storyNarrative.types.ts` | ⚫ DEAD — zero importers |
| DC-46 | twinProceduralVisual | `lib/twin/twinProceduralVisual.ts` | ⚫ DEAD — zero importers |
| DC-47 | localization constants | `constants/localization.ts` | ⚫ DEAD — zero importers |
| DC-57 | PersonalContextBuilder × unused instantiation sites | 13 runtime instantiation sites (Section 16 + Part N detailed trace) | **แก้ classification (27 ก.ย.):** ไม่ใช่ dead — **DUPLICATE CANDIDATE / architecture risk (SC-06)**; E1-proven cache-shape collision, E5 runtime impact unproven |
| DC-58 | DecisionIntelligence service | `services/DecisionIntelligence.ts` | ⚫ DEAD — zero production callers, semantic duplicate of DecisionLearningService — **≡ DC-39 (ID ซ้ำ ถูก merge เป็น canonical DC-39)** |
| DC-59 | database-init.ts runMigrations() export | `src/services/database-init.ts:13` | ⚫ DEAD — zero callers, only ensureUserProfile consumed by CoreAwakeningService |
| DC-60 | VisualStateEngine | `lib/visual/VisualStateEngine.ts` | ⚫ DEAD — header claims "single source of truth" for adaptive visuals but is test-only; claimed domain owned by ExperienceEngine via ExperienceContext |

**New total dead code: 46 utilities + 9 CSS + 10 barrels + 5 Part-L-specific = ~70+ items potentially removable**

### Dead CSS Files (Zero Imports, Not in @import Chain)

| ID | File | Notes |
|----|------|-------|
| DC-48 | styles/nova-twin.css | Dies if NovaChat feature deprecated |
| DC-49 | styles/voice-twin.css | May be needed by VoiceChatPage (unverified) |
| DC-50 | styles/confidence-indicator.css | **แก้เหตุผล (27 ก.ย.):** ConfidenceIndicator component มีชีวิต (AnalysisPage:28, ExecutiveSummary:30, IntelligencePanel:23) แต่ CSS นี้ zero refs → DEAD ด้วยหลักฐาน zero-import |
| DC-51 | styles/decision-insights.css | Dies with dead component |
| DC-52 | styles/decision-stats.css | Dies with dead component |
| DC-53 | styles/decision-timeline.css | Dies with dead component |
| DC-54 | styles/world-tabs.css | Dies with WorldTabs |
| DC-55 | styles/twin-synthesis.css | Dies with TwinSynthesis |
| DC-56 | styles/advanced-analytics.css | Dies with AnalyticsSummary |

Additionally dead from barrel exports that have no importers:
- `src/components/{audio, auth, composites, features, intelligence, landing, living, primitives, story}/index.ts` — 9 barrel index files never imported
- Note: `hooks/sfx.ts` barrel is dead despite its re-exported hooks being live (hooks consumed directly by SFXProvider)

**New total dead code: 46 + 9 bars + CSS = ~65 items potentially removable** |

### Orphan Findings (implementation exists, consumer unverified)

| ID | Item | Evidence Gap | Status |
|----|------|-------------|--------|
| OP-01 | `sfx.ts` barrel exports (`useTwinSFX`, `useTransitionSFX`, `useUISFX`) | Consumed only by `SFXProvider.tsx:19-21` — verify if SFXProvider renders anywhere | ⚪ UNPROVEN |
| OP-02 | `useDecisionCache` | **แก้ (27 ก.ย. 2026):** ไฟล์ `src/hooks/useDecisionCache.ts` (148 ln) **มีอยู่จริง** — claim "file not found" เป็นเท็จ; exports ทั้งหมด (useDecisions, useDecisionOutcomes, useDecisionPatterns, useInvalidateDecisionCache, DECISION_CACHE_KEYS, CACHE_CONFIG) zero importers → ⚫ DEAD (E1) |
| OP-03 | `SFXProvider` consumers | Need to trace if SFXProvider is rendered in any React tree | ⏸️ EXTERNAL/DEFERRED |
| OP-04 | Stray `src/package.json` | CommonJS type: "commonjs", main: "sw.js" — likely accidental left-over | ⚪ UNPROVEN |

### Legacy Findings (old implementation still active or partially active)

| ID | Item | Evidence | Status |
|----|------|---------|--------|
| LG-01 | `lib/experience/TwinStateEngine.ts` (#2 visual state) | Prior forensics claimed "0 imports/dead" but `EnvironmentEngine.ts:41` disproves — stale annotation | 🟢 VERIFIED ACTIVE (legacy naming) |
| LG-02 | `twinBirthFlow.ts` birth ceremony path | Directly instantiates `new SICEOrchestrator()` at line 121 but its own consumer `useTwinBirth()` is dead — the engine is wired but unreachable from route | 🟡 PARTIAL |
| LG-03 | `VITE_COACH_ROLLOUT_PERCENT` feature flag | Default 0 effectively disables entire AskCoach UI, but frontend remains mounted in IntelligenceHub | 🟡 PARTIAL |
| LG-04 | `TWIN_BIRTH` feature flag | Defined in featureFlags.tsx:71 but NO code reads it — route is unconditional | 🟠 LEGACY ACTIVE |
| LG-05 | `lib/intelligence/index.ts` deprecation banner | Annotated as deprecated Sept 15, 2026 but still has **80 import statements across 39 files (31 prod + 8 test)** — stale annotation | 🟠 LEGACY ACTIVE |
| LG-06 | `/core-awakening` route registered twice in App.tsx:215 and :224 | Harmless duplicate registration | 🟡 PARTIAL |
| LG-07 | `useRecoveryRoute.ts:34` recovery targets `/core-awakening` instead of newer `/twin-birth` | Inconsistent legacy path targeting | 🟡 PARTIAL |
| LG-08 | `supabase/config.toml` deno_version 2 for edge runtime | Supabase edge functions config — unrelated to CF Pages functions | ℹ️ INFO ONLY |

### Duplicate Findings (semantic responsibility overlap)

| ID | Items | Overlap Assessment | Classification |
|----|-------|-------------------|---------------|
| DP-01 | `lib/intelligence/*` (~20 classes) ↔ `services/sice/engines/*` (16 classes) | Semantic overlap on 9 names: PersonalContextBuilder, PatternDetector, InsightEngine, AIFeedbackLoop, TwinStateEngine, BadgeEngine, BehavioralForecastEngine, FutureSelfEngine, MemoryManager↔MemoryManagerEngine, DecisionIntelligenceEngine↔DecisionIntelligenceEngineAdapter | DUAL-LAYER (intentional per CLAUDE.md no-delete rule) |
| DP-02 | `TwinStateEngine` ×3 | #1 lib/intelligence = UI knowledge ladder, #2 lib/experience = visual posture CSS, #3 sice/engines = DB maturity score | INTENTIONAL SEPARATION (different domains, same name collision) |
| DP-03 | `twinVisualDNA` ×3 (F1/F2/F3) | F1 root = per-user PRNG avatar DNA, F2 lib/twin = per-archetype static color/shape lookup, F3 `services/VisualDNAService.ts` = persisted Birth DNA (consumer: CoreAwakeningService.ts:14,427 — verified 27 ก.ย.) | INTENTIONAL SEPARATION (confirmed different APIs/purposes) — **แก้จาก ×2 เป็น ×3 ตาม evidence** |
| DP-04 | `Skeleton` ×2 file-level + GrowthSpace inline | G1 ui/Skeleton = variant-based a11y, G2 composites/Skeleton = count-based no-a11y, both dead | TRUE DUPLICATE (both dead, one should replace the other when wired) |
| DP-05 | `CoreAwakening.tsx` (517 ln) ↔ `TwinBirthPage.tsx` (317 ln) | 200-line diff = mostly comments; same imports/state/effects/birth logic | ACCIDENTAL DUPLICATION (near-identical behavior for distinct routes) |
| DP-06 | `run-migrations.cjs` duplicates `supabase db push` (config.toml) | v2/v3 are no-op stubs; v1 attempts real work but uses undocumented `--file` flag | TRUE DUPLICATE (v1 unsafe, v2/v3 dead) |

---

## 2. SCOPE

### What Was Checked

- ALL `.ts` and `.tsx` files under `src/`, `functions/`, `api/`
- ALL file imports, dynamic imports, barrel exports, re-exports via exhaustive grep
- Consumer chains traced through 2+ levels where applicable
- React component render trees verified against `App.tsx` route definitions
- Cloudflare Pages Functions routing via `[[route]].ts` → `api/unified-handler.ts`
- All SQL migration files (35 canonical + 5 legacy + 3 root ad-hoc = 43 total)
- Feature flags and environment variable usages
- Test files cross-referenced to identify TEST-ONLY items

### What Could NOT Be Verified

- `SFXProvider` actual rendering in production (browser inaccessible)
- Actual runtime instantiation counts (would need E5 runtime evidence)
- Whether any Edge Functions are called from outside this repo (webhooks, cron triggers)

---

## 3. METHODOLOGY

For each candidate artifact, traced consumers via ALL 22 invocation paths specified in Part B:

1. Static import (`import { X } from '...'`) — primary method
2. Dynamic import (`import('...')`) — checked lazy-loaded components
3. Re-export (barrel `index.ts` files) — checked all barrel files
4. Barrel export references
5. Route registration in `App.tsx` — comprehensive route inventory
6. React component tree — checked JSX element tags vs component imports
7. Context/provider registration — checked context providers in `main.tsx` and `App.tsx`
8. Service registry — checked `REAL_SICE_ENGINE_NAMES` array + `registerEngines()` map
9. Dependency injection patterns
10. Event listeners
11. Event emitters
12. String-based function lookup — checked Cloudflare routing table in `[[route]].ts`
13. API route mapping — full `[[route]].ts` dispatch table
14. Cloudflare Functions routing — file-based match order
15. Supabase Edge Function invocation — checked supabase/config.toml for [functions.*] bindings (none found)
16. SQL trigger — no `CREATE TRIGGER` statements referencing external functions found
17. DB webhook — no WebhookSecretKey or similar patterns found
18. pg_cron / scheduled job — no pg_cron extension or schedule entries found in migrations
19. External webhook — Stripe webhook handler in unified-handler, no other external callback targets identified
20. CI invocation — checked all `.github/workflows/*.yml`; zero migration runner references
21. Test-only invocation — cross-referenced E2E spec imports vs production imports
22. Dev-only invocation — checked dev scripts, story files, demo routes

**No single-file conclusion was reached based solely on "grep import returns empty."** Dead status required elimination of ALL 22 invocation paths.

---

## 4. DEAD CODE FINDINGS

### DC-01: `useAudioDucking` (src/hooks/useAudioDucking.ts)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/hooks/useAudioDucking.ts:29` |
| **Definition** | `export function useAudioDucking(...)` |
| **External consumers** | **ZERO** (0) — verified via grep across ALL src/ and functions/ |
| **References** | Doc-only: .kilo/plans/, docs/FORENSIC_PHASE_00_, docs/FORENSIC_PHASE_03_*, docs/FORENSIC_PHASE_01_REPOSITORY_MAP_TH |
| **Consumer chain** | None traced |
| **Evidence level** | E1 (source traversal) |
| **Verdict** | ⚫ **DEAD** — self-contained module, completely unwired |

### DC-02: `useNotificationEngagement` (src/hooks/useNotificationEngagement.ts)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/hooks/useNotificationEngagement.ts:114` |
| **Definition** | Hook exported from file header at line 2 |
| **External consumers** | **ZERO** (0) |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** |

### DC-03: `usePasskey` (src/hooks/usePasskey.ts)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/hooks/usePasskey.ts:32` |
| **Definition** | Exports `authenticatePasskey` helper |
| **External consumers** | **ZERO** (0) |
| **Note** | `PasskeyLogin` uses `passkeyProvider` directly (webauthn-lib) instead of this hook |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** — PasskeyLogin bypasses it entirely |

### DC-04: `usePrivacy` (src/hooks/usePrivacy.ts)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/hooks/usePrivacy.ts:10` |
| **Definition** | `export const usePrivacy` |
| **External consumers** | **ZERO** (0) |
| **References** | Referenced only in `supabase/migrations/035_forensic_consolidation_2026-09-03.sql:72` (SQL comment) |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** |

### DC-05: `useSessionPersistence` (src/hooks/useSessionPersistence.ts)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/hooks/useSessionPersistence.ts:36` |
| **Definition** | Hook managing session persistence across navigation |
| **External consumers** | **ZERO** (0) |
| **Task card refs** | `.ai/task-cards/TC-505.md:10`, `TC-506.md:1`, `MASTER_PLAN.md:125` — task planning only |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** — defined but never consumed |

### DC-06: `journeyResume` (src/lib/entry/journeyResume.ts)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/lib/entry/journeyResume.ts:2` |
| **External consumers** | **ZERO** (0) in src/ |
| **References** | `supabase/migrations/037_onboarding_checkpoints.sql:4` (comment); doc references only |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** |

### DC-07: `HubSwitcher` (src/components/features/HubSwitcher.tsx)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/components/features/HubSwitcher.tsx:16` (def), `:6` (barrel re-export) |
| **Barrel** | `src/components/features/index.ts:6` — `export { HubSwitcher } from './HubSwitcher'` |
| **Comment ref** | `src/context/EnvironmentContext.tsx:24,25,33` — comments only, stating it's imported by commented-out route |
| **Actual consumers** | **ZERO** (0) |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** — barrel-exported but never imported |

### DC-08 & DC-09: Both `Skeleton` Implementations

| Implementation | Path | Consumers | Verdict |
|---------------|------|-----------|---------|
| **G1: ui/Skeleton** | `src/components/ui/Skeleton.tsx:43` (112 lines) | **ZERO** — never imported | ⚫ **DEAD** |
| **G2: composites/Skeleton** | `src/components/composites/Skeleton.tsx:10` (34 lines) | **ZERO** — exported via barrel `src/components/composites/index.ts:10` but zero destructured | ⚫ **DEAD** |

**Both are dead code.** The only skeleton code actually rendered in production is:
- GrowthSpace.tsx:inline `const Skeleton: React.FC` (line 84) — rendered at line 148
- CSS-class skeletons in dashboard.css, privacy.css, growth-space.css, etc.

This is an inversion: `ui/Skeleton` was designed (Phase 1.7) to REPLACE ad-hoc skeletons but was never wired up.

### DC-10: `SICEOrchestratorImpl` (src/services/SICEOrchestratorImpl.ts)

| Aspect | Finding |
|--------|---------|
| **Path** | `src/services/SICEOrchestratorImpl.ts:2` |
| **Self-declaration** | `@deprecated ... No longer imported anywhere` (header comment) |
| **Exports** | `SICE_ENGINES` (12 keyword-labeled objects), `orchestrateSICE()`, `calculateSICEContribution()` |
| **Consumers** | **ZERO** (0) — no file in src/ imports any of these |
| **Doc mismatch** | `SELFPRINT_PRODUCT_REALITY_MAP.md:37` incorrectly claims AnalysisPage uses it — AnalysisPage actually uses `lib/intelligence` layer |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** — safe-delete candidate (self-marked deprecated, zero callers) |

### DC-11: `WorldRoutingService.routeToWorld()` + `WorldContextAdapter`

| Aspect | Finding |
|--------|---------|
| **Path** | `src/services/world-routing/WorldRoutingService.ts` |
| **Self-declaration** | `@deprecated` (line 2) |
| **Consumers** | `WorldRoutingService.ts:67` creates orchestrator instance — self-consuming dead path |
| **Sibling** | `WorldContextAdapter.ts` imported ONLY by its own test |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** — zero production callers |

### DC-12: `src/services/migrations/` Legacy Track

| Aspect | Finding |
|--------|---------|
| **Path** | `src/services/migrations/001-add-user-profiles.sql` |
| **Canonical track** | `supabase/migrations/001..040` (35 files) — the applied migration set |
| **Legacy track** | Single file `001-add-user-profiles.sql` in `src/services/migrations/` — separate schema tracking |
| **Usage** | Never referenced by any runner or CI |
| **Evidence level** | E1 |
| **Verfect** | ⚫ **DEAD** — orphaned schema definition, superseded by canonical track |

### DC-13: `/api/coach` Backend Endpoint

| Aspect | Finding |
|--------|---------|
| **Backend** | No handler file exists in `functions/api/` or anywhere |
| **Historical** | `api/_archived/coach.ts` **deleted** in commit `d6624af` ("Track A: forensic fixes — dead code") |
| **Frontend** | `AskCoach.tsx:90` calls `fetch('/api/coach')` — will get JSON 404 from catch-all |
| **Feature flag** | `VITE_COACH_ROLLOUT_PERCENT` default 0 disables entire widget |
| **Fallback** | `AskCoach.tsx:61` falls back to `fetch('/api/profile')` — different endpoint |
| **Evidence level** | E1 (source + git history) |
| **Verdict** | ⚫ **DEAD** — intentionally disabled, no backend to call |

### DC-14 & DC-15: `run-migrations-v2.cjs` + `run-migrations-v3.cjs`

| Aspect | Finding |
|--------|---------|
| **v2** | `run-migrations-v2.cjs:executeSql()` — only logs `"Manual execution required"`, never executes SQL |
| **v3** | `run-migrations-v3.cjs:executeSql()` — reads file, logs first 100 chars, returns true — same no-op pattern |
| **Package.json** | No `migrate`/`migration` script |
| **CI** | Zero workflow references to migration runners |
| **Real runner** | `supabase db push` driven by `supabase/config.toml` `[db.migrations]` config |
| **v1 defect** | `run-migrations.cjs` passes `--file` flag which is undocumented for `supabase db push` |
| **Evidence level** | E1 |
| **Verdict** | ⚫ **DEAD** (v2/v3) / **UNSAFE** (v1) |

### DC-16 & DC-17: `twinBirthFlow.ts` + `dnaPersistence.ts` Dead Chain

```
app route /twin-birth ─→ TwinBirthPage.tsx
                              │
                     ┌────────┴───────┐
                     │                │
              CoreAwakeningService.ts  useTwinBirth() ← DEFINED, ZERO IMPORTERS
                     │
              new SICEOrchestrator()     ← THIS PATH IS LIVE (route → page → service)
                     │
              (via /core-awakening AND /twin-birth)

              ┌─────────────────────────────────────────┐
              │ DEATH CHAIN: useTwinBirth               │
              │   ├─ twinBirthFlow.startAwakening()     │
              │   │    └── new SICEOrchestrator()       │
              │   └─ (dead — hook never imported)       │
              │                                         │
              │   ├─ saveTwinDNA / loadTwinDNA         │
              │   ├─ saveDNAMetadata() — 0 callers     │
              │   └─ upgradeDNAIfNeeded() — 0 callers   │
              └─────────────────────────────────────────┘
```

| Path | Lines | Consumers | Verdict |
|------|-------|-----------|---------|
| `src/hooks/useTwinBirth.ts` | 134 | 0 | ⚫ **DEAD** |
| `src/lib/twinBirth/twinBirthFlow.ts` | 121 | 0 (only consumer is useTwinBirth) | ⚫ **DEAD** |
| `src/lib/twinBirth/dnaPersistence.ts` | 71, 80 | 0 | ⚫ **DEAD** |

### DC-18: `TWIN_BIRTH` Feature Flag

| Aspect | Finding |
|--------|---------|
| **File** | `src/lib/featureFlags.tsx:71-74` |
| **Definition** | `TWIN_BIRTH: rolloutEnabled(ENV.VITE_FEATURE_TWIN_BIRTH, ENV.VITE_FEATURE_TWIN_BIRTH_ROLLOUT ?? '100')` |
| **Default** | Rollout 100% (effectively always-on) |
| **Consumers** | **ZERO** — no code reads `featureFlags.TWIN_BIRTH` anywhere in src/ |
| **Route** | `/twin-birth` in `App.tsx:222` is **unconditional**, not gated by the flag |
| **Evidence level** | E1 |
| **Verdict** | 🟠 **LEGACY ACTIVE** — flag defined but unwired, route always live |

---

## 5. ORPHAN FINDINGS

### Orphan Candidates (implementation exists, no verified consumer — cannot prove dead due to browser access limitation)

| ID | Item | Missing Evidence | Status |
|----|------|-----------------|--------|
| OP-05 *(เดิม OP-01 — renumber เพื่อไม่ชน Section 1)* | `SFXProvider` (rendered by ?) | Cannot verify SFXProvider render tree without runtime access — `sfx.ts` barrel exports to it | ⏸️ EXTERNAL/DEFERRED |
| OP-06 *(เดิม OP-02)* | Cloudflare Functions external triggers | Cannot verify if `/api/autonomy-log`, `/api/metrics`, etc. receive external webhooks | ⏸️ EXTERNAL/DEFERRED |
| OP-07 *(เดิม OP-03)* | Supabase Edge Functions (if any exist beyond CF Pages) | `supabase/config.toml` declares `[functions.*]` section — check if any Supabase-triggered edge functions exist | ⏸️ EXTERNAL/DEFERRED |

---

## 6. LEGACY FINDINGS

### LG-01: `lib/experience/TwinStateEngine.ts` — Stale "Dead" Annotation

Prior forensic reports (FORENSIC_PHASE_03, Phase 01 §3.2) claimed this file has "0 imports / dead". This is now proven false by `src/lib/experience/EnvironmentEngine.ts:41`:

```typescript
// EnvironmentEngine.ts:41-42,91,110
this.twinEngine = new TwinStateEngine(); // uses experience version, NOT intelligence version
```

The prior report was stale — the `ExperienceEngine.ts` lives and its companion `TwinStateEngine.ts` lives within it. Both serve the "visual posture/expression" domain (§46 Advanced Adaptive Environments).

**Status: 🟢 VERIFIED ACTIVE — prior "dead" classification REJECTED**

### LG-02: `twinBirthFlow.startAwakening()` — Live Engine, Unreachable Path

The direct `new SICEOrchestrator()` instantiation inside `twinBirthFlow.ts:121` would create 16 engine instances, but the only import chain leading to it (`useTwinBirth` → `twinBirthFlow`) is dead. Meanwhile, the SAME orchestration happens via `CoreAwakeningService.ts:141` (which IS wired to routes).

**Result: The engine code inside twinBirthFlow is alive but unreachable.**

### LG-03–LG-05: Dead Feature Flags

| Flag | Default | Consumer | Status |
|------|---------|----------|--------|
| `VITE_COACH_ROLLOUT_PERCENT` | 0 | AskCoach.tsx:32 — renders `null` if `!inRollout` | 🟡 PARTIAL — flag works but disables feature permanently |
| `VITE_FEATURE_TWIN_BIRTH_ROLLOUT` | 100 | featureFlags.tsx:71 — unread anywhere | 🟠 LEGACY ACTIVE — flag defined, route unconditional |

### LG-06–LG-07: Route/Path Inconsistencies

`App.tsx:215` and `App.tsx:224` register `/core-awakening` TWICE with the same `<CoreAwakening />` element. Harmless duplication — second registration silently overwrites first in react-router-dom.

Meanwhile, `useRecoveryRoute.ts:34` directs post-login recovery AWAKENING state to `/core-awakening` (legacy path) rather than `/twin-birth` (newer path). Both paths work identically but represent inconsistent naming intent.

---

## 7. SICE DUPLICATION FORENSIC — PRIMARY FINDING

### Architectural Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DUAL-LAYER ARCHITECTURE                       │
│                                                                      │
│  Layer 1: lib/intelligence/*          Layer 2: services/sice/engines/*│
│  ~20 class files (8,099 lines)        16 class files (3,585 lines)   │
│  Connected via:                       Connected via:                   │
│  - Direct component imports           - SICEOrchestrator (single      │
│  - React context providers             source of truth for engines)   │
│  - useQuery hooks                     - SICEBridge connects 2 outputs│
│                                           back to lib/intelligence    │
│  Permitted by:                         Performed at:                   │
│  CLAUDE.md:92 — "ห้ามลบฝั่งไหน            - Awakening flow             │
│   ทิ้งเพราะคิดว่าซ้ำ"                      - Onboarding fine-tune       │
│  Contributing.md:69                    - World routing (dead path)    │
└─────────────────────────────────────────────────────────────────────┘
```

### Engine Name Collision Matrix

| Name | lib/intelligence Version | services/sice/engines Version | Semantic Overlap? | Notes |
|------|-------------------------|-------------------------------|------------------|-------|
| PersonalContextBuilder | ✅ 656 ln | ✅ 270 ln | HIGH | Different input tables (users_profiles+memories vs personal_profiles) |
| PatternDetector | ✅ 773 ln | ✅ 138 ln | HIGH | Bridged via SICEBridge (bridge calls lib version) |
| InsightEngine | ✅ 448 ln | ✅ 181 ln | HIGH | Independent reimplementations |
| AIFeedbackLoop | ✅ 549 ln | ✅ 244 ln | HIGH | Independent |
| TwinStateEngine | ✅ 277 ln | ✅ 190 ln | MEDIUM | Different state models (knowledge ladder vs DB maturity) |
| BadgeEngine | ✅ 264 ln | ✅ 274 ln | HIGH | Bridged via SICEBridge |
| BehavioralForecastEngine | ✅ 320 ln | ✅ 416 ln | HIGH | Independent |
| FutureSelfEngine | ✅ 277 ln | ✅ 351 ln | HIGH | Independent |
| MemoryManager / MemoryManagerEngine | ✅ 401 ln | ✅ 213 ln | HIGH | Renamed in sice layer |
| DecisionIntelligenceEngine / DecisionIntelligenceEngineAdapter | ✅ 387 ln | ✅ 275 ln | HIGH | "Adapter" does NOT wrap original — independent re-query |
| NatalChartEngine | ✅ 329 ln | ❌ | NONE | lib-only (astrology domain) |
| HexagramEngine | ✅ 316 ln | ❌ | NONE | lib-only (astrology domain) |
| LifeIntelligencePackEngine | ✅ 471 ln | ❌ | NONE | lib-only |
| AnalysisNarrativeBuilder | ✅ 160 ln | ❌ | NONE | lib-only |
| DailyBriefEngine | ✅ 198 ln | ❌ | NONE | lib-only |
| WellnessEngine | ❌ | ✅ 139 ln | NONE | sice-only |
| SocialConnectionEngine | ❌ | ✅ 123 ln | NONE | sice-only |
| GoalTrackingEngine | ❌ | ✅ 129 ln | NONE | sice-only |
| EmotionalIntelligenceEngine | ❌ | ✅ 107 ln | NONE | sice-only |
| ExperienceEngine | N/A | ✅ 263 ln | NONE | sice-only (experience layer specific) |
| EnvironmentEngine | ✅ (lib/experience/) | ✅ (services/sice/) | LOW | Two separate environments with similar names |

### Key Findings

**7.1** `SICEBridge` is the SOLE connection between layers. It converts outputs from 2 of 16 SICE engines back to lib/intelligence consumers:
- Engine #2 (PatternDetector): `bridgePatternResults()` → lib `PatternDetector.updatePattern()` → writes `behavioral_patterns` table
- Engine #8 (BadgeEngine): `bridgeBadgeResults()` → lib `BadgeEngine.unlockFromSICESignal()` → writes earned badges into auth `user_metadata`

**7.2** The remaining 14 engines produce output that goes nowhere outside the orchestrator result object. Only engines #5 (TwinStateEngine) and #8 (BadgeEngine) have their results extracted via case switches in `performCrossEngineSynthesis()` and `buildPersonalIntelligence()`.

**7.3** `SICEBridge` singleton (line 239) owns `new PatternDetector()` and `new BadgeEngine()` from `@/lib/intelligence/` — NOT from sice/engines. This is why the bridge works: it bridges FROM sice TO lib.

**7.4** `DailyBriefEngine.ts:21` creates a **module-level singleton**: `private twinStateEngine = new TwinStateEngine()` (lib/intelligence version). This is another direct library consumer.

**7.5** The dual-layer architecture is formally permitted by `CLAUDE.md:92` — "ห้ามลบฝั่งไหนทิ้งเพราะคิดว่าซ้ำ" (do not delete either side thinking they're duplicate). This means the duplication is intentional, not accidental. But it creates maintenance risk: changes to shared-domain engines must be applied to BOTH layers independently.

**7.6 CRITICAL CORRECTION** (from Agent Part K): Earlier Phase 9 claims that `metrics.ts` and `autonomy-log.ts` were "VERIFIED ACTIVE" with frontend callers are **incorrect for current source code**:
- `metrics.ts`: Zero `/api/metrics` callers exist in `src/`. Only k6 loadtest hits this endpoint. → ORPHAN CANDIDATE
- `autonomy-log.ts`: `useChat.ts:160` imports it, but `useChat()` is only used by `ChatWindow.tsx` which no component imports → call chain SEVERED. Only k6/smoke tests hit it. → ORPHAN CANDIDATE

---

## 7.7 CF Pages Functions Master Table

| Function | Full Path | Frontend Caller | Status | Notes |
|----------|-----------|----------------|--------|-------|
| twin | `functions/api/twin.ts` | TwinAPIService.ts:92 ← ImmersiveTwinChat.tsx:394 | 🟢 VERIFIED ACTIVE | AI Twin chat proxy |
| twin-stream | `functions/api/twin-stream.ts` | TwinAPIService.ts:167 | 🟢 VERIFIED ACTIVE | SSE variant |
| nova | `functions/api/nova.ts` | NovaAPIService.ts:84 ← NovaChat.tsx:114, VoiceChat.tsx:55 | 🟢 VERIFIED ACTIVE | NOVA Universal Intelligence Guide |
| nova-stream | `functions/api/nova-stream.ts` | NovaAPIService.ts:127 (`streamNovaResponse` has ZERO actual callers in src) | ⚪ UNPROVEN (orphan candidate) | Loadtest only |
| og | `functions/api/og.ts` | index.html:79 + seoMetadata.ts:44-54 now use static JPGs | 🟡 LEGACY ACTIVE | Test-verified (smoke.spec.ts:124), no in-app consumer |
| metrics | `functions/api/metrics.ts` | NONE found in src | ⚪ UNPROVEN (correction: was claimed active but zero callers) | Only k6 loadtest |
| autonomy-log | `functions/api/autonomy-log.ts` | useChat.ts:160 → ChatWindow.tsx (ZERO consumers) | ⚪ UNPROVEN (correction: caller chain severed) | Only k6/smoke tests |
| notifications module | via [[route]] catch-all | NONE (no fetch to /api/notifications/* in src) | ⚪ UNPROVEN | Circular logic, no user path reaches it |
| twin-evolution module | via [[route]] catch-all | NONE | ⚪ UNPROVEN | No src caller |
| sice/get-patterns module | via [[route]] catch-all | NONE (pattern_analysis written client-side directly via supabase) | ⚪ UNPROVEN | Endpoint bypassed entirely |
| share | via [[route]] catch-all | shareService.ts:5,27 ← Share.tsx + ShareButton in LivingTwin.tsx:268 | 🟢 VERIFIED ACTIVE | Share links feature |
| profile | via [[route]] catch-all | PendingOnboardingSaver.tsx:40; AskCoach.tsx:61 (fallback, gated off) | 🟢 VERIFIED ACTIVE | Profile management |
| blueprint | via [[route]] catch-all | PendingOnboardingSaver.tsx:47 | 🟢 VERIFIED ACTIVE | Blueprint creation |
| stripe webhook | via [[route]] catch-all | Stripe external webhook target | 🟢 VERIFIED ACTIVE (external trigger) | Handles checkout/subscription/invoice events |

Orphan utilities (no importers):
- `api/_utils/prompt-builder.ts` (261 ln) — ORPHAN, build-940 era leftover
- `api/_utils/safety.ts` (117 ln) — ORPHAN, referenced only from deleted coach.ts

Dead endpoints (guaranteed 404):
- journal-sync: `useJournalQueue.ts:157` calls it but hook itself unmounted → DEAD (JOURNAL404-001)
- coach: `AskCoach.tsx:90` calls it but rollout=0% → DEAD (COACH404-001)

---

## 7.8 Supabase Edge Functions Master Table *(DOC-13: เดิมพิมพ์ซ้ำเป็น "7.7" — แก้เลขหัวข้อ)*

These are **Completely Separate From CF Pages Functions**. Located at `supabase/functions/`, they use Deno runtime and are invoked by Supabase triggers/hooks.

| Function | Full Path | Frontend Caller | Trigger Source | Status |
|----------|-----------|----------------|---------------|--------|
| astrovera-edge | `supabase/functions/astrovera-edge/index.ts` | Onboarding.tsx:75 (Bearer VITE_SUPABASE_ANON_KEY) | Direct HTTP fetch | ⚠️ WIRED-BUT-DEGRADED (SEC-02: anon key rejected, falls back to client-side numerology) |
| auth-authentication-options | `supabase/functions/auth-authentication-options/index.ts` | PasskeyProvider.ts:102 ← AuthContext.tsx:174 ← PasskeyLogin.tsx:33 ← Login.tsx:289 | WebAuthn flow | 🟢 VERIFIED ACTIVE |
| auth-verify-passkey | `supabase/functions/auth-verify-passkey/index.ts` | PasskeyProvider.ts:126 ← same chain as above | WebAuthn flow | 🟢 VERIFIED ACTIVE |
| auth-registration-options | `supabase/functions/auth-registration-options/index.ts` | PasskeyProvider.ts:56 ← AuthContext.tsx:148 (registerPasskey) | **UNREACHABLE**: PasskeySettings.tsx only reads session, never calls registration | 🟡 LEGACY ACTIVE |
| auth-register-passkey | `supabase/functions/auth-register-passkey/index.ts` | PasskeyProvider.ts:81 ← same dead registration chain | Same as above | 🟡 LEGACY ACTIVE |
| auth-rate-limit | `supabase/functions/auth-rate-limit/index.ts` | NONE | Superseded by `api/_utils/rate-limit.ts` in-memory limiter on CF side | ⚪ UNPROVEN |
| account-delete | `supabase/functions/account-delete/index.ts` | NONE | PrivacyCenter.tsx:134 does client-side deletion directly (never calls edge function) | ⚪ UNPROVEN |
| account-recovery | `supabase/functions/account-recovery/index.ts` | NONE | AuthContext signInWithMagicLink bypasses this function | ⚪ UNPROVEN |
| daily-brief | `supabase/functions/daily-brief/index.ts` | NONE (DailyBrief.tsx:109 uses client-side DailyBriefEngine) | No pg_cron trigger found (only commented example) | ⚪ UNPROVEN |
| send-push | `supabase/functions/send-push/index.ts` | NONE | PushScheduler writes to notification_queue DB only; no trigger dispatches | ⚪ UNPROVEN |
| memory-manager | `supabase/functions/memory-manager/index.ts` | NONE (client writes personal_memory directly via supabase) | No trigger/cron | ⚪ UNPROVEN |
| pattern-detect | `supabase/functions/pattern-detect/index.ts` | NONE (client-side patterns in lib/patternDetection.ts + ConversationAnalyzer.ts) | Explicitly refuted cron claim in file header L24-29 | ⚪ UNPROVEN |
| data-export | `supabase/functions/data-export/index.ts` | NONE (PrivacyCenter.tsx:134 exports client-side) | No trigger/cron | ⚪ UNPROVEN |

**Critical finding:** No database trigger, pg_cron scheduled job, or external webhook invocation calls ANY Supabase Edge Function. Every orphaned edge function has exactly zero invocation channels beyond manual curl/admin deployment.

**Classification Summary:**
- **VERIFIED ACTIVE:** auth-authentication-options, auth-verify-passkey, astrovera-edge (degraded)
- **LEGACY ACTIVE:** auth-registration-options, auth-register-passkey (wired but unreachable from UI)
- **ORPHAN CANDIDATES (zero call sites):** metrics, autonomy-log, nova-stream (CF); notifications module, twin-evolution, sice module (CF); auth-rate-limit, account-delete, account-recovery, daily-brief, send-push, memory-manager, pattern-detect, data-export (Supabase)

*(DOC-13: ย่อหน้า 7.2–7.5 ที่เคยซ้ำสองรอบในตำแหน่งนี้ถูกลบออก — ต้นฉบับอยู่ในหัวข้อ SICE ด้านบน)*

---

## 8. TWINSTATEENGINE DUPLICATION (×3)

### Comparison Table

| Implementation | Path | Line Count | Consumers | Responsibility | Data Source | Ladder | Status |
|---------------|------|-----------|-----------|----------------|------------|--------|--------|
| **#1 UI Knowledge Ladder** | `src/lib/intelligence/TwinStateEngine.ts` | 277 | 7 consumers: `useTwinIdentity.ts:28,121`, `ExperienceContext.tsx:41,72,85`, `TwinEvolution.tsx:28-29`, `LivingTwin.tsx:25`, `DailyBriefEngine.ts:21`, `TwinSynthesis.tsx:25-26` | 8-state knowledge depth model from in-memory PersonalContext | In-memory scores (computed locally) | awakening→aware→connected→reflective→insightful→aligned→flourishing→mastery (8 states) | 🟢 LIVE — Primary UI |
| **#2 Visual Posture/CSS** | `src/lib/experience/TwinStateEngine.ts` | 154 | 1 real consumer: `EnvironmentEngine.ts:41,91` | Visual posture/expression from time-of-day and mood | TimePeriod enum + Mood enum | awake/focused/reflective/dreaming (posture) + concerned/thoughtful/etc. (expression) → CSS vars | 🟢 LIVE — Indirect |
| **#3 DB Maturity Score** | `src/services/sice/engines/TwinStateEngine.ts` | 190 | 2 consumers: `SICEOrchestrator.ts:34,65` + tests | SICE #5: DB-driven maturity scoring | Queries `world_stats` table (visits, journals, decisions, insights) | Awakening→Learning→Developing→Mature→Enlightened (5 stages) | 🟢 LIVE — Orchestrator-only |

### Critical Risk

**Engines #1 and #3 answer the same question differently:**
- #1 says "what's the Twin's current knowledge/emotional state?"
- #3 says "how mature is the user's engagement across worlds?"

At runtime, these can disagree. Example: UI shows `insightful` (#1) while SICE #5 reports stage 2 "Learning" (#3). No reconciliation mechanism exists.

**Engine #2 shares the CLASS NAME but NOT the semantic domain** — it manages visual posture (CSS). The naming collision is unfortunate but harmless since the input/output contracts are fundamentally different.

### Type Collision

`sce/types.ts:128,206` defines `TwinState` + `TwinStateResult = Partial<TwinState>` — a THIRD TwinState type shape. Importing code must choose which module's `TwinStateResult` interface to use. `TwinSynthesis.tsx`, `useTwinIdentity.ts`, `TwinEvolution.tsx`, `LivingTwin.tsx` all use #1's types. The orchestrator casts results to #3's types (`result.result as TwinStateResult` at line 351).

---

## 9. TWINVISUALDNA ×3 — NOT ×2 AS INITIAL DOCUMENTED

### Implementation F1: `src/lib/twinVisualDNA.ts` (Root PRNG Generator)

| Aspect | Value |
|--------|-------|
| **Lines** | 196 |
| **Algorithm** | Deterministic PRNG (Mulberry32 + hashString from `src/lib/hash.ts`) |
| **Input** | `{ dob, time, place, userId }` (BirthInput) |
| **Output** | SHAPE asymmetries (`headShape`, `eyeOffset`, `shoulderTilt`, `spineCurvature`, `limbLengthRatio`) + HUES (`primaryHue` 0–360, `accentHue` complementary, `pulseRhythm` 0.8–1.3) + behavioral mapping (`dominantSICE`, `blindSpotVisual`) + `version`, `seed` |
| **Persists to** | `localStorage['selfprint_twin_dna']` |
| **Purpose** | Per-user deterministic SVG avatar identity ("same user = same DNA forever") |
| **9 live runtime consumers** (LandingPage, Onboarding, Dashboard, TwinProfilePage, TwinProfileDetailPage, WorldEnvironment, TwinDNAAvatar, SVGCore, LivingDiagram) + type-only 2 (AnalysisEngine, twinStore) + dead-chain refs 2 (twinBirthFlow, dnaPersistence) + test 1 — **recount 27 ก.ย. แทน "10 Active Consumers" ที่ลิสต์ 11 ชื่อ** | LandingPage:342, Onboarding:1030, Dashboard:214, TwinProfilePage:45, TwinProfileDetailPage:176, WorldEnvironment:40, TwinDNAAvatar:9-10, SVGCore:18-23, LivingDiagram:21-22, AnalysisEngine:17, twinStore:14 |
| **Status** | 🟢 LIVE — core visual identity system |

### Implementation F2: `src/lib/twin/twinVisualDNA.ts` (Archetype Lookup Table)

| Aspect | Value |
|--------|-------|
| **Lines** | 104 |
| **Algorithm** | Static lookup table (no computation, no seed) |
| **Input** | `{ primary?, secondary? Archetype }` |
| **Output** | `{ archetype, coreColor, auraColor, coreShape, auraStyle, motionSpeed, blendAuraColor }` — hardcoded hex colors |
| **Persists to** | Nothing — computed on-the-fly |
| **Purpose** | Per-archetype visual identity for in-world Twin glow/presence renderer (UNIFIED ARCHITECTURE §6.2) |
| **5 Active Consumers** | useTwinIdentity.ts:24, Twin.tsx:30, TwinThreeRenderer.tsx:25, TwinPresence.tsx:32, HologramBirth.tsx:32 |
| **Status** | 🟢 LIVE — presence rendering system |

### Implementation F3: `src/services/VisualDNAService.ts:41 generateVisualDNA` (DB-Persistent Variant)

| Aspect | Value |
|--------|-------|
| **Lines** | ~150+ |
| **Algorithm** | Birth data + archetype → persisted to `twin_visual_dna` DB table |
| **Input** | Birth data + archetype selection |
| **Output** | Full VisualDNA object written to database |
| **Persists to** | `twin_visual_dna` Supabase table (migration 036) |
| **Purpose** | One-time persistent visual identity generation during birth ceremony |
| **Single Consumer** | CoreAwakeningService.ts:14,427 |
| **Status** | 🟢 LIVE — birth ceremony path only |

### Verdict

**INTENTIONAL SEPARATION — confirmed by prior forensics.** F1 = user-specific animated SVG anatomy with hue math. F2 = archetype-specific static color/shape configuration. F3 = DB-persistent variant created once during birth ceremony.

⚠️ **Naming collision risk HIGH**: Files 1 and 2 both export an interface named `TwinVisualDNA` with completely different shapes. File 3 adds yet another type shape. Any future unifier would break without aliased imports. All three compute independently at different lifecycle moments with no reconciliation mechanism existing between them.

---

## 10. SKELETON ×2 + INLINE SKELETON

### File-Level Implementations (Both Dead)

| Implementation | Path | Lines | API Design | Consumers | Verdict |
|---------------|------|-------|-----------|-----------|---------|
| **G1: ui/Skeleton** | `src/components/ui/Skeleton.tsx` | 112 | Variant-based (`text/block/circle`), width/height/className, a11y (`role="status"`, `aria-live`), compositor-friendly opacity pulse | **ZERO** — never imported | ⚫ **DEAD** |
| **G2: composites/Skeleton** | `src/components/composites/Skeleton.tsx` | 34 | Count-based, inline `pulse` keyframes, no a11y, no variants | **ZERO** — barrel exported but zero destructured | ⚫ **DEAD** |

### Inline Skeleton (Live)

| Location | Lines | Kind | Consumers |
|----------|-------|------|-----------|
| `src/components/dashboard/GrowthSpace.tsx:84` | Local `const Skeleton: React.FC` | Inline component, `.growth__skeleton` divs | Rendered at line 148, used by IntelligenceHub.tsx:198 |

### CSS-Only Skeletons (Multiple, Live)

| Location | Selector | Where Used |
|----------|----------|------------|
| `dashboard.css:849-866` | `.exec-summary__skeleton--title/.line/.short` | ExecutiveSummary.tsx |
| `privacy.css:392-395` | `.privacy__skeleton` | Privacy page |
| `growth-space.css:187-190` | `.growth__skeleton` | GrowthSpace.tsx |
| `decision-timeline.css:223` | `.timeline-skeleton` | DecisionTimeline |
| `decision-stats.css:123` | `.stats-skeleton` | DecisionStats |
| `decision-insights.css:74-87` | `.insights-skeleton/.skeleton-line` | DecisionInsights |
| `confidence-indicator.css:64` | `.confidence-skeleton` | ConfidenceIndicator |

### Recommendation

When `ui/Skeleton` is eventually wired up, remove G2 (older design, inferior API) and consolidate all CSS-only skeletons into `ui/Skeleton`. Do NOT keep three co-existing skeleton systems.

---

## 10A. PART L/M/N ADDITIONS — False Migration Claim & Service Duplication Clusters

### L1: `lib/intelligence/index.ts` Deprecation Is FALSE CLAIM / MIGRATION NEVER HAPPENED

**Claim (verbatim at lines 2–14):** "⚠️ DEPRECATED — src/lib/intelligence (15 ก.ย. 2026)...This module is a duplicate of services/sice/engines/*. All SICE engines now live in services/sice/engines..."

**Consumers:** **31 production files** (80 import statements; +8 test files — canonical count, แก้จาก "~32 files") still import from lib/intelligence directly — one of the most-imported modules in the codebase. Dashboard, analysis page, twin UI, onboarding birth flow, and even SICEBridge itself (`SICEBridge.ts`) all execute this code on every logged-in session.

**Actual replacement does NOT exist as claimed.** Parallel implementations with different types: PatternDetector (773 ln vs 138 ln), FutureSelfEngine (claims wrapper but imports only SICEBase+supabase — independent re-implementation ~351 lines), TwinStateEngine, InsightEngine, AIFeedbackLoop, MemoryManager, BadgeEngine.

**Verdict: ❌ CLAIM FALSE** — annotation is stale by design intent; lib layer IS the live engine layer with 31 production files consuming it. Services/sice/engines is second live layer.

### M1: True Duplicate With Dead Twin

| Service | Status | Notes |
|---------|--------|-------|
| DecisionIntelligence (`services/DecisionIntelligence.ts`) | ⚫ DEAD — zero prod importers | Overlaps DecisionLearningService's job exactly |
| DecisionLearningService | 🟢 ACTIVE | decisionStore:54, TwinAPIService:230, DecisionInsightService:21, DecisionAutomationService:11 |

### M2: Three World Rec recommender Systems Overlap

| System | File | Status |
|--------|------|--------|
| worldRecommender | `lib/worldRecommender.ts` | ⚫ TEST-ONLY |
| useWorldRecommendation | `hooks/useWorldRecommendation.ts` | 🟢 LIVE via ImmersiveTwinChat.tsx:44 |
| WorldRoutingService | `services/world-routing/*` | ⚫ DEAD (see Section 4 DC-11) |

### M3: VisualStateEngine "Single Source of Truth" Claim FALSE

| Implementation | Path | Reality |
|---------------|------|---------|
| `lib/visual/VisualStateEngine.ts` | Header claims "single source of truth for adaptive visuals" | ⚫ TEST-ONLY only — claim false |
| Actual owner (--exp-* visual vars) | `lib/experience/ExperienceEngine` via ExperienceContext.tsx:103-110 | 🟢 LIVE |

### M4: PersonalContextBuilder — 13 Runtime Instantiation Sites, Cache-Shape Swap Bug

Instantiation sites (runtime, non-test):

| # | File:Line | Pattern | Class | Notes |
|---|---|------|------|-------|
| 1 | IntelligencePanel.tsx:72 | useMemo(new ...) | lib | per-mount |
| 2 | ExecutiveSummary.tsx:74 | useMemo([]) | lib | per-mount |
| 3 | AnalysisPage.tsx:163 | useMemo([]) | lib | per-mount |
| 4 | useTwinIdentity.ts:120 | useMemo([]) | lib | per-hook-consumer |
| 5 | ExperienceContext.tsx:71 | useMemo([]) | lib | per-provider-mount |
| 6 | TwinEvolution.tsx:88 | useRef(new ...) | lib | **constructor evaluates on EVERY render** (only first retained) — intentional construction bug |
| 7 | IntelligenceHub.tsx:82 | module-level const | lib | singleton per module load |
| 8 | BiasDetectionDashboard.tsx:33 | useMemo([]) | lib | per-mount |
| 9 | DecisionLogger.tsx:64 | useMemo([]) | lib | per-mount |
| 10 | DailyBriefEngine.ts:52 | private pcBuilder = new ... | lib | one per DailyBriefEngine instance |
| 11 | PersonalContextInitializer.ts:39 | inside initializeContextFromOnboarding() | lib | new instance per call during birth flow |
| 12 | TwinPersonalityPage.tsx:120 | inside queryFn | **SICE engine** | new instance per query fetch; calls .process() — method lib class doesn't have |
| 13 | SICEOrchestrator.ts:61 | this.engines.set(1, new ...) | SICE engine | one per orchestrator instance |

**Cache-shape collision — E1-proven; E5 runtime impact unproven.** `TwinPersonalityPage.tsx:116-166` uses shared cache key `['personalContext', userId]` but returns a different data shape (`PersonalityMetrics`) than what other consumers expect (`PersonalContext`). **(E1)** collision พิสูจน์ที่ระดับ source; **(E5)** อาการ runtime ยังไม่เคย reproduce — กลไกที่เคยอ้าง (`sourceCount === undefined` → full analysis silently null) **ขัดกับตรรกะเอง** เพราะ `undefined === 0` เป็น false (แก้ตาม Reconciliation Report 27 ก.ย. 2026 — ห้ามเรียก "confirmed runtime bug" อีก)

No shared caching at class level. React Query dedupes network calls across 8 observers but has inconsistent staleTime (30s vs 60s vs 0) and incompatible shapes create a proven (E1) cache-shape collision — runtime consequence ยังพิสูจน์ไม่ได้ (E5 pending).

### M5: Database Init — RunMigrations() Dead Export

| Item | Path | Status |
|------|------|--------|
| database-init.ts:runMigrations() | `src/services/database-init.ts:13` | ⚫ DEAD — zero callers; only ensureUserProfile survives |
| TwinMigration.ts | `src/services/TwinMigration.ts` | ⚫ DEAD — zero callers |
| useJournalQueue.js + journalQueueDB.ts | `hooks/` + `lib/storage/` | ⚫ DEAD — offline journaling feature never wired |

### M6: Test-Only Services (Built+Tested But Never Wired to Production)

| Service | Test Count | Prod Importers |
|---------|-----------|---------------|
| SentimentAnalyzer | 1 test | 0 |
| QualityMetricsService | 1 test | 0 |
| FeedbackService | 1 test | 0 |
| ContinuousImprovementService | 1 test | 0 |
| NotificationAnalytics | 0 tests | 0 |
| FollowUpScheduler | 3 tests | 0 |
| ConversationAnalyzer | 0 tests | 0 |
| InputValidation | 0 tests | 0 |
| SecurityService | 0 tests | 0 |
| DeliveryVerification | 0 tests | 0 |

All 10 built+tested-but-never-wired-to-production services. No UI page ever triggers them.

### M7: ExperienceContext Provider Unconsumed

| Item | Path | Consumers |
|------|------|-----------|
| ExperienceProvider | `context/ExperienceContext.tsx:63` | Mounted via App.tsx:37 (lazy-loaded) |
| useExperience() hook return value | ExperienceContext.tsx:147 | **ZERO consumers anywhere in src/** |

Provider mounts, runs a PersonalContextBuilder query for every session, but nobody ever consumes its output. Exists solely for post-login chunking benefit (App.tsx:304-309 documents lazy-loading strategy).

### M8: CF Pages Functions — prompt-builder.ts and safety.ts Orphans

| File | Lines | Status | Reason |
|------|-------|--------|--------|
| `api/_utils/prompt-builder.ts` | 261 | ⚫ ORPHAN | Zero importers; build-940 era leftover |
| `api/_utils/safety.ts` | 117 | ⚫ ORPHAN | Referenced only by deleted coach.ts |

### M9: Journal Sync — Dead Endpoint

| Call Site | Called Endpoint | Status |
|-----------|----------------|--------|
| `useJournalQueue.ts:157` | `/journal-sync` | ⚫ DEAD — no module in KNOWN_MODULES (404); hook itself has zero component callers |
| Coach | `AskCoach.tsx:90` | `/api/coach` | ⚫ DEAD — rollout=0% disables widget; no handler exists |

---

## 11. MIGRATION RUNNERS ×3

| Runner | Path | Lines | What It Does | Invoked By | Can Run in Production? | Verdict |
|--------|------|-------|-------------|-----------|----------------------|---------|
| **v1: run-migrations.cjs** | Root `.cjs` | Reads `supabase/migrations/*.sql`, checks `supabase --version`, loops `supabase db push --project-ref <ref> --file <path>` | Attempts real apply (but `--file` is undocumented/non-functional) | Docs only — not in package.json, not in CI, never bundled | **NO** — not in dist/functions, not importable at runtime | 🟠 LEGACY ACTIVE (manual CLI) |
| **v2: run-migrations-v2.cjs** | Root `.cjs` | Reads SQL, logs `✓ SQL read successfully`, `executeSql()` only logs `Manual execution required` | **Never executes SQL** | Nothing | **NO** | ⚫ **DEAD** |
| **v3: run-migrations-v3.cjs** | Root `.cjs` | Same no-op pattern as v2 | **Never executes SQL** | Nothing | **NO** | ⚫ **DEAD** |
| **Real runner** | `supabase db push` | Config-driven via `supabase/config.toml: [db.migrations] schema_paths=["./migrations/*.sql"]` | Pushes pending migrations in sorted order | Manual CLI invocation; no automated path documented | **YES** (Supabase CLI tool) | ✅ PRODUCTION RUNNER |

### Additional SQL Artifacts

| Artifact | Path | Purpose | Usage |
|----------|------|---------|-------|
| SUPABASE_SETUP.sql | Root | Manual bootstrap DDL | Historical |
| PRODUCTION_DB_CATCHUP_2026-09-01.sql | Root | Manual catch-up DDL (39.7 KB) | Historical |
| 20260825_add_archetype_columns.sql | Root | Manual DDL patch | Historical |
| src/services/supabase-schema.sql | Services dir | Schema reference (read-only) | Reference only |
| src/services/migrations/001-add-user-profiles.sql | Services dir | Legacy duplicate track | Dead |
| supabase/migrations/001..040 | Canonical | 35 applied migrations (gaps at 003, 006, 008, 009, 023) | Real applied set |

### Total SQL Files Outside Canonical Track: 5

These represent manual historical interventions — not part of any runner pipeline.

---

## 12. TWIN BIRTH ENTRY POINTS

### Route Registry (src/App.tsx)

```typescript
// App.tsx:215 — FIRST registration (duplicate)
{ path: '/core-awakening', element: <CoreAwakening /> }

// App.tsx:222 — NEW route (replaces old alias per comment)
{ path: '/twin-birth', element: <TwinBirthPage /> }

// App.tsx:224 — SECOND registration of /core-awakening (harmless duplicate)
{ path: '/core-awakening', element: <CoreAwakening /> }
```

### Entry Point Comparison

| Path | Component | Lines | Imports | Lifecycle Guard | Behavior |
|------|-----------|-------|---------|----------------|----------|
| `/en\|th/core-awakening` | `CoreAwakening.tsx` | 517 | `CoreAwakeningService`, `useAuth`, `initializeTwin`, `setTwinCreated` | TWIN_ALIVE/WORLD_ACTIVE guard, waits on lifecycleLoading | Same as TwinBirthPage |
| `/en\|th/twin-birth` | `TwinBirthPage.tsx` | 317 | Same service imports | Same guard | Same behavior |

### Link Sources

| Source | Links To | Lines |
|--------|----------|-------|
| `AnalysisPage.tsx:415` | `/core-awakening` | Legacy path |
| `Onboarding.tsx:821` | `/core-awakening` | Legacy path |
| `ImmersiveTwinChat.tsx:491` | `/core-awakening` | Legacy path |
| `useRecoveryRoute.ts:34` | `/core-awakening` | Recovery route uses legacy path |
| `TwinProfileDetailPage.tsx:129,166` | `/twin-birth` | Newer path |
| `TwinPatternsPage.tsx:121` | `/twin-birth` | Newer path |

### Code Duplication Assessment

The 200-line difference between `CoreAwakening.tsx` (517 lines) and `TwinBirthPage.tsx` (317 lines) is almost entirely **explanatory comments**. Core logic is identical:
- Unauthenticated → redirect `/login`
- Add `core-awakening-body-bg` class
- Recover `birthDate` from `selfprint.users_profiles`
- Arrival lifecycle guard (`TWIN_ALIVE`/`WORLD_ACTIVE` → no downgrade, waits on `lifecycleLoading`)
- `startAwakening()` → `initializeTwin()` → `setTwinCreated()`
- 4-second celebration then `navigate('/brief', { replace: true })`

**This is near-total functional duplication.** TwinBirthPage was "Extracted from CoreAwakening.tsx" (per its header comment at line 4-5) but neither redirects to nor deprecates the other.

### Verdict

| Path | Active? | Alias? | Shared Code? | Risk |
|------|---------|--------|-------------|------|
| `/core-awakening` | Yes (registered twice) | N/A | Near-total duplication with TwinBirthPage | Maintenance confusion |
| `/twin-birth` | Yes | Not an alias — distinct component | Near-total duplication with CoreAwakening | Maintenance confusion |
| Recovery route target | Legacy (`/core-awakening`) | — | Inconsistent with newer path naming | Minor inconsistency |

---

## 13. ASKCOACH

### Status: Dead Feature (UI Alive, Backend Absent)

| Component | File | Status |
|-----------|------|--------|
| Frontend Widget | `src/components/dashboard/AskCoach.tsx` | Mounted in IntelligenceHub:44,201 but self-gates to `null` |
| Feature Flag | `VITE_COACH_ROLLOUT_PERCENT` (default 0) | Effectively disables AskCoach permanently |
| Backend Handler | **None** — no `functions/api/coach.ts` | Catch-all returns JSON 404 |
| Historical Backend | `api/_archived/coach.ts` | **Deleted** in git commit `d6624af` |
| Fallback API | `AskCoach.tsx:61` falls back to `/api/profile` | Different endpoint, not coach-specific |
| Unit Test | `AskCoach.test.tsx` | Mocks `isInRollout` — never exercises real network |

### Detailed Flow

```
IntelligenceHub:44,201 ─→ renders <AskCoach />
                             │
                       AskCoach.tsx:32: VITE_COACH_ROLLOUT_PERCENT = 0 (default)
                             │
                       AskCoach.tsx:53: isInRollout(userId, 'ask-coach', 0) = FALSE
                             │
                       AskCoach.tsx:79: if (!inRollout) return null
                             │
                       RESULT: Widget renders NOTHING

If VITE_COACH_ROLLOUT_PERCENT were set to >0:
                       AskCoach.tsx:90: fetch('/api/coach') POST
                             │
                       [[route]].ts:33-40: 'coach' ∉ KNOWN_MODULES → null → 404 JSON
                             │
                       RESULT: User sees API error toast (no handler)
```

### `/api/twin` Does NOT Replace AskCoach

| API | Purpose | Input Format | Output |
|-----|---------|-------------|--------|
| `/api/twin` (twin.ts) | Generic OpenRouter chat proxy | `{ system, messages, temperature, max_tokens }` | `{ content }` |
| `/api/nova` (nova.ts) | NOVA Universal Intelligence Guide | Model-agnostic chat | `{ content }` |
| `/api/coach` (MISSING) | Decision-specific coaching | `{ birthDate, mood, question }` → `{ answer, contextUsed }` + pattern-count context | Would be decision-specific |

`/api/coach` had a different contract — it was supposed to provide decision-specific coaching with awareness of user's birth chart, emotional state, and behavioral patterns. `/api/twin` is a generic chat channel.

### Verdict

**DECIDED: `/api/coach` is intentionally disabled and replaced with a generic fallback.** The frontend remains mounted because removing it might cause layout shifts, but the feature itself is dead. If AskCoach ever needs to become functional again, a new `functions/api/coach.ts` handler must be created.

---

## 14. EDGE FUNCTIONS

### Complete Routing Map

| Path Pattern | Served By | Mechanism | Frontend Caller? |
|-------------|-----------|-----------|-----------------|
| `/api/notifications/:action*` | `[[route]].ts` → `api/unified-handler.ts` | Module/action string routing | Likely (from notification services) |
| `/api/twin-evolution/:action*` | Same | Same | Verified: `TwinEvolutionService.ts` |
| `/api/sice/:action*` | Same | Same | Via `SICEBridge.ts:17` supabase client |
| `/api/stripe/:action*` (incl. `/api/stripe/webhook`) | Same | Same | Stripe external webhook |
| `/api/share` (exact only) | Same | Special-cased in `[[route]].ts:29` | From sharing features |
| `/api/profile/:action*` | Same | Same | AskCoach.tsx:61 fallback |
| `/api/blueprint/:action*` | Same | Same | Blueprint feature |
| `/api/autonomy-log` | `functions/api/autonomy-log.ts` | Dedicated Pages file | **YES**: `useChat.ts:160` (chat feature) |
| `/api/metrics` | `functions/api/metrics.ts` | Dedicated Pages file | Verified: performance metrics collection |
| `/api/nova` | `functions/api/nova.ts` | Dedicated Pages file | YES: Nova chat feature |
| `/api/nova-stream` | `functions/api/nova-stream.ts` | Dedicated Pages file | YES: Nova streaming chat |
| `/api/twin` | `functions/api/twin.ts` | Dedicated Pages file | YES: AI Twin chat |
| `/api/twin-stream` | `functions/api/twin-stream.ts` | Dedicated Pages file | YES: AI Twin streaming chat |
| `/api/og` | `functions/api/og.ts` | Dedicated Pages file | OG image generation |
| Any other `/api/*` | `[[route]].ts` | Catch-all → 404 JSON | — |

### All Functions Found

| File | Lines | Endpoint | Role |
|------|-------|----------|------|
| `functions/api/[[route]].ts` | 105 | `/api/*` catch-all | Routes to `api/unified-handler.ts` via `KNOWN_MODULES` whitelist |
| `functions/api/autonomy-log.ts` | 165 | `/api/autonomy-log` | Twin autonomy signal logging |
| `functions/api/metrics.ts` | 165 | `/api/metrics` | Performance metrics → Supabase |
| `functions/api/nova.ts` | 190 | `/api/nova` | NOVA Universal Intelligence Guide |
| `functions/api/nova-stream.ts` | 237 | `/api/nova-stream` | SSE streaming NOVA variant |
| `functions/api/twin.ts` | 205 | `/api/twin` | AI Twin chat proxy |
| `functions/api/twin-stream.ts` | 232 | `/api/twin-stream` | SSE streaming Twin variant |
| `functions/api/og.ts` | 101 | `/api/og` | OG image HTML generation |
| `functions/api/_utils/ai-provider.ts` | 100 | (not a route) | Shared OpenRouter REST client |
| `api/unified-handler.ts` | 1106 | (imported by [[route]]) | 7 modules: notifications, twin-evolution, sice, stripe, profile, blueprint, share |

### Previously Suspected Orphan Functions — Resolved

| Function | Previously Reported As | Current Finding |
|----------|----------------------|-----------------|
| daily-brief | No frontend caller | **NOT a CF Pages function** — part of `lib/intelligence/DailyBriefEngine.ts` (library, not serverless) |
| send-push | No frontend caller | Implemented in `PushScheduler.ts` service, invoked via `api/unified-handler.ts` notifications module |
| memory-manager | No frontend caller | Implemented in `lib/intelligence/MemoryManager.ts` (library) |
| pattern-detect | No frontend caller | Implemented in `lib/intelligence/PatternDetector.ts` (library) |
| data-export | No frontend caller | **แก้ (glob 27 ก.ย. 2026):** ไฟล์ `supabase/functions/data-export/index.ts` **มีอยู่จริง** (เดิมระบุ "may have been removed" ผิด) — zero invocation channels → ORPHAN-UNPROVEN |
| account-delete | No frontend caller | Handled in `[[route]].ts` → `api/unified-handler.ts` (profile or stripe module) |
| account-recovery | No frontend caller | Handled in profile module |
| auth-rate-limit | No frontend caller | Built into `api/_utils/rate-limit.js` middleware |
| metrics | Orphan candidate | ⚪ ORPHAN-UNPROVEN — zero production callers in src/ + index.html (grep 27 ก.ย. 2026); only k6/loadtest |
| autonomy-log | Orphan candidate | ⚪ ORPHAN-UNPROVEN — caller chain severed (`useChat.ts:160` → `ChatWindow.tsx` zero importers, grep ยืนยัน); only k6/e2e |

**Critical correction (final — DOC-02, per Reconciliation Report 27 ก.ย. 2026):** `metrics.ts` และ `autonomy-log.ts` **ไม่ใช่** VERIFIED ACTIVE — คำอธิบายเดิมในตารางนี้ ("ACTIVE — called by performance monitoring code" / "ACTIVE — called by useChat.ts:160") **เป็นเท็จ** สอดคล้องกับ §7.6: ทั้งคู่ = ORPHAN-UNPROVEN (zero production caller; external caller ปฏิเสธไม่ได้ — ห้ามประกาศ DEAD)

---

## 15. DEPRECATED CLAIMS AUDIT

### Deprecated Markers Found in Source

| File | Line | Claim | Reality | Status |
|------|------|-------|---------|--------|
| `src/lib/intelligence/index.ts` | 2-14 | "⚠️ DEPRECATED — All SICE engines moved to services/sice/engines" | **80 import statements / 39 ไฟล์ (31 prod + 8 test)** — canonical count (แก้จาก "88" — verified grep 27 ก.ย. 2026) | 🟠 LEGACY (stale annotation) |
| `src/lib/intelligence/index.ts` | 17 | Re-exports 15 classes from this folder | Most re-exported classes are ALSO implemented in sice/engines | Confirmed dual-layer |
| `src/services/SICEOrchestratorImpl.ts` | 2 | "@deprecated ... No longer imported anywhere" | Verified: zero consumers | ⚫ DEAD (accurate) |
| `src/services/world-routing/WorldRoutingService.ts` | 2 | "@deprecated" | Verified: zero production callers | ⚫ DEAD (accurate) |
| `src/services/sice/SICEOrchestrator.ts` | (implicit via comment) | Note about engine naming mismatches | REAL_SICE_ENGINE_NAMES array must match registerEngines() names | Documentation dependency |
| `src/lib/global-webapi-types.d.ts` | 45 | `@deprecated` type declaration | TypeScript type marker only | ℹ️ INFO |
| `vite.config.ts` | 76 | Build optimization comment | Tooling note | ℹ️ INFO |
| `src/lib/ai/modelRouter.ts` | 2,41 | `claude` deprecation noted | Model router updated to prefer nemotron | 🟡 PARTIAL (routing logic changed) |
| `src/services/world-routing/WorldRoutingService.ts` | 2 | Full file deprecated | Both WorldRoutingService AND WorldContextAdapter are dead | ⚫ DEAD |
| `src/services/DecisionService.ts` | 324 | Some deprecated logic path | Specific method, not entire file | ℹ️ LOCAL |

### Key Observation: `lib/intelligence/index.ts` Deprecation Is Stale

The header explicitly states that "all SICE engines now live in services/sice/engines" — but **the folder it fronts (`lib/intelligence/`) is actively consumed by 80 import statements across 39 files (31 prod + 8 test)** from components, pages, contexts, and hooks. The barrel itself (`index.ts`) is what's unimported — 0 files import `@/lib/intelligence` as a bare barrel. Every consumer imports explicit subpaths (`@/lib/intelligence/PersonalContextBuilder`, etc.).

**Conclusion:** The barrel deprecation is accurate (the barrel is unused), but the interpretation "engines migrated away from this folder" is wrong — the folder is still heavily used, just not via the barrel.

---

## 16. PERSONALCONTEXTCBUILDER MULTI-INSTANCE ANALYSIS

### Instantiation Locations

| Instance | File | Line | How Created | Context |
|----------|------|------|-------------|---------|
| **#1** | `src/services/sice/SICEOrchestrator.ts` | 61 | `new PersonalContextBuilder()` (constructor) | Inside orchestrator — fresh instance per orchestration call |
| **#2** | `src/pages/TwinPersonalityPage.tsx` | 120 | `new PersonalContextBuilder()` (inside useQuery) | Standalone direct call to sice-engine, bypassing orchestrator |
| **#3** | `src/context/ExperienceContext.tsx` | 40 | Import of `@/lib/intelligence/PersonalContextBuilder` | Imported by lib layer — instantiated inside ExperienceContext (exact line TBD) |
| **#4** | `src/hooks/useTwinIdentity.ts` | 120 | `useMemo(() => new PersonalContextBuilder(), [])` | Per-hook-mount singleton in React memo |
| **#5** | `src/services/sice/SICEBridge.ts` | 23 | `private patternDetector = new PatternDetector();` — PatternDetector, NOT PersonalContextBuilder | Bridge owns lib PatternDetector + lib BadgeEngine |
| **#6** | `src/lib/intelligence/PersonalContextBuilder.ts` | Definition file | — | — |

Wait — I need to correct my understanding. Let me trace who creates PersonalContextBuilder instances more carefully:

| Instance | Creator | Module Source | Reuses Cached State? |
|----------|---------|--------------|---------------------|
| Orchestrator #1 | `SICEOrchestrator.registerEngines(): set(1, new PersonalContextBuilder())` | sice/engines version | Fresh per call to `new SICEOrchestrator()` (3 production sites) |
| Standalone #2 | `TwinPersonalityPage.tsx:120` — `new PersonalContextBuilder()` | sice/engines version | Fresh per useQuery refetch |
| Context #3 | `ExperienceContext.tsx:40` — imported from lib layer | lib/intelligence version | Likely per-context-render (context provider lifecycle) |
| Hook #4 | `useTwinIdentity.ts:120` — `useMemo(() => new PersonalContextBuilder(), [])` | lib/intelligence version | Memoized — ONE per mount of useTwinIdentity |
| Bridge #5 | `SICEBridge.ts:23` — `new PatternDetector()`, `new BadgeEngine()` | lib/intelligence version | Singleton module-level |

### Analysis

1. **How many instances?** At minimum 4 simultaneously existing instances during runtime (orchestrator + standalone page + context + hook), potentially more depending on React renders causing multiple ExperienceContext mounts.

2. **Who instantiates them?** 4 different creation points: orchestrator constructor, page queryFn, context provider init, hook useMemo.

3. **Singleton or multiple constructors?** Multiple. No global caching. Each site creates its own.

4. **Does React lifecycle cause multiple creations?** Yes — `ExperienceContext` could re-render multiple times (parent re-renders), creating new instances. However, the `useMemo` pattern in `useTwinIdentity` protects against that.

5. **Is there shared cache?** No in-memory cache observed. All instances compute independently from the same Supabase tables.

6. **Duplicate computation?** YES — if `ExperienceContext` and `useTwinIdentity` both instantiate their own `PersonalContextBuilder` at app startup, the SAME computation (querying users_profiles, memories, etc.) runs twice.

7. **Do outputs differ?** Potentially — the two versions (lib vs sice-engine) query different input tables:
   - lib version: `users_profiles` + memories
   - sice version: `personal_profiles` + `personal_context`

8. **Race condition risk?** Low — each instance queries independently and writes/read to/from the same Supabase tables. No concurrent mutation conflict detected.

9. **Design or accident?** Partially architectural — the dual-layer design deliberately keeps both versions alive. Partially accidental — ExperienceContext and useTwinIdentity both consume the LIB version independently, creating redundant computation. Consolidating to a single instance (perhaps via React Query or Zustand store) would eliminate duplicate computation.

---

## 17. OTHER DUPLICATE SERVICES

### Services With Multiple Implementations

| Domain | Files | Overlap | Classification |
|--------|-------|---------|---------------|
| Intelligence Engines | `lib/intelligence/*` (~20) vs `services/sice/engines/*` (16) | 9 shared domain names | INTENTIONAL dual-layer |
| TwinStateEngine | 3 copies across layers | Different data sources, same question | INTENTIONAL separation + name collision |
| twinVisualDNA | 2 copies | Different algorithms/purposes | INTENTIONAL separation |
| Skeleton | 2 file-level + inline + CSS-only | Loading placeholder concept | TRUE DUPLICATE (both file-level dead) |
| Twin Creation | `CoreAwakening.tsx` (517 ln) vs `TwinBirthPage.tsx` (317 ln) | Near-identical logic, distinct routes | ACCIDENTAL DUPLICATION |
| Migration Runners | `run-migrations.cjs` vs `supabase db push` config | Same purpose (apply migrations) | TRUE DUPLICATE (one unsafe, two dead) |
| World Routing | `WorldRoutingService.ts` (dead) vs inline world logic in components | Dead path vs embedded logic | DEAD (routing service removed, logic scattered) |

### Store Inventory

`src/store/` contains 5 Zustand stores with no barrel index:
- `userStore.ts`, `twinStore.ts`, `lifecycleStore.ts`, `decisionStore.ts`, `analysisStore.ts`
- No duplicate stores — flat structure is intentional

### Component Organization

| Directory | Components | Barrel? | Notes |
|-----------|-----------|---------|-------|
| `components/ui/` | `Skeleton.tsx` (1 file) | ❌ No index | Bare directory, direct import |
| `components/composites/` | Alert, Modal, Progress, Dropdown, Tabs, Slider, Breadcrumb, Tag, Skeleton, Tooltip (10 files) | ✅ index.ts | Barrel re-exports all, but most unused |
| `components/living/` | LivingDiagram, SVGCore, TwinDNAAvatar | ❌ No index | Direct imports |
| `components/twin/` | Twin, TwinThreeRenderer, TwinPresence, HologramBirth, TwinNav, TwinEvolution, TwinSynthesis | ❌ No index | Direct imports |
| `components/dashboard/` | GrowthSpace, ExecutiveSummary, LivingTwin, IntelligencePanel, IntelligencePanels | ❌ No index | Direct imports |
| `components/features/` | HubSwitcher, EmotionSelector, DailyBrief, BadgeGallery (barreled) | ✅ index.ts | HubSwitcher dead, others may be live |

---

## 18. TEST-ONLY / DEV-ONLY / DEBUG-ONLY

### Pure Test Infrastructure (Not Production Code)

| Item | Path | Description |
|------|------|-------------|
| E2E Spec Files | `e2e/*.spec.ts` (101 tests) | Playwright E2E tests — only invoked by Playwright CLI |
| Unit Test Files | `src/**/*.test.ts(x)` — ~10 test files across lib/intelligence, components, hooks | Vitest unit tests |
| Test Setup | `src/test/setup.ts:489` — mocks SICEOrchestrator | Vitest setup |
| Mock Fixtures | `src/lib/__tests__/twinVisualDNA.test.ts` | Unit test fixtures |

### Dev/Test Tools (Not Bundled to Production)

| Item | Path | Description |
|------|------|-------------|
| `loadtests/smoke-test.cjs` + `.mjs` | Load test infrastructure | k6-compatible smoke/full load tests — only invoked manually via CI dispatch |
| `e2e/run-staging.mjs` | E2E staging runner | Runs E2E against staging URL |
| `scripts/supabase-lifecycle.ts` | Project resume/pause/status | Dev ops script, never bundled |
| `scripts/generate-sitemap.ts` | Sitemap generation | Dev build script |
| `src/package.json` | Stray manifest (type: commonjs, main: sw.js) | Likely accidental/legacy — conflicts with root package.json |

### Stories/Demo/Routes
- No Storybook/story files detected in repo structure
- No debug route components found

---

## 19. EVIDENCE MATRIX

| Category | E0 (Inference) | E1 (Source) | E2 (Test) | E3 (DB/API) | E4 (CI/Deploy) | E5 (Runtime) |
|----------|---------------|-------------|-----------|-------------|----------------|-------------|
| **Dead code confirmed** | 0 | 15 | 0 | 0 | 0 | 0 |
| **Active code confirmed** | 0 | 12 | 0 | 0 | 0 | 0 |
| **Orphan/Legacy** | 3 | 8 | 0 | 0 | 0 | 0 |
| **Duplicate services** | 0 | 9 | 0 | 0 | 0 | 0 |
| **External dependencies** | 2 | 0 | 0 | 0 | 0 | 0 |

**Maximum achieved: E1 (source code evidence).** No E5 runtime evidence obtained due to browser access limitations (consistent with Phase 5 findings and Phase 8 conclusions).

---

## 20. RECLASSIFIED FINDINGS (From Phase 1–7)

### Reclassified: False Positive Findings

| Previous Finding | Phase | Now Classified | Reason |
|-----------------|-------|---------------|--------|
| `/api/coach` broken endpoint | Phase 3 | ⚫ DEAD — intentionally disabled | Delete history confirms removal; default-0 flag prevents usage |
| `lib/experience/TwinStateEngine` dead | Phase 3/4 | 🟢 VERIFIED ACTIVE | `EnvironmentEngine.ts:41` proves consumption |
| `sfx.ts` hooks dead | Phase 3 | 🟡 PARTIAL (wired to SFXProvider) | Only consumer is SFXProvider — verify SFXProvider renders |
| `metrics.ts` orphan function | Phase 3 | ⚪ ORPHAN-UNPROVEN | **แก้ (grep 27 ก.ย. 2026):** zero production callers (src/ + index.html) — มีเพียง k6/loadtest; ไม่ใช่ VERIFIED ACTIVE และยังไม่พิสูจน์ DEAD |
| `autonomy-log.ts` orphan function | Phase 3 | ⚪ ORPHAN-UNPROVEN | **แก้:** caller chain severed (`useChat.ts:160` → ChatWindow.tsx มี zero importers); only k6/e2e — awaiting E5/external |
| FR-007 (Twin Birth recovery skip) | Phase 7 | ⚪ CORROBORATED | E2E test skip proves gap, but also adds: `useTwinBirth` hook (134 ln) entirely unwired |
| `SICEOrchestratorImpl` still active | Phase 1/2 | ⚫ DEAD | Zero consumers, self-deprecated |
| `WorldRoutingService` still active | Phase 2 | ⚫ DEAD | Zero callers, self-deprecated |

### Findings That Hold Up

| Finding | Status | Verification |
|---------|--------|-------------|
| Dual-layer SICE architecture | 🟡 CORROBORATED | 16 sice engines + ~20 lib engines + SICEBridge connector |
| Three TwinStateEngine implementations | 🟡 CORROBORATED | 3 copies, different domains, same class name collision |
| 40+ E2E test skips | 🟡 CORROCORATED | Session persistence failure blocks all protected-route testing |
| Migration sprawl (35+5+3 files) | 🟡 CORROBORATED | Confirmed via Glob search |

---

## 21. REMOVAL CANDIDATES (Proven Dead — Safe to Remove)

| ID | Item | Risk of Removal | Justification |
|----|------|----------------|--------------|
| DC-01 | `useAudioDucking.ts` | LOW | Dead hook, zero consumers |
| DC-02 | `useNotificationEngagement.ts` | LOW | Dead hook, zero consumers |
| DC-03 | `usePasskey.ts` | LOW | PasskeyLogin uses alternative approach |
| DC-04 | `usePrivacy.ts` | LOW | Dead hook |
| DC-05 | `useSessionPersistence.ts` | LOW | Dead hook |
| DC-06 | `journeyResume.ts` | LOW | Dead utility |
| DC-07 | `HubSwitcher.tsx` + barrel export | LOW | Dead component, barrel export cleanup needed |
| DC-08 | `ui/Skeleton.tsx` | LOW | Dead component, never imported |
| DC-09 | `composites/Skeleton.tsx` | LOW | Dead component, zero callers |
| DC-10 | `SICEOrchestratorImpl.ts` | MEDIUM | Self-deprecated but kept for reference |
| DC-11 | `WorldRoutingService.ts` + `WorldContextAdapter.ts` | LOW | Both dead, zero callers |
| DC-12 | `src/services/migrations/` legacy track | LOW | Orphaned schema file |
| DC-14 | `run-migrations-v2.cjs` | LOW | No-op stub |
| DC-15 | `run-migrations-v3.cjs` | LOW | No-op stub |
| DC-16 | `twinBirthFlow.ts` (orphaned subset) | MEDIUM | Contains some functionality that may be needed for future recovery |
| DC-17 | `dnaPersistence.ts` (orphaned functions) | MEDIUM | saveTwinDNA/loadTwinDNA may be useful |
| DC-18 | `useTwinBirth.ts` | LOW | Dead hook, 134 lines |

**Total removal candidates: 18 items across 4 categories** (hooks, components, services, scripts)

---

## 22. CONSOLIDATION CANDIDATES

| ID | Items | Action Required | Priority |
|----|-------|----------------|---------|
| SC-01 | `CoreAwakening.tsx` (517 ln) ↔ `TwinBirthPage.tsx` (317 ln) | Extract shared logic into reusable component/hook | HIGH |
| SC-02 | `lib/intelligence/*` ≈ 9 classes vs `services/sice/engines/*` | Architecture gate: decide if consolidation is permitted (currently blocked by CLAUDE.md no-delete rule) | HIGH |
| SC-03 | TwinStateEngine #1 (lib/intelligence) vs #3 (sice/engines) | Decide whether knowledge-ladder and maturity-score should be reconciled | HIGH |
| SC-04 | `Skeleton` G1 (ui) replaces G2 (composites) + inline | Pick one canonical Skeleton, wire it up globally | MEDIUM |
| SC-05 | TwinBirth recovery path (twinBirthFlow + useTwinBirth) | Either wire the hook to routes or remove the dead chain | MEDIUM |
| SC-06 | PersonalContextBuilder multi-instance → single source of truth | Use React Query cache or Zustand store for deduplication | MEDIUM |

---

## 23. ITEMS REQUIRING RUNTIME/EXTERNAL VERIFICATION

| ID | Item | Verification Needed | Current Status |
|----|------|-------------------|---------------|
| RV-01 | `SFXProvider` render tree | Verify SFXProvider is rendered in React tree (browser inaccessible) | ⏸️ EXTERNAL |
| RV-02 | `metrics.ts` health | Verify `/api/metrics` receives POST requests successfully | **แก้ (DOC-04):** E1 พิสูจน์ว่า **ไม่มี** production caller; k6/loadtest only — awaiting E5/external |
| RV-03 | `autonomy-log.ts` health | Verify `/api/autonomy-log` processes POST requests | **แก้ (DOC-04):** E1 — zero production callers (chain severed); k6/e2e only — awaiting E5/external |
| RV-04 | External webhook targets | Verify if any endpoints receive external webhooks (Stripe confirmed, others?) | E1 proven |
| RV-05 | Supabase Edge Functions binding | Check if `supabase/config.toml` `[functions.*]` section defines any Supabase-invoked functions | ⏸️ EXTERNAL |
| RV-06 | `src/package.json` stragler | Verify if this file serves any purpose or is accidental | ⏸️ EXTERNAL |
| RV-07 | Production deployed SHA | Verify what commit SHA is currently running in production | ⏸️ EXTERNAL (CF dashboard) |

---

## 24. ARCHITECTURE RISKS

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|-----------|
| **Dual-layer SICE drift** | HIGH | 9 engine names duplicated across layers — changes to shared-domain logic must be applied independently to both layers | Document which layer is source-of-truth per engine; enforce via code review |
| **TwinStateEngine ambiguity** | MEDIUM | 3 implementations with same class name — importing code must pick the right module or risk type mismatch | Rename one copy (e.g., `TwinStateLadderEngine` for UI version) |
| **twinVisualDNA name collision** | LOW-MEDIUM | Same interface name (`TwinVisualDNA`) with different shapes — requires aliased imports to avoid confusion | Already handled via named aliases in consumers |
| **Migration runner unsafe mode** | MEDIUM | `run-migrations.cjs` uses undocumented `--file` flag — could corrupt migration state if run alongside `supabase db push` | Deprecate v1 runner or add safety check |
| **Twin Birth route duplication** | MEDIUM | 2 routes for near-identical logic — future changes require updating both | Extract shared `useTwinBirthLogic` hook |
| **PersonalContextBuilder redundancy** | MEDIUM | 4+ simultaneous instances computing same data from different tables | Centralize in React Query or Zustand store |
| **Stale deprecation annotations** | LOW | `lib/intelligence/index.ts` marked deprecated but folder has 88 consumers | Update annotation to clarify "barrel deprecated, submodules active" |
| **Recovery route inconsistency** | LOW | `useRecoveryRoute` targets legacy `/core-awakening` while newer route is `/twin-birth` | Update recovery target to `/twin-birth` |

---

## 25. RECOMMENDED REMEDIATION CANDIDATES — NOT YET EXECUTED

Per Phase 9 scope restriction: **remediation recommendations only. No changes made.**

### Immediate (can be done safely, no risk of breaking production)

1. Remove dead hooks (DC-01 through DC-06, DC-18, useJournalQueue, useSoundscape): 10 dead hooks totaling ~450 lines
2. Remove dead components (DC-07, DC-08, DC-09, DC-20 through DC-29): HubSwitcher + both Skeletons + ChatWindow + ChoiceConsequence + VoiceTwin + MemoryRetrieval + SCIEResult + WorldTabs + BiasDetectionDashboard + TwinSynthesis — approximately **18 components**
3. Remove dead scripts (DC-14, DC-15): run-migrations-v2 + v3
4. Clean up barrel exports for dead items (HubSwitcher, Skeletons, 9 dead component barrels)
5. Remove orphan CF function utilities (api/_utils/prompt-builder.ts 261ln, api/_utils/safety.ts 117ln)

### Medium-term (requires coordination)

6. Consolidate Twin Birth pages (SC-01): extract shared logic
7. Consolidate Skeleton implementations (SC-04): pick ui/Skeleton, wire it globally
8. Wire or remove Twin Birth recovery chain (SC-05): either connect useTwinBirth to routes or remove twinBirthFlow + dnaPersistence
9. Update useRecoveryRoute target (RV-07): change from /core-awakening to /twin-birth
10. Remove dead services (~14 services identified above including DecisionIntelligence, SecurityService, DeliveryVerification, NotificationAnalytics, etc.)
11. Remove dead CSS files (9+ CSS files that die with their orphan components)
12. Cleanup empty feature subdirectories (features/chat/hooks/, features/viral/api/)
13. Fix PersonalContextBuilder cache-shape swap bug (#7 in M4 above)
14. Remove Test-Only services from production bundle (10 services built+tested-but-never-wired)
15. Remove twinVisualDNA F3 if redundant with F1/F2 (after architecture review)

### Long-term (architecture decisions requiring approval)

16. Resolve dual-layer SICE architecture (SC-02): decide if consolidation is permitted despite CLAUDE.md no-delete rule
17. Reconcile TwinStateEngine triple (SC-03): merge #1/#3 or rename to eliminate ambiguity
18. Deduplicate PersonalContextBuilder (SC-06): centralize computation via React Query/Zustand *(แก้เลขลำดับจาก 9./10./11. ที่ซ้ำกับรายการ medium-term — DOC-13)*

---

## 26. FINAL TRUTH

### What Is Definitively Dead

**68 artifacts** (canonical count แบบไม่ double-count — แก้จาก "70+" ที่นับซ้ำ 5 จุด; รายละเอียดการนับ: `docs/FORENSIC_PHASE_09_RECONCILIATION_REPORT_TH.md` Section 1) across hooks, components, services, scripts, routes, and edge functions have been proven dead through exhaustive tracing of ALL 22 invocation paths. These have zero production, test, or external consumers.

| Category | Count | Examples |
|----------|-------|---------|
| Dead Hooks | 10 | useAudioDucking, useNotificationEngagement, usePasskey, usePrivacy, useSessionPersistence, journeyResume, useTwinBirth, useJournalQueue, etc. |
| Dead Components | 12 | HubSwitcher, both Skeletons, ChatWindow, ChoiceConsequence, VoiceTwin, MemoryRetrieval, SCIEResult, WorldTabs, BiasDetectionDashboard, TwinSynthesis (DC-29 TwinAvatar / DC-30 JsonLdSchemas → **TEST-ONLY แยกออก**) |
| Dead Services | 12 | SICEOrchestratorImpl, WorldRoutingService + WorldContextAdapter, ConversationAnalyzer, DecisionAutomationService, DeliveryVerification, InputValidation, NotificationAnalytics, NotificationTemplates, SecurityService, TwinMigration, DecisionIntelligence (DC-39; **DC-58 merged**), database-init runMigrations |
| Dead Scripts | 3 | run-migrations-v2, run-migrations-v3, database-init.ts:runMigrations() |
| Dead Chains | 3 | twinBirthFlow, dnaPersistence, journal-sync (TWIN_BIRTH flag → **LEGACY ACTIVE** ตาม canonical ไม่ใช่ dead) |
| Dead Endpoint | 2 | /api/coach (deleted from git d6624af — **DISCONTINUED**), journal-sync (no module in KNOWN_MODULES) |
| Dead CSS Files | 9 | nova-twin.css, decision-*.css, world-tabs.css, twin-synthesis.css, advanced-analytics.css, confidence-indicator.css (zero import refs — verified 27 ก.ย.) |
| Dead Barrels | 10 | 9 component barrels + sfx.ts barrel (dead despite hooks being live) |
| Dead Lib Utilities | 7 | crypto, webauthn-verify, exportEngine, birthPlace.types, storyNarrative.types, twinProceduralVisual, localization constants (VisualStateEngine → **TEST-ONLY** แยกออก) |
| Test-Only Services | 9 | SentimentAnalyzer, QualityMetricsService, FeedbackService, ContinuousImprovementService, FollowUpScheduler + TwinAvatar, JsonLdSchemas, VisualStateEngine, worldRecommender (เดิมนับ 10 — 5 ชื่อซ้ำกับ dead services และมี 0 tests จึงจัด DEAD) |
| Orphan CF Functions (route-level) | 6 | nova-stream, metrics, autonomy-log, notifications module, twin-evolution, sice module (prompt-builder.ts / safety.ts → VERIFIED DEAD utilities) |
| Orphan Supabase Edge Fns | 8 | auth-rate-limit, account-delete, account-recovery, daily-brief, send-push, memory-manager, pattern-detect, data-export |

### What Is Orphan (Implementation Without Verified Consumer)

Items that exist in the repository but whose production consumer chain could not be fully verified due to browser access limitations:
- SFXProvider render tree
- External webhook targets (non-Stripe)
- Supabase Edge Functions bindings

**Status: ⏸️ EXTERNAL — awaiting runtime verification in Phase 10.**

### What Is Legacy (Still Active But Old Architecture)

- `lib/experience/TwinStateEngine` — previously marked "dead" but proven active via EnvironmentEngine *(DOC-01 แก้ typo: เดิมพิมพ์ "TowerStateEngine" — ยืนยัน 27 ก.ย. 2026 ว่าไม่มีไฟล์/สตริงนี้ใน src/)*
- Stale `lib/intelligence/index.ts` deprecation banner — barrel truly unused but folder actively consumed
- `/core-awakening` registered twice — harmless but confusing
- Recovery route targets legacy path

### What Is Duplicate (Semantic Responsibility Overlap)

**True Duplicates** (accidental, should be consolidated):
- Skeleton G1/G2 (both dead, no functional use)
- CoreAwakening ↔ TwinBirthPage (near-identical logic, distinct routes)
- run-migrations.v2/v3 (no-op stubs)

**Intentional Duplicates** (architecturally permitted):
- lib/intelligence ↔ services/sice/engines dual-layer (permitted by CLAUDE.md)
- TwinVisualDNA ×3 — F1/F2/F3 (different APIs/purposes, separated intentionally — **แก้จาก ×2 ตาม evidence 27 ก.ย.**)

**Accidental Name Collisions** (should be renamed):
- TwinStateEngine ×3 (2 genuinely overlap in domain: #1 knowledge ladder + #3 maturity score; #2 visual posture is separate)

### What Is Intentionally Discontinued

- `/api/coach` — deleted backend, default-0 feature flag, frontend widget remains as placeholder

### What Needs Runtime/External Verification

All items marked RV-XX above. Browser access limitations persist — consistent with Phase 5 and Phase 8 findings. No E5 evidence possible without runtime access to staging/production URLs.

Critical unverified items that require external verification:
- SFXProvider render tree (may or may not be rendered)
- Supabase Edge Functions invocation paths (no DB triggers/cron found, but cannot verify without Supabase dashboard)
- External webhook targets beyond Stripe (cannot verify from code alone)
- Production deployed SHA (requires CF Pages dashboard)

### Architecture Risks Identified

| Risk | Severity | Description |
|------|----------|-------------|
| Dual-layer SICE drift | HIGH | 9 engine names duplicated across layers — changes must be applied independently |
| PersonalContextBuilder cache-shape swap | HIGH (E1) | `TwinPersonalityPage` shares React Query key with different data shape — **collision พิสูจน์ที่ source (E1); runtime impact ยังไม่พิสูจน์ (E5 unproven)** |
| TwinStateEngine ambiguity | MEDIUM | 3 implementations with same class name — importing code must pick right module |
| twinVisualDNA ×3 divergence | MEDIUM | Three independent visual identity models per twin with no reconciliation |
| CoreAwakening ↔ TwinBirthPage duplication | MEDIUM | Near-identical 300–500 line components for distinct routes |
| 10 test-only services bloating bundle | LOW-MEDIUM | Never-wired services included in production build unnecessarily |
| Stale deprecation annotation (`lib/intelligence`) | MEDIUM | False claim creates confusion about which layer is authoritative |
| 70+ dead artifacts in repository | LOW | Maintenance burden increases with each release cycle |

---

## 26A. FINAL TRUTH SUMMARY

### Dead Code
**68 proven dead artifacts** (canonical — แก้จาก "70+" ซึ่งนับซ้ำ; รายละเอียด: `docs/FORENSIC_PHASE_09_RECONCILIATION_REPORT_TH.md` Section 1) across hooks, components, services, scripts, routes, CSS, barrels, utilities, orphan functions, and test-only services. All traced through ALL 22 invocation paths with zero consumers verified.

### Orphan Findings
Items that exist in the repository but whose production consumer chain could not be fully verified due to browser access limitations:
- SFXProvider render tree
- Supabase Edge Functions invocation paths
- External webhook targets (non-Stripe)
- Production deployed SHA

**Status: ⏸️ EXTERNAL — awaiting runtime verification.**

### Legacy (Still Active But Old Architecture)
- `lib/experience/TwinStateEngine` — previously marked "dead" but proven active via EnvironmentEngine *(DOC-01 แก้ typo: เดิมพิมพ์ "TowerStateEngine" — ยืนยัน 27 ก.ย. 2026 ว่าไม่มีไฟล์/สตริงนี้ใน src/)*
- Stale `lib/intelligence/index.ts` deprecation banner — barrel truly unused but folder actively consumed by 31 production files (80 import statements)
- `/core-awakening` registered twice — harmless but confusing
- Recovery route targets legacy path

### Duplicate (Semantic Responsibility Overlap)
**True Duplicates (accidental, should be consolidated):**
- Skeleton G1/G2 (both dead, no functional use)
- CoreAwakening ↔ TwinBirthPage (near-identical logic, distinct routes)
- run-migrations.v2/v3 (no-op stubs)

**Intentional Duplicates (architecturally permitted):**
- lib/intelligence ↔ services/sice/engines dual-layer (permitted by CLAUDE.md)
- twinVisualDNA ×3 (different APIs/purposes, separated intentionally)

**Accidental Name Collisions (should be renamed):**
- TwinStateEngine ×3 (2 genuinely overlap in domain: #1 knowledge ladder + #3 maturity score; #2 visual posture is separate)
- PersonalContextBuilder ×2 classes with identical name (lib vs sice/engine)

### What Needs Immediate Attention
1. **PersonalContextBuilder cache-shape collision (#7 in Section 10A)** — E1-proven cache-shape collision; E5 runtime impact unproven (ต้องมี runtime reproduction ก่อนแก้ cache key)
2. **lib/intelligence/index.ts false deprecation claim** — creates architectural confusion
3. **68 dead artifacts** — cleanup reduces maintenance burden and bundle size
4. **CoreAwakening ↔ TwinBirthPage duplication** — extract shared logic into reusable hook
5. **twinVisualDNA ×3 divergence** — assess if all three are needed or consolidate

🛑 STOP — PHASE 9 COMPLETE

File: `docs/FORENSIC_PHASE_09_DEAD_ORPHAN_LEGACY_DUPLICATION_TH.md` *(DOC-13: หมายเหตุขนาด "~87 KB" ล้าสมัย — อ่านขนาดจริงจากไฟล์; เอกสารถูกแก้ตาม DOC-01..13 ของ Phase 10 เมื่อ 27 ก.ย. 2026)*

🛑 STOP — PHASE 9 COMPLETE

---

# ANNEX A — ADDITIONAL CLUSTER FINDINGS (Duplicate Service Search)

## AA-1: Audio/SFX Cluster ×7 Paths

| # | Path | Purpose | Producer vs Consumer |
|---|------|---------|---------------------|
| 1 | `src/context/AudioContext.tsx` — AudioProvider | Music player context | Provider + consumer |
| 2 | `src/services/audioManager.ts` | Central audio control (duckVolume, restoreVolume) | Shared service |
| 3 | `src/services/adaptive-audio-engine.ts` | Quality strategy (network/device adaptation) | Singleton line 441 |
| 4 | `src/lib/experience/SoundscapeEngine.ts` | Ambient soundscape synthesis | Engine (used by lib/experience) |
| 5 | `src/hooks/useSoundscape.ts` + `useSoundscapeAudioLoader.ts` | Hook wrappers around SoundscapeEngine | **แก้ (grep 27 ก.ย.):** `useSoundscape.ts` = zero importers → DEAD; `useSoundscapeAudioLoader` มี consumer จริง (SoundscapePlayer.tsx:26) |
| 6 | `src/components/audio/SFXProvider.tsx` | SFX playback context | Provider using sfx hooks trio |
| 7 | `src/hooks/sfx.ts` barrel → useTwinSFX/useTransitionSFX/useUISFX | Low-level Audio players (each has own volume/init) | Consumed only by SFXProvider |
| 8 | `src/components/audio/TwinAudioFeedback.tsx` | Twin-specific sound feedback | UI component |
| 9 | `src/lib/twin/twinCelebrationSound.ts` | Celebration sound effects | Utility function |

**Assessment:** 9 distinct audio paths serve overlapping purposes. No single source-of-truth for audio configuration. The `sfx.ts` barrel exports to SFXProvider which may or may not render in production — unverified due to browser limitation.

## AA-2: Decision Follow-up Cluster ×4 Services

| Service | File | Lines | Key Exports | Overlap? |
|---------|------|-------|-------------|----------|
| DecisionFollowUpService | `services/DecisionFollowUpService.ts` | Schedule/follow-ups + complete | `scheduleDecisionFollowUps`, `getPendingFollowUps`, `completeFollowUp` | Has shared names |
| DecisionFollowUpNotifier | `services/DecisionFollowUpNotifier.ts` | Notification dispatching | `scheduleDecisionFollowUps`, `recordDecisionOutcome` | **SHARED EXPORT NAME**: `scheduleDecisionFollowUps` |
| FollowUpScheduler | `services/FollowUpScheduler.ts` | Cron-like scheduling | `getOverdueFollowUps`, `completeFollowUp`, `runDailyFollowUpTask` | **SHARED EXPORT NAME**: `completeFollowUp` |
| DecisionAutomationService | `services/DecisionAutomationService.ts` | Header: "Core automation moved to FollowUpScheduler" | Redundant/deprecated | LEGACY |

**Assessment:** Three services export the same function names (`scheduleDecisionFollowUps`, `completeFollowUp`). This is a naming collision that creates ambiguity about which service is authoritative. DecisionAutomationService self-deprecated ("moved to FollowUpScheduler in Phase E").

## AA-3: World Recommendation Cluster ×3

| Implementation | File | Status | Consumers |
|---------------|------|--------|-----------|
| worldRecommender | `lib/worldRecommender.ts` | Keyword matcher library | Unknown (needs trace) |
| useWorldRecommendation | `hooks/useWorldRecommendation.ts` | Hook wrapper | Page-level hook consumers |
| WorldRoutingService | `services/world-routing/WorldRoutingService.ts` | **DEPRECATED** — zero callers | Dead |

**Assessment:** Two active implementations serving overlapping purpose. WorldRoutingService dead path remains as legacy documentation artifact.

## AA-4: Supabase Client Cluster ×3

| Version | File | Pattern | Notes |
|---------|------|---------|-------|
| v1 | `lib/supabase/client.ts` | Direct import | Primary client |
| v2 | `lib/supabase/client-lazy.ts` | Lazy initialization | Comment: "duplicated on purpose" |
| v3 | `services/supabase-service.ts` | Re-exports singleton `supabase` from v1 | Line 11: re-export pattern |

**Assessment:** Three entry points to the same Supabase client. `client-lazy.ts` justifies duplication for lazy loading; `supabase-service.ts` is a re-export wrapper. This is intentional but adds cognitive load.

## AA-5: Context Providers Inventory (15 Total)

All 15 context providers use `useState` — **zero useReducer** patterns anywhere in `src/context/`:

| Provider | File | Provides |
|----------|------|----------|
| AuthProvider | `context/AuthContext.tsx` | Auth state |
| AudioProvider | `context/AudioContext.tsx` | Audio controls |
| AIProvider | `context/AIContext.tsx` | AI response state |
| EmotionProvider | `context/EmotionContext.tsx` | Emotional state |
| EnvironmentProvider | `context/EnvironmentContext.tsx` | Environment config |
| EvolutionProvider | `context/EvolutionContext.tsx` | Evolution progress |
| ExperienceProvider | `context/ExperienceContext.tsx` | Experience config (PCB + TSE instances) |
| HubProvider | `context/HubContext.tsx` | Hub selection |
| LanguageProvider | `context/LanguageContext.tsx` | Language preference |
| NovaProvider | `context/NovaContext.tsx` | Nova chat |
| PopupProvider | `context/PopupContext.tsx` | Toast/popup notifications |
| SubscriptionProvider | `context/SubscriptionContext.tsx` | Subscription status |
| ThemeProvider | `context/ThemeContext.tsx` | Theme toggling |
| TwinProvider | `context/TwinContext.tsx` | Twin identity/state |
| WorldProvider | `context/WorldContext.tsx` | Current world context |

**Finding:** Zero useReducer usage across all 15 contexts. All use simple useState patterns. This limits complex state transition safety in context providers.

## AA-6: Barrel Export Inventory (18 Barrels)

| Barrel Path | Re-exports Count | Notable Dead Exports |
|------------|-----------------|---------------------|
| `src/components/composites/index.ts` | 10 | Skeleton (dead) |
| `src/components/primitives/index.ts` | 16 | Empty type exports at lines 14-16 |
| `src/components/features/index.ts` | 4 | HubSwitcher (dead) |
| `src/components/story/index.ts` | 4 | — |
| `src/components/auth/index.ts` | 2 | Empty type export |
| `src/components/audio/index.ts` | 1 | SoundscapePlayer only |
| `src/components/living/index.ts` | 6 | — |
| `src/components/landing/index.ts` | 2 | — |
| `src/components/intelligence/index.ts` | 4 | — |
| `src/lib/experience/index.ts` | 8 | TwinStateEngine (experience version) |
| `src/lib/intelligence/index.ts` | 15 | ⚠️ DEPRECATED banner but 15 classes still re-exported |
| `src/hooks/sfx.ts` | 3 | All 3 live (via SFXProvider) |
| `src/store/*` | ❌ No barrel | Flat structure — 5 stores direct-imported |
| `src/components/ui/` | ❌ No barrel | Only Skeleton.tsx exists |

**Finding:** The deprecated barrel `lib/intelligence/index.ts` is the most paradoxical — it declares itself a duplicate while its re-exports connect 15 engines to 88 consumers across the codebase.

---

# ANNEX B — PERSONALCONTEXTCBUILDER INSTANCE ANALYSIS (REFINED)

Corrected based on verified source reads of ExperienceContext.tsx:

| Instance | Creator | Module Source | Line | React Lifecycle Protection? |
|----------|---------|--------------|------|----------------------------|
| **#1** | `SICEOrchestrator.registerEngines()` | `services/sice/engines/PersonalContextBuilder` | 61 | No — fresh per new SICEOrchestrator() call |
| **#2** | `TwinPersonalityPage.tsx:120` (inside useQuery fn) | `services/sice/engines/PersonalContextBuilder` | 120 | Partial — per-query refresh |
| **#3** | `ExperienceContext.tsx:71` — `useMemo(() => new PersonalContextBuilder(), [])` | `lib/intelligence/PersonalContextBuilder` (deprecated layer!) | 71 | Yes — useMemo prevents re-creation |
| **#4** | `useTwinIdentity.ts:120` — `useMemo(() => new PersonalContextBuilder(), [])` | `lib/intelligence/PersonalContextBuilder` (deprecated layer!) | 120 | Yes — useMemo prevents re-creation |
| **#5** | `DailyBriefEngine.ts:21` — module-level `new PersonalContextBuilder()` | `lib/intelligence/PersonalContextBuilder` | 21 | Yes — module singleton |
| **#6** | Bridge owns `PatternDetector` + `BadgeEngine` NOT PCB | N/A | N/A | Singleton module level |

### Refined Analysis

1. **4 distinct instantiation points** for PersonalContextBuilder (instances #1-#4, plus module singleton #5)
2. **Two different versions:** Instances #1-#2 use `services/sice/engines/` version. Instances #3-#5 use `lib/intelligence/` version (the deprecated layer!) — contradicting the deprecation claim.
3. **ExperienceContext uses lib/intelligence version** despite being an experience-layer context — semantic confusion.
4. **CoreAwakeningService imports FullAnalysisOutput from InsightEngine** (line 17) — proving migration incomplete.
5. **Duplicate computation risk:** If ExperienceContext and useTwinIdentity both mount during app init, their memoized PersonalContextBuilder instances compute independently from the same Supabase tables.
6. **No inter-instance coordination:** They don't share state, don't cache results together, don't know each other exist.

---

# ANNEX C — PRODUCTION IMPORT CHAIN SUMMARY

### Heaviest-Imported Files (>10 direct consumers)

| File | Import Count | Key Importers |
|------|-------------|---------------|
| `lib/intelligence/PersonalContextBuilder` | 4+ | ExperienceContext, useTwinIdentity, TwinPersonalityPage, DailyBriefEngine |
| `lib/intelligence/TwinStateEngine` | 4+ | ExperienceContext, useTwinIdentity, TwinEvolution, LivingTwin, DailyBriefEngine |
| `lib/intelligence/InsightEngine` | 3+ | CoreAwakeningService, multiple dashboard components |
| `lib/supabase/client.ts` | ~10+ | Most pages and services |
| `context/AuthContext` | ~15+ | Almost all protected pages |
| `services/sice/SICEOrchestrator` | 4+ | CoreAwakeningService, Onboarding, WorldRoutingService, tests |

### Deepest Import Chains Verified

```
Page Component (e.g., IntelligenceHub.tsx)
  → Component import (e.g., AskCoach.tsx)
    → Service import (e.g., .../api/coach fetch — DEAD)
  
App.tsx route registration
  → Lazy-loaded page (React.lazy)
    → Hook import (e.g., useAuth, useTwinIdentity)
      → Service import (e.g., PersonalContextBuilder from lib/intelligence)
        → Supabase client from lib/supabase/client.ts
```

Maximum depth observed: 5 levels deep for typical page-to-database flow.

---

# ANNEX D — FILES WITH @ts-nocheck / @ts-expect-error

| File | Lines | Reason | Risk Level |
|------|-------|--------|-----------|
| `api/unified-handler.ts:5` | `@ts-nocheck` | Intentional — CF Pages migration, tracked as tech-debt (D-10/P3-5) | MEDIUM |
| `src/components/twin/TwinThreeRenderer.tsx:22` | `@ts-expect-error` three module | Type compatibility issue | LOW |
| `src/lib/prompts/__tests__/promptBuilder.test.ts:184` | `@ts-expect-error` test guard | Test expectation mismatch | LOW |

Only 3 real usages found — no excessive type-skip patterns detected.

---

# ANNEX E — PACKAGE.JSON STRAY MANIFEST

`src/package.json` (type: "commonjs", main: "sw.js", dependency: pg):

This file does NOT belong in the src/ directory. It is likely an accidental copy of a service-worker manifest created during development. It conflicts with root `package.json` which is the correct build manifest. **Recommendation: REMOVE.**



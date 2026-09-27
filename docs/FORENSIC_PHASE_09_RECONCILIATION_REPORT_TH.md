# PHASE 9 RECONCILIATION REPORT (TH)

**วันที่:** 27 กันยายน 2026
**ต้นทาง:** `docs/FORENSIC_PHASE_09_DEAD_ORPHAN_LEGACY_DUPLICATION_TH.md` (1,549 บรรทัด, ตรวจครบทั้งฉบับรวม Annex A–E)
**ขอบเขตงานนี้:** RECONCILIATION ONLY — จัดชุดข้อมูลให้เป็น canonical inventory จากหลักฐานที่ตรวจแล้ว **ไม่มีการแก้ไขเอกสาร Phase 9 ต้นทาง, ไม่มีการแก้ source code / test / DB / config / deployment, ไม่ commit / push, ไม่ execute remediation ใด ๆ**
**วิธีตรวจ:** Re-verify เฉพาะจุดที่ขัดแย้ง (targeted) ด้วย grep/glob บน source จริง ณ วันที่ 27 ก.ย. 2026 — ไม่มีการเพิ่ม finding ใหม่จากการคาดเดา ทุกข้อสรุปอ้าง `file:line` หรือผล grep/glob
**สถานะ:** 🛑 STOP — รอ human review ก่อนขั้นถัดไป (การแก้เอกสาร Phase 9 และ/หรือ remediation เป็นขั้นตอนถัดไปที่ต้องได้รับอนุมัติ)

---

## 0. บทสรุปผู้บริหาร

เอกสาร Phase 9 มี **ความขัดแย้งภายใน 19 รายการ** (ข้อ #1–#19 ใน Section 7) ที่พิสูจน์ได้ด้วยหลักฐาน source จริง หลัง reconcile แล้ว ได้ canonical inventory ดังนี้:

| Canonical bucket | จำนวน |
|---|---|
| ⚫ VERIFIED DEAD | **68** (นับตาม artifact/finding ID — ไม่ใช่จำนวน physical files) |
| 🟢 VERIFIED ACTIVE | 25 กลุ่ม (ระบุรายชื่อใน Section 2) |
| 🟠 LEGACY ACTIVE | 9 |
| ⚪ ORPHAN-UNPROVEN | 20 (+ 5 external verification items: RV-01/04/05/06/07) |
| 🧪 TEST-ONLY | 9 |
| 🚫 DISCONTINUED | 1 cluster (/api/coach + flag) |
| 🔁 DUPLICATE CANDIDATE | 10 กลุ่ม |

> หมายเหตุ: ตัวเลข "70+" และการนับแบบรวมหมวดของเอกสารเดิม (19 → 29 → 38 → ~65 → ~70+) **นับซ้ำ** ใน 5 จุด (ดู Section 1 "ที่มาของเลข 68" และ Section 7 ข้อ #9, #13) canonical dead count ที่ถูกต้องคือ 68 (≈ 70 physical files — ดู Section 1)

---

## 1. CANONICAL DEAD COUNT — VERIFIED DEAD (68 artifacts)

จำนวนนับตาม artifact/finding (1 ID = 1 artifact — **ไม่ใช่จำนวน physical files**; หมายเหตุจำนวนไฟล์จริงท้ายตาราง)

**กลุ่ม A — Hooks / Entry utilities (21)**
| # | ID | Artifact | หลักฐาน |
|---|----|----------|---------|
| 1 | DC-01 | `useAudioDucking.ts` | zero consumers (E1, เอกสาร) |
| 2 | DC-02 | `useNotificationEngagement.ts` | zero consumers (E1) |
| 3 | DC-03 | `usePasskey.ts` | PasskeyLogin ใช้ passkeyProvider ตรง (E1) |
| 4 | DC-04 | `usePrivacy.ts` | zero consumers (E1) |
| 5 | DC-05 | `useSessionPersistence.ts` | zero consumers (E1) |
| 6 | DC-06 | `journeyResume.ts` | zero consumers (E1) |
| 7 | DC-07 | `HubSwitcher.tsx` + barrel export line | zero importers (E1) |
| 8 | DC-08 | `ui/Skeleton.tsx` | zero importers (E1) |
| 9 | DC-09 | `composites/Skeleton.tsx` | zero destructured callers (E1) |
| 10 | DC-10 | `SICEOrchestratorImpl.ts` | self-deprecated, zero consumers (E1) |
| 11 | DC-11 | `WorldRoutingService.ts` + `WorldContextAdapter.ts` (2 ไฟล์/1 ID) | zero production callers (E1) |
| 12 | DC-12 | `src/services/migrations/` legacy track | ไม่มี runner/CI อ้าง (E1) |
| 13 | DC-14 | `run-migrations-v2.cjs` | no-op stub (E1) |
| 14 | DC-15 | `run-migrations-v3.cjs` | no-op stub (E1) |
| 15 | DC-16 | `twinBirthFlow.ts` | dead chain (consumer เดียว dead) (E1) |
| 16 | DC-17 | `dnaPersistence.ts` | zero callers (E1) |
| 17 | DC-18 | `useTwinBirth.ts` | zero consumers (E1) |
| 18 | — | `useChat.ts` (transitive dead) | consumer เดียวคือ ChatWindow ซึ่ง zero importers (grep 27 ก.ย. — ดู Section 7 ข้อ #3) |
| 19 | — | `useSoundscape.ts` | zero importers (grep 27 ก.ย. — แก้ข้ออ้าง AA-1 ที่อ้างผิดเป็น useSoundscapeAudioLoader, ดู Section 7 ข้อ #16) |
| 20 | DC-59 | `database-init.ts:13` runMigrations() | zero callers (E1) |
| 21 | OP-02 | `src/hooks/useDecisionCache.ts` (148 ln) | **แก้จากเดิม**: ไฟล์มีอยู่จริง (claim "file not found" ผิด) — re-verify 27 ก.ย. 2026: exports ทั้งหมด (useDecisions, useDecisionOutcomes, useDecisionPatterns, useInvalidateDecisionCache, DECISION_CACHE_KEYS, CACHE_CONFIG) zero importers → ⚫ VERIFIED DEAD (E1) |

**กลุ่ม B — Components (9)**
| 22–30 | DC-20..DC-28 | ChatWindow, WorldContextHeader, ChoiceConsequence, VoiceTwin, MemoryRetrieval, SCIEResult, WorldTabs, BiasDetectionDashboard, TwinSynthesis | zero consumers ทั้งหมด (E1) — ChatWindow dead ยืนยันด้วย grep 27 ก.ย. (ไม่มีใคร import) |

**กลุ่ม C — Services (9)**
| 31–39 | DC-31..DC-39 | ConversationAnalyzer, DecisionAutomationService, DeliveryVerification, InputValidation, NotificationAnalytics, NotificationTemplates, SecurityService, TwinMigration, **DecisionIntelligence** (canonical ID; DC-58 = ID ซ้ำ ถูก merge) | zero callers (E1) |

**กลุ่ม D — Lib/Constants (7)**
| 40–46 | DC-41..DC-47 | `lib/auth/crypto.ts`, `lib/auth/webauthn-verify.ts`, `lib/decision/exportEngine.ts`, `lib/geo/birthPlace.types.ts`, `lib/story/storyNarrative.types.ts`, `lib/twin/twinProceduralVisual.ts`, `constants/localization.ts` | zero importers (E1) |

**กลุ่ม E — CF utilities (2)**
| 47–48 | M8 | `api/_utils/prompt-builder.ts` (261 ln), `api/_utils/safety.ts` (117 ln) | zero importers; safety เคยถูกอ้างโดย coach.ts ที่ถูกลบแล้ว (E1) |

**กลุ่ม F — Dead chain (1)**
| 49 | M5/M9 | useJournalQueue chain: `useJournalQueue.ts` + `journalQueueDB.ts` + คำเรียก `/api/journal-sync` (404) | hook มีแต่ self-reference (grep 27 ก.ย. ยืนยัน) (E1) |

**กลุ่ม G — CSS (9) — re-verify ด้วย grep 27 ก.ย. แล้วทั้งชุด: zero import reference ทุกไฟล์**
| 50 | DC-48 | `styles/nova-twin.css` | zero refs (เหตุผลเดิม "Dies if NovaChat deprecated" ผิดเงื่อนไข — NovaChat live แต่ไม่มีใคร import CSS นี้) |
| 51 | DC-49 | `styles/voice-twin.css` | zero refs (ตอนนี้ verified แล้ว — caveat "unverified" เดิมปิดไปได้) |
| 52 | DC-50 | `styles/confidence-indicator.css` | zero refs — **แก้เหตุผลเดิม**: ConfidenceIndicator component มีชีวิต (AnalysisPage:28, ExecutiveSummary:30, IntelligencePanel:23) แต่ CSS ไม่ถูก import |
| 53–55 | DC-51..53 | `decision-insights.css`, `decision-stats.css`, `decision-timeline.css` | zero refs |
| 56 | DC-54 | `world-tabs.css` | zero refs (ผูกกับ WorldTabs ที่ dead) |
| 57 | DC-55 | `twin-synthesis.css` | dead เชิง transitive — import โดย TwinSynthesis.tsx:27 ซึ่งเป็น dead component |
| 58 | DC-56 | `styles/advanced-analytics.css` | zero refs |

**กลุ่ม H — Barrels (10)**
| 59–67 | Section 1 | 9 component barrels: `components/{audio,auth,composites,features,intelligence,landing,living,primitives,story}/index.ts` | never imported (E1) |
| 68 | OP-01(ส่วน barrel) | `hooks/sfx.ts` ในฐานะ barrel | barrel ไม่มีผู้ import (hooks ข้างใน → ORPHAN, ดู Section 3) |

**รวม VERIFIED DEAD = 68 artifacts** (นับเป็น physical files ≈ 70: DC-11 = 2 ไฟล์, journal chain = 2 ไฟล์ ใน 1 artifact เป็นต้น)

**ที่มาของเลข 68 (ต่างจาก "70+" ของเอกสารเดิม):** หัก ID ซ้ำ/นับซ้ำ ได้แก่ DC-58 (merge เข้า DC-39), DC-19/DC-40 (unproven ไม่นับ dead), DC-29/DC-30/DC-60 (test-only ไม่นับ dead), /api/coach (DISCONTINUED ไม่นับ dead), 5 services ใน M6 ที่โดนนับซ้ำทั้งฝั่ง dead และ test-only; เพิ่ม useChat, useSoundscape, useDecisionCache ที่พิสูจน์แล้ววันนี้ (3 แถวท้ายกลุ่ม A)

---

## 2. CANONICAL ACTIVE / LEGACY / DISCONTINUED COUNT

### 🟢 VERIFIED ACTIVE (25 กลุ่ม)
| # | กลุ่ม | รายการ |
|---|------|--------|
| 1–7 | CF Pages Functions | `twin.ts`, `twin-stream.ts`, `nova.ts`, share module, profile module, blueprint module, stripe webhook |
| 8–10 | Supabase Edge (active) | astrovera-edge (degraded SEC-02), auth-authentication-options, auth-verify-passkey |
| 11–13 | TwinStateEngine ×3 (live ทั้งหมด คนละ domain) | #1 lib/intelligence (7 consumers), #2 lib/experience (EnvironmentEngine.ts:41 — LG-01), #3 sice/engines (SICEOrchestrator.ts:34,65) |
| 14–16 | TwinVisualDNA ×3 | F1 `lib/twinVisualDNA.ts`, F2 `lib/twin/twinVisualDNA.ts`, F3 `services/VisualDNAService.ts:41` (consumer: CoreAwakeningService.ts:14,427 — re-verified 27 ก.ย.) |
| 17–18 | PersonalContextBuilder | lib version + sice/engines version — **13 runtime sites ยืนยันด้วย grep 27 ก.ย. ตรงกับตาราง M4 ทุกจุด** |
| 19–21 | Services อื่นที่พิสูจน์แล้ว | DecisionLearningService (M1), useWorldRecommendation (M2), ExperienceEngine/ExperienceContext chain (M3) |
| 22 | Inline/CSS skeletons ที่ใช้จริง | GrowthSpace.tsx:84 + CSS-class skeletons |
| 23 | Supabase client หลัก | `lib/supabase/client.ts` (v2 lazy / v3 re-export = intentional) |
| 24 | Zustand stores ×5 | flat, intentional (DC-19 เป็นเพียง "ไม่มี barrel" ไม่ใช่ dead) |
| 25 | Dual-layer SICE engine layer | ~20 lib classes + 16 sice engines + SICEBridge + SICEOrchestrator + CoreAwakeningService + TwinBirthPage/CoreAwakening pages |

### 🟠 LEGACY ACTIVE (9)
1. **LG-04** `TWIN_BIRTH` flag — ถูก define แต่ไม่มีใครอ่าน, route unconditional (featureFlags.tsx:71)
2. **LG-05** banner deprecated เก่าของ `lib/intelligence/index.ts` — barrel ไม่ถูก import จริง แต่ folder ถูกใช้ผ่าน **80 import statements / 39 ไฟล์ (31 prod + 8 test)** — ตัวเลข canonical แทน "88" และ "~32 files" ที่ขัดกันเอง
3. **LG-06** `/core-awakening` ลงทะเบียนซ้ำ 2 ครั้ง (App.tsx:215, 224)
4. **LG-07** `useRecoveryRoute.ts:34` ชี้ path เก่า
5. **og.ts** — test-verified (smoke.spec.ts:124) แต่ไม่มี in-app consumer
6. **auth-registration-options** — wired แต่ UI เข้าไม่ถึง
7. **auth-register-passkey** — เช่นเดียวกัน
8. **ExperienceProvider** (M7) — mount จริงทุก session แต่ useExperience() ไม่มี consumer
9. **run-migrations.cjs (v1)** — ยัง "manual CLI" ได้ แต่ใช้ flag `--file` ที่ undocumented → unsafe

### 🚫 DISCONTINUED (1 cluster)
- **`/api/coach` cluster**: backend ถูกลบ (commit d6624af) + flag `VITE_COACH_ROLLOUT_PERCENT` default 0 (LG-03) + widget ถูก gate เป็น null — ตัดสินใจแล้วว่าปิด feature นี้

> **หมายเหตุ:** LG-01 (`lib/experience/TwinStateEngine`) ถูกจัด **VERIFIED ACTIVE** ตามหลักฐาน EnvironmentEngine.ts:41 — ชื่อ "TowerStateEngine" ใน Section 26/26A เป็น **typo ของ TwinStateEngine** (ยืนยัน: ไม่มีไฟล์และไม่มีสตริง `TowerStateEngine` ใน src/ เลย)

---

## 3. CANONICAL ORPHAN / UNPROVEN LIST (20 artifacts + 5 external verification items)

### ORPHAN-UNPROVEN (implementation มีจริง, พิสูจน์ consumer ไม่ได้ด้วย E1)
| # | ID | Artifact | สาเหตุที่พิสูจน์ไม่ได้ |
|---|----|----------|----------------------|
| 1 | DC-19 | `src/store/*` ไม่มี barrel | อาจ intentional — เอกสารเองระบุ UNPROVEN |
| 2 | DC-40 | `lib/ai/modelRouter.ts` | อาจถูกเรียกแบบ dynamic ณ runtime |
| 3 | OP-01 | hooks trio ใน `sfx.ts` (useTwinSFX/useTransitionSFX/useUISFX) | consumer เดียวคือ SFXProvider ซึ่ง render หรือไม่พิสูจน์ได้ (RV-01) |
| 4 | OP-05 (เดิม OP-03 Section 5) | SFXProvider render tree | ต้อง runtime access (RV-01) |
| 5 | OP-07 (เดิม OP-04) | `src/package.json` stray manifest | RV-06 |
| 6 | OP-06 (เดิม OP-02 Section 5) | CF external triggers อื่นนอกจาก Stripe | RV-04 |
| 7 | — | `functions/api/nova-stream.ts` | `streamNovaResponse` zero callers; loadtest เท่านั้น |
| 8 | — | `functions/api/metrics.ts` | **แก้ตามหลักฐานล่าสุด:** zero caller ใน src/ และ index.html (grep 27 ก.ย.) — มีแต่ k6/loadtest/README → ไม่ใช่ VERIFIED ACTIVE อีกต่อไป แต่ก็ **ไม่ประกาศ DEAD** เพราะปฏิเสธ external caller ไม่ได้ |
| 9 | — | `functions/api/autonomy-log.ts` | **แก้ตามหลักฐานล่าสุด:** chain ถูกตัด (useChat.ts:160 → ChatWindow.tsx → zero importers, grep ยืนยัน) — มีเพียง k6/e2e (security.spec.ts:71) → ไม่ใช่ dead ที่พิสูจน์สมบูรณ์, ไม่ใช่ active |
| 10–12 | 7.7 | CF modules: notifications, twin-evolution, sice/get-patterns | ไม่มี fetch จาก src |
| 13–20 | 7.8 | Supabase Edge Functions 8 ตัว: auth-rate-limit, account-delete, account-recovery, daily-brief, send-push, memory-manager, pattern-detect, **data-export** | ไม่มี trigger/cron/webhook ใด ๆ; ฟังก์ชันเทียบเท่าทำงานฝั่ง client/CF แล้ว (คำอธิบายใน Section 14 อธิบาย "ฟังก์ชันเทียบเท่าอยู่ที่อื่น" ไม่ใช่ "edge function ถูกเรียก") — data-export **มีไฟล์จริง** (glob ยืนยัน) ตามที่ Section 14 เคยค้างว่า "may have been removed" |

**RV (external/runtime) ที่ยังค้าง (5 รายการ):** RV-01 (SFXProvider render), RV-04 (external webhooks นอกจาก Stripe), RV-05 (Supabase bindings), RV-06 (src/package.json), RV-07 (production SHA) — RV-02/RV-03 ถูก**แก้สถานะ**: ไม่ใช่ "E1 proven (has callers)" แต่เป็น "E1 พิสูจน์ว่า**ไม่มี** production caller; มีแต่ loadtest/e2e — awaiting E5"

---

## 4. CANONICAL DUPLICATE CANDIDATES

| # | กลุ่ม | ประเภท |
|---|------|--------|
| 1 | DP-01: `lib/intelligence/*` ↔ `services/sice/engines/*` (9 ชื่อซ้ำ) | INTENTIONAL — gate ที่ CLAUDE.md:92 |
| 2 | DP-02: TwinStateEngine ×3 | intentional separation + name collision |
| 3 | **DP-03: twinVisualDNA ×3 (F1/F2/F3) — แก้จาก ×2** | INTENTIONAL — ยืนยันด้วยไฟล์จริง 3 ไฟล์ + consumer F3 ที่ CoreAwakeningService.ts:14,427 |
| 4 | DP-04: Skeleton G1/G2 (ทั้งคู่ dead) + inline + CSS-only | TRUE DUPLICATE (SC-04) |
| 5 | DP-05: CoreAwakening (517 ln) ↔ TwinBirthPage (317 ln) | ACCIDENTAL (SC-01) |
| 6 | DP-06: migration runners (v1 unsafe legacy / v2,v3 dead stubs / ตัวจริงคือ `supabase db push`) | TRUE DUPLICATE |
| 7 | DC-57: PersonalContextBuilder ×13 sites + cache-key `['personalContext', userId]` ถูกแชร์ระหว่าง 2 shape | DUPLICATE CANDIDATE (SC-06) — **evidence level: E1 (collision พิสูจน์ที่ source); E5 (runtime impact) ยังไม่พิสูจน์** |
| 8 | AA-2: `scheduleDecisionFollowUps` ×2, `completeFollowUp` ×2 (DecisionFollowUpService/Notifier/FollowUpScheduler) | name collision |
| 9 | AA-4: supabase client ×3 (client / client-lazy / supabase-service) | intentional |
| 10 | 26A: PersonalContextBuilder ×2 class ชื่อเดียวกัน (lib vs sice) | name collision |

---

## 5. CONFIRMED ARCHITECTURE RISKS (พร้อมระดับหลักฐาน)

| # | Risk | Severity | Evidence |
|---|------|----------|----------|
| 1 | Dual-layer SICE drift (9 ชื่อ engine ซ้ำ 2 เลเยอร์) | HIGH | E1 |
| 2 | PCB cache-key shape collision: `TwinPersonalityPage.tsx:116-166` คืน shape `PersonalityMetrics` บน key `['personalContext', userId]` ที่อีก 9 จุดใช้เป็น `PersonalContext` | HIGH (risk) — **แต่ระดับหลักฐาน: E1 collision พิสูจน์แล้ว / E5 runtime impact ยังไม่พิสูจน์** — ข้ออ้างเดิม "full analysis silently null" ขัดกับตรรกะของตัวเอง (`sourceCount === undefined` ≠ 0) | E1 + E5 pending |
| 3 | TwinStateEngine ×3 ชื่อชนกัน | MEDIUM | E1 |
| 4 | twinVisualDNA ×3 divergence (ไม่มี reconciliation ระหว่าง F1/F2/F3) | MEDIUM | E1 |
| 5 | CoreAwakening ↔ TwinBirthPage duplication | MEDIUM | E1 |
| 6 | 10 service เก่าติด bundle (5 dead + 4 test-only + 1 legacy) | LOW-MEDIUM | E1 |
| 7 | Stale deprecation banner (`lib/intelligence/index.ts`) | MEDIUM | E1 (นับใหม่: 80 imports / 39 ไฟล์) |
| 8 | Migration runner v1 unsafe flag | MEDIUM | E1 |
| 9 | Dead artifact mass 68 ชิ้น | LOW | E1 |
| 10 | `/api/metrics` + `/api/autonomy-log` deploy อยู่แต่ไม่มี in-app caller (ความเสี่ยง external trigger พิสูจน์ไม่ได้จาก code) | LOW | E1 (zero src callers) |

---

## 6. UNRESOLVED EXTERNAL / RUNTIME ITEMS

| ID | รายการ | สถานะหลัง reconcile |
|----|--------|---------------------|
| RV-01 | SFXProvider render tree | ⏸️ EXTERNAL (ไม่เปลี่ยน) |
| RV-02 | `/api/metrics` | **แก้:** ไม่ใช่ "E1 proven (has callers)" — E1 พิสูจน์ว่า **ไม่มี** production caller; รอ E5/external |
| RV-03 | `/api/autonomy-log` | **แก้** เช่นเดียวกับ RV-02 — caller chain ถูกตัด |
| RV-04 | External webhooks นอกจาก Stripe | ⏸️ EXTERNAL |
| RV-05 | Supabase Edge Functions bindings | ⏸️ EXTERNAL (ต้องดู Supabase dashboard) |
| RV-06 | `src/package.json` stray | ⏸️ EXTERNAL |
| RV-07 | Production deployed SHA | ⏸️ EXTERNAL (CF dashboard) |

---

## 7. CONTRADICTIONS ที่ถูกแก้ทั้งหมด (ทั้งหมด 19 ข้อ — แก้ใน canonical inventory นี้แล้ว ยังไม่แตะเอกสารต้นทาง)

| # | จุดขัดแย้งในเอกสาร Phase 9 | หลักฐานที่ตรวจ (27 ก.ย. 2026) | การแก้ (canonical) |
|---|---------------------------|-------------------------------|---------------------|
| 1 | Section 26 + 26A เขียน `lib/experience/TowerStateEngine` | glob/grep: ไม่มีไฟล์/สตริงนี้ใน src/ | เป็น typo ของ `TwinStateEngine` (ตรงกับ LG-01 / Section 8 #2) |
| 2 | Section 14 + 20 + RV-02 ว่า metrics.ts "ACTIVE / มี callers" | grep src/: **zero** caller ของ `/api/metrics`; มีแค่ loadtests/ | → ORPHAN-UNPROVEN (ตามที่ Section 7.6 แก้ไว้ถูกต้องแล้ว) |
| 3 | Section 14/20/RV-03 ว่า autonomy-log "ACTIVE" | `useChat.ts:160` → consumer เดียวคือ ChatWindow.tsx ซึ่ง **ไม่มีใคร import** (grep ยืนยัน) → chain ขาด | → ORPHAN-UNPROVEN; useChat เอง = VERIFIED DEAD เชิง transitive |
| 4 | Section 14 "Resolved" ว่า account-delete/recovery, auth-rate-limit, daily-brief, send-push, memory-manager, pattern-detect "handled ที่อื่น" | Section 7.8 + "Critical finding" | ทั้งสองฝั่งถูกคนละมุม: **ฟังก์ชันเทียบเท่า**อยู่ฝั่ง client/CF แต่ **ตัวไฟล์ edge function เอง**ยัง zero invocation channel → คง ORPHAN-UNPROVEN |
| 5 | Section 14 ว่า "data-export … may have been removed" | glob: `supabase/functions/data-export/index.ts` **มีอยู่จริง** | แก้: ไฟล์มีอยู่, สถานะ ORPHAN-UNPROVEN (zero invocation channel) |
| 6 | OP-02 "file not found on disk" | `src/hooks/useDecisionCache.ts` มีอยู่จริง (148 บรรทัด) | แก้: ไฟล์มีอยู่ + zero importers → VERIFIED DEAD (E1) |
| 7 | DP-03/Section 26 ว่า twinVisualDNA ×2 vs Section 9/26A ว่า ×3 | 3 ไฟล์มีจริง + consumer F3 ยืนยัน | canonical = **×3 (F1/F2/F3)** ทุกตำแหน่ง |
| 8 | 26/26A "confirmed runtime bug — silent type errors" ของ PCB | E1: collision จริง (key เดียว 2 shapes, 13 sites ยืนยัน); แต่ (ก) อาการ runtime ไม่เคย reproduce (E5), (ข) กลไกที่เอกสารอ้าง (`sourceCount===0` → null) ขัดกับตัวเอง (`undefined === 0` เป็น false) | ลดระดับเป็น: "cache-shape collision — E1-proven, runtime impact E5-unproven" |
| 9 | "19 confirmed dead" แต่ DC-19 = UNPROVEN | นับใหม่ | dead ในช่วง DC-01..19 จริง ๆ = 17 (DC-13 → DISCONTINUED, DC-19 → ORPHAN) |
| 10 | DC-39 กับ DC-58 เป็น artifact เดียวกัน (DecisionIntelligence) | ตารางเดียวกัน | merge เป็น DC-39 (canonical) |
| 11 | OP-01..04 ถูกใช้ซ้ำ 2 ชุด (Section 1 vs Section 5) | เทียบตาราง | Section 5 → renumber **OP-05, OP-06, OP-07** |
| 12 | DC-57 วางผิดตาราง "Dead Lib/Utilities" ทั้งที่ไม่ใช่ dead | M4/Annex B | ย้ายไป DUPLICATE CANDIDATE (SC-06) |
| 13 | Dead Services 14 กับ Test-Only 10 นับซ้ำกัน 5 รายการ (ConversationAnalyzer, InputValidation, SecurityService, DeliveryVerification, NotificationAnalytics — M6 ระบุ 0 tests เอง) | ตาราง M6 | 5 รายการนั้น = VERIFIED DEAD; TEST-ONLY จริง = 9 (SentimentAnalyzer, QualityMetricsService, FeedbackService, ContinuousImprovementService, FollowUpScheduler, TwinAvatar, JsonLdSchemas, VisualStateEngine, worldRecommender) |
| 14 | "88 subpath imports" (§15) vs "~32 files" (L1) | grep 27 ก.ย. | canonical: **80 import statements / 39 ไฟล์ (31 prod + 8 test)** |
| 15 | F1 "10 Active Consumers" แต่ลิสต์ 11 ชื่อ | grep consumer จริง | canonical: live runtime consumers = **9** (LandingPage, Onboarding, Dashboard, TwinProfilePage, TwinProfileDetailPage, WorldEnvironment, TwinDNAAvatar, SVGCore, LivingDiagram) + type-only 2 (AnalysisEngine, twinStore) + dead-chain refs 2 (twinBirthFlow, dnaPersistence) + test 1 |
| 16 | Section 25 ว่า useSoundscape dead vs AA-1 ว่ามี UI consumers | grep | `useSoundscape.ts` **zero importers → DEAD ถูกต้อง**; ส่วน `useSoundscapeAudioLoader` มี consumer (SoundscapePlayer.tsx:26) — AA-1 อ้างผิดตัว |
| 17 | DC-50 อ้าง "dead ConfidenceIndicator usage" | grep: ConfidenceIndicator ถูก import โดย AnalysisPage:28, ExecutiveSummary:30, IntelligencePanel:23 | เหตุผลผิด แต่ CSS เอง zero-ref → ยังคง VERIFIED DEAD ด้วยหลักฐานใหม่ |
| 18 | Section 26 "Orphan CF Functions \| 8" แต่ลิสต์ได้ 5 | นับใหม่ | canonical: CF orphan (route-level) = 6 (nova-stream, metrics, autonomy-log, notifications module, twin-evolution, sice module) + 2 orphan utilities (prompt-builder, safety — จัด VERIFIED DEAD) |
| 19 | หัวข้อ `## 7.7` ซ้ำ 2 บล็อก + ย่อหน้า 7.2–7.5 ซ้ำ 2 รอบ + Section 25 ลำดับ 9./10. ซ้ำ + เลข KB เก่า (~87 KB) | อ่านเอกสาร | เสนอแก้ (ดู Section 9) |

---

## 8. รายการที่ "ยังไม่ควรแตะ" ใน Phase 10

### ก) ห้ามแตะจนกว่า architecture gate จะปลด (CLAUDE.md:92 / การตัดสินใจเชิงสถาปัตยกรรม)
1. `lib/intelligence/*` ทั้งเลเยอร์ + `services/sice/engines/*` — dual-layer ตามคำสั่ง no-delete (DP-01, SC-02)
2. TwinStateEngine ×3 — ห้าม merge/rename ก่อน decision (DP-02, SC-03)
3. TwinVisualDNA F1/F2/F3 — ห้ามลบ F3 หรือรวมฉบับ ก่อน architecture review (DP-03)
4. PersonalContextBuilder ×13 sites + การแก้ cache key — **ต้องมี runtime reproduction (E5) ก่อนแตะ** (SC-06)
5. TwinBirth dead chain (DC-16/17/18 + useChat/ChatWindow) — ต้องตัดสินใจ SC-05 (wire หรือลบ) ก่อน
6. `/core-awakening` ↔ `/twin-birth` consolidation (SC-01) — ทั้งสอง route ยังใช้งานจริง

### ข) ห้ามแตะก่อนได้หลักฐาน E5 / external
7. `/api/metrics` + `/api/autonomy-log` — zero in-app caller แต่ **ปฏิเสธ external caller ไม่ได้**; ต้องยืนยันที่ runtime ก่อนพิจารณาลบ (RV-02/03 แก้ใหม่)
8. SFXProvider / sfx hooks trio — รอ RV-01
9. Supabase Edge Functions orphan 8 ตัว — รอ RV-05 (dashboard) ก่อนพิจารณาลบ
10. External webhook targets (นอกจาก Stripe) — รอ RV-04
11. `src/package.json` — รอ RV-06
12. Production deployed SHA — รอ RV-07 (CF dashboard)

### ค) รายการ "removal candidates" ทั้งชุด — ห้าม execute จนกว่า human review อนุมัติ
13. ทั้ง 68 VERIFIED DEAD และ 9 TEST-ONLY ข้างต้น: ทุกรายการเป็น **candidate เท่านั้น** — Phase 9 ปิดแบบไม่ execute ตามขอบเขตเดิม (Section 25 ของเอกสารเดิมยังคงเป็น "NOT YET EXECUTED")

---

## 9. ข้อเสนอแก้ไขเอกสาร Phase 9 (DEFERRED — ยังไม่ได้แก้ รออนุมัติ)

รายการแก้ไข in-place ต่อ `FORENSIC_PHASE_09_DEAD_ORPHAN_LEGACY_DUPLICATION_TH.md` ที่**พิสูจน์แล้วว่าผิด/ขัดกันเอง** แต่**ยังไม่ถูก Apply** ตามคำสั่งผู้ใช้ ("ยังไม่ได้ให้ซ่อม"):

1. §26 + §26A: `TowerStateEngine` → `TwinStateEngine` (2 จุด)
2. §14 ตาราง "Resolved": แถว metrics/autonomy-log + ย่อหน้า "Critical correction" — แก้เป็น ORPHAN (สอดคล้อง §7.6 ที่ถูกแล้ว)
3. §20 ตาราง Reclassified: แถว metrics/autonomy-log 🟢 → ⚪ ORPHAN-UNPROVEN
4. §23: RV-02/RV-03 แก้คำ "E1 proven (has callers)" → "E1: zero production callers; loadtest/e2e only"
5. §14 แถว data-export: "NOT found — may have been removed" → "ไฟล์มีอยู่จริงที่ supabase/functions/data-export/ (zero invocation channels)"
6. §26 ตารางนับ: แก้เลข canonical ตามรายงานนี้ (68 dead ฯลฯ), แก้ "8 → ลิสต์ 5" ของ Orphan CF Functions
7. DP-03: ×2 → ×3 (F1/F2/F3); §26 "Intentional Duplicates" TwinVisualDNA ×2 → ×3
8. OP-02: แก้ evidence ("file not found" → "ไฟล์มีอยู่, zero importers → DEAD") + renumber OP ของ Section 5 → OP-05..07
9. DC-58 ลบ/merge เข้า DC-39; DC-57 ย้ายออกจากตาราง dead
10. §15 "88 subpath imports" → 80 imports / 39 ไฟล์; L1 "~32 files" → 31 production files
11. F1 consumer count "10" → canonical 9 + type-only 2 + dead-chain 2 + test 1
12. §10A/M4/§26: ลดระดับ "confirmed runtime bug" → "E1 collision, E5 unproven"
13. โครงสร้าง: รวมหัวข้อ 7.7 ซ้ำ → 7.8, ลบย่อหน้า 7.2–7.5 ซ้ำ, แก้ลำดับเลข Section 25, อัปเดตหมายเหตุขนาดไฟล์

---

## 10. วิธีการและขอบเขตการตรวจ (สำหรับผู้ทบทวน)

- **Re-verify แบบ targeted** เฉพาะจุดที่เอกสารขัดแย้งกันเอง: metrics/autonomy-log (grep callers), useDecisionCache (glob+grep), PCB (grep 13 sites + อ่าน TwinPersonalityPage.tsx:100-179 / AnalysisPage.tsx:175-219), TwinVisualDNA F1-F3 (glob + grep consumers), TowerStateEngine (glob/grep = ไม่มี), lib/intelligence import count (81 matches → 80 imports / 39 ไฟล์), useSoundscape (zero importers), ConfidenceIndicator (live), CSS 9 ไฟล์ (zero import refs), supabase/functions (13 ไฟล์ ครบ รวม data-export), git status (เอกสาร forensic ทั้งชุดยัง untracked, ไม่มีอะไรถูกแตะ)
- **ไม่ได้** re-verify รายการที่ไม่ขัดแย้ง (เช่น DC-01..17 รายตัว) — คงสถานะ E1 ตามที่เอกสารสรุปไว้
- **ไม่มีการเพิ่ม finding ใหม่จากการคาดเดา** — ทุกการแก้มีหลักฐาน grep/glob ณ วันที่ 27 ก.ย. 2026 รองรับ
- ข้อจำกัดเดิมคงอยู่: ไม่มี E5 (runtime) evidence — สอดคล้อง Phase 5/8

---

🛑 **STOP — RECONCILIATION COMPLETE. รอ human review ก่อนดำเนินการใด ๆ ต่อ (การ apply ข้อเสนอแก้ไข §9 ลงเอกสาร Phase 9 และ/หรือ Phase 10)**

# PHASE 10 — REMEDIATION PLAN (TH)

**สถานะ: PLANNING ONLY — ห้าม Execute Remediation**

**วันที่:** 27 กันยายน 2026
**Repository:** `duriankab-dot/selfprint-v3-react` · Branch: `master`
**Canonical source of truth:** `docs/FORENSIC_PHASE_09_RECONCILIATION_REPORT_TH.md` (27 ก.ย. 2026) — canonical buckets: VERIFIED DEAD **68 artifacts/finding IDs** (ไม่ใช่ 68 physical files), VERIFIED ACTIVE 25 groups, LEGACY ACTIVE 9, ORPHAN-UNPROVEN 20, TEST-ONLY 9, DISCONTINUED 1 cluster, DUPLICATE CANDIDATE 10 groups, contradictions reconciled 19, external pending RV-01/04/05/06/07 (RV-02/03 = E1-corrected, awaiting E5)

**ขอบเขตรอบนี้:** จัดลำดับและออกแบบ remediation plan จาก evidence ที่มีอยู่แล้วเท่านั้น — **ไม่ลงมือแก้ code/test/DB/config/deployment, ไม่ลบไฟล์, ไม่ rename/move, ไม่ merge, ไม่ refactor, ไม่ execute migration/script, ไม่ commit/push/PR**

**ข้อห้ามสำคัญ:** การอยู่ใน VERIFIED DEAD **ไม่** หมายถึงอนุญาตให้ลบทันที — ทุกรายการต้องผ่าน Gate ของแถวนั้นก่อน ห้ามเปิด full re-audit / broad grep ใหม่ ห้ามเปลี่ยน classification ของ Phase 9 หากพบ contradiction ใหม่จริง ให้บันทึกเป็น UNRESOLVED OBSERVATION แล้ว STOP จุดนั้น

---

## 1. REMEDIATION MATRIX (ตารางเต็ม)

Classification ใช้เฉพาะ: DOC-ONLY / SAFE-REMOVAL-CANDIDATE / TRANSITIVE-DEAD-CHAIN / RUNTIME-VERIFICATION / EXTERNAL-VERIFICATION / ARCHITECTURE-DECISION / TEST-ONLY-CANDIDATE / DISCONTINUED / DEFERRED

| ID | Candidate | Classification | Evidence | Risk | Dependency | Action | Gate | Priority |
|----|-----------|----------------|----------|------|-----------|--------|------|----------|
| DOC-01 | `TowerStateEngine` → `TwinStateEngine` (§26, §26A ของ Phase 9 doc) | DOC-ONLY | glob/grep 27 ก.ย.: ไม่มีไฟล์/สตริง TowerStateEngine ใน src/ | ไม่มี (เอกสาร) | ไม่มี | แก้คำ 2 จุด | NONE (DOC-ONLY) | P3 |
| DOC-02 | §14 ตาราง "Resolved" + "Critical correction": metrics/autonomy-log → ORPHAN | DOC-ONLY | grep 27 ก.ย.: zero src callers / chain severed | ไม่กระทบ runtime | ไม่มี | แก้ถ้อยคำให้สอดคล้อง §7.6 | NONE / DOC-ONLY | P3 |
| DOC-03 | §20 แถว metrics/autonomy-log: 🟢 → ⚪ ORPHAN-UNPROVEN | DOC-ONLY | เดียวกับ DOC-02 | ไม่มี | ไม่มี | แก้สถานะในตาราง | NONE / DOC-ONLY | P3 |
| DOC-04 | §23 RV-02/RV-03 wording: "E1 proven (has callers)" → "E1: zero production callers; loadtest/e2e only — awaiting E5" | DOC-ONLY | grep 27 ก.ย. | ไม่มี | ไม่มี | แก้ถ้อยคำ | NONE / DOC-ONLY | P3 |
| DOC-05 | §14 แถว data-export: "may have been removed" → "ไฟล์มีอยู่ (supabase/functions/data-export/, zero invocation channels)" | DOC-ONLY | glob 27 ก.ย. | ไม่มี | ไม่มี | แก้ถ้อยคำ | NONE / DOC-ONLY | P3 |
| DOC-06 | §26 ตารางนับ → canonical (68 dead ฯลฯ, Orphan CF 6 route-level) | DOC-ONLY | นับใหม่จาก reconciliation | ไม่มี | ไม่มี | แก้ตัวเลข | NONE / DOC-ONLY | P3 |
| DOC-07 | DP-03 + §26: twinVisualDNA ×2 → ×3 (F1/F2/F3) | DOC-ONLY | 3 ไฟล์มีจริง + F3 consumer CoreAwakeningService.ts:14,427 | ไม่มี | ไม่มี | แก้ตัวเลข | NONE / DOC-ONLY | P3 |
| DOC-08 | OP-02 evidence ("file not found" → "ไฟล์มีอยู่, zero importers → DEAD") + renumber Section-5 OP → OP-05..07 | DOC-ONLY | read `src/hooks/useDecisionCache.ts` (148 ln) | ไม่มี | ไม่มี | แก้ evidence + ID | NONE / DOC-ONLY | P3 |
| DOC-09 | DC-58 merge เข้า DC-39; ย้าย DC-57 ออกจากตาราง dead | DOC-ONLY | ตาราง Phase 9 เอง | ไม่มี | ไม่มี | แก้ตาราง | NONE / DOC-ONLY | P3 |
| DOC-10 | §15/L1: "88 imports / ~32 files" → "80 imports / 39 ไฟล์ (31 prod + 8 test)" | DOC-ONLY | grep 27 ก.ย. | ไม่มี | ไม่มี | แก้ตัวเลข | NONE / DOC-ONLY | P3 |
| DOC-11 | §9 F1 consumer count "10" → 9 live + 2 type-only + 2 dead-chain + 1 test | DOC-ONLY | grep consumers | ไม่มี | ไม่มี | แก้ตัวเลข | NONE / DOC-ONLY | P3 |
| DOC-12 | §10A/M4/§26: "confirmed runtime bug" → "E1-proven cache-shape collision; E5 runtime impact unproven" | DOC-ONLY | source: TwinPersonalityPage.tsx:116-166, AnalysisPage.tsx:202 | ป้องกันการตีความผิดว่า bug ยืนยันแล้ว | ไม่มี | แก้ถ้อยคำ evidence-level | NONE / DOC-ONLY | P3 |
| DOC-13 | โครงสร้าง: หัวข้อ 7.7 ซ้ำ → 7.8, ลบย่อหน้า 7.2–7.5 ซ้ำ, เลข Section 25, ขนาดไฟล์เก่า | DOC-ONLY | อ่านเอกสาร | ไม่มี | ไม่มี | แก้โครงสร้างเอกสาร | NONE / DOC-ONLY | P3 |
| B1-01..B1-59 | Isolated dead artifacts — 59 รายการ: hooks DC-01..06, DC-18, useSoundscape; components DC-21..25, 27, 28; services DC-31..39; lib DC-41..47; CSS DC-48..56 (9); barrels 9 ชุด | SAFE-REMOVAL-CANDIDATE | zero consumers ทุกรายการ (E1, Phase 9 + re-verify 27 ก.ย.) | ต่ำ (แต่ต้องผ่าน gate) | barrel-export lines ที่เกี่ยว (DC-07/DC-08/DC-09) | ลบเป็นชุดพร้อม build+test verification | HUMAN-APPROVAL + TEST-VERIFICATION + BUILD-VERIFICATION | P2 |
| B1-60 | OP-02 `useDecisionCache.ts` (148 ln) | SAFE-REMOVAL-CANDIDATE | zero importers ทุก export (grep 27 ก.ย.) | ต่ำ | ไม่มี | ลบพร้อมชุด B1 | HUMAN-APPROVAL + TEST-VERIFICATION | P2 |
| B2-01 | Transitive chain: `useChat.ts` → `ChatWindow.tsx` (→ /api/autonomy-log) | TRANSITIVE-DEAD-CHAIN | useChat.ts:160; ChatWindow zero importers (grep 27 ก.ย.) | ปานกลาง — ผูกกับ RV-03 | ต้องตัดสินใจร่วมกับ autonomy-log fate | ลบเป็น chain หรือคงไว้รอ RV | HUMAN-APPROVAL + TEST-VERIFICATION (+ รอ RV-02/03 สรุป) | P2 |
| B2-02 | TwinBirth dead chain: `useTwinBirth.ts` + `twinBirthFlow.ts` + `dnaPersistence.ts` (DC-16/17/18) | TRANSITIVE-DEAD-CHAIN | consumer chain dead ทั้งสาย (E1) | กลาง — SC-05 ระบุ "wire หรือลบ" ยังไม่ตัดสิน | SC-05 / E5 gate | wire หรือ remove — ต้องมี decision ก่อน | ARCHITECTURE-DECISION + HUMAN-APPROVAL | P2 |
| B2-02 | Journal queue chain: `useJournalQueue.ts` + `journalQueueDB.ts` + `/journal-sync` call | TRANSITIVE-DEAD-CHAIN | M5/M9; hook zero consumers (grep) | ต่ำ-กลาง (มี DB/storage lib ร่วม) | ไม่มี external | ลบเป็น chain | HUMAN-APPROVAL + TEST-VERIFICATION | P2 |
| B2-03 | `og.ts` caller context — ไม่ลบ (LEGACY ACTIVE, test-verified) | RUNTIME-VERIFICATION | smoke.spec.ts:124 | ต่ำ | — | รอผู้กำหนด (มี e2e อ้าง) | TEST-VERIFICATION ก่อนแตะ | DEFERRED |
| B3-01 | Multi-file: DC-11 `WorldRoutingService.ts` + `WorldContextAdapter.ts` (2 ไฟล์/1 finding) | SAFE-REMOVAL-CANDIDATE | zero production callers | ต่ำ — ต้องลบคู่พร้อมกัน | — | ลบพร้อมกัน | HUMAN-APPROVAL + TEST-VERIFICATION | P2 |
| B3-02 | useDecisionCache.ts (148 ln, 1 ไฟล์เดียว) | SAFE-REMOVAL-CANDIDATE | zero importers (grep 27 ก.ย.) | ต่ำ | — | ลบไฟล์เดียว | HUMAN-APPROVAL + TEST-VERIFICATION | P2 |
| B3-03 | CF utilities: `api/_utils/prompt-builder.ts` + `api/_utils/safety.ts` | SAFE-REMOVAL-CANDIDATE | zero importers; safety อ้างโดย coach.ts ที่ถูกลบ | ต่ำ | — | ลบ | HUMAN-APPROVAL + BUILD-VERIFICATION | P2 |
| O-01..O-20 | ORPHAN-UNPROVEN 20 รายการ (ตาราง §3 ของ Reconciliation Report) | RUNTIME-VERIFICATION / EXTERNAL-VERIFICATION | ดูตาราง §3 + Section 4 ด้านล่าง | พิสูจน์ไม่ครบ | RV-01/04/05/06/07 | ห้ามแตะก่อน gate | RUNTIME-EVIDENCE หรือ EXTERNAL-EVIDENCE | P1–P2 |
| T-01..T-09 | TEST-ONLY 9 รายการ (Section 3 ด้านล่าง) | TEST-ONLY-CANDIDATE | M6/DC-29/30/60, M2, M3 | ต่ำ | test suites | พิจารณา retention/relocation | HUMAN-APPROVAL + TEST-VERIFICATION | P4 |
| L-01..L-09 | LEGACY ACTIVE 9 รายการ | ดู Section 5 | ดู Section 5 | ต่ำ-กลาง | แต่ละรายการ | ห้ามเปลี่ยน behavior รอบนี้ | HUMAN-APPROVAL (แยกรายการ) | P2–P3 |
| D-01 | `/api/coach` cluster | DISCONTINUED | backend ลบ (d6624af), flag=0, widget null | ไม่มี runtime risk | — | doc cleanup เท่านั้น | NONE / DOC-ONLY | P3 |
| E1–E5 | Architecture gates (SICE, TSE, TVD, PCB, TwinBirth) | ARCHITECTURE-DECISION | ดู Section 4 | — | — | จัดคิว decision ให้ human | ARCHITECTURE-DECISION + HUMAN-APPROVAL | P1 |
| RV-01..07 | External/runtime verification (ดู Section 6) | RUNTIME/EXTERNAL-VERIFICATION | RV table | — | — | ตรวจ ไม่แก้ | EXTERNAL-EVIDENCE / RUNTIME-EVIDENCE | P1–P2 |
| DEF-01.. | รายการใด ๆ ที่ evidence ไม่พอ | DEFERRED | — | — | — | ไม่ดำเนินการ | DEFERRED | — |

---

## 2. กลุ่ม B — VERIFIED DEAD 68 รายการ แบ่งเป็นชุด remediation (ยังไม่ execute)

### B1 — Isolated dead artifacts (62)
ครอบคลุม: hooks (DC-01..06, DC-18, useSoundscape, DC-59 export), dead components DC-21..25 (5), dead services DC-31..39 (9), lib/constants DC-41..47 (7), CF utils 2, CSS 9, component barrels 9 + sfx barrel, OP-02 useDecisionCache, และ artifacts เดี่ยวอื่น ๆ ตามรายการ Section 1 ของ Reconciliation Report (รายชื่อครบ 68 อยู่ที่นั่น — เอกสารนี้ไม่ทำซ้ำทั้งตาราง)
- consumer evidence: zero importers/callers (E1, ตรวจแล้วใน Phase 9 + re-verify เฉพาะจุด 27 ก.ย.)
- dependency risk: ต่ำเชิงกลไก แต่ **barrel-export lines และ CSS ที่ผูกกับ component ต้องลบพร้อมกัน** เพื่อไม่ให้ build พัง
- mechanically safe: ส่วนใหญ่ใช่ (แยกไฟล์, zero importers) — ยกเว้นที่อยู่ใน chain (ย้ายไป B2)
- verification ที่ต้องมี: typecheck + build + test suite หลังแต่ละชุด (gate TEST-VERIFICATION + BUILD-VERIFICATION)
- human architecture approval: **ไม่จำเป็นสำหรับ B1** (isolated) แต่ **ต้องมี HUMAN-APPROVAL ทุกชุด** ตามหลัก "VERIFIED DEAD ≠ ลบได้ทันที"

### B2 — Transitive dead chains (6 artifacts)
1. `useChat.ts` → `ChatWindow.tsx` (consumer เดียวกันของกัน) — ห้ามลบแยกชิ้น; ต้องตัดสินความเชื่อมโยงกับ `/api/autonomy-log` (อยู่ใน RV-02/03 gate) ก่อน
2. `useJournalQueue.ts` + `journalQueueDB.ts` + `/journal-sync` call — ลบเป็น chain เดียว
3. `useTwinBirth.ts` + `twinBirthFlow.ts` + `dnaPersistence.ts` — **ผูกกับ E5 (wire/consolidate/retire)** ห้ามลบก่อน decision
4. `ChatWindow.tsx` (DC-20) — อยู่ใน chain เดียวกับ useChat

### B3 — Multi-file artifacts (ธงระวัง ไม่นับเพิ่ม)
- DC-11 (2 ไฟล์: WorldRoutingService + WorldContextAdapter) — ลบพร้อมกัน
- journal chain (2 ไฟล์ + endpoint call)
- barrel แต่ละตัวพ่วง export lines ของ artifact อื่น (เช่น features/index.ts อ้าง HubSwitcher) — ลบ barrel พร้อมตรวจ import lines
- ทั้งหมดถูกนับอยู่ใน 68 แล้ว — **ไม่นับซ้ำ**

**ทุกกลุ่ม B: ห้าม execute removal ในรอบนี้ — ผลลัพธ์คือแผน + เงื่อนไขเท่านั้น**

---

## 3. กลุ่ม C — TEST-ONLY (9 รายการ — ห้ามนับซ้ำเป็น DEAD)

| # | รายการ | Prod caller | Test caller | วัตถุประสงค์ | Retention | Prerequisite ก่อนลบ |
|---|--------|-------------|-------------|--------------|-----------|---------------------|
| 1 | SentimentAnalyzer | none | 1 test | sentiment util | unclear — ดูเหมือน feature ที่วางแผนไว้แต่ไม่ wire | HUMAN-APPROVAL + ตัดสิน "retire หรือ wire" |
| 2 | QualityMetricsService | none | 1 test | วัดคุณภาพ | unclear | เช่นเดียวกัน |
| 3 | FeedbackService | none | 1 test | feedback loop | unclear (อาจเกี่ยว AIFeedbackLoop concept) | เช่นเดียวกัน |
| 4 | ContinuousImprovementService | none | 1 test | improvement pipeline | unclear | เช่นเดียวกัน |
| 5 | FollowUpScheduler | none | 3 tests | ตัวตามที่ AA-2 ระบุ (ชื่อฟังก์ชันชนกับ cluster) | likely intentional placeholder | ตัดสินร่วมกับ E-gate (AA-2 name collision) |
| 6 | TwinAvatar.tsx | none | 1 test consumer | avatar component | test fixture | ตัดสินใน Phase ถัดไป |
| 7 | JsonLdSchemas.tsx | none | test-only (ยืนยัน 27 ก.ย.) | SEO schema | unclear — SEO requirement (AEO/GEO) อาจต้องการในอนาคต | ปรึกษาเจ้าของ SEO spec ก่อนลบ |
| 8 | VisualStateEngine.ts | none | test-only (M3) | adaptive visuals (claim "single source of truth" = false) | unclear | รวมการตัดสินกับ E2/experience domain |
| 9 | worldRecommender.ts | none | test-only (M2) | world matching lib | unclear — useWorldRecommendation (live) อาจดึง logic คืน | เก็บจนกว่า M2 consolidation decision |

ห้ามนับ 9 รายการนี้ซ้ำเป็น VERIFIED DEAD (คงจำนวน 68 ตามเดิม)

---

## 4. กลุ่ม E — ARCHITECTURE DECISION GATES (ห้าม refactor ในรอบนี้)

### E1 — Dual-layer SICE (P1)
- Evidence: ~20 lib classes ↔ 16 sice engines, SICEBridge เชื่อม 2 engines; CLAUDE.md:92 "ห้ามลบฝั่งไหนทิ้งเพราะคิว่าซ้ำ"
- Risk: drift 9 ชื่อ engine (HIGH, E1)
- Decision ที่ต้องขอ: ยืนยัน dual-layer เป็น permanent architecture หรือกำหนด convergence path รอบหลัง
- ห้าม merge

### E2 — TwinStateEngine ×3 (P1)
- #1 lib/intelligence (knowledge ladder), #2 lib/experience (visual posture — EnvironmentEngine.ts:41), #3 sice/engines (DB maturity)
- Decision: คงชื่อเดิม / rename ฝั่งใด / รวม #1+#3 — ต้องมี architecture decision เป็นลายลักษณ์อักษร
- ห้าม rename/merge

### E3 — TwinVisualDNA ×3 (P1)
- F1 `lib/twinVisualDNA.ts` (per-user PRNG), F2 `lib/twin/twinVisualDNA.ts` (archetype lookup), F3 `services/VisualDNAService.ts` (birth-ceremony persisted)
- ทั้งหมด VERIFIED ACTIVE — ห้ามลบ F3, ห้ามรวม
- Decision ที่ต้องได้: ยืนยัน "ทั้งสามตัวจำเป็น" หรือมีแผน consolidate ระยะยาว

### E4 — PersonalContextBuilder (P1)
- สถานะ canonical: **E1-proven cache-shape collision; E5 runtime impact unproven** (ห้ามเขียนว่า "confirmed runtime bug")
- บันทึก: lib version + SICE version, 13 creation sites, cache-key `['personalContext', userId]` ถูกแชร์กับ `PersonalityMetrics` shape (TwinPersonalityPage.tsx:116-166)
- ขั้นตอนแนะนำลำดับ: (1) ทำ runtime reproduction script (แต่ยังไม่รันในรอบนี้) → (2) E5 evidence → (3) HUMAN-APPROVAL → (4) แก้ key
- ห้ามแก้ cache key ในรอบนี้

### E5 — Twin Birth (P1)
- ประเด็น: CoreAwakening (517 ln) ↔ TwinBirthPage (317 ln), สอง route, recovery path เก่า, dead chain (useTwinBirth/twinBirthFlow/dnaPersistence)
- ตัวเลือกที่ต้องให้ human เลือก: **wire / consolidate / retire** — plan นี้ไม่เลือกแทน
- ห้ามแตะทั้งสองหน้าและ recovery route

---

## 5. กลุ่ม F — LEGACY ACTIVE (9 — ห้ามเปลี่ยน behavior)

| # | รายการ | Behavior ปัจจุบัน | ทำไม legacy | ถูกพึ่งพาภายนอก? | Future action (แนะนำ) | Prerequisite |
|---|--------|-------------------|-------------|--------------------|------------------------|--------------|
| 1 | TWIN_BIRTH flag | define แล้วไม่มีใครอ่าน; route unconditional | ไม่ได้ผูกกับ route | ไม่ | wire flag เข้า route หรือลบ flag | ARCH-DECISION (ผูกกับ E5) |
| 2 | lib/intelligence/index.ts stale banner | barrel ไม่ถูก import แต่ folder ใช้จริง (80 imports/39 ไฟล์) | claim เท็จ | ไม่ | แก้ wording เป็น "barrel unused, submodules active" | DOC-ONLY, human approval |
| 3 | `/core-awakening` ลงทะเบียนซ้ำ | harmless แต่ซ้ำ | legacy naming | ไม่ (ภายใน) | ลบ registration ซ้ำ | HUMAN-APPROVAL (ผูก E5) |
| 4 | recovery path → `/core-awakening` | ชี้ path เก่า | naming inconsistency | ไม่ | เปลี่ยนเป้าไป `/twin-birth` | ผูก E5 |
| 5 | og.ts | ทำงาน, e2e เรียก, ไม่มี in-app consumer | ถูกแทนด้วย static JPG | e2e test พึ่งพา | ถนอมจนกว่า e2e จะเปลี่ยน | TEST-VERIFICATION |
| 6 | auth-registration-options | wired แต่ UI ไม่ถึง | ผู้ใช้เพิ่ม passkey ไม่ได้จาก UI | อาจมี external caller ทาง Supabase | ตัดสิน "เปิด UI หรือลบ" | EXTERNAL-EVIDENCE (RV-05) + ARCH |
| 7 | auth-register-passkey | เช่นเดียวกัน | เช่นเดียวกัน | เช่นเดียวกัน | เช่นเดียวกัน | เช่นเดียวกัน |
| 8 | ExperienceProvider unused output | mount ทุก session, query PCB ทุกครั้ง, output ไม่มีใครอ่าน | legacy design | ไม่ (แต่กระทบ perf เล็กน้อย) | ประเมินถอดหรือ consume | ARCH-DECISION |
| 9 | run-migrations.cjs (v1) | manual CLI, flag `--file` undocumented — พังถ้ารัน | unsafe | ไม่ (ไม่มี CI) | ใส่ deprecation warning ในไฟล์ / ลบ | HUMAN-APPROVAL (data-integrity conditional) |

---

## 6. กลุ่ม D — RUNTIME / EXTERNAL VERIFICATION GATES (ห้ามแก้ในรอบนี้)

| Gate | สิ่งที่ต้องยืนยัน | วิธีตรวจ (ภายหลัง) | ขึ้นอยู่กับ |
|------|-------------------|---------------------|-------------|
| RV-01 | SFXProvider render tree + sfx hooks + audio chain | runtime DOM inspection / staging | ก่อนพิจารณาแตะ audio cluster |
| RV-02 | `/api/metrics` — external caller มีหรือไม่ | CF dashboard logs / external config | ก่อนพิจารณาลบ function |
| RV-03 | `/api/autonomy-log` — เช่นเดียวกัน | เช่นเดียวกัน | เช่นเดียวกัน |
| RV-04 | External webhooks นอกจาก Stripe | external configuration review | ก่อนลบ endpoints ใด ๆ |
| RV-05 | Supabase Edge Functions: triggers, cron, webhooks, invocation history, bindings, scheduled jobs | Supabase dashboard | ก่อนแตะ 8 orphan functions |
| RV-06 | `src/package.json` — build/runtime tooling อ่านหรือไม่ | build pipeline review | ก่อนลบไฟล์ |
| RV-07 | Production deployed SHA | CF Pages dashboard | **ต้องรู้ก่อน removal ใด ๆ** (dead ใน repo ≠ dead ใน production ที่ deploy ค้าง) |

RV-02/RV-03 สถานะ canonical: **ORPHAN-UNPROVEN (E1: zero production caller; loadtest/e2e เท่านั้น) — ห้ามประกาศ DEAD จนกว่า external verification ปิด**

---

## 7. PRIORITY MODEL (ผลจัดจริง)

| ระดับ | รายการ | เหตุผล (evidence-based) |
|-------|--------|--------------------------|
| P0 | **ไม่มี** | ไม่พบ security/data-integrity risk ที่มี evidence แบบ active-breach; รายการใกล้เคียงที่สุด (migration v1 unsafe flag) เป็น conditional → P1 |
| P1 | RV-02/RV-03 verification, RV-04, RV-05, RV-07, PCB decision queue (E4), dual-layer drift decision (E1), TSE/TV naming decisions (E2/E3), TwinBirth decision (E5), migration v1 unsafe flag | runtime ambiguity / architecture / data-integrity-conditional ที่มี evidence จริง |
| P2 | 68 VERIFIED DEAD (แบ่งชุด B1/B2/B3) + 9 LEGACY ACTIVE ที่ตัดสินใจได้ | dead พิสูจน์แล้วแต่ต้องผ่าน HUMAN-APPROVAL + TEST/BUILD gate |
| P3 | DOC-ONLY 13 รายการ (ครอบคลุม 19 contradictions) + 1 DISCONTINUED doc cleanup | เอกสาร/ถ้อยคำ |
| P4 | TEST-ONLY 9 รายการ | optional cleanup |
| DEFERRED | ทุกอย่างที่ gate ยังไม่ปลด: 8 Supabase orphans (รอ RV-05), SFX chain (RV-01), src/package.json (RV-06), PCB fix (รอ E5), TwinBirth chain (รอ E5) | ไม่มี evidence พอ |

---

## 8. DEPENDENCY ORDER (ลำดับที่ต้องทำเมื่อได้รับอนุมัติ — ไม่ใช่สิ่งที่ทำวันนี้)

1. **RV-07 (production SHA) ก่อนทุก removal** — ต้องรู้ SHA ที่ deploy จริงก่อนสรุปว่า artifact ใดยังทำงานใน prod
2. **DOC-ONLY fixes** (แก้เอกสาร Phase 9 ตาม §9 ของ Reconciliation Report) — ทำได้อิสระ แต่ต้องได้อนุมัติ
3. **RV-02/03/04/05/06 external checks** — ขนานกันได้ ผลลัพธ์ปลดล็อก dead/preserve ของ metrics, autonomy-log, supabase functions, src/package.json
4. **RV-01** — ปลดล็อก sfx/SFXProvider/audio chain ก่อนแตะ B1 ที่เกี่ยว audio
5. **E1–E5 architecture decisions** — ต้องเสร็จก่อนแตะ SICE/TSE/TVD/PCB/CoreAwakening-TwinBirth
6. **B1 removal batches** (isolated) → แต่ละ batch: remove → typecheck → build → test → review
7. **B2 chains** หลังตัดสิน SC-05 (wire/retire) — ห้ามลบทีละไฟล์แบบแยกส่วน
8. **P4 TEST-ONLY** ทำท้ายสุด (หลัง dead removal เสร็จ เพื่อไม่สับสน test surface)

---

## 9. กลุ่ม A รายละเอียด — DOCUMENTATION ONLY (ห้ามแก้เอกสารจริงในรอบนี้)

ทั้งหมดชี้เป้าเดียว: `docs/FORENSIC_PHASE_09_DEAD_ORPHAN_LEGACY_DUPLICATION_TH.md` (รายละเอียด exact correction ทั้ง 13 ข้ออยู่ใน Reconciliation Report Section 9 — ใช้ตามนั้นเป็น spec) แต่ละรายการ: evidence พร้อมแล้ว (file:line/grep 27 ก.ย.), impact = ความถูกต้องของเอกสารเท่านั้น ไม่กระทบ runtime, **ทุกรายการต้องมี HUMAN-APPROVAL ก่อน apply** เพราะเป็นการแตะเอกสาร audit

---

## 10. EXPLICIT NON-GOALS (ยืนยัน)

Phase 10 รอบนี้:
- ❌ ไม่แก้ source code / test / DB / config / deployment
- ❌ ไม่ลบไฟล์ ไม่ rename/move ไม่ merge ไม่ refactor
- ❌ ไม่แตะ SICE architecture, TwinStateEngine, TwinVisualDNA, PersonalContextBuilder, CoreAwakening/TwinBirth, routing, API contract
- ❌ ไม่ execute migration, ไม่รัน remediation script
- ❌ ไม่ commit / push / สร้าง PR / สร้าง debug artifact
- ❌ ไม่แก้ Phase 9 source document (รายการ DOC-ONLY เป็นเพียง spec รออนุมัติ)
- ✅ สร้างเอกสารแผนเพียงไฟล์เดียว: `docs/PHASE_10_REMEDIATION_PLAN_TH.md`

---

🛑 **STOP — PHASE 10 PLANNING COMPLETE — AWAITING HUMAN REVIEW**

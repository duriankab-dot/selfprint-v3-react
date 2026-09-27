# SELFPRINT — Forensic Reconstruction & Full Product Audit (Execution Plan)

> แผนนี้คือ **spec สำหรับผู้ปฏิบัติงาน (implementation-capable agent)** ให้ทำการตรวจสอบ SELFPRINT ทั้ง repository แบบ Forensic + Product Reconstruction + Real User Audit ตามคำสั่งต้นทาง
> แผนนี้ *ไม่ใช่* ผลการตรวจสอบ เป็นเพียงแผนดำเนินการ + baseline ที่เก็บมาแล้วใน Plan Mode (read-only)

## 0. สถานะของแผนนี้ต่อข้อจำกัด Plan Mode

- session ปัจจุบันอยู่ใน **Plan Mode** → เขียนได้เฉพาะไฟล์ plan Markdown เท่านั้น
- จึง **ยังไม่สามารถสร้าง** `docs/FORENSIC_PHASE_00_BASELINE_TH.md` ได้จาก session นี้
- เมื่อผู้ใช้อนุมัติแผน ให้สลับไป agent ที่แก้ไฟล์ได้ แล้วเริ่มจาก **Phase 0 → เขียนเอกสาร → STOP** ตาม Breakpoint Policy
- Baseline ด้านล่างถูกเก็บด้วยคำสั่ง read-only (git/ls/read/grep) จริงแล้ว

## 1. เป้าหมาย / Non-goals

**เป้าหมาย:** ค้นหาความจริงของระบบจาก code, runtime, DB, API, storage, tests, deployment แล้วสร้างภาพใหม่ว่า SELFPRINT วันนี้คืออะไร ทำอะไรได้จริง ผู้ใช้อะไรได้จริง อะไรครบ/ผิด/หาย/พิสูจน์ไม่ได้

**Non-goals (ห้ามทำตลอด Phase 0–12):**
- ห้ามแก้ source/component/service/API/DB/migration/seed/test/E2E/config/env/deployment/CI
- ห้ามลบไฟล์, refactor, install dependency, เปลี่ยน product behavior/requirement/concept
- ห้าม commit/push
- ห้าม "พบปัญหา → แก้ → อ้างว่าผ่าน"
- ใช้ได้เฉพาะ read-only / non-mutating command
- **ตรวจ Bitemebaby: นอก scope โดยเด็ดขาด**

## 2. กฎเหล็กของงาน

- **Source-of-truth order:** Runtime > Actual Code > DB/API/Storage > Tests > Config/CI/Deploy > Docs
- ห้ามถือ docs เป็นหลักฐานว่า feature ทำงาน
- ห้ามเดาจากชื่อ (TwinService, WorldEngine ฯลฯ) — ต้อง trace ว่าเรียกจริง/ทำอะไรจริง/ใครใช้/ผลถูกใช้ไหม/ผู้ใช้เข้าถึงได้ไหม
- **Green tick rule:** ใช้ 🟢 ได้เฉพาะมี Evidence + File/Function + Runtime/Test evidence + วิธีตรวจ + วันที่/commit
- **Breakpoint policy:** จบแต่ละ Phase → สรุป → อัปเดต ledger → รายงาน → **STOP รอคำสั่ง** ห้ามข้าม/ทำต่อเอง
- ห้ามสรุป "PRODUCT COMPLETE" — แยก TEST / PRODUCT / USER / DOCUMENTATION complete ออกจากกัน

## 3. Status System (ใช้เหมือนกันทั้งโครงการ)

🟢 VERIFIED · 🟡 PARTIAL · 🟠 INCOMPLETE · 🔴 BROKEN · ⚪ UNPROVEN · ⚫ MISSING · 🔵 DOC-ONLY · 🟣 CODE-ONLY · 🟤 ORPHAN · ⏸️ DEFERRED

## 4. เอกสารกลาง (Ledger)

สร้าง/ใช้อัปเดต: `docs/FORENSIC_RECONSTRUCTION_LEDGER_TH.md`
ledger เป็นเพียง audit trail **ไม่ใช่หลักฐานว่าระบบทำงาน** — ห้ามแก้ source เพื่อให้ ledger เขียว

ฟิลด์ต่อ finding: `ID, หัวข้อ, ประเภท, สถานะ, สิ่งที่คาดหวัง, สิ่งที่พบ, หลักฐาน, ไฟล์, บรรทัด/ฟังก์ชัน, Runtime evidence, Test evidence, ข้อสรุป, สิ่งที่ยังไม่รู้`

---

## 5. PHASE 0 — BASELINE & REPOSITORY INTEGRITY

**Deliverable:** `docs/FORENSIC_PHASE_00_BASELINE_TH.md`

### 5.1 Baseline ที่เก็บมาแล้ว (read-only, 2026-09-27)

- **Repository root:** `D:/selfprint-v3-react`
- **Remote:** `origin https://github.com/duriankab-dot/selfprint-v3-react.git` (fetch/push `origin`)
- **HEAD:** `54ee3610b31e1b371aad2762b84f5cb5b7c94fcd` — "docs: sync closure evidence to verified code state"
- **Branch:** `master` (tracking `origin/master`, up to date)
- **Local branches:** `master`, `p0-a/restore-lifecycle`; remote: `origin/master`, `origin/p0-a/restore-lifecycle`
- **Working tree:** สะอาด ยกเว้น untracked `.kilo/plans/1790430288450-code-verification-plan.md`
- **Recent commits:** 54ee361, 9fa8e19, cefd647, 0207391, 3e76dc0, 096bdda, 5bec359, fb5cb8c, 2f1fe28, 4b5d5b4, bd43b57, 3712688, 17410a2, 4f219a7, 8a2d222, d3d5658, e6a94a5, 459bf53, bdc3760, fbaea9a

### 5.2 Stack / build / test (จาก package.json)

- **Build:** Vite 8 + `tsc -b`; framework React 19 + react-router-dom v7; PWA ผ่าน `vite-plugin-pwa`
- **State:** Zustand 5, TanStack Query 5, React Context หลายตัว
- **Backend/AI:** `@supabase/supabase-js` 2, `three` 0.186, `@anthropic-ai/sdk`, `stripe`, `axios`, Sentry
- **Test:** `vitest run` (unit/integration), `playwright test` (E2E)
- **Lint/typecheck:** `oxlint`, `tsc -p tsconfig.functions.json --noEmit`
- **Custom gates:** `check:astro`, `check:tokens`, `check:master-plan`, `validate:all`, `validate:phase-0/1`
- **Hooks:** `.husky/pre-push` → `npm run validate:all`
- ต้องยืนยันต่อใน Phase 0: ตัวเลข test จริง (มี refer "1102/1102" ใน memory vs "1042" ใน handoff), env references, scripts ทั้งหมด

### 5.3 โครงสร้างหลักที่ตรวจพบ

- `src/` — React app (components, pages, hooks, context, lib, services, store, styles, types, features)
- `api/` — `unified-handler.ts` + `_utils/` (Vercel-style)
- `functions/api/` — Cloudflare Pages Functions (`twin.ts`, `nova.ts`, `nova-stream.ts`, `twin-stream.ts`, `metrics.ts`, `og.ts`, `autonomy-log.ts`, `_utils/ai-provider.ts`)
- `supabase/migrations/` — 001–040 (มีช่องว่าง: 003, 006, 008, 009, 023)
- `supabase/functions/` — Deno edge functions (auth/passkey, daily-brief, memory-manager, pattern-detect, data-export, account-delete/recovery, send-push, astrovera-edge)
- `e2e/` — Playwright specs + fixtures; `tests/e2e/user-recovery.spec.ts` แยกต่างหาก
- `docs/` — เอกสารจำนวนมาก + `archive/`, `OLD/`, `reference/`, `verification/`
- root — เอกสารหลักฐานจำนวนมาก (`MASTER_GATE_*`, `SELFPRINT_100_*`, `FORENSIC_*`, `swap` ฯลฯ), SQL migrations แบบ loose, migration runners (`run-migrations*.cjs`), `wrangler.toml`, `.github/workflows` (5 workflows: ci-gate, deploy, lighthouse-ci, phase-gate, testing)

### 5.4 สิ่งผิดปกติ (candidate anomalies — ยังไม่ตัดสิน)

- ไฟล์ `npx` ขนาด 0 byte ที่ root
- `src/constants/testwrite.tmp` (temp artifact ถูก track)
- `src/package.json` + `src/package-lock.json` (package manifest ซ้ำซ้อนใน `src/`)
- `src/BITEMEBABY_PRODUCT_REALITY_MAP.md` — **นอก scope** (Bitemebaby) ต้องระบุแยกและไม่ปนกับ findings
- migration numbering ไม่ต่อเนื่อง (003/006/008/009/023 缺失)
- SQL ซ้ำหลายชุด: `SUPABASE_SETUP.sql`, `PRODUCTION_DB_CATCHUP_2026-09-01.sql`, `migration_*.txt`, `20260825_add_archetype_columns.sql`
- backend สามเส้นทาง parallel (`api/`, `functions/api/`, `supabase/functions/`) — ต้อง trace ว่า deploy จริงตัวไหน (Phase 2/7/9)
- working artifacts ถูก track: `dist/` (ignored แต่มีอยู่), `playwright-report/`, `test-results/`, `astro-audit.txt`, `build-output.txt`, `token-violations.txt`, `lighthouse-*.json`
- เอกสาร root/documentation ขัดกันเอง (1102 vs 1042 tests; handoff เองกำกับว่า superseded)

### 5.5 คำถามที่ Phase 0 ต้องตอบให้ครบ

- repo นี้คืออะไร / HEAD / branch / working tree / source หลัก / test / backend / DB·migration / deployment config อยู่ตรงไหน
- มีสิ่งผิดปกติอะไร (ยืนยัน/หักล้างข้อ 5.4 ด้วยหลักฐานไฟล์+บรรทัด)

### 5.6 งานที่ต้องทำใน Phase 0 (read-only)

1. `git ls-files | wc` และนับไฟล์ในแต่ละโดเมน (source/test/backend/db/config/docs)
2. อ่าน `.env.example`, `.env.e2e*`, `.dev.vars` — **ห้ามพิมพ์ค่า secret**; รายงานเฉพาะชื่อตัวแปร + ว่ามี/ไม่มี
3. อ่าน `.github/workflows/*.yml` ทั้ง 5 — สรุป trigger, job, secret references, env
4. อ่าน `playwright.config.ts`, `vitest.config.ts`, `vite.config.ts`, `wrangler.toml`, `supabase/config.toml`
5. ตรวจ ignored-but-present artifacts (`git status --ignored`)
6. ยืนยันจำนวน test จริง (นับ `test(`/`it(` และ compare กับ vitest output ถ้ามี read-only artifact)
7. ตรวจ migration index ว่ามีไฟล์ครบ/หายจริงตามหมายเลข

**จากนั้น STOP — รายงาน Phase 0 + อัปเดต ledger แล้วหยุดรอคำสั่ง**

---

## 6. PHASE 1 — REPOSITORY RECONSTRUCTION

**Deliverable:** `docs/FORENSIC_PHASE_01_REPOSITORY_MAP_TH.md`
Inventory directories/files/modules/routes/pages/components/hooks/services/API/functions/DB/migrations/tests/E2E/configs/docs/scripts
หา: duplicate, legacy, suspicious, dead/orphan candidates, feature flags, TODO/FIXME, commented-out impl, temp/debug artifacts
**ห้ามตัดสิน dead จนกว่า trace usage** → STOP

## 7. PHASE 2 — ARCHITECTURE RECONSTRUCTION

**Deliverable:** `docs/FORENSIC_PHASE_02_ARCHITECTURE_TH.md`
สร้าง architecture ใหม่จาก code จริง (User→Browser→UI→State→Hooks→Services→API→AI/Supabase→DB/Storage→Response→UI)
ต้องมี data/control/lifecycle/AI/Twin/World/Chat/Decision flow, entry point, persistence, error handling, recovery → STOP

## 8. PHASE 3 — COMPLETE CAPABILITY DISCOVERY (สำคัญมาก)

**Deliverable:** `docs/FORENSIC_PHASE_03_CAPABILITY_MATRIX_TH.md`
ค้น capability จาก code ทั้งหมด (รวมที่ไม่เคยอยู่ใน docs): Auth, Register/Login, Onboarding, Twin, Twin Birth, Profile, Chat, World, Decision, Personal Context, Memory, Lifecycle, AI, Upload, Storage, Persistence, Personalization, Recovery, Notifications, APIs, Background, Analytics/telemetry, Admin/debug, hidden features
ต่อ capability ต้องตอบ: ชื่อ/คำอธิบาย/Entry point/Implementation/Consumer/Data flow/Persistence/Runtime/Tests/Status/Evidence → STOP

## 9. PHASE 4 — REQUIREMENT RECONCILIATION

**Deliverable:** `docs/FORENSIC_PHASE_04_REQUIREMENT_RECONCILIATION_TH.md`
Matrix: `Requirement | Code | Runtime | Test | User Journey | Status | Evidence`
ห้ามใช้ % โดยไม่มีฐานนับ → ตอบ "โจทย์ทั้งหมดทำครบหรือยัง" → STOP

## 10. PHASE 5 — REAL USER SIMULATION

**Deliverable:** `docs/FORENSIC_PHASE_05_REAL_USER_AUDIT_TH.md`
Journey A New User, B Twin, C Chat, D World, E Decision, F Upload — บน staging/runtime ที่อนุญาต (ห้าม destruct production)
ทุก step มีสถานะ + evidence → STOP

## 11. PHASE 6 — FAILURE / EDGE / RECOVERY

**Deliverable:** `docs/FORENSIC_PHASE_06_FAILURE_RECOVERY_TH.md`
refresh, direct URL, back/forward, logout/login, session expiry, missing/empty data, missing Twin/profile, slow/API failure/timeout, invalid input, upload failure, duplicate/rapid interaction, network interruption (non-destructive)
ตรวจ loading/error/empty/recovery/retry/redirect/data integrity → STOP

## 12. PHASE 7 — BACKEND / DATA / AI / SECURITY

**Deliverable:** `docs/FORENSIC_PHASE_07_BACKEND_AI_SECURITY_TH.md`
DB (tables/columns/relations/constraints/indexes/triggers/migrations/drift/unused/missing), Supabase (Auth/RLS/policies/storage/functions/ownership), API ทุก endpoint (caller/auth/io/persistence/errors/consumer/orphan), AI (provider/request/prompt/context/user data/persistence/response/timeout/error/fallback/memory), Security (authz bypass/ID manipulation/RLS/storage/secrets/client trust/permissions/error leakage/env separation) → STOP

## 13. PHASE 8 — TEST / E2E / CI / DEPLOYMENT

**Deliverable:** `docs/FORENSIC_PHASE_08_TEST_CI_DEPLOYMENT_TH.md`
Unit/Integration inventory + coverage + misleading tests; E2E covered/not/skipped/flaky/prove-only-UI; CI; Deployment staging/production
ห้ามสรุป Tests pass = Product complete → STOP

## 14. PHASE 9 — DEAD / ORPHAN / LEGACY / DUPLICATION

**Deliverable:** `docs/FORENSIC_PHASE_09_LEGACY_ORPHAN_TH.md`
Trace usage ของ components/hooks/services/APIs/functions/tables/migrations/routes/flags/env/deps/tests/docs
จำแนก DEAD / ORPHAN / LEGACY / DUPLICATE / MISLEADING — **ห้ามลบ** → STOP

## 15. PHASE 10 — DOCUMENTATION RECONCILIATION

**Deliverable:** `docs/FORENSIC_PHASE_10_DOCUMENTATION_RECONCILIATION_TH.md`
จัดทุก statement เป็น 🟢/🟡/🔴 CONTRADICTED/⚪/⚫ → ตอบ "docs ปัจจุบันบอกอะไรที่ไม่ตรงกับ code/runtime" → STOP

## 16. PHASE 11 — COMPLETE GAP ANALYSIS

**Deliverable:** `docs/FORENSIC_PHASE_11_COMPLETE_GAP_ANALYSIS_TH.md`
Gap: PRODUCT / UX / TECHNICAL / DATA / AI / SECURITY / RELIABILITY / TEST / DOCUMENTATION / ARCHITECTURE DEBT / UNKNOWN
ห้ามลดความสำคัญเพราะ test ผ่าน → STOP

## 17. PHASE 12 — SELFPRINT REALITY REPORT

**Deliverable:** `docs/SELFPRINT_REALITY_REPORT_TH.md` (ไทย 100%)
ตอบทุกคำถามใน brief (SELFPRINT คืออะไรจริง, ผู้ใช้ทำอะไรได้, Twin/Birth/Chat/World/Decision/Context/Lifecycle/AI คืออะไรจริง ฯลฯ)
ห้ามใช้ "ครบ/สมบูรณ์" โดยไม่มี definition+evidence → STOP

## 18. PHASE 13 — RECONSTRUCTED THAI DOCUMENTATION (หลัง 0–12 เท่านั้น)

**Deliverables:**
- `docs/RECONSTRUCTED_DOCUMENTATION_INDEX_TH.md` (ระบุก่อนว่าควรมีเอกสารอะไร จำนวนตามความจำเป็นจริง ไม่บังคับ 100)
- เอกสารใหม่ภาษาไทย 100% (คง technical identifier ได้) ครอบ knowledge domains ตาม brief
- ทุกเอกสารผ่านขั้นตอน เขียน→เทียบ code→เทียบ runtime→เทียบ Reality Report→ตรวจ terminology→ตรวจ contradiction→🟢 VERIFIED DOCUMENT
- ถ้ายังพิสูจน์ไม่ได้ ให้เขียน "ยังไม่ยืนยัน" ห้ามเขียนเป็น fact

## 19. FINAL MASTER MATRIX + USER SUMMARY

- `docs/SELFPRINT_MASTER_CAPABILITY_MATRIX_TH.md` — `ID | Capability | Requirement | Implementation | Runtime | Test | User Journey | Status | Evidence`
- `docs/SELFPRINT_WHAT_CAN_IT_ACTUALLY_DO_TH.md` — ภาษาคนธรรมดา

## 20. ลำดับการ execute & breakpoints (สำคัญ)

ทำ **ทีละ Phase** เท่านั้น:
```
Phase N → เก็บ evidence → เขียน deliverable + ledger → สรุป verified/unverified/contradictions/blockers → STOP รอคำสั่ง
```
ห้ามรวบทำหลาย Phase ในเทิร์นเดียว แม้ "น่าจะทำได้"

## 21. Validation ของงาน audit

- ทุกไฟล์ deliverable มีอยู่จริงใน paths ที่ระบุ
- พบ "🟢" ทุกจุดต้องมี Evidence block ครบ (ไฟล์/ฟังก์ชัน/วิธีตรวจ/วันที่-commit)
- ไม่มีการแก้ source/config/test ใด ๆ (ตรวจด้วย `git status` ต้องไม่ต่างจาก baseline ยกเว้นไฟล์ doc/ledger ใหม่)
- ไม่มี Bitemebaby findings ปนใน SELFPRINT sections

## 22. Open questions / สิ่งที่ต้องยืนยันก่อนเริ่ม

1. **Runtime access:** staging URL `selfprint-staging.pages.dev` + Supabase staging ใช้ตรวจ Phase 5–7 ได้หรือไม่ และ credential ใด (ห้าม commit secret)
2. **test count จริง:** ยืนยัน 1102 vs 1042 ระหว่าง Phase 0 (จาก artifacts/vitest)
3. **backend ที่ deploy จริง:** `api/` (Vercel) หรือ `functions/api/` (Cloudflare) คือ production path — Phase 2/7 ยืนยัน
4. Bitemebaby files (`src/BITEMEBABY_PRODUCT_REALITY_MAP.md`) — ยืนยันว่า "ระบุว่านอก scope" ไม่ใช่ลบ

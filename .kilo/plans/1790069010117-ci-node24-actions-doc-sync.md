# PLAN — CI ACTION RUNTIME MAINTENANCE (Node 20 deprecation) + DOCUMENTATION SYNC

Repo: `D:\selfprint-v3-react` · branch `master` · HEAD `e730cd7` (2026-09-22, up to date กับ origin/master)
วันที่ plan: 2026-09-22

---

## 0) FORENSIC SNAPSHOT ก่อนแก้ (ตรวจแล้ว ณ วันที่ plan)

Working tree ปัจจุบัน (ทั้งหมด uncommitted) แยก 3 กลุ่ม:

**A — งาน doc-sync ค้างของ session ก่อน (ห้าม overwrite/revert — แก้ "ต่อยอด" บนสภาพนี้เท่านั้น)**
- `README.md` — แถว CI run #411 GREEN, Playwright workers/retries, section Deployment
- `docs/DEPLOYMENT.md` — Vercel ถอดออก, section 6 Cloudflare + staging auto-deploy จาก CI
- `docs/SELFPRINT_PROJECT_SUMMARY_TH.md` — บรรทัดอัปเดต 22 ก.ย.
- `docs/SELFPRINT_STATUS_HONEST_TH.md` — บรรทัดอัปเดต 22 ก.ย. + แถวตาราง CI
- `MASTER_GATE_AS_IS.md` — block "UPDATE 2026-09-22 — CI GREEN + STAGING DEPLOY AUTOMATION"
- `.github/secrets-setup.md` — secrets ครบชุด + deployment flow diagram

**B — ของผู้ใช้/external (HARD STOP — ห้ามแตะเด็ดขาด)**
- `.clineignore` (กฎ AI ที่ผู้ใช้ใส่), `kilo.jsonc` (instructions list), untracked stray file `npx` (repo root)

**C — งาน maintenance รอบนี้**
- `.github/workflows/testing.yml` (ไฟล์ workflow เดียวที่มีใน repo)
- เอกสาร operational ที่ระบุใน Task 2 (แก้ต่อยอดบน working tree)

ไม่มี conflict ที่ต้อง STOP: กลุ่ม A เป็นเนื้อหา CI/staging เดียวกับที่รอบนี้จะต่อยอด — ทุกไฟล์ในกลุ่ม A อยู่ในขอบเขต Task 2 โดยตั้งใจ (งานเดียวกันต่อเนื่อง) ถ้าตอน implement ต้อง discard เนื้อหาค้างใดๆ เพื่อแก้ไฟล์ = STOP แล้วรายงาน

---

## 1) EVIDENCE — annotation จริงจาก CI run #411 (ดึงจาก GitHub API, ตัวต่อตัว)

Run #411 id `35698934587` attempt 2, `e730cd7`, 22 ก.ย. 2026, conclusion `success`
Jobs: Unit Tests ✅ · Deploy Staging ✅ · E2E Tests ✅ · Generate Test Report ✅ · k6 × 2 = skipped (manual only)

Annotations ต่อ job:
1. **warning (ทุก job ที่รัน actions):**
   `Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: actions/checkout@v4, actions/setup-node@v4[, actions/upload-artifact@v4 (e2e), + actions/download-artifact@v4 (report)]. For more information see: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/`
   → ตรงกับรายการ 4 actions ที่ผู้ใช้กำหนดพอดี สาเหตุ: action ยังประกาศ `runs.using: node20` ใน action.yml แม้ runner จะบังคับรันบน node24 แล้ว — แก้ด้วยการ bump เป็น major ที่ประกาศ node24 แบบ native
2. **notice:** `ubuntu-latest label will migrate to Ubuntu 26 beginning October 19, 2026` — **ไม่แตะในรอบนี้** (ตามคำสั่งผู้ใช้: migration notice ไม่ใช่ปัญหา)
3. **failure-level annotation (e2e + report):** `Process completed with exit code 3` จากขั้น `Notify Slack` (curl exit 3) — known behavior ที่ document ไว้แล้วใน `.github/secrets-setup.md` (`continue-on-error: true` → ไม่ล้ม job) — **ไม่ใช่ Node 20, ไม่แตะ**
4. `actions/github-script@v6` **ไม่ติด annotation** (step `Comment on PR` ถูก skip ใน push runs) — คงเดิมตามรายการที่ผู้ใช้กำหนด, รายงานเป็น residual note

---

## 2) UPSTREAM VERSION EVIDENCE + การเลือก (หลักเดียวกันทั้ง 4 actions)

**เกณฑ์: เลือก major ต่ำสุดที่ upstream ยืนยันอย่างเป็นทางการว่ารัน Node.js 24 แบบ native และไม่มี behavior delta เพิ่มเติมที่ไม่จำเป็น** (ไม่เลือก "latest" แบบเดา ไม่เลือก major ที่มี breaking/feature delta)

| Action | ปัจจุบัน | เลือก | Evidence ทางการ | เหตุผลไม่เลือก major ใหม่กว่า |
|---|---|---|---|---|
| actions/checkout | @v4 (×6) | **@v5** | v5.0.0 (11 ส.ค. 2025): "Update actions checkout to use node 24" · min runner v2.327.1 · inputs ไม่เปลี่ยน | v6.0.0 (20 พ.ย. 2025) เปลี่ยน persist-credentials ไปไฟล์แยก (#2286) = behavior delta ไม่จำเป็น |
| actions/setup-node | @v4 (×3) | **@v5** | v5.0.0 (4 ก.ย. 2025): "Upgrade action to use node24" · breaking: auto package-manager caching — **ไม่กระทบเรา** (workflow ตั้ง `cache: 'npm'` ชัดเจน + `package.json` ไม่มี `packageManager` field — ตรวจแล้ว) | v6.0.0 (14 ต.ค. 2025) breaking: limit auto-cache เฉพาะ npm — ไม่จำเป็นกับเรา |
| actions/upload-artifact | @v4 (×5) | **@v6** | v6.0.0 (12 ธ.ค. 2025) อย่างเป็นทางการ: "v5 had preliminary support for Node.js 24, however this action was by default still running on Node.js 20. Now this action by default will run on Node.js 24" + punycode fix · inputs ที่เราใช้ (`name`/`path`/`retention-days`/`if-no-files-found`) ไม่เปลี่ยน | **v5 = ยัง default node20 (ต้องเลี่ยง!)** · v7.0.0 (26 ก.พ. 2026) = ESM + direct uploads (param `archive` ใหม่) = feature delta |
| actions/download-artifact | @v4 (×2) | **@v7** | v7.0.0 (12 ธ.ค. 2025) อย่างเป็นทางการ: "v6 had preliminary support for Node 24, however this action was by default still running on Node.js 20. Now this action by default will run on Node.js 24" · inputs (`name`/`path`) ไม่เปลี่ยน | **v6 = ยัง default node20 (ต้องเลี่ยง!)** · v8.0.0 (26 ก.พ. 2026) = **breaking: digest-mismatch default เป็น error** (failure mode ใหม่) + ESM + skip-decompress |

- Runner minimum v2.327.1 ทั้งชุด: GitHub-hosted `ubuntu-latest` รองรับอยู่แล้ว (พิสูจน์แล้วจริง: run #411 force-run node24 บน runner ชุดเดียวกันสำเร็จ)
- upload v6 + download v7 ใช้ backend artifact สถาปัตยกรรมเดียวกับ v4 (ต่างกันแค่ runtime/punycode) — download by `name` compatible
- **คงเดิมทุกอย่างอื่น:** `grafana/setup-k6-action@v1`, `actions/github-script@v6`, `runs-on: ubuntu-latest`, `node-version: '22'`, `wrangler@4.131.2`, secrets/env ทั้งหมด
- **STOP RULE:** ถ้าตอน implement พบ evidence ว่า input/behavior ใดต่างจากตารางนี้ → STOP แล้วรายงานก่อนแก้ต่อ

---

## 3) TASK 1 — แก้ workflow (16 substitutions เท่านั้น)

ไฟล์: `.github/workflows/testing.yml`

- `actions/checkout@v4` → `actions/checkout@v5` ×6 (unit-tests · deploy-staging **คง `ref: github.sha` ไว้** · e2e-tests · smoke-test · full-load-test · report-results)
- `actions/setup-node@v4` → `actions/setup-node@v5` ×3
- `actions/upload-artifact@v4` → `actions/upload-artifact@v6` ×5
- `actions/download-artifact@v4` → `actions/download-artifact@v7` ×2

ห้ามแตะอื่นใดในไฟล์: job names, `needs`, `if`, env, secrets, steps, scripts, timeout, retention-days, artifact names (`playwright-report`, `test-results`, `smoke-test-results`, `full-load-test-results`, `test-report`), `STAGING_URL`, wrangler command, Playwright install/test command, Slack blocks

ตรวจหลังแก้ (grep tool): ไม่เหลือ `@v4` เลย + นับได้ checkout@v5 ×6, setup-node@v5 ×3, upload-artifact@v6 ×5, download-artifact@v7 ×2 และ `git diff` ต้องโชว์แค่ version string เปลี่ยน 16 จุด

---

## 4) TASK 2 — DOCUMENTATION SYNC (ภาษาไทย, แก้ต่อยอดบน working tree)

**ข้อเท็จจริงที่ใส่ได้ (evidence-bounded) — ชุดเดียวกันทุกไฟล์:**
- Run #411 (`e730cd7`, 22 ก.ย. 2026): jobs ทั้งหมด ✅ — แต่ **ยังมี annotation**: warning "Node.js 20 is deprecated" ของ actions v4 ทั้ง 4 ตัว (เป็น warning/deprecation — **ไม่ใช่ test failure**; GitHub force-run node24 อยู่แล้ว)
- แก้ใน working tree นี้: bump v4 → checkout@v5 / setup-node@v5 / upload-artifact@v6 / download-artifact@v7 (node24 native — release notes ทางการ) — **ห้ามเขียนว่า warning หายแล้ว** ให้เขียนว่า "คาดว่าจะหายไป — ต้องยืนยันจาก run ถัดไปก่อนเขียนว่าหายจริง"
- **ห้ามเขียนว่า CI "100% ผ่านทุกอย่าง"** — jobs GREEN, ยังมี: Node 20 warning (กำลังแก้), Slack `exit code 3` failure annotation (known, ตาม `.github/secrets-setup.md`), ubuntu-latest → Ubuntu 26 notice (ค้างไว้รอบนี้โดยตั้งใจ)
- Runtime แยก 2 ชั้นให้ชัด: **project Node 22** (`node-version: '22'` — npm ci/build/test) ต่างจาก **action runtime Node 24** (ตัว action ประกาศเอง)
- Staging: auto-deploy จาก job `deploy-staging` ผูกกับ `github.sha` ของ run; `e2e-tests` `needs: deploy-staging`; production (selfprint.one, Pages Git integration) แยก lifecycle ต่างหาก

**ไฟล์ที่แก้ (ทั้งหมด = แก้ต่อยอด ห้ามทับงานกลุ่ม A):**
1. `README.md` — แถว CI: เติม runtime/annotation facts ต่อท้ายเนื้อหา pending (เก็บข้อความเดิมไว้)
2. `MASTER_GATE_AS_IS.md` — block UPDATE 2026-09-22: เติม ~1 บรรทัด qualify "ALL GREEN" ด้วย annotation facts
3. `docs/SELFPRINT_STATUS_HONEST_TH.md` — บรรทัดอัปเดต 22 ก.ย. + แถวตาราง 22 Sep: เติม annotation note
4. `docs/SELFPRINT_PROJECT_SUMMARY_TH.md` — บรรทัดอัปเดต: เติม note สั้น (ชี้ README ได้)
5. `.github/secrets-setup.md` — section Deployment flow: เติม action runtime (v5/v6/v7, node24 native) + อธิบาย annotation
6. `docs/DEPLOYMENT.md` — section 6: เติม 1–2 บรรทัด runtime facts (project Node 22 vs action runtime Node 24)
7. `docs/TESTING.md` — ตาราง CI Pipeline **ขาม job `deploy-staging` (stale ต่อ workflow ปัจจุบัน)** → เพิ่มแถว `deploy-staging` + หมายเหตุ runtime/annotations
8. `docs/DEVELOPMENT.md` — บรรทัด Node.js 22: เติมความต่าง action-runtime ต่อท้าย
9. `docs/development/GIT_WORKFLOW.md` — section "CI/CD Pipeline" (บรรทัด ~245–279) **อธิบาย pipeline ที่ไม่มีจริง** (ESLint/Prettier/`test:ci` — ไม่มีใน `package.json`) → แทนเฉพาะ section นี้ด้วย pipeline จริงจาก `testing.yml` แบบกระชับ (unit · deploy-staging → e2e · k6 manual-only · report) + runtime/annotations

**ภาษา:** เนื้ออธิบายเป็นไทย — คงภาษาอังกฤษสำหรับ action refs (`actions/checkout@v5`), job names, commands (`npm ci`, `npx wrangler@4.131.2 pages deploy`), URLs, secret names, file paths · ไม่สร้างเอกสารใหม่

**HISTORICAL — ห้ามแตะเด็ดขาด:** `docs/OLD/**`, `docs/archive/**` (รวม `SELFPRINT_PRODUCTION_STATUS_TH.md`), `docs/reference/**`, `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` (handoff 12–18 ก.ย. = historical evidence), `docs/SELFPRINT MASTER PRODUCT SPEC & 100% CLOSURE BOOK.md` (closure record 13 ก.ย.), `docs/development/TESTING_STRATEGY.md` (ไม่มีเนื้อหา CI runtime — ไม่แตะ)

---

## 5) BEHAVIOR-EQUALITY CHECKLIST (ตรวจตอน diff หลังแก้ — ต้องเหมือนเดิมทุกข้อ)

job names · job dependency (`report-results needs [unit-tests, e2e-tests]`) · `deploy-staging → e2e-tests` (`needs: deploy-staging`) · checkout SHA/ref behavior (`ref: github.sha` ใน deploy-staging) · `node-version: '22'` · `cache: 'npm'` · `npm ci` · `npm run build` (+ `VITE_SUPABASE_*` secrets) · wrangler command + `--project-name selfprint-staging` + `--commit-hash` · verify alias HTTP 200 · `STAGING_URL: https://selfprint-staging.pages.dev` · `BASE_URL` / `PRODUCTION_URL` · Playwright projects (ไม่แตะ `playwright.config.ts`) · `npm run test:e2e` · artifact names + retention · Slack steps (`continue-on-error` คงเดิม) · k6 manual-only (`workflow_dispatch` gate) · report-results flow

ถ้าพบข้อใดต่างจากเดิมที่ไม่ใช่ version string → STOP แล้วรายงาน

---

## 6) VALIDATION (local เท่านั้น — ห้าม deploy / trigger CI / push)

1. Grep ตรวจ workflow ตาม Task 1 (ไม่เหลือ @v4, นับครบ)
2. `git diff` review: workflow diff = 16 จุดเท่านั้น
3. `npm run typecheck` — ต้อง PASS
4. `npm run typecheck:functions` — ต้อง PASS
5. `npm test` — ต้อง PASS (baseline 1050 tests)
6. `npm run build` — ต้อง PASS
7. YAML syntax: การแก้เป็น string substitution ล้วน (primary verification = diff review); ถ้ามีเครื่องมือ YAML lint อนุญาตให้รันเพิ่มได้ — ถ้า permission ไม่ให้ ให้ข้ามและระบุใน report

---

## 7) POST-EDIT REPORT + DIFF FORENSIC (รายงานเป็นภาษาไทย)

รายงานต้องมีครบ:
1. Files ที่ task นี้แก้ (workflow + เอกสาร 9 ไฟล์)
2. Files ที่ผู้ใช้แก้ค้างก่อน task (กลุ่ม A 6 ไฟล์)
3. External/unrelated (กลุ่ม B: `.clineignore`, `kilo.jsonc`, stray `npx` — ยืนยัน untouched)
4. `git diff` ของ workflow + เอกสาร
5. ยืนยัน source/test/config/product logic ไม่ถูกแตะ (`src/`, `e2e/`, `tests/`, `playwright.config.ts`, `vitest.config.ts`, `package.json`, `wrangler.toml`, functions/)
6. ยืนยัน staging deployment flow ไม่เปลี่ยน behavior (checklist ข้อ 5)
7. ผล validation ทั้ง 4 คำสั่ง
8. Residual notes: `github-script@v6` (ยัง target node20 — จะ emit เฉพาะ PR runs, อยู่นอกรายการที่ผู้ใช้กำหนด), Slack exit-3 annotations, ubuntu-latest notice, การยืนยัน warning หายจริงต้องรอ run ถัดไป (ห้าม trigger เอง)

---

## 8) HARD STOP (ยืนยันอีกครั้ง)

- ❌ ไม่ commit · ❌ ไม่ push · ❌ ไม่ amend · ❌ ไม่ reset · ❌ ไม่ checkout ทับ · ❌ ไม่ stash
- ❌ ไม่ rerun CI · ❌ ไม่ trigger workflow · ❌ ไม่ deploy จาก local
- ❌ ไม่แตะ `.clineignore`, `kilo.jsonc`, stray `npx`, ubuntu-latest, `grafana/setup-k6-action@v1`, `github-script@v6`, secrets/credentials, production deployment, staging behavior
- ส่ง POST-EDIT REPORT + diff ให้ผู้ใช้ตัดสิน commit/push เอง

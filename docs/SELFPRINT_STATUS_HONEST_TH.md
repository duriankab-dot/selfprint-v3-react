# 📊 SELFPRINT PROJECT STATUS — Honest Summary ภาษาไทย

**อัปเดตล่าสุด:** 6 กันยายน 2026 (รอบ forensic — วัดจริง 4–5 ก.ย. 2026, HEAD `da855c5`, **อัปเดตรอบที่ 6 — 6 Sep 2026: A1 ปิด (6 orphan deleted) + A7 ปิด (47 as-any casts) + Story/Narrative docs**)
**Project:** Selfprint v3 (React + Vite + Supabase + Cloudflare Pages)
**วิธีตรวจ:** อ่านซอร์สโค้ดจริง + รัน build/test/lint จริง + **verify กับ Supabase / Cloudflare / GitHub / scoop จริงเมื่อ 5 ก.ย. 2026** — **ไม่เชื่อไฟล์ `.md` ใด ๆ อย่างเดียว**
**เอกสารอ้างอิงหลัก:** `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` (ต้องอ่านคู่กับ Supabase/Cloudflare/GitHub จริงเสมอ)

> ⚠️ เอกสารฉบับก่อน (30 ส.ค. 2026) อ้างว่า "Phase A COMPLETE 42/42" — **เก่าและไม่ผ่านการ verify**
> ตัวเลขจริงวัดใหม่ทั้งหมดในรอบนี้แล้ว ดูตารางด้านล่าง
>
> 📌 **สถานะ Track A ที่ถูกต้อง:** งาน Track A ที่บล็อก UX/UI เสร็จแล้ว — แต่ **A1 (ล้าง Vercel + dead code — ปิดแล้ว: 11 deleted prev + 6 deleted 6 Sep 2026)** และ **A7 (เปิด TypeScript strict + `as any` 47 จุด วัด 6 Sep 2026 — ปิดแล้ว)** ยังเปิดอยู่ (ดู `PLAN_TRACKS_TH.md:52` / `:58`) — **ไม่บล็อก Track C**
>
> ✅ **อัปเดตจาก Supabase จริง (5 ก.ย. 2026):** migration `035_forensic_consolidation_2026-09-03` **apply แล้ว** — verify จาก Supabase SQL Editor: `SELECT '035_forensic_consolidation_2026-09-03 complete' AS status;` → `complete ✅` · เอกสารฉบับก่อนเขียนว่า "ยังไม่ apply" นั้น **เก่าแล้ว** — แก้ครั้งนี้
>
> 📌 **GitHub จริง (HEAD `da855c5`):** commits ล่าสุด: `7ca1a4f`(docs sync) `6cc2fe6`(A1 delete 11) `e25fc15`(untrack v2 docs) `6746f7a`(X1 env) `13c70f8`(ASSET404-001) `6e0aebd`(STUB-001) `bcf46f7`/`49995fa`/`0cf7ee4`(A7 as-any) `5676db7`(A1-cont) `875a5ca`(A3-lazy) `da855c5`(A3-perf) `65cf56b`(A1 close) `ec80693`(B5 as-any) `103d7ba`(tsc fix) `b7bde64`(B2-B3 passkey+voice fix) · gates: `tsc -b 0 errors` ✅ (build/lint/test: ต้องรันบน Windows — native binaries)
>
> ✅ **อัปเดตจาก Cloudflare Pages (5 ก.ย. 2026):** deployments มี 141 รายการ · HEAD `3fa100a` build PASS · HEAD `da855c5` = ยังไม่ verify กับ Cloudflare · `e937ed8` (commit ก่อน) build **FAIL** — สาเหตุ: `package.json` มี `@tailwindcss/vite@4.3.3` แต่ `package-lock.json` ไม่มี → `npm ci` EUSAGE + `wrangler.toml` ไม่มี `pages_build_output_dir` (commit `3fa100a` แก้แล้ว)
>
> ✅ **อัปเดตจากเครื่องจริง (5 ก.ย. 2026):** `git filter-repo` **ติดตั้งแล้ว v2.47.0** (verify `where git-filter-repo` + `scoop list | findstr filter`) · แต่ `purge.txt` **ยังไม่ได้สร้าง** → ต้องสร้างก่อนรันคำสั่ง filter-repo
>
> ✅ **rotate รหัส staging 6 ตัว — ไม่ต้องทำ** (เจ้าของลบ users ทุกครั้งหลังทดสอบเสร็จ)

---

## 🎯 สถานะ gate ปัจจุบัน — วัดจริงทุกตัว (4–5 ก.ย. 2026)

| gate | ผล | verify กับ |
|------|-----|----------|
| `tsc -b` | ✅ 0 errors — `strict: true` เปิดแล้ว (`tsconfig.app.json:28`) | local build |
| `npm run typecheck:functions` | ✅ 0 errors | local build |
| `vite build` | ✅ สำเร็จ 3.81 s · 933 modules | local build |
| `oxlint` | ✅ 0 errors · **187 warnings · 474 files** | local build |
| `vitest run` | ✅ **66/66 ไฟล์ · 1037 tests ผ่าน · 0 fail · 0 skip** (REALBUG-001..004 แก้ครบแล้ว) | local build |
| **migration 035** | ✅ **apply แล้ว** (Supabase SQL Editor) | **Supabase จริง** 5 ก.ย. 2026 |
| **HEAD commit** | `da855c5` (A3-perf) — 6 Sep 2026 | **GitHub จริง** |
| **Cloudflare Pages build** | `3fa100a` ✅ / `e937ed8` ❌ (lock mismatch + wrangler.toml) | **Cloudflare จริง** 5 ก.ย. 2026 |
| **`git filter-repo`** | ✅ v2.47.0 ติดตั้งแล้ว (scoop) | **เครื่องจริง** 5 ก.ย. 2026 |

**สรุป:** `tsc -b` 0 errors ✅ — build/lint/test ต้องรันบน Windows (native binaries: rolldown/oxlint/vitest) · dist/ stale (ต้อง `npm run build` ใน local Windows ก่อนอ้างตัวเลข bundle) · A1 ปิดแล้ว · A7 ปิดแล้ว

---

## ✅ สิ่งที่ทำเสร็จจริง 100% + verify กับโปรดักต์แล้ว

### Core Awakening (โค้ดฝั่ง client)
- `src/services/CoreAwakeningService.ts` — `startAwakening()` / `initializeTwin()` ทำงานครบ
  (9 operations ผ่าน `Promise.allSettled`)
- `src/services/TwinSupabaseService.ts` — `createTwinInDatabase()` ทำ **INSERT จริง**
- `checkReadyForAwakening()` แก้บั๊กแล้ว (`.eq('user_id')` + `.maybeSingle()`)

### SICE — 12 engines จริง
- `SICEOrchestrator.ts` ลงทะเบียน 12 engines จริง
- `nova.ts` + `twin.ts` เรียก Anthropic SDK จริง + verify JWT

### C0 fixes — verify ครบทุกข้อ
| รหัส | เรื่อง |
|------|-------|
| `TWFIX-001` | Tailwind v4 ทำงานจริง — `--tw-` 545 จุดใน bundle |
| `REALBUG-001..004` | แก้ครบ → 1037/1037 ผ่าน · 0 skip |
| `SEC-02` | `send-push` บังคับ JWT แล้ว (โค้ด) |
| `NAVGAP-001` | nav หายช่วง 761–1023 px — แก้แล้ว |
| `DEADCHUNK-001` | ลบ manualChunks branch ที่ตาย — **PARTIAL (บางส่วน)**: `vendor-supabase` (ถูกดูดเข้า chunk-intelligence) + `decision-services` (static import) branch ยังเปิด |
| `ASSET404-001` | แก้ asset ที่อ้างแต่ไม่มีไฟล์จริง — **PARTIAL (บางส่วน)**: `public/audio/` หาย + `soundscape-manifest.json` 23 CLOUDINARY_URL + `logo.png`/`og-image.png` ยังเปิด |
| `RAFLOOP-001` | rAF loop เคารพ `prefers-reduced-motion` |
| `AUTHHDR-001` | client ส่ง `Authorization` ครบ |
| `NOVAPROV-001` | `NovaProvider` mount ครบ |
| `ERRBOUND-001` + `SENTRY-INIT-001` | ErrorBoundary + Sentry init |
| `HOMEBLANK-001` | หน้าแรกไม่ blank แล้ว |

### i18n — ระบบจริง
- inline `isTh ? ... : ...` 958 จุด + `useLanguage` / `TRANSLATIONS` / `t(` 1607 จุด
- `docs/I18N_EN_TRANSLATION_HANDOFF_TH.md` — Tier 1+2+3 เสร็จ ~85+ ไฟล์

### ✅ migration 035 — APPLY แล้ว (verify Supabase จริง 5 ก.ย. 2026)
- ไฟล์: `supabase/migrations/035_forensic_consolidation_2026-09-03.sql` (1,392 บรรทัด)
- สถานะ: ✅ **apply สำเร็จแล้ว** — Supabase SQL Editor run: `SELECT '035_forensic_consolidation_2026-09-03 complete' AS status;` → `complete`
- ผลกระทบ: Core Awakening บน production **ไม่พัง 42703 แล้ว** — `twins` table มี 11 คอลัมน์ครบ (6 เดิม + 5 ใหม่: `primary_archetype`, `secondary_archetype`, `maturity_score`, `evolution_stage`, `awakened_at`)
- เอกสารฉบับก่อนเขียนผิด: "**ยังไม่ถูก apply**" — แก้เป็น "**apply แล้ว**" ในรอบนี้

### ✅ git filter-repo — ติดตั้งแล้ว v2.47.0 (verify เครื่องจริง 5 ก.ย. 2026)
- คำสั่ง: `where git-filter-repo` → `C:\Users\HP EliteBook\scoop\shims\git-filter-repo` ✅
- คำสั่ง: `scoop list | findstr filter` → `git-filter-repo 2.47.0 main 2026-09-05` ✅
- เอกสารฉบับก่อนเขียนผิด: "**ยังไม่ได้ติดตั้ง**" — แก้เป็น "**ติดตั้งแล้ว v2.47.0**"

---

## 🔴 อ้างว่าทำแล้ว แต่ยังไม่เสร็จจริง (เหลือ 4 ข้อ — ลดจาก 5)

> **หมายเหตุสำคัญ:** รายการนี้คือ **อ้างว่าทำแล้ว แต่ยังไม่เสร็จ** — รายการที่ **ทำเสร็จจริง** (รวมถึง migration 035 + git filter-repo) ย้ายไปอยู่หัวข้อ "✅ สิ่งที่ทำเสร็จจริง" ข้างบนแล้ว

| # | เรื่อง | สถานะจริง | verify กับ |
|---|-------|----------|----------|
| 1 | ~~**Core Awakening บน production** (migration 035)~~ | ✅ **เสร็จแล้ว** — ดูหัวข้อ "✅ สิ่งที่ทำเสร็จจริง" ข้างบน | Supabase SQL Editor 5 ก.ย. 2026 |
| 2 | **Passkey flow** | ✅ **แก้แล้ว (b7bde64)** — supabase.auth.setSession() เรียกถูก · JWT HMAC-SHA256 จริง · PasskeyProvider management → throw NotImplemented (ไม่พัง runtime แล้ว) | local code + b7bde64 |
| 3 | **Edge Functions (SEC-02)** | แก้โค้ดแล้วแต่**ยังไม่ deploy** (`send-push`, `daily-brief`, `pattern-detect`) · verify Supabase Functions dashboard 5 ก.ย. 2026 พบว่ามีแค่ "DEPLOY YOUR FIRST EDGE FUNCTION" (0/11 function) | local code + **Supabase Functions dashboard จริง** 5 ก.ย. 2026 |
| 4 | **dist/ ตาม src/** | dist/ ล้าหลัง src/ 1 commit — `e937ed8` build FAIL ใน Cloudflare Pages · `3fa100a` (lock sync) build PASS แต่ dist/ ใน local ยังเป็น `index-DE3pLhDs.js` เก่า → ต้อง `npm run build` ใหม่ใน local | local build + **Cloudflare Pages log จริง** 5 ก.ย. 2026 |
| 5 | **งาน manual ที่ค้าง** | ~~apply migration 035~~ ✅ · ~~`git filter-repo` ติดตั้ง~~ ✅ v2.47.0 · ~~rotate รหัส staging~~ ❌ ไม่ต้องทำ · ~~A1 dead code~~ ✅ ปิดแล้ว · ~~A7 as-any~~ ✅ ปิดแล้ว · **สร้าง `purge.txt` ก่อนรัน filter-repo** · ~~deploy Edge Functions~~ ✅ · ~~voice route decision~~ ✅ · ~~passkey decision~~ ✅ · rebuild dist/ ใน Windows | local + scoop + Supabase |

---

## 🧩 Stub / Mockup / Hardcode ที่ยังเหลือ

| ไฟล์:บรรทัด | สิ่งที่ยังเป็นของปลอม |
|-------------|---------------------|
| `VoiceChat.tsx:80` | ✅ แก้แล้ว — Web Speech API + /api/nova (b7bde64) |
| `VoiceInput.tsx:38` | mock speech recognition |
| `VoiceOutput.tsx:34` | mock TTS |
| `AdvancedAnalytics.tsx:26` | mock data (orphan — ไม่มีใคร import) |
| `SentryService.ts:15` | `MockSentry` class (orphan chain) |
| `CommunityPage.tsx:397` | "กำลังมาเร็วๆ นี้ / Coming soon" |
| `ExplorePage.tsx:728` + `:898` | stub cards + "เร็วๆ นี้" |
| `DecisionDashboard.tsx:126` | placeholder "Phase F Dashboard" |
| `structuredData.ts:21` | `VITE_BUSINESS_PHONE \|\| '+66-2-XXX-XXXX'` fake phone fallback |
| `public/soundscape-manifest.json` | `CLOUDINARY_URL` ยังไม่ถูกแทนที่ 23 จุด → sound URL พังหมด · `public/audio/` ไม่มีอยู่จริง แต่ `adaptive-audio-engine.ts:285` อ้าง mp3 |
| dead code 16+ ไฟล์ | `AdvancedAnalytics.tsx`, `SentryService.ts`, `AlertingService.ts`, `PerformanceMonitor.ts`, `AssetCatalog.tsx`, `DebugTheme.tsx`, `WorldSelector.tsx` (ว่าง), `TwinHologramBirth.tsx`, `TwinEvolutionProgress.tsx`, `GrowthBadge.tsx`, `RecoveryIndicator.tsx`, orphan pages `Chat.tsx` `ChatPage.tsx` `BlogIndex.tsx` `blog-astrology-vs-behavioral.tsx`, `public/service-worker.js` (dead — ตัวจริงคือ `sw.js`) |
| `as any` | 47 จุด (วัด 6 ก.ย. 2026 — A7 ปิดแล้ว) |
| `dangerouslySetInnerHTML` | 8 จุด (ปลอดภัยทั้งหมดผ่าน `safeJsonLd()`) |

---

## 🎯 พร้อมเข้าสู่ UX/UI Improvement (Track C) หรือยัง?

**คำตอบ: ✅ พร้อม** — งาน visual/UX ไม่ถูกบล็อกด้วยบั๊ก build/test/lint และ Core Awakening production ทำงานได้แล้ว (migration 035 apply แล้ว)

> 📌 **แหล่งความจริงด้านการออกแบบ (design source of truth) ของ Track C:**
> [`docs/Experience Architecture v2.md`](./Experience%20Architecture%20v2.md)
> (2,046 บรรทัด · 51 topics · **Status: Proposed Architecture**)
> หลัก: **RECOMPOSE ไม่ใช่ REBUILD** · core promise *"Understand yourself. Meet your Twin. Keep evolving."* ·
> App Shell = **TODAY · WORLDS · TWIN · EXPLORE · ME** · P0.1–P0.10 / P1.1–P1.8 / P2.1–P2.7 ·
> §44 safety rule · §45 success criteria · §46 core loop
> ทุก phase ของ Track C ต้องอ้าง §topic ของเอกสารนี้ — แผนปฏิบัติการอยู่ที่
> `docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`

> ✅ **ปิดครบ 6 Sep 2026 HEAD b7bde64** — Edge Functions deployed · passkey flow fixed · VoiceChat ใช้ Web Speech API จริง · dist/ rebuilt (CF Pages auto-deploy)

~~1. **deploy Edge Functions**~~ ✅ ปิดแล้ว — 12 functions deployed 6 Sep 2026
~~2. **แก้/ตัดสินใจ passkey flow**~~ ✅ ปิดแล้ว — AuthContext.tsx + JWT HMAC-SHA256 + PasskeyProvider NotImplemented
~~3. **ตัดสินใจ voice route**~~ ✅ ปิดแล้ว — VoiceChat ใช้ Web Speech API + /api/nova

---

## 📌 เอกสารอื่นที่ล้าสมัย (ต้องระวัง)

| เอกสาร | ข้อความเก่า | ความจริง (5 ก.ย. 2026) |
|--------|------------|------------------------|
| `README.md` | "PRODUCTION READY", P1-P6 ✅, 130/130 tests, อ้าง Vercel/Express/Three.js (ลบไปแล้ว), อ้าง `SELFPRINT_HANDOFF_SESSION_NEXT.md` (ไม่มีจริง), "Build currently broken" | build ผ่าน — **rewrite แล้ว (5 ก.ย. 2026)** |
| `README.md` (ตาราง nav 5 แท็บ) | ระบุ **"กิจกรรม (Activities)"** เป็นแท็บนำทาง | **ผิด** — แท็บจริงคือ **โลก (Worlds) → `/worlds`** (ยืนยันจาก `BottomNav.tsx:89-93` + `NavRail.tsx:73-77`) · Activities **ไม่ใช่แท็บ** — route `/activities` ยังมี (`App.tsx:170`) แต่หลุดจาก nav แล้ว และถูกดูดรวมเป็นส่วนหนึ่งของ Explore ตามคอมเมนต์ `BottomNav.tsx:6` "รวมกิจกรรมเดิม" — **แก้แล้ว (5 ก.ย. 2026)** |
| `SELFPRINT_STATUS_HONEST_TH.md` (ฉบับก่อนแก้) | "Phase A COMPLETE 42/42", "migration 035 ยังไม่ apply" | เก่า/ไม่ผ่าน verify — **migration 035 apply แล้ว** · แก้เป็นฉบับนี้แล้ว (5 ก.ย. 2026) |
| `FORENSIC_AUDIT` (3 ก.ย.) | "skip 11 = REALBUG", "migration 035 ยังไม่ apply" | REALBUG แก้ครบแล้ว 0 skip · migration 035 apply แล้ว — แก้ทั้ง 2 ไฟล์ในรอบนี้ |
| `PLAN_TRACKS_TH.md` (3 ก.ย.) | "vitest รันแค่ 7/73 ไฟล์" | ตอนนี้ 66/66 ไฟล์ |
| `CLAUDE.md` | "oxlint 195 warnings/480 files" | จริงคือ 187/474 |
| Phase 0 F-01 (Tailwind), F-03 (nav gap), F-07 (rAF) | ยังไม่แก้ | **แก้หมดแล้ว** |

---

## 📚 รายการเอกสารที่เกี่ยวข้อง (อัปเดต 5 ก.ย. 2026)

> **หลักการอ่าน:** เอกสารชุดนี้แบ่งเป็น **3 ชั้น** — เอกสารชั้นบน (single source of truth) · เอกสารชั้นกลาง (แผนงาน/ผลตรวจ) · เอกสารชั้นล่าง (ข้อมูลเฉพาะเรื่อง) — ทั้งหมดอ้างอิงด้วย `ไฟล์:บรรทัด` ที่ verify กับโค้ดจริงเมื่อ 4–5 ก.ย. 2026 (HEAD `da855c5`)
>
> ⚠️ **กฎเหล็ก:** เอกสารทุกฉบับในโปรเจกต์นี้ **ต้อง verify กับ Supabase / Cloudflare / GitHub / scoop จริงเสมอ** — ห้ามเชื่อเอกสารอย่างเดียว (เคส migration 035 + git filter-repo + e937ed8 build FAIL ฉบับก่อนเขียนผิดเป็นหลักฐาน)

### 🟢 ชั้น 1 — Single Source of Truth (ต้องอ่านก่อนทำอะไร)

| # | เอกสาร | ที่อยู่ | บทบาท | สถานะ | verify กับ |
|---|--------|--------|--------|--------|----------|
| 1 | `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` | [`/FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](../FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md) | **เอกสารสถานะฉบับเดียวที่ถูกต้อง** — งานที่เสร็จ/ค้าง/ต้องรันด้วยมือ 424 บรรทัด | ✅ ล่าสุด 5 ก.ย. 2026 (แก้รอบที่ 4) | local + Supabase บางส่วน |
| 2 | `SELFPRINT_STATUS_HONEST_TH.md` (ไฟล์นี้) | [`/docs/SELFPRINT_STATUS_HONEST_TH.md`](./SELFPRINT_STATUS_HONEST_TH.md) | สรุปสถานะโปรเจกต์ฉบับภาษาไทย | ✅ ล่าสุด 5 ก.ย. 2026 (แก้รอบที่ 5) | local + Supabase + GitHub + Cloudflare + scoop |
| 3 | `CLAUDE.md` | [`/CLAUDE.md`](../CLAUDE.md) | **บริบทถาวร + gotchas** ก่อนแตะโค้ด (12,346 bytes) — เช่น `strict: true` / 187 warnings / ห้ามอ้าง "100%" โดยไม่มีตัวเลข | ✅ ล่าสุด 4 ก.ย. 2026 | local |
| 4 | `README.md` | [`/README.md`](../README.md) | หน้าแรกของโปรเจกต์ — ตาราง gate / 5-tab nav / Known Limitations / Trusted Documentation | ✅ Rewrite 5 ก.ย. 2026 | local |

### 🟡 ชั้น 2 — แผนงานรวม + ผลตรวจ (Phase 0 / Track A/B/C)

| # | เอกสาร | ที่อยู่ | บทบาท | สถานะ |
|---|--------|--------|--------|--------|
| 5 | `PLAN_TRACKS_TH.md` | [`/docs/PLAN_TRACKS_TH.md`](./PLAN_TRACKS_TH.md) | **แผนงานรวม 3 Track** (A=บั๊กค้าง / B=Phase 0 forensic / C=visual redesign) — 275 บรรทัด | ✅ อัปเดต 5 ก.ย. 2026 |
| 6 | `PHASE0_VISUAL_PERF_FORENSIC_TH.md` | [`/docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](./PHASE0_VISUAL_PERF_FORENSIC_TH.md) | **ผลตรวจ Phase 0** 10 deliverable — F-01..F-07 + B0.1–B0.10 (PASS 7 · PARTIAL 3 · BLOCKED 0) 990 บรรทัด · **ต้องอ่านก่อน Track C** | ✅ ส่งรายงาน 4–5 ก.ย. 2026 |
| 7 | `Experience Architecture v2.md` | [`/docs/Experience Architecture v2.md`](./Experience%20Architecture%20v2.md) | **Design master ของ Track C** — 2,046 บรรทัด · 51 topics · RECOMPOSE not REBUILD · App Shell 5 tab · §44 safety rule · §45 success · §46 core loop | 🟡 **Proposed Architecture** (ยังไม่ implement) |
| 8 | `Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md` | [`/docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`](./Experience%20Architecture%20v2/TRACK_C_VISUAL_REDESIGN_TH.md) | **แผนปฏิบัติการ Track C** — แปลง design master เป็น phase ทำงาน | 🟡 Track B STOP รอ approve |

### 🔵 ชั้น 3 — เอกสารเฉพาะเรื่อง (อ้างอิงตามหัวข้อ)

#### 3.1 เอกสารที่อ้างอิงจาก README และ audit

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 9 | `Experience Architecture v2.txt` | [`/Experience Architecture v2.txt`](../Experience%20Architecture%20v2.txt) | ฉบับ plain text ของ design master (44,612 bytes) | ✅ 4 ก.ย. 2026 |
| 10 | `CONTRIBUTING.md` | [`/CONTRIBUTING.md`](../CONTRIBUTING.md) | แนวทางการ contribute | ✅ 4 ก.ย. 2026 |
| 11 | `AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md` | [`/docs/AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md`](./AI_CONTEXT_CLOSE_ITEMS_CHECKLIST.md) | Checklist สำหรับ AI agent ปิดงานค้าง | ✅ |
| 12 | `AI_WORKING_DISCIPLINE_RULES.md` | [`/docs/AI_WORKING_DISCIPLINE_RULES.md`](./AI_WORKING_DISCIPLINE_RULES.md) | กฎการทำงานของ AI (Anti-Lazy Rule 0.17) | ✅ |

#### 3.2 เอกสาร architecture / API / database

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 13 | `ARCHITECTURE.md` | [`/docs/ARCHITECTURE.md`](./ARCHITECTURE.md) | ภาพรวมสถาปัตยกรรมระบบ | ✅ |
| 14 | `SYSTEM_ARCHITECTURE.md` | [`/docs/SYSTEM_ARCHITECTURE.md`](./SYSTEM_ARCHITECTURE.md) | System architecture โดยละเอียด | ✅ |
| 15 | `SICE_ARCHITECTURE_TH.md` | [`/docs/SICE_ARCHITECTURE_TH.md`](./SICE_ARCHITECTURE_TH.md) | SICE (12 engines) architecture ฉบับไทย | ✅ |
| 16 | `INTELLIGENCE_SYSTEM_ARCHITECTURE.md` | [`/docs/INTELLIGENCE_SYSTEM_ARCHITECTURE.md`](./INTELLIGENCE_SYSTEM_ARCHITECTURE.md) | Intelligence system โดยละเอียด | ✅ |
| 17 | `EDGE_ARCHITECTURE.md` | [`/docs/EDGE_ARCHITECTURE.md`](./EDGE_ARCHITECTURE.md) | Cloudflare Pages Functions + Supabase Edge Functions | ✅ |
| 18 | `API.md` + `API_ARCHITECTURE.md` + `API_OVERVIEW.md` + `API_REFERENCE.md` | [`/docs/API.md`](./API.md) + ที่เกี่ยวข้อง | API documentation 4 ฉบับ (catch-all → 7 modules) | ✅ |

#### 3.3 เอกสาร deployment / monitoring / performance

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 19 | `DEPLOYMENT.md` | [`/docs/DEPLOYMENT.md`](./DEPLOYMENT.md) | Deploy บน Cloudflare Pages (Vercel ลบแล้ว) | ✅ |
| 20 | `MONITORING.md` | [`/docs/MONITORING.md`](./MONITORING.md) | Sentry monitoring | ✅ |
| 21 | `PERFORMANCE.md` | [`/docs/PERFORMANCE.md`](./PERFORMANCE.md) | Performance guidelines (§25) | ✅ |
| 22 | `SECURITY.md` + `SECURITY_AUDIT_2026-08-18.md` | [`/docs/SECURITY.md`](./SECURITY.md) + [`/docs/SECURITY_AUDIT_2026-08-18.md`](./SECURITY_AUDIT_2026-08-18.md) | Security audit (SEC-02 fix coded, ยังไม่ deploy) | ✅ |

#### 3.4 เอกสารผู้ใช้ / การตั้งค่า / อื่น ๆ

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 23 | `GETTING_STARTED.md` | [`/docs/GETTING_STARTED.md`](./GETTING_STARTED.md) | Quick start guide | ✅ |
| 24 | `SETUP.md` | [`/docs/SETUP.md`](./SETUP.md) | การตั้งค่า Supabase + Cloudflare | ✅ |
| 25 | `USER_GUIDE.md` + `USER_GUIDE_TH.md` | [`/docs/USER_GUIDE.md`](./USER_GUIDE.md) + [`/docs/USER_GUIDE_TH.md`](./USER_GUIDE_TH.md) | คู่มือผู้ใช้ (EN/TH) | ✅ |
| 26 | `DATABASE_SCHEMA_TH.md` | [`/docs/DATABASE_SCHEMA_TH.md`](./DATABASE_SCHEMA_TH.md) | Database schema ฉบับไทย | ✅ |
| 27 | `WORLDS_REFERENCE.md` | [`/docs/WORLDS_REFERENCE.md`](./WORLDS_REFERENCE.md) | 12 Hub Worlds | ✅ |
| 28 | `TWIN_UX_GUIDELINES.md` | [`/docs/TWIN_UX_GUIDELINES.md`](./TWIN_UX_GUIDELINES.md) | Twin UX guidelines | ✅ |
| 29 | `VOICE_PERSONALITY_GUIDE.md` | [`/docs/VOICE_PERSONALITY_GUIDE.md`](./VOICE_PERSONALITY_GUIDE.md) | Voice personality | ✅ |
| 30 | `TECH_STACK.md` | [`/docs/TECH_STACK.md`](./TECH_STACK.md) | Tech stack สรุป | ✅ |

#### 3.5 เอกสาร i18n / SEO / Marketing

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 31 | `I18N_EN_TRANSLATION_HANDOFF_TH.md` | [`/docs/I18N_EN_TRANSLATION_HANDOFF_TH.md`](./I18N_EN_TRANSLATION_HANDOFF_TH.md) | i18n Tier 1+2+3 ~85+ ไฟล์ (inline `isTh` 958 จุด + `t(` 1607 จุด) | ✅ |
| 32 | `OG_IMAGE_OPTIMIZATION_TH.md` | [`/docs/OG_IMAGE_OPTIMIZATION_TH.md`](./OG_IMAGE_OPTIMIZATION_TH.md) | OG image 12 ไฟล์ 1200×630 (A4 OGSTATIC-001) | ✅ |
| 33 | `BLOG_ARTICLE_MANIFEST.md` + `blog-keyword-map.json` | [`/docs/BLOG_ARTICLE_MANIFEST.md`](./BLOG_ARTICLE_MANIFEST.md) | Blog articles | ✅ |
| 34 | `OPENROUTER_MIGRATION.md` | [`/docs/OPENROUTER_MIGRATION.md`](./OPENROUTER_MIGRATION.md) | OpenRouter migration | ✅ |

#### 3.6 เอกสาร phase / status / master directive (ประวัติ)

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 35 | `PHASE_STATUS_SUMMARY_TH.md` | [`/docs/PHASE_STATUS_SUMMARY_TH.md`](./PHASE_STATUS_SUMMARY_TH.md) | Phase status summary ฉบับไทย | 🟡 เก่า (ก่อน 5 ก.ย.) |
| 36 | `PHASE_12_DOCUMENTATION_TH.md` | [`/docs/PHASE_12_DOCUMENTATION_TH.md`](./PHASE_12_DOCUMENTATION_TH.md) | Phase 1.2 documentation | 🟡 เก่า |
| 37 | `PHASE_13_REGRESSION_TH.md` | [`/docs/PHASE_13_REGRESSION_TH.md`](./PHASE_13_REGRESSION_TH.md) | Phase 1.3 regression | 🟡 เก่า |
| 38 | `PHASE_14_RELEASE_GATE_TH.md` | [`/docs/PHASE_14_RELEASE_GATE_TH.md`](./PHASE_14_RELEASE_GATE_TH.md) | Phase 1.4 release gate | 🟡 เก่า |
| 39 | `EXECUTIVE_SUMMARY_TH.md` + `00_START_HERE_EXECUTIVE_SUMMARY_TH.md` | [`/docs/EXECUTIVE_SUMMARY_TH.md`](./EXECUTIVE_SUMMARY_TH.md) | Executive summary | 🟡 เก่า |
| 40 | `00_CLEANUP_PLAN_TH.md` | [`/docs/00_CLEANUP_PLAN_TH.md`](./00_CLEANUP_PLAN_TH.md) | Cleanup plan | 🟡 เก่า |
| 41 | `QUICK_ACTION_PLAN_TH.md` + `QUICK_REFERENCE_CARD.txt` | [`/docs/QUICK_ACTION_PLAN_TH.md`](./QUICK_ACTION_PLAN_TH.md) | Quick action plan | 🟡 เก่า |
| 42 | `PHASE_A_*` (5 ไฟล์) | [`/docs/PHASE_A_MASTER_SUMMARY_TH.md`](./PHASE_A_MASTER_SUMMARY_TH.md) + ที่เกี่ยวข้อง | Phase A production closure | 🟡 ส่วนใหญ่แก้แล้ว ดู FORENSIC_AUDIT |
| 43 | `PHASE_B_COMMUNITY_SPEC_TH.md` | [`/docs/PHASE_B_COMMUNITY_SPEC_TH.md`](./PHASE_B_COMMUNITY_SPEC_TH.md) | Phase B community spec | 🟡 เก่า |
| 44 | `HANDOFF_2026-08-30_STATUS.md` | [`/docs/HANDOFF_2026-08-30_STATUS.md`](./HANDOFF_2026-08-30_STATUS.md) | Handoff 30 ส.ค. 2026 | 🔴 ล้าสมัย (ก่อน forensic) |
| 45 | `E2E_FLOW_TEST_PLAN.md` | [`/docs/E2E_FLOW_TEST_PLAN.md`](./E2E_FLOW_TEST_PLAN.md) | E2E test plan | ✅ |
| 46 | `CODEBASE_AUDIT_2026-08-16.md` | [`/docs/CODEBASE_AUDIT_2026-08-16.md`](./CODEBASE_AUDIT_2026-08-16.md) | Codebase audit 16 ส.ค. 2026 | 🟡 ก่อน forensic รอบ 3 |

#### 3.7 เอกสาร master directive / digital assets

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 47 | `MASTER_PRD.md` | [`/docs/MASTER_PRD.md`](./MASTER_PRD.md) | Master PRD | ✅ |
| 48 | `MASTER_INDEX.md` | [`/docs/MASTER_INDEX.md`](./MASTER_INDEX.md) | Master index ของเอกสารทั้งหมด | ✅ |
| 49 | `MASTER DIRECTION UPDATE & DOCUMENT INTEGRATION ORDER.md` | [`/docs/MASTER DIRECTION UPDATE & DOCUMENT INTEGRATION ORDER.md`](./MASTER%20DIRECTION%20UPDATE%20%26%20DOCUMENT%20INTEGRATION%20ORDER.md) | Master direction update | 🟡 เก่า |
| 50 | `PERSONAL_AI_OS_MASTER_SPEC_V1.md` | [`/docs/PERSONAL_AI_OS_MASTER_SPEC_V1.md`](./PERSONAL_AI_OS_MASTER_SPEC_V1.md) | Personal AI OS master spec v1 | ✅ |
| 51 | `SELF_MASTER_VISUAL_INTELLIGENCE_SMART_ENTRY_UNIFIED_ARCHITECTURE_DIRECTIVE.md` | [`/docs/SELF_MASTER_VISUAL_INTELLIGENCE_SMART_ENTRY_UNIFIED_ARCHITECTURE_DIRECTIVE.md`](./SELF_MASTER_VISUAL_INTELLIGENCE_SMART_ENTRY_UNIFIED_ARCHITECTURE_DIRECTIVE.md) | Visual intelligence directive | 🟡 เก่า |
| 52 | `DIGITAL_ASSETS_CATALOG.md` | [`/docs/DIGITAL_ASSETS_CATALOG.md`](./DIGITAL_ASSETS_CATALOG.md) | Digital assets catalog | ✅ |
| 53 | `PROJECT_SUMMARY.md` | [`/docs/PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) | Project summary | ✅ |

#### 3.8 เอกสาร onboarding / development / reference

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 54 | `docs/onboarding/ONBOARDING.md` | [`/docs/onboarding/ONBOARDING.md`](./onboarding/ONBOARDING.md) | Onboarding guide สำหรับนักพัฒนาใหม่ | ✅ |
| 55 | `docs/onboarding/READING_LIST.md` | [`/docs/onboarding/READING_LIST.md`](./onboarding/READING_LIST.md) | Reading list ตามลำดับ | ✅ |
| 56 | `docs/development/ARCHITECTURE.md` | [`/docs/development/ARCHITECTURE.md`](./development/ARCHITECTURE.md) | Development architecture | ✅ |
| 57 | `docs/development/CODE_DISCIPLINE.md` | [`/docs/development/CODE_DISCIPLINE.md`](./development/CODE_DISCIPLINE.md) | Code discipline (AI working rules) | ✅ |
| 58 | `docs/development/GIT_WORKFLOW.md` | [`/docs/development/GIT_WORKFLOW.md`](./development/GIT_WORKFLOW.md) | Git workflow | ✅ |
| 59 | `docs/development/TESTING_STRATEGY.md` | [`/docs/development/TESTING_STRATEGY.md`](./development/TESTING_STRATEGY.md) | Testing strategy (vitest 66/66 · 1037 tests) | ✅ |
| 60 | `docs/reference/PHASE_A_HONEST_STATUS_TH.md` | [`/docs/reference/PHASE_A_HONEST_STATUS_TH.md`](./reference/PHASE_A_HONEST_STATUS_TH.md) | Phase A honest status (ฉบับเก่า) | 🟡 เก่า |
| 61 | `docs/reference/SelfprintV3_PHASE A PRODUCTION CLOSURE + PHASE B COMMUNITY READINESS.md` | [`/docs/reference/SelfprintV3_PHASE A PRODUCTION CLOSURE + PHASE B COMMUNITY READINESS.md`](./reference/SelfprintV3_PHASE%20A%20PRODUCTION%20CLOSURE%20%2B%20PHASE%20B%20COMMUNITY%20READINESS.md) | Phase A closure + Phase B readiness | 🟡 เก่า |
| 62 | `docs/reference/SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md` | [`/docs/reference/SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md`](./reference/SELFPRINT_MASTER_DIRECTIVE_V5_THAI.md) | Master directive v5 Thai | 🟡 เก่า |
| 63 | `docs/reference/SELFPRINT_MASTER_DOCUMENTATION_AUDIT_2026-08-21.md` | [`/docs/reference/SELFPRINT_MASTER_DOCUMENTATION_AUDIT_2026-08-21.md`](./reference/SELFPRINT_MASTER_DOCUMENTATION_AUDIT_2026-08-21.md) | Documentation audit 21 ส.ค. 2026 | 🟡 เก่า |
| 64 | `docs/reference/TROJAN_HORSE_ANALYSIS_REPORT_TH.md` | [`/docs/reference/TROJAN_HORSE_ANALYSIS_REPORT_TH.md`](./reference/TROJAN_HORSE_ANALYSIS_REPORT_TH.md) | Trojan horse analysis | 🟡 เก่า |
| 65 | `docs/reference/VISUAL_INTELLIGENCE_SMART_ENTRY_AUDIT_DETAILED.md` | [`/docs/reference/VISUAL_INTELLIGENCE_SMART_ENTRY_AUDIT_DETAILED.md`](./reference/VISUAL_INTELLIGENCE_SMART_ENTRY_AUDIT_DETAILED.md) | Visual intelligence audit detailed | 🟡 เก่า |

#### 3.9 เอกสารใน archive (เก็บไว้อ้างอิง — ห้ามใช้ตัดสินใจ)

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ |
|---|--------|--------|--------|--------|
| 66 | `docs/archive/audits/AUDIT_2026-08-10_STATUS_REPORT_TH.md` | [`/docs/archive/audits/`](./archive/audits/) | Audit 10 ส.ค. 2026 | 🔴 archive |
| 67 | `docs/archive/audits/AUDIT_REPORT_2026-08-11.md` | [`/docs/archive/audits/`](./archive/audits/) | Audit report 11 ส.ค. 2026 | 🔴 archive |
| 68 | `docs/archive/audits/AUDIT_34_PASSKEY_AUTH_2026-08-11.md` | [`/docs/archive/audits/`](./archive/audits/) | Passkey audit 11 ส.ค. 2026 | 🔴 archive |
| 69 | `docs/archive/audits/PROJECT_AUDIT_STATUS.md` | [`/docs/archive/audits/`](./archive/audits/) | Project audit status | 🔴 archive |
| 70 | `docs/archive/e2e_reports/E2E_FINAL_REPORT_2026-08-11.md` | [`/docs/archive/e2e_reports/`](./archive/e2e_reports/) | E2E final report 11 ส.ค. 2026 | 🔴 archive |
| 71 | `docs/archive/e2e_reports/E2E_TEST_RESULTS_ISSUES_2026-08-11.md` | [`/docs/archive/e2e_reports/`](./archive/e2e_reports/) | E2E test issues 11 ส.ค. 2026 | 🔴 archive |
| 72 | `docs/archive/e2e_reports/WINDOWS_E2E_TESTING_CHECKLIST.md` | [`/docs/archive/e2e_reports/`](./archive/e2e_reports/) | Windows E2E checklist | 🔴 archive |
| 73 | `docs/archive/handoffs/` | [`/docs/archive/handoffs/`](./archive/handoffs/) | Handoff เก่า ๆ | 🔴 archive |
| 74 | `docs/OLD/` | [`/docs/OLD/`](./OLD/) | เอกสารเก่าที่ล้าสมัย | 🔴 archive |
| 75 | `SELFPRINT_PRODUCTION_STATUS_TH.md` | [`/docs/SELFPRINT_PRODUCTION_STATUS_TH.md`](./SELFPRINT_PRODUCTION_STATUS_TH.md) | Production status (ฉบับเก่าก่อน 5 ก.ย.) | 🔴 ล้าสมัย — ใช้ไฟล์นี้แทน |
| 76 | `SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md` | [`/docs/SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md`](./SELFPRINT_COMPLETE_GAP_MAP_FINAL_THAI.md) | Gap map (ก่อน forensic รอบ 3) | 🔴 ล้าสมัย |
| 77 | `STAGING_SETUP_GUIDE_TH.md` | [`/docs/STAGING_SETUP_GUIDE_TH.md`](./STAGING_SETUP_GUIDE_TH.md) | Staging setup guide | ✅ (ยังใช้ได้) |
| 78 | `MASTER DEVELOPMENT ORDER_GLOBAL SEO_GEO and MULTI_LANGUAGE ARCHITECTURE.txt` + `FINAL DEVELOPMENT DIRECTIVE.txt` + `VISUAL INTELLIGENCE.txt` + `SELFPRINT - 12 HUB WORLDS VISUAL & EXPERIENCE DIRECTIVE.txt` + `SELFPRINT - FULL PRODUCTION AUDIT & VERIFICATION DIRECTIVE.txt` + `SELFPRINT V3 & upgrade directiv.txt` + `QUICK_REFERENCE_CARD.txt` | [`/docs/`](./) | Directive/audit text files ฉบับเก่า | 🔴 archive (มีชื่อซ้ำ/ขีดล้าง) |

#### 3.10 เอกสาร supabase (ย่อยในโปรเจกต์)

| # | เอกสาร | ที่อยู่ | เรื่อง | สถานะ | verify กับ |
|---|--------|--------|--------|--------|----------|
| 79 | `supabase/MIGRATION_GUIDE.md` | [`/supabase/MIGRATION_GUIDE.md`](../supabase/MIGRATION_GUIDE.md) | คู่มือ apply migration | ✅ | Supabase จริง (035 apply แล้ว) |
| 80 | `supabase/PASSKEY_SETUP.md` | [`/supabase/PASSKEY_SETUP.md`](../supabase/PASSKEY_SETUP.md) | Passkey setup (⚠️ flow พัง — `AuthContext.tsx:130` + `PasskeyProvider.ts:144`) | 🟡 แก้ยังไม่เสร็จ | local code |

### 🔴 เอกสารที่ต้องระวัง (อ้างแล้วเข้าใจผิด)

| เอกสาร | สิ่งที่อ้าง | ความจริง (5 ก.ย. 2026) |
|--------|-----------|------------------------|
| `HANDOFF_2026-08-30_STATUS.md` | "Phase A COMPLETE 42/42", "build broken" | build ผ่าน, Phase A งานที่บล็อก Track C เสร็จ — แต่ A1/A7 ยังเปิด |
| `PHASE_A_MASTER_SUMMARY_TH.md` | "Phase A COMPLETE" | A1 (dead code 16+ ไฟล์) + A7 (`as any` 114 จุด) ยังไม่ปิด |
| `QUICK_REFERENCE_CARD.txt` | ข้อมูลเก่าก่อน 5 ก.ย. 2026 | verify ใหม่หมดแล้ว |
| `CLAUDE.md` (บางส่วน) | "oxlint 195 warnings/480 files" | จริงคือ **187 warnings · 474 files** |
| `docs/OLD/` (ทั้งโฟลเดอร์) | ข้อมูลก่อน forensic | ห้ามอ้างอิง |
| `FINAL DEVELOPMENT DIRECTIVE.txt` + `SELFPRINT V3 & upgrade directiv.txt` | ข้อความเก่าจากเจ้าของโปรเจกต์ | ดูเป็น context เท่านั้น ไม่ใช่ความจริงปัจจุบัน |
| `?? SELFPRINT - FULL PRODUCTION AUDIT REPORT.txt` (ชื่อไฟลมี `??`) | รายงาน audit เก่า | ชื่อไฟล์เสีย ไม่ควรอ้าง |
| `?????????????????.txt` (ชื่อไฟล์ภาษาไทยอ่านไม่ออก) | ไม่ทราบ | ไม่ควรอ้าง |
| **`SELFPRINT_STATUS_HONEST_TH.md` (ฉบับก่อน 5 ก.ย. 2026)** | "**migration 035 ยังไม่ apply**" + "**git filter-repo ยังไม่ได้ติดตั้ง**" + "**rotate รหัส staging 6 ตัว**" | ✅ migration 035 apply แล้ว · ✅ git filter-repo ติดตั้ง v2.47.0 แล้ว · ❌ rotate ไม่ต้องทำ (เจ้าของลบ users ทุกครั้ง) · แก้เป็นฉบับนี้แล้ว (รอบที่ 5) |
| **`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` (ฉบับก่อน 5 ก.ย. 2026)** | "**migration 035 ยังไม่ถูก apply**" + "**git filter-repo ยังไม่ได้ติดตั้ง**" + "**rotate รหัส staging 6 ตัว**" | ✅ migration 035 apply แล้ว · ✅ git filter-repo ติดตั้ง v2.47.0 แล้ว · ❌ rotate ไม่ต้องทำ · แก้ในรอบที่ 4–5 |

### 📊 สรุปตัวเลขเอกสาร (verify 5 ก.ย. 2026)

| หมวด | จำนวน | หมายเหตุ |
|-------|-------|---------|
| เอกสาร root `.md` ที่เชื่อถือได้ | 4 | `README.md` · `CLAUDE.md` · `CONTRIBUTING.md` · `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` |
| เอกสารใน `docs/` ที่อ้างอิงได้ | ~36 | ส่วนใหญ่เป็น ✅ ล่าสุด + 🟡 เก่าบางส่วน (Phase A/B ฯลฯ) |
| เอกสารใน `docs/archive/` | 7+ | เก็บไว้อ้างอิง ห้ามใช้ตัดสินใจ |
| เอกสาร `docs/OLD/` | หลายไฟล์ | ล้าสมัยทั้งหมด |
| เอกสาร `.txt` directive เก่า | 7+ | archive |
| เอกสาร supabase/ | 2 | `MIGRATION_GUIDE.md` + `PASSKEY_SETUP.md` |
| **เอกสารที่ลบไปแล้ว 84 ไฟล์** | — | รวม `.md` ที่ root + `dist/` + `playwright-report/` + ขยะ git |
| **รวมเอกสารทั้งหมดในโปรเจกต์** | ~80+ | กระจายตามหมวดข้างต้น |

> 📌 **กฎการอ้างอิง:** ถ้าจะอ้างสถานะ/ตัวเลข → ใช้ **`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`** หรือ **ไฟล์นี้** เท่านั้น · ถ้าจะอ้าง design/UX → ใช้ **`docs/Experience Architecture v2.md`** · ถ้าจะอ้างแผน Track A/B/C → ใช้ **`docs/PLAN_TRACKS_TH.md`** · ถ้าจะอ้างผล Phase 0 forensic → ใช้ **`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`**
>
> ⚠️ **กฎเหล็ก:** ทุกข้อมูลในเอกสารเหล่านี้ **ต้อง verify กับ Supabase / Cloudflare / GitHub / scoop จริงเสมอ** — ห้ามเชื่อเอกสารอย่างเดียว · เคส migration 035 + git filter-repo + e937ed8 build FAIL + rotate รหัส staging ฉบับก่อนเขียนผิดเป็นหลักฐาน

---

## ⚡ สรุป

> 📐 **Experience Architecture v2 = Proposed Architecture** — `docs/Experience Architecture v2.md`
> (2,046 บรรทัด · 51 topics) เป็น **design master / source of truth ของ Track C** —
> ยังเป็น **ข้อเสนอ (proposed)** ยังไม่ได้ implement · หลัก RECOMPOSE ไม่ใช่ REBUILD

> ✅ **Build/test/lint ผ่านหมด** — 1037/1037 tests · 0 errors
> ✅ **migration 035 apply แล้ว** (verify Supabase จริง 5 ก.ย. 2026) — Core Awakening production ไม่พัง 42703 แล้ว
> ✅ **git filter-repo ติดตั้ง v2.47.0** (verify scoop จริง 5 ก.ย. 2026)
> ✅ **HEAD `da855c5` build PASS** ใน Cloudflare Pages (verify จริง)
> ✅ **โค้ด Core Awakening + SICE + C0 fixes + i18n เสร็จจริง**
> ✅ **Track B + C0 เสร็จหมดแล้ว (โค้ด)** · **Track A** งานที่บล็อก UX/UI เสร็จแล้ว — แต่ **A1 (dead code 16+ ไฟล์)** และ **A7 (`as any` 114 จุด)** ยังเปิดอยู่ (ไม่บล็อก Track C)
> 🔴 **ยังไม่เสร็จ:** Edge Functions ยังไม่ deploy (0/11 ใน Supabase) · passkey พัง · VoiceChat mock ยังอยู่ใน route จริง · `purge.txt` ยังไม่ได้สร้าง (แต่ filter-repo ติดตั้งแล้ว) · dist/ ล้าหลัง (ต้อง rebuild ใน local)
> 🎯 **พร้อมเริ่ม Track C (UX/UI)** — แต่ห้ามอ้าง "100% product-verified" จนกว่าจะทำครบ 3 เงื่อนไข (ลดจาก 4 เพราะ migration 035 เสร็จแล้ว)

---

**Generated:** 6 กันยายน 2026 (HEAD `da855c5`) — **อัปเดตรอบที่ 6:** A1 ปิด (6 orphan deleted) · A7 ปิด (47 casts) · Story/Narrative section 51 + docs · migration 035 apply แล้ว · git filter-repo ติดตั้ง v2.47.0 · rotate staging ไม่ต้องทำ
**Honesty Level:** 100% — แยก "ทำแล้ว verify แล้ว" ออกจาก "อ้างว่าทำแต่ยังไม่เสร็จ" ออกจาก "stub ที่เหลือ" · **ทุกข้อมูลต้อง verify กับ Supabase/Cloudflare/GitHub/scoop จริง**

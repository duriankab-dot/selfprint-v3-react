# FORENSIC AUDIT — สถานะจริงของ SELFPRINT V3

**อัปเดตล่าสุด:** 7 กันยายน 2026 · รอบที่ 7 · HEAD `710afa0`
**Baseline เดิม:** HEAD `da855c5` (6 ก.ย. 2026)
**วิธีตรวจ:** อ่านซอร์สโค้ดจริง + **verify กับ Supabase / Cloudflare / GitHub / scoop จริง** — **ไม่เชื่อไฟล์ `.md` ใด ๆ** รวมถึงฉบับก่อนของไฟล์นี้เอง
**เครื่องมือ:** clone จาก GitHub + รัน build/test/lint จริง + agent เฉพาะทาง 6 ตัว + Supabase SQL Editor + Supabase Functions dashboard + Cloudflare Pages dashboard + Cloudflare Workers + scoop

> ✅ **แก้รอบที่ 4 (5 ก.ย. 2026):** ฉบับรอบที่ 3 เขียนว่า "**migration 035 ยังไม่ apply**" — verify กับ Supabase SQL Editor แล้ว (5 ก.ย. 2026) พบว่า **migration 035 apply แล้ว** · `SELECT '035_forensic_consolidation_2026-09-03 complete' AS status;` → `complete` · แก้ทั้งไฟล์นี้และ [`docs/SELFPRINT_STATUS_HONEST_TH.md`](./docs/SELFPRINT_STATUS_HONEST_TH.md) ให้ตรงกัน
>
> ✅ **แก้รอบที่ 5 (5 ก.ย. 2026):** แก้อีก 3 จุดจากการตรวจ:
> - **`git filter-repo` ติดตั้งแล้ว v2.47.0** (verify `where git-filter-repo` + `scoop list | findstr filter`) — เอกสารรอบที่ 3 เขียนว่า "ยังไม่ได้ติดตั้ง" ผิด
> - **`purge.txt` ยังไม่ได้สร้าง** (verify `dir purge.txt` → `File Not Found`) — ต้องสร้างก่อนรัน filter-repo
> - **rotate รหัส staging 6 ตัว = ไม่ต้องทำ** (เจ้าของลบ users ทุกครั้งหลังทดสอบ) — เอกสารรอบที่ 3 เขียนเกินจริง
> - **`e937ed8` build FAIL ใน Cloudflare Pages** (verify Cloudflare build log) — สาเหตุ: `npm ci` EUSAGE (lock file ไม่ sync กับ `package.json` ที่เพิ่ม Tailwind 4 packages) + `wrangler.toml` ไม่มี `pages_build_output_dir` · **ไม่ใช่** เพราะ `:` ใน commit message (ตามที่เจ้าของสงสัย)
>
> 📌 **บทเรียนรอบที่ 4–5:** แม้แต่เอกสาร "single source of truth" ก็ยังอาจเขียนผิดได้ — ต้อง verify กับ Supabase/Cloudflare/GitHub/scoop จริงเสมอ ไม่ใช่เชื่อเอกสารอย่างเดียว

> ⚠️ **ไฟล์นี้คือเอกสารสถานะฉบับเดียวที่ถูกต้อง** — ไฟล์ `.md` ที่ root อีก 84 ไฟล์
> ถูกลบทิ้งแล้วในรอบนี้เพราะอ้างสิ่งที่โค้ดไม่ได้ทำ (ดูหัวข้อ 8)
> แผนงานรวมอยู่ที่ `docs/PLAN_TRACKS_TH.md`

---

## 0. TL;DR

**ปลดล็อกใหญ่:** `npm run build` / `test` / `lint` **รันได้แล้ว** — ที่เอกสารเก่าบอกว่า
"Rolldown ใช้กับ Linux ไม่ได้" มาหลายเซสชันนั้น **วินิจฉัยผิด** สาเหตุจริงคือ
`npm install` ถูกขัดจังหวะจนไฟล์ `.node` ถูกตัดกลางคัน
(rolldown 248 KB จากของจริง 19.9 MB · lightningcss 2.8/10.0 MB · oxlint 1.1/16.0 MB)

**สถานะ gate ปัจจุบัน — HEAD `710afa0` · 7 ก.ย. 2026**

| gate | ผล | verify กับ |
|------|-----|----------|
| `tsc -b` (strict) | ✅ 0 errors | local build |
| `npm run typecheck:functions` | ✅ 0 errors | local build |
| `vite build` | ✅ สำเร็จ (3.81 s · 933 modules) | local build |
| `oxlint` | ✅ 0 errors · 187 warnings · 474 files | local build |
| `vitest run` | ✅ **66/66 ไฟล์ · 1037 tests · 0 fail · 0 skip** | local build |
| **E2E Playwright CI** | ✅ **run #305 ผ่านหมด** — 7 ก.ย. 2026 | **GitHub Actions จริง** |
| **Production `selfprint.one`** | ✅ `/th/` + `/en/` โหลดได้ปกติ ไม่มี error boundary | **Chrome DevTools จริง** 7 ก.ย. 2026 |
| **Supabase migration 035** | ✅ apply แล้ว | Supabase SQL Editor 5 ก.ย. 2026 |
| **Supabase Edge Functions** | ✅ 12 functions deployed · ทุกตัวตอบ 401 · SEC-02 live | Supabase Functions dashboard 6 ก.ย. 2026 |
| **`git filter-repo`** | ✅ v2.47.0 ติดตั้งแล้ว · `purge.txt` ยังต้องสร้าง | scoop 5 ก.ย. 2026 |

**✅ Track A + B + C0 เสร็จหมดแล้ว · Production ทำงานได้ · E2E CI ผ่าน · เหลือแต่ Track C (visual redesign)**

งาน C0 ที่เคลียร์ทางให้ Track C (4 ก.ย. 2026):

| รหัส | เรื่อง |
|------|-------|
| `TWFIX-001` | **ติดตั้ง Tailwind v4 ให้ทำงานจริง** — `@tailwindcss/vite` + `@config` อ่าน token เดิม · **ตั้งใจไม่เปิด preflight** เพื่อไม่ให้ทับ CSS เขียนมือ ~30 ไฟล์ก่อน Track C จะได้ออกแบบใหม่ · พิสูจน์: `--tw-` 545 จุดใน bundle (เดิม 0) |
| `REALBUG-001..004` | แก้ครบทั้ง 4 → un-skip 11 เทสต์ ผ่านหมด **1037/1037 · 0 skip** |
| `SEC-02` | `send-push` / `daily-brief` / `pattern-detect` บังคับ JWT + user id จาก token เท่านั้น (body ไม่ตรง → 403) — ✅ **แก้แล้วและ deploy แล้ว** — verified 6 Sep 2026, ทุก function ตอบ 401 |
| `NAVGAP-001` | nav หายช่วง 761–1023 px (iPad/Surface แนวตั้ง) — ขยาย BottomNav ให้ชนกับ NavRail |
| `DEADCHUNK-001` | ลบ manualChunks branch ที่ตาย 2 อัน (`vendor-motion`, `decision-components`) — **PARTIAL (บางส่วน)**: `vendor-supabase` (ถูกดูดเข้า chunk-intelligence) + `decision-services` (static import) branch ยังเปิด |
| `ASSET404-001` | แก้ asset ที่โค้ดอ้างแต่ไม่มีไฟล์จริง 8 รายการ + ลบ `hero.png` 778 kB ที่ไม่มีใคร import — **PARTIAL (บางส่วน)**: `public/audio/` หาย + `soundscape-manifest.json` 23 CLOUDINARY_URL + `logo.png`/`og-image.png` ยังเปิด |
| `RAFLOOP-001` | rAF loop บนหน้าแรกเคารพ `prefers-reduced-motion` + หยุดเมื่อแท็บถูกซ่อน |
| `HOMEBLANK-001` | หน้าแรกไม่ blank แล้ว — dist/ rebuild เป็น `index-DE3pLhDs.js` (เดิม `index-DuuIO42s.js` มีโค้ดเก่า) |

> ⚠️ **F-05 ยังเปิด** — dep 3 ตัว (`web-vitals`, `@simplewebauthn/browser`, `@simplewebauthn/server`) **ยังติดอยู่** ถอดเป็นงานที่ค้าง (ยังไม่ทำ) — ไม่ได้อยู่ในตาราง C0 ที่เสร็จ

**✅ APPLY แล้ว (5 ก.ย. 2026 — verify Supabase SQL Editor)** — ไม่ใช่งานเร่งด่วนอีกต่อไป · ดูหัวข้อ 2.2
ทดสอบกับ **PostgreSQL 18.4 จริง** แล้ว 3 เคส: DB แบบ production / รันซ้ำ / DB ว่าง

**อ่านต่อ:** `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` = ผล Phase 0 ครบ 10 หัวข้อ
ต้องอ่านก่อนเริ่ม Track C ทุกกรณี

---

## 1. งานที่แก้เสร็จแล้ว — ผ่าน compiler จริงทุกข้อ

### รอบที่ 1 — P0 ที่ทำให้โปรดักต์พัง

| รหัส | เรื่อง |
|------|-------|
| `AUTHHDR-001` | **แชททั้งระบบตอบ 401 ทุก request** — client ไม่เคยส่ง `Authorization` แต่ CF Pages บังคับ → Nova/Twin/floating chat ใช้ไม่ได้เลย 100% |
| `NOVAPROV-001` | **`/chat/nova` จอขาวทุกครั้ง** — `useNova()` ถูกเรียกโดยไม่มี `NovaProvider` mount ที่ไหนเลย |
| `ERRBOUND-001` + `SENTRY-INIT-001` | ไม่มี ErrorBoundary ทั้งโปรเจกต์ + Sentry ติดตั้งแต่ไม่เคย `init()` → error ทุกตัว = จอขาวเงียบ ๆ |
| `AUTONOMY-FIX-001` | `/api/autonomy-log` พัง 4 ชั้น บันทึกได้ 0 แถวมาตลอด (ไม่มี auth / payload คนละ contract / เขียนผิดตาราง / โกหกว่าสำเร็จ) |
| `METRICS-FIX-001` | `/api/metrics` ไม่มี auth + เขียนผิด schema + บั๊ก operator precedence ทำให้ `rating` เป็นตัวเลข |
| `CFBUFFER-001` | `Buffer` ใน `generateShareCode()` ไม่มีบน Workers runtime |
| `STRIPEWH-001` | Stripe webhook ใช้ `constructEvent` (sync/node crypto) → subscription ไม่เคย sync |
| `ENVNAME-001` | `getAnonSupabase` อ่าน `VITE_*` ที่ไม่มีใน runtime → 3 endpoint ตอบ 500 |
| `NOTIFAUTH-001` | notification POST ทุก action เชื่อ `body.userId` ทั้งที่มี `user` ที่ verify แล้วในขอบเขต |
| `NOTIFCOL-001` | `notification_queue` ใช้ชื่อคอลัมน์ camelCase แต่ schema เป็น snake_case |
| `TWINEVOAUTH-001` | `/api/twin-evolution` ไม่มี auth เลย (รอดเพราะ RLS บังเอิญ) |
| `DEBUGLEAK-001` | ส่ง Postgres error / stack ให้ client 10 จุด (มี endpoint ที่ไม่ต้อง login ด้วย) |
| `COACH404-001` | AskCoach rollout default 10% แต่ `/api/coach` ไม่มี handler → ผู้ใช้ 10% เห็นฟีเจอร์พัง |
| `JOURNAL404-001` | journal-sync 404 แล้ว mark failed ถาวร |
| `SCHEMA-TS-002` | ย้าย `blueprints`/`users_profiles`/`share_links` ไป schema `selfprint` ใน type file |
| `TSCONFIG-FUNCTIONS-001` | เพิ่ม typecheck ให้ `functions/` + `api/` **ครั้งแรกในประวัติโปรเจกต์** → เจอ 13 errors ที่ซ่อนอยู่ แก้ครบ |
| `GITIGNORE-FIX-001` + `CRLF-001` | แก้ `.gitignore` 2 บรรทัดที่เขียนผิดจนกฎไม่ทำงาน + เพิ่ม `.gitattributes` |

### รอบที่ 2 — Track A

**A1 · ล้าง Vercel + dead code** — ลบ 65 ไฟล์ ตรวจ importer ทุกไฟล์ก่อนลบ

```
.vercel/ · vercel.json · .vercelignore
api/{twin,nova,og,og.tsx,metrics}.ts · api/_archived/ · api/edge/ · api/__tests__/
server/ ทั้งโฟลเดอร์  (พังอยู่แล้ว: server/index.ts:28 import ../api/decisions ที่ไม่มีจริง)
src/api/ · src/middleware/ · src/lib/api/ · src/components/decision/ ทั้งโฟลเดอร์
src/services/{nova-ai,personalModel}.ts · src/lib/supabase/supabase.ts
src/hooks/usePushSubscription.ts · functions/api/rate-limiter.ts
components/{TwinEvolutionDisplay,WorldEnvironment}.tsx  (ตัวจริงอยู่ในโฟลเดอร์ย่อย)
dependency ที่ไม่มีใครใช้ 10 ตัว: three, @types/three, @vercel/og, @vercel/node,
  express, cors, helmet, dotenv, ts-node, concurrently, web-push, @types/{express,cors}
```

> 📌 **audit รอบแรกผิด 1 จุด** — `components/features/DecisionList.tsx` ถูกใช้จริงโดย
> `features/DecisionLogger.tsx:24` ผมจึงเก็บไว้ ไม่ได้ลบตามที่ audit แนะนำ

**A2 · env + รหัสผ่าน** (`E2EPW-001`, `ENVDOC-001`)
ย้ายรหัสผ่านบัญชี staging 6 ตัวออกจากโค้ดไปเป็น env (มี `requireEnv()` ที่ fail ดัง ๆ
ถ้าไม่ได้ตั้งค่า) + ลบรหัสออกจาก `console.log` สรุปท้ายสคริปต์ +
เขียน `.env.example` ใหม่ทั้งไฟล์ให้ครบทั้งฝั่ง client / server / e2e

> 📌 **หมายเหตุเพิ่ม (รอบที่ 5):** เจ้าของแจ้งว่า "**ปกติดทดลองเสร็จจะลบยูสทุกครั้งก่อนลองใหม่**" → ดังนั้น staging users จะถูกลบทุกครั้งอยู่แล้ว ไม่ต้อง "rotate รหัส" — ข้อความเก่าในเอกสารที่ว่า "ต้อง rotate รหัสผ่านบัญชี staging 6 ตัว" จึง **เกินจริง**

**A4 · OG image** (`OGSTATIC-001`, `OGABS-001`, `OGFONT-001`)
เจอหนักกว่าที่ audit บอก — ไม่ใช่แค่ `/api/og` คืน HTML แต่ **ไฟล์ `/og-*.jpg` ทั้ง 12 ไฟล์
ไม่มีอยู่จริงใน `public/` เลย** social preview จึงพังทุกหน้า ไม่ใช่แค่หน้าแรก

สร้างรูปจริงครบ 12 ไฟล์ ขนาด 1200×630 ด้วย design token ของโปรเจกต์เอง
(navy `#0F1F3F` → `#1E3A5F`, accent `#5B5CEB`) รองรับไทย+อังกฤษผสมในบรรทัดเดียว
+ แก้ให้เป็น absolute URL + เพิ่ม `og:image:width/height` + `twitter:card`
+ ลบ `functions/api/og.ts` ทิ้ง

**A9 · ล้างเอกสาร** — ลบ `.md` ที่ root **84 ไฟล์** + ไฟล์ขยะจากคำสั่ง git ที่พิมพ์ผิด 14 ไฟล์
+ `dist/` + `playwright-report/` + `test-results/` เหลือที่ root 4 ไฟล์:
`README.md` · `CLAUDE.md` · `CONTRIBUTING.md` · ไฟล์นี้

**A3 (บางส่วน) · `ENVTICK-001`**
`EnvironmentContext` ตั้ง `setInterval(compute, 60s)` ใน `useEffect` ที่ deps เป็น `[]`
จึงค้าง closure ของ `compute` ตอน mount ไว้ตลอด แต่ `compute` เปลี่ยนตัวใหม่ทุกครั้ง
ที่ world/mood เปลี่ยน → **ทุก 60 วินาที บรรยากาศของแอปเด้งกลับไปเป็นของโลกเดิม**
แก้ด้วย ref pattern โดยไม่ re-arm interval

**A5 (โค้ดฝั่ง client) · `DBTBL-001`, `DBCOL-001`, `DBKEY-001`**

| ไฟล์ | เดิม | แก้เป็น | ผลกระทบ |
|------|-----|--------|---------|
| `PersonalContextBuilder.ts:286,426` | `.from('personal_contexts')` | `.from('personal_context')` | insert ล้มทุกครั้ง (42703) |
| `PatternDetector.ts:389` | `.from('personal_contexts')` | `.from('personal_context')` | select คอลัมน์ที่ไม่มี |
| `ExplorePage.tsx:445` | `.select('birth_date')` | `.select('date_of_birth')` | คอลัมน์ผิดชื่อ |
| `CoreAwakeningService.ts:70` | `.eq('id', userId)` | `.eq('user_id', userId)` | `id` เป็น surrogate key ไม่ใช่ auth uid |
| `database-init.ts:82,134` | `.eq('id', userId)` | `.eq('user_id', userId)` | ไม่เคย match แถวไหนเลย |
| `database-init.ts:100` | `{ id: userId, ... }` | `{ user_id: userId, ... }` | ไม่ส่ง `user_id` (NOT NULL) → insert ล้มทุกครั้ง |

---

## 2. งานที่ยังค้าง (ไม่เร่งด่วน)

### 2.1 git filter-repo (ไม่เร่งด่วน — key revoke แล้ว)

> ✅ **อัปเดตรอบที่ 5:** `git filter-repo` **ติดตั้งแล้ว v2.47.0** (verify จากเครื่องจริง 5 ก.ย. 2026)
> - คำสั่ง `where git-filter-repo` → `C:\Users\HP EliteBook\scoop\shims\git-filter-repo` ✅
> - คำสั่ง `scoop list | findstr filter` → `git-filter-repo 2.47.0 main 2026-09-05` ✅
> - เอกสารฉบับรอบที่ 3 เขียนว่า "ยังไม่ได้ติดตั้ง" — **ผิด** · แก้ในรอบที่ 5
>
> ⚠️ **แต่ `purge.txt` ยังไม่ได้สร้าง** — verify `dir purge.txt` ใน `D:\selfprint-v3-react` แล้ว `File Not Found`
> → ต้องสร้าง `purge.txt` ก่อนรัน `git filter-repo` (ไม่งั้น `FileNotFoundError: b'purge.txt'`)

ในประวัติ git มีไฟล์ชื่อ `feat(e2e): Add global-setup auth + Phase B test isolation in playwright.config`
(เกิดจากพิมพ์ `git commit` ผิด) ชื่อมี `:` ซึ่ง Windows สร้างไฟล์ไม่ได้ → filter-repo
เขียนประวัติเสร็จแต่ checkout index ล้มเหลว **สแกนพาธทั้ง 11,887 พาธแล้ว มีตัวนี้ตัวเดียวที่ผิดกฎ**

```powershell
cd D:\selfprint-v3-react
git bundle create ..\selfprint-backup.bundle --all      # สำรองก่อน

$lines = @(
  'literal:feat(e2e): Add global-setup auth + Phase B test isolation in playwright.config',
  'regex:^KEY/',
  'literal:.env.local',
  'regex:^supabase/\.temp/',
  'regex:^node_modules/',
  'regex:^dist/'
)
[IO.File]::WriteAllLines("$PWD\purge.txt", $lines, (New-Object Text.UTF8Encoding $false))

git filter-repo --invert-paths --paths-from-file purge.txt --force
git remote add origin https://github.com/duriankab-dot/selfprint-v3-react.git
git push --force origin master
git push --force origin p0-a/restore-lifecycle
del purge.txt
```

ยืนยัน syntax จาก `git-filter-repo --help` แล้ว — `--paths-from-file` รองรับ prefix
`literal:` / `glob:` / `regex:` ต้องใช้ `literal:` กับชื่อที่มี `:` `(` `)` เพราะถ้าใส่เป็น
argument ตรง ๆ PowerShell กับ regex จะตีความผิดทั้งคู่

---

## 3. ✅ Core Awakening — วินิจฉัยจบแล้ว (สถานะ 5 ก.ย. 2026)

> 📌 **อัปเดตรอบที่ 4 (5 ก.ย. 2026):** migration 035 apply แล้ว — Core Awakening บน production **ทำงานได้** (โค้ด + schema ครบ)

ไล่ `src/services/CoreAwakeningService.ts` ทีละบรรทัด:

| ขั้น | สถานะ | สาเหตุ |
|-----|-------|--------|
| `checkReadyForAwakening()` | ✅ แก้แล้ว | `.eq('user_id')` + `.maybeSingle()` — เดิม `.eq('id')` ไม่ match แถวไดม |
| `startAwakening()` | ✅ ทำงานได้ | 9 operations ผ่าน `Promise.allSettled` — schema ตรงกับ migration 025 |
| `initializeTwin()` → `createTwinInDatabase()` | ✅ **ทำงานได้แล้ว** (หลัง apply 035) | INSERT จริง 5 คอลัมน์ (`primary_archetype`, `secondary_archetype`, `maturity_score`, `evolution_stage`, `awakened_at`) — **schema ครบแล้ว** ไม่ 42703 อีก |
| ↳ ~~หลัง apply 035 แล้ว~~ → **เสร็จแล้ว** | ✅ **ทำงานได้** | migration 035 Section B.1 (เพิ่ม 5 คอลัมน์) + Section D.1–D.3 (INSERT policy) — apply แล้ว 5 ก.ย. 2026 |
| `completeCoreAwakening()` | ✅ ทำงานได้ | ทำงานต่อจาก initialize ได้แล้ว |

**สรุป: โค้ด Core Awakening ฝั่ง client เสร็จและถูกต้องแล้ว — และทำงานบน production ได้แล้ว (5 ก.ย. 2026)** เพราะ migration 035 (1392 บรรทัด) **apply แล้ว**
สิ่งที่เหลือคือ "ทดสอบ end-to-end บน staging จริง" เพื่อ confirm UX flow ครบ — เป็นงาน verify ไม่ใช่บล็อกการใช้งาน

---

## 4. 🔴 ยังไม่เสร็จจริง — ต้องตัดสินใจ/ลงมือก่อน (สถานะ 5 ก.ย. 2026)

### SEC-02 · Edge Functions — แก้แล้วและ deploy แล้ว ✅

| ไฟล์ | สถานะ | verify กับ |
|------|-------|-----------|
| `send-push/index.ts:234-254` | ✅ โค้ดบังคับ JWT + user id จาก token แล้ว (body ไม่ตรง → 403) — ✅ **deployed 6 Sep 2026** | Supabase Functions dashboard verified 6 Sep 2026 |
| `daily-brief/index.ts:34-102` | ✅ โค้ดแก้แล้ว — ✅ **deployed 6 Sep 2026** | Supabase Functions dashboard verified 6 Sep 2026 |
| `pattern-detect/index.ts:54-200` | ✅ โค้ดแก้แล้ว — ✅ **deployed 6 Sep 2026** | Supabase Functions dashboard verified 6 Sep 2026 |
| `auth-registration-options` + `auth-register-passkey` | ✅ deploy แล้ว 6 Sep 2026 | Supabase Functions dashboard verified 6 Sep 2026 |

> ตรวจสอบ 6 ก.ย. 2026: ทุก 12 functions deployed, ทุกตัวตอบ 401 เมื่อไม่มี Authorization header

**เพิ่มเติม:** `auth-verify-passkey/index.ts:130-137` ✅ แก้แล้ว — ใช้ HMAC-SHA256 จาก SUPABASE_JWT_SECRET (b7bde64)

### 🔴 Passkey flow พัง (ค้นพบรอบนี้ 5 ก.ย. 2026)

| จุด | ปัญหา |
|-----|-------|
| `AuthContext.tsx:130` | `signInWithPasskey` เรียกแค่ React `setSession()` — **ไม่ได้เรียก `supabase.auth.setSession()`** → token ไม่เข้าสู่ supabase client → RLS ยังเป็น anonymous → หลัง "ล็อกอินสำเร็จ" ข้อมูลทุกอย่างยังเป็นของคนไม่ระบุตัวตน |
| `PasskeyProvider.ts:144` | เรียก Edge Function 4 ตัวที่**ไม่มีอยู่จริง**: `auth-list-credentials`, `auth-rename-credential`, `auth-delete-credential`, `auth-delete-all-credentials` → 404 ทุกครั้ง |
| `auth-verify-passkey/index.ts:130-137` | ✅ แก้แล้ว — ใช้ HMAC-SHA256 จาก SUPABASE_JWT_SECRET (b7bde64) |

✅ ซ่อมแล้ว (b7bde64): AuthContext.tsx เรียก supabase.auth.setSession() · PasskeyProvider management methods throw NotImplemented · JWT signing จริง

### คำถามเปิดจาก agent DB — ตอบไม่ได้จากโค้ด

1. **`selfprint` schema เปิด expose ใน PostgREST ของ production หรือยัง?**
   `supabase/config.toml:13` ระบุแค่ `["public", "graphql_public"]` — ถ้าตรงกับ production จริง
   `.schema('selfprint')` **ทุกจุด**จะพังไม่ว่าตาราง/คอลัมน์จะถูกแค่ไหน
   เช็คที่ Supabase Dashboard → Settings → API → Exposed schemas
2. `user_passkeys` (settings page) กับ `user_credentials` (login จริง) — merge หรือแยก?
3. `decisions` กับ `decision_log` — ตั้งใจให้เป็น 2 ระบบคู่ขนานหรือควรรวม?
   (`DecisionIntelligenceEngineAdapter.ts:78-91` พยายาม join ข้ามระบบผิดทาง)
4. migration ที่ track ใน git (013/020/029/030/033) push ขึ้น production จริงหรือยัง?

### ✅ REALBUG-001..004 — แก้ครบแล้ว (5 ก.ย. 2026)

เทสต์จับบั๊กจริงได้ 4 ตัว (เดิม `it.skip()` ไว้ 11 เทสต์) — **แก้โค้ดโปรดักต์ครบทั้ง 4 แล้ว**
un-skip 11 เทสต์ → **1037/1037 ผ่าน · 0 fail · 0 skip**

| รหัส | ไฟล์ | สถานะ |
|------|------|-------|
| **004** | `ConfidenceIndicator.tsx:120` | ✅ แก้แล้ว — เช็ค `evidencePoints` (ของจริง) แทน `confidencePoints` ที่ไม่มีในโปรเจกต์ |
| **001** | `ContinuousImprovementService.ts:82` | ✅ แก้แล้ว — เรียง `severity` ถูกต้อง |
| **003** | `config/twin-prompts.ts:267` | ✅ แก้แล้ว — Twin ได้รับ identity ของ SELF ครบ |
| **002** | `constants/worlds.ts:296` | ✅ แก้แล้ว — `getWorld(id)` ไม่คืน `undefined` ผิดสัญญา |

### ✅ F-01 — Tailwind v4 ทำงานจริงแล้ว (TWFIX-001)

**เดิม:** `@tailwind` อยู่ใน `src/index.css` ที่ไม่มีใคร import · ไม่มี `postcss.config.js` ·
`vite.config.ts` ไม่มี tailwind plugin · ค้น `--tw-` ใน `dist/assets/*.css` ไม่พบเลย

**ตอนนี้ (5 ก.ย. 2026):** ✅ แก้แล้ว — `@tailwindcss/vite` + `@config` อ่าน token เดิม
พิสูจน์: `--tw-` **545 จุดใน bundle** (เดิม 0) · ตั้งใจไม่เปิด preflight เพื่อไม่ให้ทับ CSS เขียนมือ ~30 ไฟล์
ก่อน Track C จะได้ออกแบบใหม่ — **ไม่บล็อก Track C อีกต่อไป**

### ❌ e937ed8 build FAIL ใน Cloudflare Pages (อัปเดตรอบที่ 5 — verify Cloudflare build log)

> **คำถามจากเจ้าของ (5 ก.ย. 2026):** "1 commit ไม่ผ่าน จาก `:` จริง จะแก้ยังไง"
> **คำตอบ:** `e937ed8` build FAIL **ไม่ใช่เพราะ `:` ใน commit message** แต่เพราะ 2 สาเหตุจาก Cloudflare build log:

```
1. npm error EUSAGE
   `npm ci` can only install packages when your package.json and package-lock.json are in sync.
   Missing: @tailwindcss/vite@4.3.3 from lock file
   Missing: @tailwindcss/node@4.3.3 from lock file
   Missing: @tailwindcss/oxide@4.3.3 from lock file
   ... (Tailwind 4 packages ขาดหายหมด)

2. Warning: A Wrangler configuration file was found but it does not appear to be valid.
   Did you mean to use wrangler.toml to configure Pages?
   If so, then make sure the file is valid and contains the `pages_build_output_dir` property.
```

**สรุปสาเหตุ:**
- `package.json` มี `@tailwindcss/vite@4.3.3` + Tailwind 4 packages (จาก `TWFIX-001`) แต่ `package-lock.json` ไม่ sync
- `wrangler.toml` ไม่มี `pages_build_output_dir` property

**วิธีแก้:** commit `3fa100a` = `fix(build): sync package-lock.json — CF Pages npm ci ฟังเพราะ lock ไม่ตรง` แก้แล้ว — build PASS ใน Cloudflare
แต่ `wrangler.toml` ยังไม่ได้แก้ (warning ไม่ fail)

**ข้อสังเกต:** `:` ใน commit message (เช่น `C0:`, `A8+B:`, `fix(build):`) ปกติไม่ทำให้ Git/CI พัง — `:` ที่เป็นปัญหาคือ `:` ใน **path/ชื่อไฟล์** เช่น commit ก่อนหน้า (3 ก.ย.) ที่มี path: `feat(e2e): Add global-setup auth + Phase B test isolation in playwright.config` (มี `:` ในชื่อไฟล์) — แต่คนละ commit กับ `e937ed8`

---

## 5. B0.3 — Bundle baseline (วัดจริงครั้งแรก)

```
chunk                              raw        gzip
------------------------------------------------------
chunk-intelligence                345.77 kB   87.31 kB   ← ใหญ่สุด
vendor-react                      181.75 kB   57.16 kB
index (entry)                     145.40 kB   43.66 kB
vendor-misc                       116.00 kB   35.16 kB
worlds                             95.41 kB   26.22 kB
CoreAwakening                      94.22 kB   29.44 kB
IntelligenceHub                    87.60 kB   20.78 kB
Onboarding                         65.69 kB   17.36 kB
LandingPage                        45.06 kB   11.80 kB
```

**B0.4 — dependency audit (บางส่วน)**
- `three` ไม่มีไฟล์ไหน import เลยสักบรรทัด → `vendor-three` chunk **ไม่เคยถูกสร้าง** ลบทิ้งแล้ว
  (คอมเมนต์ใน `vite.config.ts` ที่อธิบาย chunk นี้ว่า "~350 KB ตัวใหญ่สุด" อธิบายโค้ดที่ไม่มีอยู่)
- build เตือน `INEFFECTIVE_DYNAMIC_IMPORT`: `DecisionLearningService.ts` ถูก dynamic import
  จาก `DecisionService.ts` แต่ static import จากอีก 3 ที่ → code splitting ไม่เกิดผล

---

## 6. Commands

```powershell
npm install
npm run build                 # tsc -b && vite build — ✅ ผ่าน (3.81 s · 933 modules)
npm test                      # vitest — ✅ 66/66 ไฟล์ · 1037 tests · 0 fail · 0 skip
npm run lint                  # oxlint — ✅ 0 errors / 187 warnings / 474 files
npm run typecheck:functions   # typecheck functions/ + api/ — ✅ 0 errors
```

⚠️ ถ้า build/test พังด้วย **bus error** = ไฟล์ native ติดตั้งไม่ครบ ไม่ใช่ Linux ไม่รองรับ
เช็คขนาด: `@rolldown/binding-*` ต้อง ~19.9 MB · `lightningcss-*` ~10 MB · `@oxlint/binding-*` ~16 MB
ถ้าเล็กกว่านั้นมาก ให้ `rm -rf node_modules && npm install` ใหม่ให้จบจริง

---

## 7. โซนห้ามแตะ

- `.env*`, `KEY/`, secret ทุกชนิด
- `supabase/migrations/*` ที่ apply ไป production แล้ว (035 apply แล้ว — ไม่แตะ)
- SICE / SICE Orchestrator / AI pipeline / Zustand business state / Auth / lifecycle / routing core
- rename NOVA ในโค้ด

> ✅ **ยืนยันสอดคล้องกับ §44 ARCHITECTURAL SAFETY RULE** ของ
> [`docs/Experience Architecture v2.md`](./docs/Experience%20Architecture%20v2.md) —
> เอกสารแม่กำหนด **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ **REBUILD → REWRITE → REPLACE**
> และห้าม: rewrite/replace SICE · สร้าง parallel intelligence · replace canonical APIs ·
> rewrite business logic · เปลี่ยน DB lifecycle โดยไม่มีเหตุบั๊ก · bypass memory เดิม ·
> สร้าง duplicate Twin · เอา Community เข้า First Journey · ทำให้ Phase A production closure ไม่นิ่ง
> → **โซนห้ามแตะด้านบนตรงกับ §44 ทุกข้อ — ไม่ขัดกัน**

---

## 8. เอกสารที่เคยโกหก — เก็บไว้เป็นบทเรียน

| เอกสารเคยอ้าง | ความจริงจากโค้ด |
|--------------|----------------|
| "Phase 3 automation → 91 TypeScript errors, 72 ไฟล์พัง" | **ไม่จริงเลย** 43 ไฟล์ต่างกันแค่ LF→CRLF (`git diff --ignore-cr-at-eol` = ว่าง, insertions = deletions เป๊ะ 8754) |
| "build ไม่ได้ — Rolldown ใช้กับ Linux ไม่ได้" | ไฟล์ native ติดตั้งไม่ครบ ติดตั้งใหม่แล้วรันได้ทันที |
| "Auth: JWT verified via Authorization header" (`autonomy-log.ts:13`) | ไม่มีโค้ด verify ในไฟล์เลย |
| "TD-03 CF KV rate limiting ✅ DONE (deployed)" | `checkRateLimitKV` ไม่มีใคร import และไฟล์ไม่ export `onRequest` → ไม่เกิด route ด้วยซ้ำ |
| "TypeScript strict mode passes" | `tsconfig.app.json` ไม่มี `"strict"` เลย |
| "P1 ✅ Data Persistence (FBS) Complete" | ตาราง `user_feedback` ฯลฯ อยู่ในโฟลเดอร์ที่ CLI ไม่เคย apply |
| "P2 Production Verification ✅ 100%, zero stubs" | `/api/metrics` + `/api/autonomy-log` บันทึกได้ 0 แถว |
| "test ผ่านหมด" | vitest include ครอบ 7 จาก 73 ไฟล์ — **ตอนนี้ 66/66 ไฟล์ · 1037 tests ผ่านจริง** |
| "no `dangerouslySetInnerHTML` found (0 occurrences)" | มี **8 จุด** (ปลอดภัยทั้งหมดผ่าน `safeJsonLd()`) |
| "TD-04 ลบ `as any` ครบ 50 จุด" | SICE layer สะอาดจริง ✅ แต่ทั้งโปรเจกต์ยังเหลือ **114 จุด** |
| "Phase A COMPLETE 42/42" (`SELFPRINT_STATUS_HONEST_TH.md` 30 ส.ค.) | เก่า/ไม่ผ่าน verify — ตัวเลขจริงคือ 1037/1037 tests (ดูฉบับใหม่ 5 ก.ย.) |
| "skip 11 = REALBUG" (FORENSIC_AUDIT 3 ก.ย.) | ล้าสมัย — REALBUG-001..004 แก้ครบแล้ว · 0 skip |
| "vitest รันแค่ 7/73 ไฟล์" (`PLAN_TRACKS_TH.md` 3 ก.ย.) | ล้าสมัย — ตอนนี้ 66/66 ไฟล์ |
| "oxlint 195 warnings/480 files" (`CLAUDE.md`) | จริงคือ **187/474** |
| **"migration 035 ยังไม่ apply"** (FORENSIC_AUDIT รอบที่ 3 + `SELFPRINT_STATUS_HONEST_TH.md` ฉบับก่อน 5 ก.ย.) | ✅ **APPLY แล้ว** — verify Supabase SQL Editor 5 ก.ย. 2026 · แก้ทั้ง 2 ไฟล์ในรอบที่ 4 |
| **`"git filter-repo ยังไม่ได้ติดตั้ง"`** (FORENSIC_AUDIT รอบที่ 3) | ✅ **ติดตั้งแล้ว v2.47.0** — verify `where git-filter-repo` + `scoop list \| findstr filter` 5 ก.ย. 2026 · แก้ในรอบที่ 5 |
| **`"ต้อง rotate รหัส staging 6 ตัว"`** (FORENSIC_AUDIT รอบที่ 3) | ❌ **ไม่ต้องทำ** — เจ้าของลบ users ทุกครั้งหลังทดสอบ · แก้ในรอบที่ 5 |
| **`"e937ed8 build fail เพราะ :"`** (สมมติฐาน) | ❌ **ผิด** — verify Cloudflare build log 5 ก.ย. 2026: จริงเพราะ `npm ci` EUSAGE (lock file ไม่ sync กับ Tailwind 4 packages) + `wrangler.toml` ไม่มี `pages_build_output_dir` |

**บทเรียน:** `.md` 84 ไฟล์ที่ root คือหนี้เชิงข้อมูล ไม่ใช่แค่ของรก มันทำให้เซสชันถัดไป
เริ่มจากสมมติฐานผิดแล้วแก้ผิดจุด — ลบไปแล้วในรอบนี้

**บทเรียนรอบที่ 4:** แม้แต่เอกสาร "single source of truth" (FORENSIC_AUDIT + SELFPRINT_STATUS_HONEST_TH) ก็เขียนผิดเรื่อง migration 035 ได้ — ต้อง verify กับ Supabase/Cloudflare/GitHub จริงเสมอ · ห้ามเชื่อเอกสารอย่างเดียว

**บทเรียนรอบที่ 5:** ข้อสังเกตของเจ้าของเรื่อง "1 commit ไม่ผ่าน จาก `:`" แม้จะถูกบางส่วน (commit ก่อนหน้ามี `:` ในชื่อไฟล์จริง) แต่ `e937ed8` build FAIL จริงๆ เพราะ lock file ไม่ sync + wrangler.toml — **ต้องตรวจ build log จริง ไม่ใช่เดา** · ขอบคุณเจ้าของที่ช่วย catch ข้อผิดพลาด 4 จุด (migration 035, git filter-repo, rotate รหัส, e937ed8)

---

## 8.5 🧩 Stub / Mockup / Hardcode ที่ยังเหลือ (5 ก.ย. 2026)

| ไฟล์:บรรทัด | สิ่งที่ยังเป็นของปลอม |
|-------------|---------------------|
| `VoiceChat.tsx:80` | ✅ แก้แล้ว (b7bde64) — ใช้ useVoiceTwin (Web Speech API STT+TTS) + /api/nova; ไม่มี mock แล้ว |
| `VoiceInput.tsx:38` | mock speech recognition |
| `VoiceOutput.tsx:34` | mock TTS |
| `AdvancedAnalytics.tsx:26` | mock data (orphan — ไม่มีใคร import) |
| `SentryService.ts:15` | `MockSentry` class (orphan chain) |
| `CommunityPage.tsx:397` | "กำลังมาเร็วๆ นี้ / Coming soon" |
| `ExplorePage.tsx:728` + `:898` | stub cards + "เร็วๆ นี้" |
| `DecisionDashboard.tsx:126` | placeholder "Phase F Dashboard" |
| `structuredData.ts:21` | `VITE_BUSINESS_PHONE \|\| '+66-2-XXX-XXXX'` fake phone fallback |
| `public/soundscape-manifest.json` | `CLOUDINARY_URL` ยังไม่ถูกแทนที่ 23 จุด → sound URL พังหมด · `public/audio/` ไม่มีอยู่จริง แต่ `adaptive-audio-engine.ts:285` อ้าง mp3 |
| dead code 6 ไฟล์ (ลบแล้ว 6 Sep 2026) | A1 ปิด — ตรวจ: `Chat.tsx` `ChatPage.tsx` `TwinHologramBirth.tsx` `TwinEvolutionProgress.tsx` `SentryService.ts` `RecoveryIndicator.css`, `SentryService.ts`, `AlertingService.ts`, `PerformanceMonitor.ts`, `AssetCatalog.tsx`, `DebugTheme.tsx`, `WorldSelector.tsx` (ว่าง), `TwinHologramBirth.tsx`, `TwinEvolutionProgress.tsx`, `GrowthBadge.tsx`, `RecoveryIndicator.tsx`, orphan pages `Chat.tsx` `ChatPage.tsx` `BlogIndex.tsx` `blog-astrology-vs-behavioral.tsx`, `public/service-worker.js` (dead — ตัวจริงคือ `sw.js`) |
| `as any` | **47 จุด** (วัดจริง 6 ก.ย. 2026 — A7 ปิดแล้ว) |
| `dangerouslySetInnerHTML` | **8 จุด** (ปลอดภัยทั้งหมดผ่าน `safeJsonLd()`) |

---

## 8.6 🎯 พร้อมเข้าสู่ Track C (UX/UI) หรือยัง? — 5 ก.ย. 2026

**คำตอบ: ✅ พร้อม** — งาน visual/UX ไม่ถูกบล็อกด้วยบั๊ก build/test/lint
(เดิม F-01 Tailwind เคยบล็อก — แก้แล้วด้วย TWFIX-001)

> 📌 **Track C มีเอกสารแม่ (design master) แล้ว:**
> [`docs/Experience Architecture v2.md`](./docs/Experience%20Architecture%20v2.md)
> (2,046 บรรทัด · 51 topics · **Status: Proposed Architecture**)
> หลัก: **RECOMPOSE ไม่ใช่ REBUILD** · core promise *"Understand yourself. Meet your Twin. Keep evolving."* ·
> App Shell = **TODAY · WORLDS · TWIN · EXPLORE · ME** · P0.1–P0.10 / P1.1–P1.8 / P2.1–P2.7 ·
> §44 safety rule · §45 success criteria · §46 core loop
> **Track C ทุก phase ต้องอ้างหัวข้อ (§topic) ของเอกสารนี้** — ดู mapping ใน
> `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` และแผนปฏิบัติการใน
> `docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`

**แต่ยังไม่สามารถอ้าง "100% product-verified" ได้จนกว่าจะทำครบ 3 เงื่อนไข** (ลดจาก 4 เพราะ migration 035 apply แล้ว):

~~1. deploy Edge Functions~~ ✅ ปิดแล้ว — 12 functions deployed 6 Sep 2026
~~2. แก้/ตัดสินใจ passkey flow~~ ✅ ปิดแล้ว — AuthContext + JWT + PasskeyProvider
~~3. ตัดสินใจ voice route~~ ✅ ปิดแล้ว — VoiceChat ใช้ Web Speech API + Nova API

### ⚠️ สองจุดที่ Track C จะชนแน่ ๆ — ต้องขออนุมัติก่อน

| # | เรื่อง | หลักฐาน | Track C จะชนเมื่อ | สถานะ |
|---|-------|---------|------------------|--------|
| **C1** | ~~Twin มี 3 implementations~~ **✅ แก้แล้ว (verify 8 ก.ย. 2026)** | `useTwinIdentity.ts` เป็น single source ของ `evolutionStage`/`glowMult`/dna/traits แล้ว · `Twin.tsx` facade + `LivingTwin.tsx`/`TwinPresence.tsx` เรียก hook เดียวกันทั้งคู่ (ไม่มี logic ซ้ำเหลือ) · `HologramBirth` เข้า facade ผ่าน `variant="birth"` | Phase 6/7 — **ไม่บล็อกแล้ว** | ✅ **ปิดแล้ว จริง — ไม่ต้องขอ A3 อีก** |
| **C2** | ~~ไม่มี SSR / SSG / prerender~~ **🟡 บางส่วนแก้แล้ว (8 ก.ย. 2026)** | X1 env ปิดแล้ว (CF-CREDS-003) · FAQ schema ตรวจแล้วถูกต้องจริง (5 คำถามจริง ไม่ปลอม) · sitemap.xml/sitemap-th.xml แก้ให้ตรงกัน + เพิ่ม 8 หน้าที่หายไป (about/science/contact/terms/blog/tarot/palmistry/community) · `Share.tsx` เพิ่ม OG tags จริง | Phase 12 — งานหลักปิดแล้ว | 🟡 **เหลือ**: SSR/SSG จริงยังไม่ทำ (ไม่จำเป็นสำหรับ gap ที่เจอ) · TarotPage/PalmistryPage/CommunityPage ยังไม่มี `canonicalUrl` · บทความ blog รายตัวไม่อยู่ใน sitemap (dynamic slug) |

> ทั้งสองข้อ **ไม่บล็อกการเริ่ม Track C** (เริ่มที่ Phase 1 ซึ่งแตะ 0 ไฟล์)
> แต่ต้องมีคำตอบก่อน Phase 6 และ Phase 12 ตามลำดับ

**งาน manual ที่ค้าง (อัปเดตรอบที่ 5):**
- ~~`git filter-repo` ติดตั้ง~~ ✅ **เสร็จแล้ว v2.47.0** (verify scoop จริง)
- ~~apply migration 035~~ ✅ **เสร็จแล้ว** (verify Supabase จริง)
- ~~rotate รหัส staging 6 ตัว~~ ❌ **ไม่ต้องทำ** (เจ้าของลบ users ทุกครั้ง)
- **สร้าง `purge.txt` แล้วรัน `git filter-repo`** (ต้องสร้างไฟล์ก่อน ไม่งั้น `FileNotFoundError`)
- ~~deploy Edge Functions~~ ✅ **เสร็จแล้ว** — 12 functions deployed, ทุกตัวตอบ 401 (6 Sep 2026)
- ~~ตัดสินใจ passkey flow~~ ✅ **ซ่อมแล้ว** (b7bde64) — AuthContext + JWT HMAC-SHA256 + PasskeyProvider NotImplemented
- ~~ตัดสินใจ voice route~~ ✅ **เสร็จแล้ว** (b7bde64) — VoiceChat ใช้ Web Speech API + /api/nova
- rebuild dist/ ใน local (Windows: `npm run build`) ให้ตรง src/ HEAD `b7bde64`

---

## 9. รหัสอ้างอิงทั้งหมด (grep เจอคอมเมนต์อธิบายในโค้ด)

`AUTHHDR-001` · `NOVAPROV-001` · `ERRBOUND-001` · `SENTRY-INIT-001` · `AUTONOMY-FIX-001` ·
`METRICS-FIX-001` · `CORS-ALLOWLIST-001` · `CFBUFFER-001` · `STRIPEWH-001` · `ENVNAME-001` ·
`NOTIFAUTH-001` · `NOTIFCOL-001` · `TWINEVOAUTH-001` · `DEBUGLEAK-001` · `COACH404-001` ·
`JOURNAL404-001` · `SCHEMA-TS-002` · `ENVTYPE-001` · `TSCONFIG-FUNCTIONS-001` ·
`GITIGNORE-FIX-001` · `CRLF-001` · `DEADDEP-001` · `E2EPW-001` · `ENVDOC-001` ·
`OGSTATIC-001` · `OGABS-001` · `OGFONT-001` · `ENVTICK-001` · `DBTBL-001` · `DBCOL-001` · `DBKEY-001` ·
`TWFIX-001` · `REALBUG-001..004` · `SEC-02` · `NAVGAP-001` · `DEADCHUNK-001` · `ASSET404-001` ·
`RAFLOOP-001` · `HOMEBLANK-001` · `LOCKSYNC-001`

---

**หลักการของเอกสารนี้:** ตรวจจากโค้ด + **verify กับ Supabase / Cloudflare / GitHub / scoop จริง** ไม่ใช่ตรวจจากเอกสาร · แยก "แก้แล้ว verify แล้ว"
ออกจาก "แก้แล้วแต่ verify ไม่ได้" ออกจาก "ยังไม่แก้" · ไม่อ้างว่าทำสิ่งที่ยังไม่ได้ทำ

**รอบที่ 3–6 (5–6 ก.ย. 2026):** migration 035 apply · git filter-repo ติดตั้ง · Edge Functions 12 ตัว deploy · Passkey fix · VoiceChat ใช้ Web Speech API จริง

✅ **รอบที่ 7 (7 ก.ย. 2026 · HEAD `710afa0`):**
- **CF-CREDS-002** (`2b56169`): `supabase/client.ts` — dynamic `import.meta.env[name]` → literal access · หยุด "Missing Supabase credentials" error boundary
- **CF-CREDS-003** (`710afa0`): `structuredData.ts` — `requireEnv()` throw → literal access + `''` fallback · หยุด "VITE_BUSINESS_ADDRESS_STREET not set" error boundary
- **`functions/api/og.ts`** (`b8011a7`): สร้าง CF Pages Function ใหม่ · SK-05 ผ่าน
- **CI webkit** (`b8011a7`): `.github/workflows/testing.yml` ติดตั้ง webkit · Mobile Safari tests ไม่ crash
- **SK-01 locator** (`710afa0`): `e2e/smoke.spec.ts` ใช้ `.hero-cta button` แทน regex copy เก่า
- **E2E CI run #305 ✅ ผ่านหมด** — `selfprint.one/th/` + `/en/` โหลดได้จริง ไม่มี error boundary

**บทเรียน Vite env (สำคัญมาก):** `import.meta.env[name]` (dynamic) **ไม่ถูก Vite inline ที่ build time** → ได้ `undefined` ตลอด ต้องใช้ literal `import.meta.env.VITE_FOO` เท่านั้น — pattern นี้พังทั้ง Supabase credentials และ structuredData สองรอบซ้อน

---

## 10. รอบที่ 8 (8 ก.ย. 2026 · HEAD ล่าสุดในเซสชันนี้) — Track C Phase 1-12 ปิดครบ + แก้บั๊กชื่อทวิน + เจอเอกสารล้าสมัย 2 จุด

> ตรวจจากโค้ดจริงทุกข้อ ไม่เชื่อสถานะเดิมในเอกสารใดๆ รวมถึงไฟล์นี้เอง ตาม "Current repo state = source of truth"

### ✅ Track C Phase 1-12 (visual/UX redesign) — ปิดครบตามแผน `docs/PLAN_TRACKS_TH.md`

Phase 1-4 audit-only (ไม่มี gap เชิงโครงสร้าง) · Phase 5 confetti reduced-motion guard · Phase 6
ProvenanceStrip wiring · Phase 7+10 Twin hub + mode selector · Phase 8 timeSlot/h2/real confidence
· Phase 9 WorldsHub Twin visual · Phase 11 Memory Experience "What Twin Knows" section ใหม่
(`getTwinKnowledge.ts` + forget action จริง) · Phase 12 sitemap/Share.tsx/FAQ schema audit —
รายละเอียดเต็ม + file:line evidence + ผล tsc/oxlint/vitest ทุกจุดอยู่ใน
`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md` ส่วน "ตรวจสถานะจริงซ้ำเทียบโค๊ดปัจจุบัน"

### ✅ พบเอกสารล้าสมัย 2 จุด — แก้ทั้ง 3 ไฟล์ที่เกี่ยวข้องแล้ว

1. **C1 Twin Facade** — `TRACK_C_VISUAL_REDESIGN_TH.md` + kilo plan (`.kilo/plans/1788755171904-docs-consultation-update.md`) เขียนว่า "ยังไม่ implement ต้องขอ A3" — ตรวจโค้ดแล้ว **ทำเสร็จจริง** (`useTwinIdentity.ts` + `Twin.tsx` facade + `LivingTwin`/`TwinPresence` เรียก hook เดียวกันไม่มีโค้ดซ้ำ) — แก้ทั้ง 2 ไฟล์แล้ว + แก้ตารางในไฟล์นี้ (หัวข้อ 8.6 ด้านบน)
2. **PWA Phase 1-2** (kilo plan) — checklist ยังไม่ติ๊กแต่โค้ดทำครบจริงแล้ว (manifest polish, workbox precache, push icon, offline.html) — แก้ checklist ในไฟล์ kilo plan แล้ว

### 🔴 บั๊กจริงที่เจอจากคำถามเจ้าของ "ชื่อทวินต้องเปลี่ยนทุกจุดที่ผู้ใช้เห็น" — แก้แล้วทั้ง 2 จุด

| จุด | ปัญหา | แก้ยังไง | verify |
|-----|-------|---------|--------|
| `ExecutiveSummary.tsx:136` | empty-state โชว์ "Twin ของคุณ" generic ทั้งที่มีชื่อจริงแล้ว | เพิ่ม `useTwin()` ใช้ `twin.name` จริง | tsc -b 0 errors |
| `config/twin-prompts.ts` | **สำคัญกว่า** — system prompt จริงที่ส่งให้ AI ใช้ `{{twinName}}` (= ชื่อทวินเอง) แทนที่ข้อความที่ควรเป็นชื่อ**ผู้ใช้** เช่น "COMPLETE behavioral analysis of {{twinName}}" → AI สับสนว่าใครคือใครทุกครั้งที่แชท | แก้ทั้ง `TWIN_BASE_PROMPT` + 12 `TWIN_WORLD_PROMPTS` ให้ `{{twinName}}` หมายถึงชื่อทวินเองอย่างเดียว ("Your name is {{twinName}}...") ส่วนที่เหลือใช้ "the user" | tsc -b 0 errors · `TwinWorldsIntegration.test.ts` 14/14 + `worldsVerification.test.ts` 77/77 ผ่านหมด (91/91) |

**ฐานข้อมูล 12 SICE ก่อนตั้งชื่อ — ตรวจแล้วถูกต้องอยู่แล้ว ไม่ต้องแก้**: `startAwakening()` รัน
`SICEOrchestrator` (12 engine จริง) ก่อนที่ `initializeTwin()` (ขั้นตั้งชื่อ) จะทำงานเสมอ

**ยังไม่ตรวจครบ:** grep เจอ ~31 ไฟล์ที่มีคำว่า "Twin"/"ทวิน" ในรูปแบบที่อาจเกี่ยวข้อง — ตรวจแล้วแค่
7 ไฟล์ (NavRail/BottomNav/MePage เป็น nav label ไม่ใช่บั๊ก, TwinNaming ถูกต้องอยู่แล้ว, ExecutiveSummary
+ twin-prompts.ts แก้แล้ว) **เหลืออีก ~24 ไฟล์ยังไม่ได้ไล่ทีละจุด** — งานแยกถ้าต้องการครบ 100%

### 🟡 Story/Narrative Layer (§51) — เพิ่มจุดที่ขาดจริง 3 จุด (ไม่ใช่ระบบเต็ม)

`STORY_NARRATIVE_LAYER_TH.md` ถูก cross-check กับโค้ดจริงทีละ phase (ดูส่วน "ตรวจสถานะจริงซ้ำเทียบโค๊ด"
ในไฟล์นั้น) — สรุป: **ไม่เคย implement เป็นระบบ** (ไม่มี 3 Narrative Layers/Rhythm Table/5 Story Modes
จริง) เพิ่มแค่จุดที่พิสูจน์ได้ว่าขาดจริงในรอบนี้:

| ไฟล์ | สิ่งที่เพิ่ม |
|------|-------------|
| `LandingPage.tsx` (`story.s3.next`) | ประโยค bridge ก่อน CTA บอกว่าขั้นตอนถัดไปคืออะไร (เช็คอินอารมณ์ → คุย SELFPRINT → ทวินเริ่มเป็นรูปเป็นร่าง) — ของจริงตรงกับ step order ใน `Onboarding.tsx` |
| `BirthdateInput.tsx` | เพิ่ม 1 บรรทัดอธิบายว่าข้อมูลนี้ใช้ทำอะไรจริง (เดิมเป็น form เปล่าไม่มี narrative เลย) |
| `analysis.css` + `AnalysisPage.tsx` | staggered fade-in ต่อ section (index-based delay, กัน `prefers-reduced-motion`) แก้ "reveal ทุกอย่างพร้อมกัน" — CSS/presentation ล้วนๆ ไม่แตะข้อมูล |

**ยังไม่ทำ (นอก scope รอบนี้):** Phase 9 (World = scene พร้อม Story/Pattern/Reflection/Decision แยก 4
ส่วนชัดเจน) · Phase 10 (Choice→Consequence surfacing — ต้องมี P1.8 data หนุนก่อน) — ทั้งสองต้องเปิดเป็น
งานแยกที่มี change budget ของตัวเอง

### เอกสารที่แก้ในรอบนี้

`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md` ·
`docs/Experience Architecture v2/STORY_NARRATIVE_LAYER_TH.md` ·
`.kilo/plans/1788755171904-docs-consultation-update.md` · ไฟล์นี้ ·
`docs/SELFPRINT_STATUS_HONEST_TH.md` · `CLAUDE.md`

**บทเรียนรอบที่ 8:** เอกสารสถานะที่เขียนไว้ถูกในวันที่เขียน (6-7 ก.ย.) กลายเป็นล้าสมัยได้ภายใน 1-2 วัน
เมื่อมีงานทำต่อโดยไม่อัปเดตเอกสาร (C1/PWA เสร็จจริงแล้วแต่ 2 เอกสารยังบอกว่า "รอ A3 อนุมัติ") — ต้อง
verify โค้ดจริงทุกครั้งก่อนเชื่อสถานะใดๆ แม้จะมาจากเอกสาร "source of truth" เอง

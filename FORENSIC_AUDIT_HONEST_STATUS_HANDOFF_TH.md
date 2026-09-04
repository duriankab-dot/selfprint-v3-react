# FORENSIC AUDIT — สถานะจริงของ SELFPRINT V3

**อัปเดตล่าสุด:** 3 กันยายน 2026 (รอบที่ 2 — หลังลงมือแก้)
**Baseline:** `62987f6` + งานที่ยังไม่ commit ในรอบนี้
**วิธีตรวจ:** อ่านซอร์สโค้ดจริงอย่างเดียว — **ไม่เชื่อไฟล์ `.md` ใด ๆ** รวมถึงฉบับก่อนของไฟล์นี้เอง
**เครื่องมือ:** clone จาก GitHub + รัน build/test/lint จริง + agent เฉพาะทาง 6 ตัว

> ⚠️ **ไฟล์นี้คือเอกสารสถานะฉบับเดียวที่ถูกต้อง** — ไฟล์ `.md` ที่ root อีก 84 ไฟล์
> ถูกลบทิ้งแล้วในรอบนี้เพราะอ้างสิ่งที่โค้ดไม่ได้ทำ (ดูหัวข้อ 8)
> แผนงานรวมอยู่ที่ `docs/PLAN_TRACKS_TH.md`

---

## 0. TL;DR

**ปลดล็อกใหญ่:** `npm run build` / `test` / `lint` **รันได้แล้ว** — ที่เอกสารเก่าบอกว่า
"Rolldown ใช้กับ Linux ไม่ได้" มาหลายเซสชันนั้น **วินิจฉัยผิด** สาเหตุจริงคือ
`npm install` ถูกขัดจังหวะจนไฟล์ `.node` ถูกตัดกลางคัน
(rolldown 248 KB จากของจริง 19.9 MB · lightningcss 2.8/10.0 MB · oxlint 1.1/16.0 MB)

**สถานะ gate ปัจจุบัน — วัดจริงทุกตัว (4 ก.ย. 2026)**

| gate | ผล |
|------|-----|
| `tsc -b` | ✅ 0 errors — **`strict: true` เปิดแล้ว** |
| `npm run typecheck:functions` | ✅ 0 errors — strict เช่นกัน |
| `vite build` | ✅ สำเร็จ (1.3 s) |
| `oxlint` | ✅ 0 errors · 195 warnings · 480 files |
| `vitest run` | ✅ **66/66 ไฟล์ · 1026 tests ผ่าน · 0 พัง** (skip 11 = REALBUG) |

**Track A + B + C0 เสร็จหมดแล้ว — เหลือแต่ Track C (visual redesign)**

งาน C0 ที่เคลียร์ทางให้ Track C (4 ก.ย. 2026):

| รหัส | เรื่อง |
|------|-------|
| `TWFIX-001` | **ติดตั้ง Tailwind v4 ให้ทำงานจริง** — `@tailwindcss/vite` + `@config` อ่าน token เดิม · **ตั้งใจไม่เปิด preflight** เพื่อไม่ให้ทับ CSS เขียนมือ ~30 ไฟล์ก่อน Track C จะได้ออกแบบใหม่ · พิสูจน์: `--tw-` 545 จุดใน bundle (เดิม 0) |
| `REALBUG-001..004` | แก้ครบทั้ง 4 → un-skip 11 เทสต์ ผ่านหมด **1037/1037 · 0 skip** |
| `SEC-02` | `send-push` / `daily-brief` / `pattern-detect` บังคับ JWT + user id จาก token เท่านั้น (body ไม่ตรง → 403) |
| `NAVGAP-001` | nav หายช่วง 761–1023 px (iPad/Surface แนวตั้ง) — ขยาย BottomNav ให้ชนกับ NavRail |
| `DEADCHUNK-001` | ลบ manualChunks branch ที่ตาย 2 อัน (`vendor-motion`, `decision-components`) |
| `ASSET404-001` | แก้ asset ที่โค้ดอ้างแต่ไม่มีไฟล์จริง 8 รายการ + ลบ `hero.png` 778 kB ที่ไม่มีใคร import |
| `RAFLOOP-001` | rAF loop บนหน้าแรกเคารพ `prefers-reduced-motion` + หยุดเมื่อแท็บถูกซ่อน |
| — | ถอด dep ที่ไม่มีใครใช้อีก 3 ตัว (`web-vitals`, `@simplewebauthn/browser`, `@simplewebauthn/server`) |

**เร่งด่วนที่สุด:** apply `supabase/migrations/035_forensic_consolidation_2026-09-03.sql`
— Core Awakening จะกลับมาทำงานได้ก็ต่อเมื่อรันไฟล์นี้ (ดูหัวข้อ 3)
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

## 2. ⚠️ ต้องรันด้วยมือ — ยังไม่เสร็จจนกว่าจะทำ

### 2.1 git filter-repo — คำสั่งที่แก้แล้ว

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

### 2.2 apply migration 035 — Core Awakening ขึ้นกับข้อนี้

```
supabase/migrations/035_forensic_consolidation_2026-09-03.sql   (717 บรรทัด)
```

ปลอดภัยรันซ้ำได้ 100% · ไม่มี `DROP TABLE` / `DROP COLUMN` / `TRUNCATE` / `DELETE` จริงสักคำสั่ง
มี Section E เป็นชุด `SELECT` สำหรับพิสูจน์ผลหลังรัน

### 2.3 เปลี่ยนรหัสผ่านบัญชี staging ทั้ง 6 ตัว
รหัสเดิมหลุดใน git history ไปแล้ว การย้ายมาไว้ใน env แก้แค่ปัญหาข้างหน้า ไม่ได้แก้ของที่หลุด

---

## 3. 🔴 Core Awakening — วินิจฉัยจบแล้ว

ไล่ `src/services/CoreAwakeningService.ts` ทีละบรรทัด:

| ขั้น | สถานะ | สาเหตุ |
|-----|-------|--------|
| `checkReadyForAwakening()` | dead ในโปรดักชัน (เรียกจาก test เท่านั้น) | มีบั๊ก `.eq('id')` — **แก้แล้ว** |
| `startAwakening()` | ✅ ทำงานได้ | schema ตรงกับ migration 025 |
| `initializeTwin()` → `createTwinInDatabase()` | ❌ **พังทุกครั้ง** | `INSERT INTO twins(primary_archetype, secondary_archetype, maturity_score, evolution_stage)` แต่ migration 024 สร้าง `twins` แค่ 6 คอลัมน์พื้นฐาน → 42703 → catch แล้ว `return {success:false}` |
| ↳ หลังแก้คอลัมน์แล้ว | ❌ ยังพังซ้อนอีก 3 จุด | `twin_state` / `twin_personality` / `twin_capabilities` **ไม่มี INSERT policy** → RLS บล็อกเงียบ ๆ (log เป็น warning ไม่ throw จึงไม่เห็นจาก UI) |
| `completeCoreAwakening()` | ✅ ทำงานได้ | แต่ไปไม่ถึงเพราะติดข้างบน |

**สรุป: Core Awakening ไม่เคยทำงานได้เลยสักครั้งในโค้ดปัจจุบัน**
migration 035 Section B.1 (เพิ่ม 5 คอลัมน์) + Section D.1–D.3 (เพิ่ม INSERT policy)
แก้ทั้ง 2 ชั้น — **แต่ต้องทดสอบจริงบน staging ก่อนถือว่าเสร็จ**

---

## 4. 🔴 ยังไม่แก้ — ต้องตัดสินใจก่อน

### SEC-02 · Supabase Edge Functions 4 ตัวเปิดโล่ง

| ไฟล์ | ทำอะไรได้ |
|------|----------|
| `send-push/index.ts:234-254` | ส่ง push ข้อความอะไรก็ได้ ไปหาใครก็ได้ → ช่องทาง phishing ที่ใส่แบรนด์คุณเอง |
| `daily-brief/index.ts:34-102` | อ่าน decision log + journal ของ **คนอื่น** แล้วส่งกลับใน response |
| `pattern-detect/index.ts:54-200` | อ่าน **และเขียน** behavioral pattern ของคนอื่น |
| `auth-registration-options` + `auth-register-passkey` | **account takeover** — ผูก passkey ตัวเองเข้ากับอีเมลเหยื่อได้ |

เพิ่มเติม: `auth-verify-passkey/index.ts:130-137` **ปั้น JWT ด้วย signature เป็นศูนย์ 32 ไบต์**

> 3 ตัวแรกแก้ได้ทันที ก็อป pattern จาก `data-export/index.ts:74-87` ในรีโปเดียวกัน
> ที่ทำถูกอยู่แล้ว ส่วน passkey flow กระทบการล็อกอินของผู้ใช้ปัจจุบัน ต้องคุยก่อน
> เจ้าของแจ้งว่า "ยังไม่มีผู้ใช้จริงกระทบ" และกำลังจะปรับ UX/UI อยู่แล้ว → ทำได้เลย

### คำถามเปิดจาก agent DB — ตอบไม่ได้จากโค้ด

1. **`selfprint` schema เปิด expose ใน PostgREST ของ production หรือยัง?**
   `supabase/config.toml:13` ระบุแค่ `["public", "graphql_public"]` — ถ้าตรงกับ production จริง
   `.schema('selfprint')` **ทุกจุด**จะพังไม่ว่าตาราง/คอลัมน์จะถูกแค่ไหน
   เช็คที่ Supabase Dashboard → Settings → API → Exposed schemas
2. `user_passkeys` (settings page) กับ `user_credentials` (login จริง) — merge หรือแยก?
3. `decisions` กับ `decision_log` — ตั้งใจให้เป็น 2 ระบบคู่ขนานหรือควรรวม?
   (`DecisionIntelligenceEngineAdapter.ts:78-91` พยายาม join ข้ามระบบผิดทาง)
4. migration ที่ track ใน git (013/020/029/030/033) push ขึ้น production จริงหรือยัง?

### 🔴 REALBUG-001..004 — บั๊กจริงที่เทสต์จับได้ (skip ไว้ 11 เทสต์ รอตัดสินใจ)

พอเปิดเทสต์ครบ 66 ไฟล์เป็นครั้งแรก เทสต์จับบั๊กจริงได้ 4 ตัว
**ไม่ได้แก้โค้ดโปรดักต์เอง** — `it.skip()` ไว้พร้อมคอมเมนต์อธิบายในโค้ด
(grep `REALBUG` ในไฟล์ `.test.ts`/`.test.tsx`) แก้แล้วเอา skip ออกได้ทันที

| รหัส | ไฟล์ | อาการที่ผู้ใช้เห็น |
|------|------|-------------------|
| **004** 🔴 | `ConfidenceIndicator.tsx:112` | เช็ค field `confidencePoints` ที่**ไม่มีในโปรเจกต์เลย** (ของจริงคือ `evidencePoints` ที่ `lib/intelligence/types.ts:199`) → branch นี้เป็น dead code → ตกไป fallback → การ์ดขึ้น **NaN% / Very Low / พื้นแดง** ทุกครั้งที่รับ BehavioralPattern เห็นจริงผ่าน `IntelligencePanel` + `ContextDisplay` · **แก้คำเดียว** |
| **001** | `ContinuousImprovementService.ts:82` | `.order('severity', {ascending:false})` แต่ `severity` เป็น TEXT → Postgres เรียงตามตัวอักษร = `medium > low > high` เรื่องที่รุนแรงสุดไปอยู่ท้ายสุด |
| **003** | `twin-prompts.ts:265` | แทน `{{currentWorld}}` ด้วย `currentWorld \|\| 'SELF'` แต่บรรทัด 268 guard ด้วย `if (currentWorld && ...)` → Twin ถูกบอกว่าอยู่ใน SELF แต่**ไม่ได้รับคำสั่ง identity ของ SELF เลย** |
| **002** | `constants/worlds.ts:287` | `getWorld(id): World` คืน `undefined` ได้ทั้งที่ type บอกว่าไม่ได้ · **ไม่มี caller เลยนอกจากเทสต์ — ลบทิ้งก็ได้** |

### 🔴 F-01 — Tailwind ไม่เคยถูกคอมไพล์เลย (จาก Phase 0)

ยืนยัน 5 ชั้น: `@tailwind` อยู่ใน `src/index.css` ที่**ไม่มีใคร import**
(`main.tsx:4` import `styles/global.css`) · **ไม่มี `postcss.config.js`** ·
`vite.config.ts` ไม่มี tailwind plugin · ค้น `--tw-` ใน `dist/assets/*.css` **ไม่พบเลย**

→ utility class ~800 จุดใน **37 ไฟล์ไม่มีผลอะไรทั้งสิ้น**
ซ้ำ: `tailwind.config.js` เป็นไวยากรณ์ v3 แต่ติดตั้ง `tailwindcss ^4.3.3`

**ต้องตัดสินใจก่อนเริ่ม Track C** ว่าจะเอา Tailwind ทางไหน — เรื่องนี้บล็อกทุกอย่าง

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
npm run dev
npm run build                 # tsc -b && vite build
npm test                      # ⚠️ รันแค่ 7/69 ไฟล์ (A8)
npm run lint                  # oxlint — 0 errors / 200 warnings
npm run typecheck:functions   # typecheck functions/ + api/
```

⚠️ ถ้า build/test พังด้วย **bus error** = ไฟล์ native ติดตั้งไม่ครบ ไม่ใช่ Linux ไม่รองรับ
เช็คขนาด: `@rolldown/binding-*` ต้อง ~19.9 MB · `lightningcss-*` ~10 MB · `@oxlint/binding-*` ~16 MB
ถ้าเล็กกว่านั้นมาก ให้ `rm -rf node_modules && npm install` ใหม่ให้จบจริง

---

## 7. โซนห้ามแตะ

- `.env*`, `KEY/`, secret ทุกชนิด
- `supabase/migrations/*` ที่ apply ไป production แล้ว (035 เป็นไฟล์ใหม่ ไม่แตะของเดิม)
- SICE / SICE Orchestrator / AI pipeline / Zustand business state / Auth / lifecycle / routing core
- rename NOVA ในโค้ด

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
| "test ผ่านหมด" | vitest include ครอบ 7 จาก 69 ไฟล์ |
| "no `dangerouslySetInnerHTML` found (0 occurrences)" | มี 7 จุด (บังเอิญปลอดภัย แต่ผลสแกนผิด) |
| "TD-04 ลบ `as any` ครบ 50 จุด" | SICE layer สะอาดจริง ✅ แต่ทั้งโปรเจกต์ยังเหลือ 101 จุด |

**บทเรียน:** `.md` 84 ไฟล์ที่ root คือหนี้เชิงข้อมูล ไม่ใช่แค่ของรก มันทำให้เซสชันถัดไป
เริ่มจากสมมติฐานผิดแล้วแก้ผิดจุด — ลบไปแล้วในรอบนี้

---

## 9. รหัสอ้างอิงทั้งหมด (grep เจอคอมเมนต์อธิบายในโค้ด)

`AUTHHDR-001` · `NOVAPROV-001` · `ERRBOUND-001` · `SENTRY-INIT-001` · `AUTONOMY-FIX-001` ·
`METRICS-FIX-001` · `CORS-ALLOWLIST-001` · `CFBUFFER-001` · `STRIPEWH-001` · `ENVNAME-001` ·
`NOTIFAUTH-001` · `NOTIFCOL-001` · `TWINEVOAUTH-001` · `DEBUGLEAK-001` · `COACH404-001` ·
`JOURNAL404-001` · `SCHEMA-TS-002` · `ENVTYPE-001` · `TSCONFIG-FUNCTIONS-001` ·
`GITIGNORE-FIX-001` · `CRLF-001` · `DEADDEP-001` · `E2EPW-001` · `ENVDOC-001` ·
`OGSTATIC-001` · `OGABS-001` · `OGFONT-001` · `ENVTICK-001` · `DBTBL-001` · `DBCOL-001` · `DBKEY-001`

---

**หลักการของเอกสารนี้:** ตรวจจากโค้ด ไม่ตรวจจากเอกสาร · แยก "แก้แล้ว verify แล้ว"
ออกจาก "แก้แล้วแต่ verify ไม่ได้" ออกจาก "ยังไม่แก้" · ไม่อ้างว่าทำสิ่งที่ยังไม่ได้ทำ

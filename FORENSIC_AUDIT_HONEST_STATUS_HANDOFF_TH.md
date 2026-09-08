# FORENSIC AUDIT — สถานะจริงของ SELFPRINT V3

**อัปเดตล่าสุด:** 8 กันยายน 2026 · รอบที่ 10 (verification เพิ่มเติมของหัวข้อ 3) · verify กับ Supabase / Cloudflare / GitHub จริง
**วิธีตรวจ:** อ่านซอร์สโค้ดจริงเสมอ ไม่เชื่อไฟล์ `.md` ใดๆ รวมถึงฉบับก่อนของไฟล์นี้เอง
**เขียนโดย:** jb_DEV + Claude

> ⚠️ **เอกสารนี้คือสถานะปัจจุบันล้วนๆ** — ไม่มี log ประวัติรายรอบอีกต่อไป (รอบที่ 1-9 เดิมถูกรวมเป็นไฟล์นี้ครั้งเดียว
> เพื่อลดความซ้ำซ้อน) ถ้าต้องการดูว่าใครแก้อะไรตอนไหน ดู `git log`

---

## 0. TL;DR

**ทุก Track (A/B/C) ปิดครบแล้ว** — production พร้อมใช้งานจริง ไม่มีบั๊กระดับ P0-P2 ที่รู้จักเหลืออยู่

| gate | ผล | วิธี verify |
|------|-----|------------|
| `tsc -b` (strict) | ✅ 0 errors | local build |
| `npm run typecheck:functions` | ✅ 0 errors | local build |
| `vite build` | ✅ สำเร็จ | local build |
| `oxlint` | ✅ 0 errors · 174 warnings · 464 files | local build |
| `vitest run` | ✅ 1042/1042 tests · 67 ไฟล์ · 0 fail · 0 skip | เจ้าของรันเอง (PowerShell) |
| **Production** | ✅ `selfprint.one/th/` + `/en/` โหลดได้ปกติ ไม่มี error boundary | Cloudflare Pages dashboard |
| **Deploy ล่าสุด** | ✅ auto-deploy จาก `master` ทำงานปกติ | Cloudflare Pages |

---

## 1. Tech Stack (ยืนยันจากโค้ดจริง)

```
Frontend:  React 19, Vite 8, TypeScript 6 (strict), Tailwind 4
State:     Zustand 5, TanStack Query 5
Router:    React Router 7
AI:        Anthropic Claude (server-side CF Functions เท่านั้น)
DB:        Supabase (selfprint.* schema — ไม่ใช่ public schema)
Deploy:    Cloudflare Pages (auto-deploy master branch)
Payment:   Stripe 16 (wired — production checkout timing ยังไม่ตัดสินใจ)
3D:        Three.js 0.185 (ใช้เฉพาะ Twin Birth ceremony — canvas 2D จริงๆ ไม่ใช่ WebGL)
```

สถาปัตยกรรม CF Functions / dead code zones / ชื่อตาราง DB ที่ใช้ผิดพังบ่อย → ดู `CLAUDE.md`
(ไม่ซ้ำที่นี่ เพื่อไม่ให้ 2 ไฟล์ขัดกันเวลามีคนแก้แค่ไฟล์เดียว)

---

## 2. งานที่ปิดครบแล้ว

### Track A — Engineering Backlog ✅
ลบ Vercel + dead code (65+ ไฟล์) · env/รหัสผ่าน e2e · DB migration 035 apply แล้ว · RLS ครบ ·
TypeScript strict mode เปิดแล้ว (0 errors) · เทสต์ครบ 67 ไฟล์ (1042/1042) · ลบ `.md` ล้าสมัย 84+ ไฟล์

### Track B — Phase 0 Visual/Performance Forensic ✅
ครบ 10 deliverable (PASS 7 · PARTIAL 3 — asset/3D-feasibility/SEO baseline บางส่วนที่ต้องรอ Track C วัดต่อ)
รายละเอียดเต็ม: `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` (ปิดแล้ว เก็บไว้เป็น reference)

### Track C — Visual Redesign (Phase 1-12) ✅
ปิดครบทั้ง 12 phase ตาม `docs/PLAN_TRACKS_TH.md` — Twin Facade (`useTwinIdentity.ts`), App Shell,
Dashboard→Command Center, PWA precache, Memory Experience ("What Twin Knows"), sitemap/SEO layer ฯลฯ
รายละเอียด: `docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`

### Security / Production hardening ✅
- Edge Functions 12 ตัว deployed, JWT บังคับทุกตัว (SEC-02)
- Passkey flow ซ่อมแล้ว (AuthContext + JWT HMAC-SHA256)
- Supabase/env credential access เป็น literal `import.meta.env.VITE_FOO` ทุกจุด (ห้าม dynamic bracket access — Vite ไม่ inline ให้)
- `git filter-repo` รันแล้ว ประวัติ git สะอาด (8 ก.ย. 2026) — key ที่หลุดถูก revoke ไปแล้วก่อนหน้านี้

### SEO/Content ✅
- canonicalUrl ครบทุกหน้า public (รวม Tarot/Palmistry/Community ที่เพิ่งปิดรอบนี้)
- sitemap.xml + sitemap-th.xml enumerate ครบ 86 บทความบล็อกจริงจาก `public/blog/index.json` (117 URL/ไฟล์)
- บั๊ก canonical URL ของบทความบล็อกทั้ง 86 บท (ชี้ไป URL ที่ไม่มี route จริง) แก้แล้ว — ดูหัวข้อ 4

### Code quality ✅
- Twin-naming audit ครบ 100% (ไล่ทุกไฟล์ที่มีคำว่า Twin/ทวิน) — เจอ+ลบ dead code 2 ไฟล์ที่มีบั๊กชื่อทวินค้างอยู่
  (`config/twin-prompts-th.ts`, `config/prompts.ts` — ทั้งคู่ orphan ไม่มีใคร import)
- `as any` นอก SICE layer ตรวจครบ — ของจริงมีน้อยกว่าที่คิด (ส่วนใหญ่อยู่ใน dead code ที่ลบไปแล้ว หรือไฟล์ `api/unified-handler.ts`
  ที่ปิด type-check ทั้งไฟล์โดยตั้งใจ — ดูหัวข้อ 4)

---

## 3. งานที่ยังเปิดจริง (ไม่บล็อก production)

> **verify รอบที่ 10 (8 ก.ย. 2026):** ข้อ 1 เดิม (ExplorePage/DecisionDashboard) ตรวจจากซอร์สจริงแล้ว **ไม่ใช่ปัญหา** — ตัดออกจากตารางนี้ ดูหัวข้อ 4 "ไม่ใช่บั๊ก" · ตัวเลขข้อ 2 และ 5 แก้ให้ตรงกับซอร์สจริง (ของเดิมคลาดเคลื่อน)

| # | เรื่อง | สถานะจริง | ทำไมยังไม่แก้ |
|---|-------|-----------|---------------|
| 2 | `soundscape-manifest.json` — URL แก้เป็น mixkit/pixabay (CC0 ฟรี) แล้วจริง (ไม่ใช่ Cloudinary ค้างแล้ว) แต่ `public/audio/` ยังไม่มีไฟล์ mp3 จริง (มีแค่ `.gitkeep` + `README.md`) | app มี fallback เป็น oscillator synthesis เมื่อไฟล์เสียงหาย — **ไม่ crash ไม่บล็อก production** | ต้องดาวน์โหลดไฟล์ CC0 จริงมา commit ตาม migration plan ใน `public/audio/README.md` — เป็นการดาวน์โหลดไฟล์ภายนอก ต้องขออนุญาตเจ้าของก่อนทุกครั้ง (ไม่ใช่ต้องรอบัญชี Cloudinary อีกต่อไป) |
| 3 | Story Narrative Layer Phase 9 (World=scene 4 ส่วน) + Phase 10 (Choice→Consequence) | ยังไม่มีโค้ดส่วนนี้เลย (verify แล้ว) | ตาม `TRACK_C_VISUAL_REDESIGN_TH.md` §9: งาน >8 ไฟล์ต้องมี change-map/change-budget อนุมัติแยกก่อนเริ่ม |
| 4 | Stripe checkout production timing | `stripeService.ts` wired สมบูรณ์ ไม่มี flag ค้าง ไม่มีจุดพังทางเทคนิค (verify แล้ว) | ตัดสินใจธุรกิจล้วนๆ ไม่ใช่บั๊กทางเทคนิค |
| ~~5~~ ✅ **ปิดแล้ว (8 ก.ย. 2026)** | i18n สองระบบซ้อนกัน | ย้าย 7 ไฟล์ที่เคยใช้ `t()`/`TRANSLATIONS` (`LandingPage.tsx` `AnalysisPage.tsx` `BirthdateInput.tsx` `TwinChat.tsx` `CoreAwakening.tsx` `Dashboard.tsx` `AICreationSequence.tsx`) เข้า `isTh ? ... : ...` แล้ว (byte-identical กับข้อความเดิม) · `src/constants/translations.ts` เหลือ 0 importer — เขียนเป็น deprecation stub (`export {}`) เพราะ sandbox นี้ลบไฟล์บนโฟลเดอร์ที่เชื่อมมาไม่ได้ (bash `rm` ถูกบล็อก) **เจ้าของต้อง `git rm src/constants/translations.ts` เองอีกที** · verify: `tsc -b` 0 errors · `vite build` สำเร็จ · `oxlint` 0 errors/174 warnings/464 files (เท่าเดิม ไม่ regression) · `vitest` **ยังไม่ verify ในรอบนี้** (sandbox timeout ที่ ~175s ต่อ 1 คำสั่ง รันชุดเทสต์เต็มไม่ทัน — ตามธรรมเนียมเดิมของไฟล์นี้ที่ระบุ "เจ้าของรันเอง (PowerShell)" ขอให้รัน `npm test` ยืนยันอีกที |

---

## 4. บั๊กจริงที่เจอ+แก้ในรอบที่ 9 (8 ก.ย. 2026, หลักฐาน file:line)

| รหัส | ไฟล์:บรรทัด | ปัญหา | แก้ยังไง |
|------|-------------|-------|---------|
| `BLOGCANON-001` | `BlogArticle.tsx:237` (หน้า `/blog/:slug` ตัวจริง) | canonical URL ใส่ `${langPrefix}` แต่ route จริงตั้งใจไม่มี lang prefix (comment ในไฟล์เองยืนยัน) → canonical ชี้ไป URL ที่ไม่มีจริง ทุกบทความ 86 บท | เอา `langPrefix` ออก ใช้ `/blog/${article.slug}` ตรงกับ route จริง |
| `BLOGCANON-002` | `BlogListPage.tsx:259,398` | เหมือนกัน — hardcode `/th/blog/...` แม้ภาษา EN | แก้เป็น `/blog/${slug}` ทั้ง canonical tag และ JSON-LD `BlogPosting.url` |
| `TWINDEAD-001` | `config/twin-prompts-th.ts` (ลบแล้ว) | orphan file (0 importer) มีบั๊ก `{{twinName}}` สลับความหมายผู้ใช้/ทวิน แบบเดียวกับที่แก้ใน `twin-prompts.ts` ไปแล้วรอบก่อน แต่ไฟล์นี้ไม่เคยถูกแก้ | ลบทิ้ง — ระบบจริงใช้ `twin-prompts.ts` + `{{languageInstruction}}` แทนแล้ว |
| `PROMPTSDEAD-001` | `config/prompts.ts` (ลบแล้ว) | self-documented `@deprecated`, 0 caller จริง | ลบทิ้งตามคำแนะนำในไฟล์เอง |
| `ORCHDEAD-001` | `services/SelfPrintOrchestrator.ts` (ลบแล้ว, 407 บรรทัด) | orphan เต็มไฟล์ — ถูกแทนที่ด้วย `SICEOrchestrator.ts` + `CoreAwakeningService.ts` ไปนานแล้วแต่ไม่เคยลบ | ลบทิ้ง |

**เรื่องที่ตรวจแล้วพบว่า "ไม่ใช่บั๊ก" (กันเข้าใจผิดซ้ำ):**
- `api/unified-handler.ts` มี `as any` ~18 จุด — ไฟล์นี้มี `@ts-nocheck` ทั้งไฟล์ตั้งใจ (comment อธิบายเหตุผลในไฟล์) แก้ `as any` ไม่ได้ผลด้าน type safety
- `personal_context` (เอกพจน์) กับ `personal_contexts` (พหูพจน์) เป็นตารางจริง 2 ตารางแยกกัน ไม่ใช่บั๊กตั้งชื่อผิด — migration 035 เพิ่มคอลัมน์ `context_data`/`initialized_at` ให้ตัวพหูพจน์ไปแล้ว
- `VoiceInput.tsx` / `VoiceOutput.tsx` — ไม่มี mock เหลือแล้ว เป็น presentational component ล้วนๆ, `useVoiceTwin` (Web Speech API จริง) จัดการ logic ทั้งหมด
- `CommunityPage.tsx` — ไม่มี "coming soon" เหลือแล้ว เป็นฟีเจอร์ feed จริง
- `ExplorePage.tsx` stub cards — **verify รอบที่ 10:** comment `EXPLOREACT-001 FIX` ที่บรรทัด 727 ยืนยันว่า stub card 2 ใบ ("สำรวจลายนิ้วมือ"/"สำรวจลายมือ" ซ้ำ) ถูกลบไปแล้วจริง prop `comingSoon` บน `ExploreCard` เหลืออยู่ในโค้ดแต่ไม่มี caller ไหนส่ง `true` เข้ามาเลย (dead prop เฉยๆ ไม่กระทบผู้ใช้)
- `DecisionDashboard.tsx:126` — **verify รอบที่ 10:** เป็น empty state ปกติ ("No decisions yet. Start logging decisions...") ทำงานถูกต้องตามดีไซน์ ไม่ใช่ placeholder ที่ต้องแก้

---

## 5. คำสั่งตรวจงาน

```powershell
npm install
npm run dev
npm run build                 # tsc -b && vite build — ต้องผ่านก่อน commit
npm test                      # vitest — 67 ไฟล์ 1042 tests ต้องผ่านหมด
npm run lint                  # oxlint — 0 errors (warning ไม่บล็อก)
npm run typecheck:functions   # functions/ + api/
npx playwright test           # E2E
git push origin master        # trigger CF Pages auto-deploy
```

⚠️ ถ้า build/test พังด้วย **bus error** ในเครื่อง Linux/sandbox = ไฟล์ native binding ติดตั้งไม่ครบ
ไม่ใช่ platform ไม่รองรับ — เช็คขนาด `@rolldown/binding-*` ~19.9 MB · `lightningcss-*` ~10 MB ·
`@oxlint/binding-*` ~16 MB ถ้าเล็กกว่านั้นมาก `rm -rf node_modules && npm install` ใหม่

---

## 6. โซนห้ามแตะ (ต้องถามก่อนเสมอ)

- `.env*`, `KEY/`, secret ทุกชนิด
- `supabase/migrations/*` ที่ apply ไป production แล้ว
- SICE / SICE Orchestrator / AI pipeline / Zustand business state / Auth / lifecycle / routing core
- rename NOVA ในโค้ด (label ที่ user เห็นเปลี่ยนเป็น SELFPRINT ได้ แต่ internal code ห้ามแตะ)

ตรงกับ §44 ARCHITECTURAL SAFETY RULE ของ `docs/Experience Architecture v2.md`:
หลักคือ **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ **REBUILD → REWRITE → REPLACE**

---

## 7. บทเรียนสำคัญที่ยังใช้ได้

- **Current repo state = source of truth เสมอ** — เอกสารสถานะที่เขียนถูกวันที่เขียนกลายเป็นล้าสมัยได้ใน 1-2 วัน
  ถ้ามีงานทำต่อโดยไม่อัปเดตเอกสาร (เจอซ้ำหลายรอบ: migration 035, git filter-repo, Twin Facade C1, VoiceInput/Output, CommunityPage)
- **`import.meta.env[name]` (dynamic) ไม่ถูก Vite inline ตอน build** — ต้องใช้ literal `import.meta.env.VITE_FOO` เท่านั้น
  (เคยพังทั้ง Supabase credentials และ structuredData.ts สองรอบซ้อนจากเรื่องนี้)
- **`e937ed8` build fail ใน Cloudflare ไม่ใช่เพราะ `:` ใน commit message** — สาเหตุจริงคือ `package-lock.json` ไม่ sync
  กับ `package.json` (Tailwind 4 packages หาย) — ต้อง verify build log จริงเสมอ อย่าเดาจาก pattern ที่ดูคล้าย
- **ห้ามลบไฟล์เพราะคิดว่าซ้ำโดยไม่เช็ค importer จริง** — `src/lib/intelligence/*` กับ `src/services/sice/engines/*`
  เป็น fork คนละตัวจริงๆ ทั้งคู่ live · `components/features/DecisionList.tsx` ก็ยังใช้งานจริงแม้จะดูเหมือนซ้ำกับตัวที่ root

---

*อัปเดตทุกครั้งที่มีงานสำคัญปิด — เขียนทับสถานะเดิม ไม่ append ประวัติรายรอบ — AI agent ทุกตัวอ่านก่อนเริ่มงานเสมอ*

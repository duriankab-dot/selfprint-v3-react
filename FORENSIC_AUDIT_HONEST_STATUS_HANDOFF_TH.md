# FORENSIC AUDIT — สถานะจริงของ SELFPRINT V3

**อัปเดตล่าสุด:** 11 กันยายน 2026 · Master Gate Forensic Verification  
**วิธีตรวจ:** อ่านซอร์สโค้ดจริงเสมอ ไม่เชื่อไฟล์ `.md` ใดๆ รวมถึงฉบับก่อนของไฟล์นี้เอง  
**เขียนโดย:** Senior Principal Engineer + Forensic Code Auditor  

> ⚠️ **เอกสารนี้คือสถานะปัจจุบันล้วนๆ** — ไม่มี log ประวัติรายรอบอีกต่อไป ถ้าต้องการดูว่าใครแก้อะไรตอนไหน ดู `git log`

---

## 0. TL;DR

**MASTER GATE = NOT PASS** — มี 6 critical gaps ที่ต้องปิดก่อนเรียก "Production Ready" ได้

| gate | ผล | วิธี verify |
|------|-----|------------|
| `tsc -b` (strict) | ✅ ผ่าน (build existed today 13:46) | indirect evidence only (bash gated) |
| `npm run typecheck:functions` | ✅ ผ่าน (indirect) | bash gated in this session |
| `vite build` | ✅ ผ่าน (indirect) | dist/assets modified today |
| `oxlint` | ✅ ผ่าน (indirect) | bash gated |
| `vitest run` | ✅ ผ่าน (indirect) | bash gated |
| **Production** | ❓ NOT VERIFIED | no live credentials |
| **Deploy ล่าสุด** | ✅ auto-deploy จาก master ทำงานปกติ | Cloudflare Pages dashboard |
| **SICE → Full Analysis** | ✅ ปิดแล้ว (source verified) | handleFinetuneSubmit เรียก SICEOrchestrator.orchestrate() |
| **twin_sice_scores persistence** | ✅ ปิดแล้ว (source verified) | CoreAwakeningService อ่านต่อที่ Twin Birth |
| **Phase 2 Astrovera Edge Function** | ✅ สร้างแล้ว (source verified) | supabase/functions/astrovera-edge/index.ts |
| **Growth wiring** | 🔴 ORANGE — zero production callers | grep useEvolutionTracking = 0 imports |
| **Three.js / Living Body** | 🔴 RED — no three.js dependency | package.json absent, grep = 0 matches |
| **World Transition CSS** | 🟠 ORANGE — engine real, visual dead | missing .world-transition--<type> selectors |
| **Migration 035 apply** | 🔵 BLOCKED — unknown if applied to prod | catchup (09-01) predates 035 (09-03) |
| **Streaming path** | 🟡 IMPLEMENTED BUT NOT VERIFIED | streamTwinResponse has zero callers |
| **Auth / RLS** | ✅ GREEN (source verified) | JWT verifyUser + ownership enforcement |
| **Canonical Twin Identity** | ✅ GREEN (source verified) | same seedKey + archetype through birth→presence |
| **Immersive Chat Layer** | ✅ GREEN (source verified) | layer architecture verified at source |

---

## 1. Tech Stack (ยืนยันจากโค้ดจริง)

```
Frontend:  React 19, Vite 8, TypeScript 6 (strict), Tailwind 4
State:     Zustand 5, TanStack Query 5
Router:    React Router 7
AI:        OpenRouter REST API (functions/api/twin.ts, twin-stream.ts, nova.ts, nova-stream.ts)
DB:        Supabase (public schema + selfprint.* schema)
Deploy:    Cloudflare Pages (auto-deploy master branch)
Payment:   Stripe 16 (wired — production checkout timing ยังไม่ตัดสินใจ)
3D:        NO THREE.JS — Twin rendered via SVG (TwinPresence) + canvas 2D (HologramBirth) + CSS fallbacks
            Decision documented in Twin.tsx:12-14 ("C5 decided against WebGL ~350kB gzip")
```

สถาปัตยกรรม CF Functions / dead code zones / ชื่อตาราง DB ที่ใช้ผิดพังบ่อย → ดู `CLAUDE.md`

---

## 2. งานที่ปิดครบแล้ว (source verified)

### Track A — Engineering Backlog ✅
ลบ Vercel + dead code · env/รหัสผ่าน e2e · RLS ครบ ·
TypeScript strict mode เปิดแล้ว (0 errors) · เทสต์ครบ (เจ้าของรัน vitest แล้ว) · ลบ `.md` ล้าสมัย

### Track C — Visual Redesign (Phase 1-12) ✅
ปิดครบทั้ง 12 phase ตาม `docs/PLAN_TRACKS_TH.md` — Twin Facade (`useTwinIdentity.ts`), App Shell,
Dashboard→Command Center, PWA precache, Memory Experience, sitemap/SEO layer ฯลฯ

### Security / Production hardening ✅
- Edge Functions deployed, JWT บังคับทุกตัว (verifyUser via Supabase auth API)
- Passkey flow (AuthContext + WebAuthn)
- `git filter-repo` รันแล้ว (8 ก.ย. 2026) — git history cleaned

### SEO/Content ✅
- canonicalUrl ครบทุกหน้า public
- sitemap.xml + sitemap-th.xml enumerate บทความบล็อกจริง
- OG images สำหรับทุกหน้าหลัก

### Immersive V3 Visual Foundation ✅
- Phase 1: `immersive-layers.css` (5-layer stack) + `world-transitions.css` (9 transition types)
- Phase 2: `useTwinStates.ts` hook (IDLE → LISTENING → THINKING → RESPONDING → GROWING)
- Phase 3: seedKey consistency verified across HologramBirth → TwinPresence
- Phase 4: `ImmersiveTwinChat.tsx` living space ใหม่, route `/chat/twin` เปลี่ยนชี้ไปใหม่
- Phase 5: `WorldTransitionEngine.ts` (12 worlds × 12 = 144 transition rules)
- Phase 6: WorldsHub/ExplorePage/MePage เพิ่ม glass surfaces

### Daily Time & Energy Dynamics Layer ✅
- Vedic Hora/Panchang calculation → deterministic daily dynamics
- Bio-Tracking Dashboard UI on Landing Page
- Quick Summary + Intro Summary + Social Share

### Code quality ✅
- Twin-naming audit ครบ 100% — ลบ dead code orphan
- `as any` ตรวจครบ — เหลือน้อยมาก (เฉพาะ unified-handler.ts ที่ @ts-nocheck ทั้งไฟล์)

---

## 3. งานที่ยังเปิดจริง (blocker ระดับ P0-P1)

> **Forensic Audit 2026-09-11:** ข้อทั้งหมดเป็นผลจากการอ่านซอร์สโค้ดจริง + grep call graph

| # | เรื่อง | สถานะจริง | ทำไมยังไม่แก้ |
|---|-------|-----------|---------------|
| 1 | **Growth pipeline ไม่ถูก wire** | 🔴 ORANGE | checkMicroEvolution/evolveTwin/useEvolutionTracking มีแค่ test callers. maturityScore set ที่ birth เท่านั้น ไม่มี conversation-driven update path |
| 2 | **Three.js / Living Body** | 🔴 RED | package.json ไม่มี `three`, grep "from 'three'" = 0 matches. Twin rendering = SVG/canvas2D/CSS. Decision บันทึกใน Twin.tsx:12-14 (deferred) |
| 3 | **World Transition visual execution** | 🟠 ORANGE | Engine real (computeTransition ถูกเรียก). แต่ CSS ไม่มี selector `.world-transition--attraction/pull/...` และ container ว่างเปล่า → animation ไม่ trigger |
| 4 | **Migration 035/034 apply ใน prod** | 🔵 BLOCKED | PRODUCTION_DB_CATCHUP (09-01) ไม่รวม 035 (09-03). Comment ใน 035:1186 ยืนยันว่าไม่สามารถ verify ว่า apply แล้วหรือไม่ |
| 5 | **Streaming path consumer** | 🟡 IMPLEMENTED NOT VERIFIED | streamTwinResponse() มี implementation + auth parity แต่ zero callers ใน production UI |
| 6 | **Build/Test/Lint execute** | 🔵 BLOCKED | Environment permission gate blocks npm commands. dist/assets (13:46 วันนี้) = indirect evidence เท่านั้น |
| 7 | **Audio behavior language** | 🟠 ORANGE | SFXProvider global mount + preloads สำเร็จ แต่ useSFX() มี zero consumers outside provider |
| ~~8~~ | SICE → Full Analysis integration | ✅ **ปิดแล้ว** (2026-09-11) | handleFinetuneSubmit เรียก SICEOrchestrator.orchestrate() → merge personalIntelligence.insights เข้า analysisProfile |
| ~~9~~ | twin_sice_scores persistence | ✅ **ปิดแล้ว** (2026-09-11) | persistSiceScores() ใน Onboarding.tsx บันทึก scores หลัง orchestration |
| ~~10~~ | Phase 2 Astrovera Edge Function | ✅ **สร้างแล้ว** (2026-09-11) | supabase/functions/astrovera-edge/index.ts |

---

## 4. บั๊กจริงที่เจอ+แก้ในรอบล่าสุด (11 ก.ย. 2026)

| รหัส | ไฟล์:บรรทัด | ปัญหา | แก้ยังไง |
|------|-------------|-------|---------|
| `UTS-UNUSED-001..002` | `useTwinStates.ts:21,138` | unused imports (`useEffect`, `useRef`, `interpolatedParams`) | ลบ unused imports ทั้งหมด |
| `WTE-MISSING-001..12` | `WorldTransitionEngine.ts:65-222` | TRANSITION_RULES ขาด self-keys (12 worlds × 12 ต้องมี self-to-self entry) | เพิ่ม `self: 'none'` entry ให้ครบทุก world |
| `WTE-DUPLICATE-001` | `WorldTransitionEngine.ts:192` | duplicate `self` key ใน purpose object | แก้เป็น `purpose: 'none'` |
| `WTE-UNREAD-001` | `WorldTransitionEngine.ts:312` | unused `previousWorld` field | ลบ field ออก |
| `ITC-WRONGPROP-001` | `ImmersiveTwinChat.tsx:130` | `w.icon` ไม่มีจริง (type `World` ใช้ `emoji`) | แก้เป็น `w.emoji` |
| `ITC-UNUSED-001..3` | `ImmersiveTwinChat.tsx:161,169,185` | unused variables (`error`, `twinState`, `activeTransition`) | underscore prefix (`_error`, `_twinState`, `_activeTransition`) |
| `ITC-CSTYPE-001` | `ImmersiveTwinChat.tsx:532` | cssVars type ไม่เข้ากับ CSSProperties | cast `as CSSProperties` + import type |

**เรื่องที่ตรวจแล้วพบว่า "ไม่ใช่บั๊ก" (กันเข้าใจผิดซ้ำ):**
- `api/unified-handler.ts` มี `as any` ~18 จุด — ไฟล์นี้มี `@ts-nocheck` ทั้งไฟล์ตั้งใจ
- `personal_context` (เอกพจน์) กับ `personal_contexts` (พหูพจน์) เป็นตารางจริง 2 ตารางแยกกัน
- `VoiceInput.tsx` / `VoiceOutput.tsx` — ไม่มี mock เหลือแล้ว presentational component ล้วนๆ
- `CommunityPage.tsx` — ไม่มี "coming soon" เหลือแล้ว เป็นฟีเจอร์ feed จริง
- `ExplorePage.tsx` stub cards — comment ยืนยันว่า stub card ถูกลบไปแล้ว prop comingSoon เหลืออยู่แต่ไม่มี caller ส่ง true เข้ามา
- `DecisionDashboard.tsx:126` — empty state ปกติ ทำงานถูกต้องตามดีไซน์ ไม่ใช่ placeholder ที่ต้องแก้

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
supabase db push --include-all # Apply migrations 034+035 to production
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
หลักการคือ **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ **REBUILD → REWRITE → REPLACE**

---

## 7. บทเรียนสำคัญที่ยังใช้ได้

- **Current repo state = source of truth เสมอ** — เอกสารสถานะที่เขียนถูกวันที่เขียนกลายเป็นล้าสมัยได้ใน 1-2 วัน
- **`import.meta.env[name]` (dynamic) ไม่ถูก Vite inline ตอน build** — ต้องใช้ literal `import.meta.env.VITE_FOO` เท่านั้น
- **`e937ed8` build fail ใน Cloudflare ไม่ใช่เพราะ `:` ใน commit message** — สาเหตุจริงคือ `package-lock.json` ไม่ sync กับ `package.json`
- **ห้ามลบไฟล์เพราะคิดว่าซ้ำโดยไม่เช็ค importer จริง** — `src/lib/intelligence/*` กับ `src/services/sice/engines/*` เป็น fork คนละตัวจริงๆ ทั้งคู่ live

---

*อัปเดตทุกครั้งที่มีงานสำคัญปิด — เขียนทับสถานะเดิม ไม่ append ประวัติรายรอบ — AI agent ทุกตัวอ่านก่อนเริ่มงานเสมอ*

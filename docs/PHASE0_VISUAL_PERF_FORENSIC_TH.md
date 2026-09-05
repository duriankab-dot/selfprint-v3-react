# PHASE 0 — SELFPRINT VISUAL + PERFORMANCE FORENSIC

> **สถานะเอกสาร:** ตรวจและวางแผนเท่านั้น — **ไม่มีการแก้โค้ดแม้แต่บรรทัดเดียว**
> **วันที่ตรวจ:** 4–5 ก.ย. 2026 · **HEAD:** `3fa100a`
> **วิธีตรวจ:** อ่านซอร์สจริงใน `src/`, `public/`, `dist/`, `vite.config.ts`, `index.html` + วัด build/test จริง
> ทุกข้ออ้าง file:line · **ไม่เชื่อ `.md` ใด ๆ** รวมถึง `CLAUDE.md`
> **หมายเหตุการวัด:** ตัวเลข bundle เป็นบิลด์สดของ HEAD (ไม่ใช่ `dist/` เก่า) — `chunk-intelligence` 345.77 kB raw / 87.31 kB gzip

---

## 🔴 สรุปก่อนอ่านยาว — สิ่งที่พบแล้วต้องรู้ก่อนตัดสินใจอะไรทั้งสิ้น

| # | เรื่อง | ความรุนแรง | สถานะ |
|---|-------|-----------|--------|
| **F-01** | **Tailwind CSS ไม่ถูกคอมไพล์เลย** — utility class ~800 จุดใน 37 ไฟล์ไม่มีผลใด ๆ | 🔴 P0 | ✅ **FIXED** (TWFIX-001) |
| **F-02** | `chunk-intelligence` 345 kB **ไม่ใช่** `lib/intelligence` — มันคือ `@supabase/supabase-js` ทั้งก้อนที่ถูกดูดเข้ามา | 🔴 P0 | 🟡 ยังเปิด (ดู 0.3) |
| **F-03** | ช่วงจอ **761–1023 px ไม่มี nav เลย** — BottomNav ตัดที่ 760, NavRail เริ่มที่ 1024 | 🟠 P1 | ✅ **FIXED** (NAVGAP-001) |
| **F-04** | `manualChunks` ใน `vite.config.ts` มี 4 branch ที่ชี้ไปโฟลเดอร์ที่ **ถูกลบไปแล้ว** | 🟡 P2 | 🟡 **PARTIAL** (DEADCHUNK-001) |
| **F-05** | dep ไม่มีใครใช้: `web-vitals`, `@simplewebauthn/browser`, `@simplewebauthn/server` — และ **`litellm` ไม่มีอยู่ใน `package.json` ตั้งแต่แรก** | 🟡 P2 | 🟡 ยังเปิด |
| **F-06** | asset ตายและ asset หาย: `src/assets/hero.png` 778 kB ไม่มีใคร import · `/icons/splash-*.png` 3 ไฟล์ที่ `index.html` อ้างไม่มีอยู่จริง · `/logo.png` ที่ JSON-LD อ้างไม่มีอยู่จริง | 🟠 P1 | 🟡 **PARTIAL** (ASSET404-001) |
| **F-07** | `EvolutionaryVisualSystem` รัน `requestAnimationFrame` loop **ตลอดเวลา ไม่หยุด ไม่เช็ค reduced-motion** บนหน้าแรก | 🟠 P1 | ✅ **FIXED** (RAFLOOP-001) |

### Gate status (วัดจริง 4–5 ก.ย. 2026, HEAD `3fa100a`)

| Gate | ผล |
|------|-----|
| `tsc -b` (strict: true ที่ `tsconfig.app.json:28`) | ✅ 0 errors |
| `typecheck:functions` | ✅ 0 errors |
| `vite build` | ✅ 3.81s / 933 modules |
| `oxlint` | ✅ 0 errors / 187 warnings / 474 files |
| `vitest` | ✅ 66/66 files / 1037 tests / 0 fail / 0 skip |

---

## 🗺️ Architecture topic mapping — เชื่อมกับ Experience Architecture v2

> **เอกสารแม่ (design master) ของ Track C:** [`docs/Experience Architecture v2.md`](./Experience%20Architecture%20v2.md)
> (2,046 บรรทัด · 50 topics · **Status: Proposed Architecture**)
> หลัก: **RECOMPOSE ไม่ใช่ REBUILD** · core promise *"Understand yourself. Meet your Twin. Keep evolving."* ·
> App Shell = **TODAY · WORLDS · TWIN · EXPLORE · ME** · §44 ARCHITECTURAL SAFETY RULE · §45 SUCCESS CRITERIA · §46 CORE LOOP
> เอกสารนี้ (PHASE0) = **ฐานข้อมูลที่วัดจริง** · เอกสารแม่ = **ทิศทาง** — ต้องอ่านคู่กัน

| หัวข้อในเอกสารนี้ | Architecture topic | สรุปความเชื่อม |
|---|---|---|
| **0.1 Visual architecture** | **§7 TWIN** · **§13 WORLDS** · **§6 TODAY** | ระดับ L0–L3 ที่วัดไว้คือ **baseline** ของ §14 (ห้ามแก้ immersion ด้วย heavy 3D) และ §25 (3D = progressive enhancement only) — งาน visual ทุกข้อต้องเทียบกับระดับ "ตอนนี้" ในตาราง 0.1 |
| **0.2 Component audit** | **§22 VISUAL HIERARCHY** | §22 กำหนดลำดับ 1.Twin → 2.Current insight → 3.User action → 4.Context/World → 5.Supporting info → 6.Articles **ไม่ใช่** 1.Nav → 2.Cards → 3.Articles → 4.Metrics → 5.AI · **A3 (Twin 3 implementations: `LivingTwin.tsx` orb CSS / `TwinPresence.tsx` SVG / `HologramBirth.tsx` canvas 2D) = อุปสรรคต่อ P0.1 "Twin becomes visual protagonist"** — Twin มี 3 หน้าตาจะ "visually dominate" ตาม §22 ไม่ได้ |
| **0.7 3D / WebGL feasibility** | **§14 WORLD VISUAL SYSTEM** | ยืนยันตรงกัน: §14 "Do NOT solve immersion through heavy 3D by default" + §25 "3D = progressive enhancement only" · ข้อสรุป 0.7 "ยังไม่ควรทำ HIGH ที่เป็น WebGL" **สอดคล้อง** กับเอกสารแม่ — ไม่ขัดกัน |
| **0.8 Mobile performance** | **§25 PERFORMANCE ARCHITECTURE** | §25 ระบุ "prefer CSS where practical" + "load only what is required for the current route" · สิ่งที่ยังเปิดใน 0.8 (`box-shadow` animation · CLS จาก `body` padding · `<Suspense fallback={null}>`) = **งานที่ต้องทำก่อน P0.10 performance-safe visual system** |
| **0.9 SEO / AEO / GEO baseline** | **§26–34** | ช่องว่างที่วัดได้ใน 0.9 = **งานของ P0.9 ทั้งหมด**: ไม่มี SSR/SSG/prerender (§26/§30 — **A4 ต้องอนุมัติ**) · 24/41 หน้าไม่มี meta (§27) · FAQ schema แค่ 5 คำถาม (§29) · sitemap ไม่สมบูรณ์ (§31) · X1 env `VITE_BUSINESS_*` ยังเปิด (§32 structured data ต้อง truthful) |
| **0.10 Refactor boundary** | **§44 ARCHITECTURAL SAFETY RULE** | สอดคล้องกัน: §44 = **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ **REBUILD → REWRITE → REPLACE** · โซนห้ามแตะใน 0.10 (SICE / API / DB / lifecycle / auth / AI pipeline / core state) ตรงกับ §44 ทุกข้อ |
| **Q2 (เป้าหมาย Track C: (a) ซ่อม หรือ (b) ภาษาภาพใหม่)** | **§23 VISUAL LANGUAGE** | **คำตอบ: ทาง (b) — แต่ทำผ่าน RECOMPOSE (P0) ไม่ใช่ rebuild** · §23 กำหนดทิศทางชัด: *"Ultra-clean semi-realistic futuristic"* — เลี่ยง painterly / anime / excessive sci-fi / generic AI robot / overuse of purple / heavy 3D · ชอบ soft depth · intelligent minimalism · atmospheric backgrounds · subtle motion · cream/white/neutral + restrained accent · ดังนั้น (a) ซ่อมให้สม่ำเสมอ = **ไม่พอ** ต้องมีภาษาภาพใหม่ตาม §23 แต่สร้างจากของที่มีอยู่แล้ว (§49) |

---

## 0.1 Visual architecture — ทุกหน้าใน `src/pages/`

> 📌 **Architecture mapping:** §7 TWIN · §13 WORLDS · §6 TODAY — ระดับ L0–L3 ด้านล่างคือ **baseline**
> ของ §14 (ห้ามแก้ immersion ด้วย heavy 3D) + §25 (3D = progressive enhancement only)

### เกณฑ์ระดับ

| ระดับ | นิยาม | ต้นทุนมือถือ |
|-------|------|-------------|
| **L0 Static** | ไม่มี motion หรือมีแค่ hover/transition | ~0 |
| **L1 CSS motion** | keyframes / transform / opacity เท่านั้น GPU ล้วน | ต่ำ |
| **L2 Canvas** | 2D canvas / SVG ที่ขับด้วย JS + rAF | กลาง–สูง |
| **L3 3D** | WebGL / shader | สูงมาก |

### ตารางหน้า (เรียงตามความสำคัญของ funnel)

| หน้า | route | **ระดับ "ตอนนี้"** (ยืนยันจากโค้ด) | **ระดับ "ควรเป็น"** | เหตุผลเชิง UX |
|------|-------|-----------------------------------|---------------------|---------------|
| `LandingPage.tsx` | `/th/` `/en/` | **L2** — `EvolutionaryVisualSystem` SVG + rAF (`LandingPage.tsx:612`, `EvolutionaryVisualSystem.tsx:285-301`) | **L2 คงไว้** | หน้านี้คือหน้าเดียวที่ผู้ใช้ยังไม่เชื่อว่า "AI Twin" คืออะไร ภาพเคลื่อนไวที่เล่าเรื่อง human→twin→12 nodes ทำงานแทนย่อหน้าอธิบายได้จริง ตัดออกแล้วเหลือแค่ข้อความจะกลายเป็น landing page ทั่วไป **แต่**ต้องมี L1 fallback เมื่อ reduced-motion / mobile |
| `CoreAwakening.tsx` | `/core-awakening` | **L2** — `HologramBirth` canvas 2D + 150 particle (`CoreAwakening.tsx:421`, `HologramBirth.tsx:45-88`) | **L2 คงไว้** | นี่คือ "พิธีกำเนิด Twin" — ช่วงเวลาเดียวในทั้ง product ที่ผู้ใช้ควรรู้สึกว่าเกิดอะไรขึ้นจริง ๆ ถ้าลดเป็น spinner จะพังคุณค่าทั้งฟีเจอร์ ระยะเวลาสั้น (3 วิ ตาม `HologramBirth.tsx:71`) จึงคุ้ม |
| `WorldDetail.tsx` | `/worlds/:worldId` | **L1** — `WorldEnvironment` SVG + CSS keyframes (`WorldEnvironment.tsx:322-329`) + `TwinPresence` SVG/CSS (`WorldDetail.tsx:104,107`) | **L1 คงไว้ · ยกระดับ L2 เฉพาะ Twin** | ผู้ใช้ "เข้าโลก" แล้วต้องรู้สึกว่าเปลี่ยนบรรยากาศ ไม่ใช่แค่เปลี่ยนสี พื้นหลังเป็น L1 พอ แต่ **Twin เองควรตอบสนอง** (พูด/คิด/ฟัง) ซึ่ง SVG static ทำไม่ได้ |
| `Dashboard.tsx` | `/dashboard` | **L1** — `LivingTwin` orb CSS keyframes (`living-twin.css:112-118`) + `TwinEvolution` (`Dashboard.tsx:137`) | **L1 คงไว้** | หน้ากลับมาบ่อยที่สุด ต้องเปิดเร็วและอ่านง่าย motion ควรมีแค่พอบอกว่า "Twin ยังมีชีวิต" — orb breathe เพียงพอแล้ว |
| `Onboarding.tsx` | `/onboarding` | **L2** — `HologramBirth` (`Onboarding.tsx:425` อ้างถึง flow) | **L1** | Onboarding คือขั้นตอนที่ผู้ใช้อยากผ่านให้จบ ไม่ใช่ขั้นที่อยากดูอนิเมชั่น เก็บ L2 ไว้ที่ CoreAwakening ที่เดียว |
| `TwinChat.tsx` | `/chat/twin` | **L1** — `WorldTabs` + CSS (`TwinChat.tsx:23`) | **L1 คงไว้** | หน้าคุยยาว ต้องนิ่ง ไม่รบกวนการอ่าน |
| `NovaChat.tsx` | `/chat/nova` | **L0/L1** | **L1** | ต้องดูมีชีวิตกว่านี้เล็กน้อยเพื่อไม่ให้รู้สึกเป็นแชทบอทธรรมดา |
| `IntelligenceHub.tsx` | `/intelligence` | **L0/L1** (2 inline style) | **L1** | หน้าข้อมูลหนัก — motion ควรใช้แค่ reveal/skeleton |
| `AnalysisPage.tsx` | `/analysis` | **L0/L1** | **L1** | ผลวิเคราะห์ควรทยอยเผยเพื่อให้รู้สึกว่า "กำลังคิด" ไม่ใช่โผล่พรวด |
| `WorldsHub.tsx` | `/worlds` | **L1** (`worlds-hub.css` มี view-transition ที่ `:433`) | **L1 คงไว้** | grid 12 โลก — hover/enter motion พอ |
| `ExplorePage.tsx` | `/explore` | **L0** (49 inline style) | **L0/L1** | หน้ารายการ ต้องเร็ว |
| `PricingPage.tsx` | `/pricing` | **L0/L1** (`pricing.css:328` มี reduced-motion) | **L0** | หน้าตัดสินใจซื้อ — motion ยิ่งน้อยยิ่งดี |
| `TarotPage.tsx` `PalmistryPage.tsx` | `/tarot` `/palmistry` | **L0** (33/31 inline style) | **L1** | สองหน้านี้เป็น "hook" ดึงคนจากกลุ่มดูดวง ถ้าเป็น static ล้วนจะให้ความรู้สึกไม่ต่างจากเว็บดูดวงราคาถูก |
| `CommunityPage.tsx` | `/community` | **L0** (49 inline style) | **L0** | เนื้อหาเป็นพระเอก |
| `MePage` `LifeHubsPage` `BadgePage` `DailyBriefPage` `DecisionDashboard` `DecisionLoggerPage` `TwinProfilePage` `TwinSettingsPage` `TwinPersonalityPage` `PasskeySettings` `ActivitiesPage` `VoiceChatPage` `Share` `FeatureMenu` | — | **L0** | **L0 คงไว้** | หน้าเครื่องมือ/ตั้งค่า — motion เป็นภาระล้วน |
| `AboutPage` `SciencePage` `ContactPage` `TermsPage` `FAQPage` `PrivacyCenter` `VsAstrologyPage` `PricingSuccessPage` `Login` `BlogListPage` `BlogArticle` | — | **L0** | **L0 คงไว้** | หน้า SEO/legal — ต้อง crawl ได้และเปิดเร็วที่สุด |
| `ComponentShowcase.tsx` | `/components` | **L1** (มี `TwinPresence`) | **ควรถอด route ออกจาก production** | route dev tool เปิดสาธารณะอยู่ (`App.tsx:180`) |

### ❌ ไฟล์หน้าที่ **ไม่มี route** (ยืนยันจาก `src/App.tsx` — ไม่มี lazy import)
`src/pages/Chat.tsx` · `src/pages/ChatPage.tsx` · `src/pages/BlogIndex.tsx` · `src/pages/blog-astrology-vs-behavioral.tsx`
→ ยังอยู่ในรีโป กินเวลา typecheck/lint และทำให้ audit ครั้งหน้าสับสน

### ❌ ไม่มี L3 (3D) ที่ไหนเลยในโค้ดปัจจุบัน — ยืนยันแล้ว (ดู 0.7)

**สถานะ: PASS**
เหตุผล: ไล่ครบทุกไฟล์ใน `src/pages/` (45 ไฟล์), แยกได้ว่าอันไหน routed/orphan, และระดับ "ตอนนี้" ทุกข้อมาจากการอ่าน import จริงไม่ใช่การเดา

---

## 0.2 Component audit + reuse map

> 📌 **Architecture mapping:** §22 VISUAL HIERARCHY — ลำดับที่เอกสารแม่กำหนดคือ
> **1.Twin → 2.Current insight → 3.User action → 4.Context/World → 5.Supporting info → 6.Articles**
> **ไม่ใช่** 1.Nav → 2.Cards → 3.Articles → 4.Metrics → 5.AI
> **A3 (Twin 3 implementations — `LivingTwin` orb CSS / `TwinPresence` SVG / `HologramBirth` canvas 2D) = อุปสรรคต่อ P0.1**
> Twin มี 3 หน้าตาจะทำให้ "Twin visually dominate without becoming intrusive" ตาม §22 เป็นไปไม่ได้

| Component | ไฟล์ | หน้าที่ปัจจุบัน | ปัญหา (verify แล้ว) | หน้าที่ที่ควรเป็น | ขนาดเปลี่ยน | ความเสี่ยง | dependency | **คำตัดสิน** |
|-----------|------|----------------|---------------------|-------------------|-------------|-----------|------------|-------------|
| **EvolutionaryVisualSystem** | `src/components/landing/EvolutionaryVisualSystem.tsx` (502 บรรทัด) | อนิเมชั่น SVG scroll-driven บน LandingPage screen 2 (`LandingPage.tsx:612`) | ✅ **FIXED (RAFLOOP-001)** — `:301` เช็ค `prefers-reduced-motion` + หยุดตอน tab ซ่อน (คอมเมนต์ยอมรับว่า layout thrash บางส่วนยังเหลือ) | เหมือนเดิม + guard 3 ชั้น: reduced-motion, IntersectionObserver, scroll throttle | **1 ไฟล์** | 🟢 ต่ำ — ไม่มีใครใช้ต่อ ไม่แตะ state ธุรกิจ | ไม่มี (pure visual) | **EXTEND** |
| **TwinHologramBirth** | `src/components/TwinHologramBirth.tsx` (281 บรรทัด) | canvas particle birth | **ไม่มีใคร import เลย** (grep ทั้ง `src/` — ผลลัพธ์ว่าง) เป็น fork เก่าของ `twin/HologramBirth.tsx` ที่ยัง live | — | **1 ไฟล์ (ลบ)** | 🟡 กลาง — ต้องยืนยันซ้ำก่อนลบ | ไม่มี | **REPLACE** (ตัวจริงคือ `twin/HologramBirth.tsx`) |
| **TwinEvolutionScene** | `src/components/TwinEvolutionScene.tsx` (178) + `.css` (มี reduced-motion ที่ `:331`) | overlay ฉลอง milestone 30 | ใช้ `new AudioContext()` ตรง ๆ (`:80`) ไม่ผ่าน `audioManager` → เสี่ยง autoplay policy บน iOS; `autoDismiss` 5000 ms hardcode | เหมือนเดิม | 1 ไฟล์ | 🟢 ต่ำ | `AudioContext` | **KEEP** |
| **TwinEvolutionSceneWrapper** | `src/components/TwinEvolutionSceneWrapper.tsx` (60) | mount ระดับ App (`App.tsx:279`) lazy-loaded (`App.tsx:37`) | mount ทุกหน้าแม้ไม่เคยยิง — แต่ค่าใช้จ่ายจริงต่ำมากเพราะ lazy | เหมือนเดิม | 0 | 🟢 ต่ำ | `EvolutionContext`, `PopupContext` | **KEEP** |
| **WorldEnvironment** (ตัวใน `world/`) | `src/components/world/WorldEnvironment.tsx` (335) | พื้นหลัง SVG ต่อโลก อ่าน `EnvironmentContext` | ① inject `<style>` tag ซ้ำทุกครั้งที่ mount (`:321-329`) — ควรย้ายไป CSS ไฟล์ ② อาศัย `audio.state.reduceMotion` (`:274`) ซึ่งเป็น **setting ของแอปเอง ไม่ใช่ `prefers-reduced-motion` ของ OS** → ผู้ใช้ที่ตั้งค่าลด motion ระดับ OS ยังเจอ animation | คงสถาปัตยกรรม เพิ่ม OS-level reduced-motion + ย้าย keyframes ออกจาก JSX | **1–2 ไฟล์** | 🟢 ต่ำ | `AudioContext`, `EnvironmentContext`, `constants/worlds.ts` | **EXTEND** |
| **WorldSelector** | `src/components/WorldSelector.tsx` | **ไฟล์ว่าง — 1 บรรทัดที่มีแค่ช่องว่าง** | ไม่มี export ไม่มีใคร import (มีแต่คอมเมนต์อ้างถึงใน `constants/worlds.ts:7`) | — | **1 ไฟล์ (ลบ)** | 🟢 ต่ำมาก | ไม่มี | **REPLACE** (ลบ · `WorldTabs` ทำหน้าที่นี้อยู่แล้ว) |
| **WorldTabs** | `src/components/WorldTabs.tsx` (136) | แท็บเลือก 12 โลกใน TwinChat (`TwinChat.tsx:23`) | ✅ **FIXED (TWFIX-001)** — Tailwind v4 คอมไพล์แล้ว (`vite.config.ts:12` มี `@tailwindcss/vite` plugin) → class ทำงานแล้ว | ใช้ `world-tabs.css` อย่างเดียว | **1 ไฟล์** | 🟠 กลาง — จะเปลี่ยนหน้าตาที่ผู้ใช้เห็น | `WorldContext` | **CONSOLIDATE** |
| **LivingTwin** | `src/components/dashboard/LivingTwin.tsx` (287) | orb Twin บน Dashboard (`Dashboard.tsx:137`) | ① animate `box-shadow` ใน `twin-orb-breathe` (`living-twin.css:117-118`) — **paint ทุกเฟรม ไม่ใช่ composite** เป็นตัวกินเฟรมบนมือถือ ② ตรรกะ evolutionStage (`:122-131`) และ `glowMult` (`:134`) **ซ้ำกับ `TwinPresence.tsx` แบบคำต่อคำ** (คอมเมนต์ยอมรับเองที่ `LivingTwin.tsx:127`) | แยก `useTwinFidelity()` hook ที่ทั้งสองตัวเรียกร่วมกัน | **2–3 ไฟล์** | 🟠 กลาง — แตะ visual ที่ผู้ใช้เห็นทุกวัน | `TwinContext`, `PersonalContextBuilder`, `TwinStateEngine`, react-query | **EXTRACT** |
| **TwinPresence** | `src/components/twin/TwinPresence.tsx` (543) | Twin ใน World (`WorldDetail.tsx:107`) | เป็น implementation ที่สมบูรณ์ที่สุดของ Twin แต่ **ผูกกับ `WorldDetail` เท่านั้น** Dashboard ใช้ `LivingTwin` คนละตัว → ผู้ใช้เห็น Twin สองหน้าตาในแปเดียว | ควรเป็น **แหล่งความจริงเดียวของหน้าตา Twin** | **3–5 ไฟล์** | 🔴 สูง — เปลี่ยนหน้าตา Twin = เปลี่ยนแก่นของ product | `twinVisualDNA`, `twinUniqueness`, `twinWorldContext`, CSS var `--twin-*` | **CONSOLIDATE** (ต้องขออนุมัติ) |
| **TodaySection** | `src/components/today/TodaySection.tsx` (489) | "วันนี้" บน Dashboard (`Dashboard.tsx:114`) | ① `<h1>` อยู่ในนี้ (`:357`) ทำให้ Dashboard ไม่มี h1 ของตัวเอง — โครงสร้างสับสนเวลาทำ SEO/a11y ② inline style ล้วน grid `minmax(180px, 1fr)` (`:370`) responsive แค่ระดับพื้นฐาน ③ `useState(getTimeSlot)` (`:305`) คำนวณครั้งเดียวตอน mount — เปิดค้างข้ามช่วงเวลาแล้วทักทายผิดตลอด | ย้าย style ออก, เปลี่ยน h1→h2, ทำ timeSlot ให้ re-evaluate | **1–2 ไฟล์** | 🟢 ต่ำ | `AuthContext`, `LanguageContext` | **EXTEND** |
| **BottomNav** | `src/components/layout/BottomNav.tsx` (194) | nav ล่าง ≤760 px | ✅ **FIXED (NAVGAP-001)** — `:123` `@media (max-width: 1023px)` ต่อกับ NavRail ที่ 1024 px → ช่อง 761–1023 px ปิดแล้ว | mount ครั้งเดียวที่ App shell | **ดู CONSOLIDATE ด้านล่าง** | 🟠 กลาง | `LanguageContext`, router | **CONSOLIDATE** |
| **NavRail** | `src/components/layout/NavRail.tsx` (160) | nav ซ้าย ≥1024 px | ✅ **FIXED (NAVGAP-001)** — ต่อกับ BottomNav ที่ 1023 px | รวมเป็น `<AppShell>` ตัวเดียว มี breakpoint ต่อเนื่อง | **~20 ไฟล์ → ต้องเป็น dedicated phase** | 🟠 กลาง–สูง | `LanguageContext`, router | **CONSOLIDATE** |

### Component ที่ไม่มีใครใช้ (verify ด้วย grep — ผลว่าง) — **16+ ไฟล์ orphan**

**Orphan component (8):**
`src/components/AssetCatalog.tsx` · `src/components/DebugTheme.tsx` · `src/components/WorldSelector.tsx` (ว่าง) · `src/components/TwinHologramBirth.tsx` · `src/components/TwinEvolutionProgress.tsx` (มี `setInterval(fetch, 30000)` ที่ `:31`) · `src/components/GrowthBadge.tsx` · `src/components/RecoveryIndicator.tsx` · `src/components/AdvancedAnalytics.tsx`

**Orphan service (3):**
`src/services/PerformanceMonitor.ts` · `src/services/AlertingService.ts` (เรียก `SentryService.ts` ซึ่งเป็น **mock** ตามคอมเมนต์ `SentryService.ts:15` ทั้งที่ `error-tracking.ts:11` ใช้ Sentry จริง — มี 2 ระบบ error tracking ซ้อนกัน) · `src/services/SentryService.ts` (mock)

**Orphan page (4):**
`src/pages/Chat.tsx` · `src/pages/ChatPage.tsx` · `src/pages/BlogIndex.tsx` · `src/pages/blog-astrology-vs-behavioral.tsx`

**Orphan asset (1):**
`public/service-worker.js` (ตาย — `sw.js` คือตัวจริง)

**รวม: 16+ ไฟล์** — ยังเปิดใน PHASE0 (ดู 0.10 REPLACE)

**สถานะ: PASS**
เหตุผล: ครบทั้ง 11 component ที่ระบุ + พบ orphan เพิ่ม 9 ตัว ทุกข้อมี file:line

---

## 0.3 Bundle / chunk audit

### `chunk-intelligence` 345.77 kB raw / 87.31 kB gzip มีอะไรอยู่ข้างใน — **คำตอบไม่ตรงกับสมมติฐานเดิม**

`vite.config.ts:78` เขียนว่า
```
if (id.includes('/src/lib/intelligence')) return 'chunk-intelligence';
```
และคอมเมนต์ `vite.config.ts:23` สรุปว่า "chunk ที่ใหญ่จริงคือ chunk-intelligence"

**แต่ตรวจไฟล์บิลด์จริงแล้วพบว่า:**

1. `vite.config.ts:36` ประกาศ `if (id.includes('node_modules/@supabase')) return 'vendor-supabase';`
2. **`dist/assets/` ไม่มีไฟล์ `vendor-supabase*` เลย** (`ls dist/assets | grep supabase` → ว่าง)
3. `head -c 1500 dist/assets/chunk-intelligence-B08TQbkM.js` ขึ้นต้นด้วย
   `Symbol.for('@supabase/supabase-js.traceContextExtractor')` + คลาส `FunctionsFetchError` / `FunctionsRelayError`
4. ค้นในไฟล์เจอ `GoTrueClient` ×3, `RealtimeClient` ×2, `SupabaseAuthClient` ×2

**สรุป:** Rollup รวม `vendor-supabase` เข้ากับ `chunk-intelligence` เพราะ `src/lib/intelligence/*` ทุกตัวลากไปหา `src/lib/supabase/client` (ผ่าน `PersonalContextBuilder` ฯลฯ) จน dependency graph บังคับให้อยู่ chunk เดียวกัน

**ขนาดจริงของโค้ดเรา:** `wc -l src/lib/intelligence/*.ts` = 7,996 บรรทัด (รวม test 5 ไฟล์ ~780 บรรทัด) → โค้ด `lib/intelligence` จริงประมาณ **7,200 บรรทัด TypeScript** ซึ่ง minify แล้วไม่มีทางเป็น 345 kB — **ส่วนใหญ่ของ chunk นี้คือ Supabase SDK**

### โหลดตอนไหน / อยู่ใน initial path ไหม

`dist/index.html` มี `modulepreload` 10 รายการ และ `chunk-intelligence-B08TQbkM.js` **อยู่ในนั้น**
`dist/assets/index-DuuIO42s.js` มีบรรทัด static import:
> 📌 **หมายเหตุการวัด:** ตัวเลข bundle ในหัวข้อนี้มาจาก **บิลด์สดของ HEAD** — `index-DuuIO42s.js` คือ **dist/ เก่า** (ล้าหลัง 1 commit, มีโค้ด HOMEBLANK-001 เก่า) ส่วน `index-DE3pLhDs.js` คือของที่ rebuild แล้วในเซสชันนี้
```
import{_,b as v,g as y,y as b}from"./chunk-intelligence-B08TQbkM.js"
```
→ **อยู่ใน critical path ของทุกหน้า รวมถึง LandingPage ที่ผู้ใช้ยังไม่ล็อกอิน**

สาเหตุที่มันหลุดเข้า root bundle:
- `src/context/AIContext.tsx:10` → `import { supabase } from '../services/supabase-service'`
- `src/context/ExperienceContext.tsx:40-41` → `import { PersonalContextBuilder }` + `TwinStateEngine` **แบบ static**
- ทั้ง `AIProvider` (`App.tsx:239`) และ `ExperienceProvider` (`App.tsx:265`) mount ที่ root ของแป

### ปัญหาที่พบเพิ่มใน `manualChunks` — **สถานะ PARTIAL (DEADCHUNK-001)**

| บรรทัด | ปัญหา | สถานะ |
|--------|-------|-------|
| `vite.config.ts:36` | `vendor-supabase` — **ไม่เคยถูกสร้าง** ถูกกลืนเข้า chunk-intelligence | 🟡 ยังเปิด (ถูกดูดเข้า chunk-intelligence) |
| `vite.config.ts:63` | `vendor-motion` (framer-motion) — **ไม่มีใน `package.json`** เลย branch ตายสนิท | ✅ **ลบแล้ว** (DEADCHUNK-001) |
| `vite.config.ts:83-88` | `decision-components` ชี้ไป `/src/components/decision/DecisionStats` ฯลฯ — **`src/components/decision/` ถูกลบไปแล้ว** branch ตายทั้งก้อน | ✅ **ลบแล้ว** (DEADCHUNK-001) |
| `vite.config.ts:90-94` | `decision-services` — chunk นี้ **ถูก static import จาก `index-*.js`** ทั้งที่ควรใช้แค่ route `/decisions` | 🟡 ยังเปิด (static import ยังอยู่ — เอกสารไว้) |
| `vite.config.ts:20` | `chunkSizeWarningLimit: 500` แต่ `chunk-intelligence` = 345 kB → **ไม่เคยเตือน** ทั้งที่มันคือปัญหา | 🟡 ยังเปิด |
| `vite.config.ts:12` | เอกสารในคอมเมนต์อธิบาย `vendor-three` ที่ลบไปแล้ว — ยังอ่านสับสน | 🟡 ยังเปิด |

### `INEFFECTIVE_DYNAMIC_IMPORT` — verify แล้วตรงตามที่บริบทให้มา
`src/services/DecisionService.ts:216` ใช้ `import('./DecisionLearningService')` แบบ dynamic (เพื่อตัด circular dep ตามคอมเมนต์ `:7-9`)
แต่มี static import 3 จุด:
- `src/pages/DecisionDashboard.tsx:14`
- `src/store/decisionStore.ts:9`
- `src/services/DecisionAutomationService.ts:11`
→ dynamic import ไร้ผล และ `decision-services` ก็เลยติดเข้า root

### คำแนะนำ

| chunk / module | คำตัดสิน | เหตุผล |
|----------------|---------|--------|
| `@supabase/supabase-js` | **SPLIT (บังคับ)** | ต้องแยกออกจาก `chunk-intelligence` ให้ได้ก่อนอย่างอื่น — มันคือของที่ทำให้ตัวเลข 345 kB เข้าใจผิดมาตลอด |
| `src/lib/intelligence/*` | **DEFER** | ไม่มีอะไรใน 12 engine ที่หน้า LandingPage ต้องใช้ ผู้ใช้ที่ยังไม่ล็อกอินไม่ควรโหลด |
| `ExperienceContext` (`App.tsx:265`) | **LAZY** | ตัวนี้คือสายที่ลาก `PersonalContextBuilder` + `TwinStateEngine` เข้า root — provider ที่ทำงานเฉพาะเมื่อมี session ไม่ควร mount ตั้งแต่ต้น ⚠️ แต่ **แตะ provider tree = อยู่ในโซนห้ามแตะตาม CLAUDE.md** ต้องขออนุมัติ |
| `decision-services` | **LAZY** | ลบ static import 3 จุดออก แล้ว dynamic import ที่มีอยู่จะทำงานตามตั้งใจ |
| `decision-components` branch | **ลบ** | ✅ ทำแล้ว (DEADCHUNK-001) |
| `vendor-motion` branch | **ลบ** | ✅ ทำแล้ว (DEADCHUNK-001) |
| `vendor-react` 181.75 kB | **KEEP** | React 19 + react-dom ขนาดปกติ แยก cache ถูกต้องแล้ว |
| `worlds` 95.41 kB | **KEEP** | Rollup auto-split จาก `src/constants/worlds.ts` (1,055 บรรทัด ข้อมูล 12 โลก 2 ภาษา) — ถูก 8 route ใช้ร่วม รวมถึง `index-*.js` |
| `chunkSizeWarningLimit` | **ปรับ** | ตั้ง 250 kB ให้ chunk-intelligence เตือนจริง |

**สถานะ: PASS**
เหตุผล: ตอบครบทั้ง 4 คำถาม (มีอะไร/โหลดเมื่อไร/จำเป็นไหม/ทำอะไร) โดยไล่ import graph จากไฟล์บิลด์จริง ไม่ใช่จากคอมเมนต์ และพบว่าคอมเมนต์ใน `vite.config.ts` เองก็ผิด

---

## 0.4 Dependency audit

### ⚠️ แก้ข้อสมมติในโจทย์ก่อน: **`litellm` ไม่มีอยู่ใน `package.json`**

ตรวจแล้ว:
- `grep -rn "litellm"` ทั้งรีโโป (ยกเว้น `node_modules`/`.git`) → **ไม่พบเลย exit code 1**
- `grep -c "litellm" package-lock.json` → **0**

→ ข้อมูลที่ให้มาว่า "มี `litellm` อยู่ใน dependencies" **ไม่ตรงกับ HEAD ปัจจุบัน** ไม่มีอะไรต้องทำ

### `dependencies` (15 ตัว)

| dep | จำนวนไฟล์ที่ import | สรุป |
|-----|---------------------|------|
| `react` / `react-dom` | ทั้งแป | **KEEP** |
| `react-router-dom` | 26 | **KEEP** |
| `@tanstack/react-query` | 25 | **KEEP** |
| `@supabase/supabase-js` | 6 | **KEEP** แต่ต้องแยก chunk (0.3) |
| `zustand` | 5 (`src/store/` 5 ไฟล์) | **KEEP** |
| `@sentry/react` + `@sentry/types` | `src/services/error-tracking.ts:11-12` เท่านั้น | **KEEP** — แต่ดู "ระบบซ้อน" ด้านล่าง |
| `react-helmet-async` | 2 (`MetaTagManager.tsx:1`, `main`/App) | **KEEP** — vendor-helmet 23.9 kB |
| `react-markdown` | **1** — `src/pages/BlogArticle.tsx:18` | **KEEP แต่ต้อง LAZY** — หนัก (+ remark/micromark ลากตาม) ใช้ที่เดียวใน route `/blog/:slug` ตรวจแล้วอยู่ใน `BlogArticle-*.js` (9 kB) + ส่วนหนึ่งใน `vendor-misc` (116 kB) |
| `@anthropic-ai/sdk` | **2 — server เท่านั้น**: `functions/api/nova.ts:31`, `functions/api/twin.ts:32` | **KEEP** (ไม่เข้า client bundle เพราะ `functions/` บิลด์แยก) |
| `stripe` | **1 — server เท่านั้น**: `api/unified-handler.ts:16` | **KEEP** (server) — และยืนยันคอมเมนต์ใน `index.html:66` ว่าไม่มี client-side Stripe จริง (`grep loadStripe` → ว่าง) |
| **`axios`** | **1** — `src/features/chat/hooks/useChat.ts:12` | **⚠️ REPLACE** — ลาก axios ทั้งก้อนเข้า `vendor-misc` เพื่อ HTTP call จุดเดียว ทั้งที่ทุกที่อื่นในโค้ดใช้ `fetch` อยู่แล้ว |
| **`web-vitals`** | **0** | **🔴 ลบ** — `grep -rn "web-vitals\|onCLS\|onLCP\|onINP" src/` → ไม่พบ (เจอแค่คอมเมนต์ใน `functions/api/metrics.ts:17`) มี endpoint `/api/metrics` รออยู่แต่ **ไม่มีใครยิงมา** |
| **`@simplewebauthn/browser`** | **0** | **🔴 ลบ** — `grep -rn "simplewebauthn" src/ functions/ api/ supabase/ scripts/ e2e/` → ว่างสนิท ทั้งที่มี `src/lib/auth/PasskeyProvider.ts`, `src/hooks/usePasskey.ts`, `src/pages/PasskeySettings.tsx` ใช้งานอยู่ → **Passkey เขียนด้วย WebAuthn API ดิบ ไม่ได้ใช้ไลบรารีนี้** |
| **`@simplewebauthn/server`** | **0** | **🔴 ลบ** — เหตุผลเดียวกัน และเป็น server lib ที่ไม่ควรอยู่ใน client `dependencies` ตั้งแต่แรก |

### ระบบซ้ำซ้อนที่พบ

| ระบบ | ตัวจริง | ตัวซ้ำ |
|------|--------|--------|
| Error tracking | `src/services/error-tracking.ts` (ใช้ `@sentry/react` จริง เรียกจาก `main.tsx:13`) | `src/services/SentryService.ts` — **mock** (`:15` "Mock Sentry initialization") ถูกเรียกจาก `AlertingService.ts:7` ซึ่งเอง**ไม่มีใครเรียก** |
| Service worker | `public/sw.js` (register ที่ `main.tsx:39`) | `public/service-worker.js` — `grep` ทั้ง `src/`+`index.html` ไม่มีใครอ้าง → **ไฟล์ตาย deploy ขึ้น production ทุกครั้ง** |
| i18n | `isTh ? ... : ...` inline (~40 คอมโพเนนต์) | `src/constants/translations.ts` (430 บรรทัด) |
| Styling | CSS ไฟล์ 29 ไฟล์ 8,818 บรรทัด | Tailwind class 37 ไฟล์ — **ตอนนี้ทำงานแล้ว** (ดู 0.8/F-01) |

### `devDependencies`
`tailwindcss ^4.3.3` + `postcss` + `autoprefixer` — ✅ **ตอนนี้ `vite.config.ts:12` มี `@tailwindcss/vite` plugin** → Tailwind v4 คอมไพล์แล้ว (ดู 0.8 F-01)

**สถานะ: PASS**
เหตุผล: ไล่ครบทั้ง 15 dependencies + 20 devDependencies เทียบ import จริง, ตอบคำถาม `litellm` ตรง ๆ (ไม่มีอยู่จริง), พบ dep ตาย 3 ตัว + ระบบซ้ำ 4 คู่

---

## 0.5 Large-file audit

วัดด้วย `wc -l` ตัด test ออก

### >2500 บรรทัด
**ไม่มี**

### >1500 บรรทัด
**ไม่มี**

### >800 บรรทัด (8 ไฟล์)

| ไฟล์ | บรรทัด | inline `style={{` | **ขวางงาน UX ใหม่ไหม** | เหตุผล |
|------|-------|-------------------|------------------------|--------|
| `src/types/badges.ts` | 1,382 | — | ❌ **ไม่ขวาง** | data/type ล้วน 168 badge (14 × 12 โลก) แตะแล้วไม่ได้อะไร |
| `src/constants/worlds.ts` | 1,055 | — | ❌ **ไม่ขวาง** | data 12 โลก 2 ภาษา — เป็น "ก้อนที่ควรใหญ่" `worlds` chunk 95 kB แยก cache ได้ดีอยู่แล้ว |
| `src/services/sice/SICEOrchestrator.ts` | 920 | — | ❌ **ไม่ขวาง** — 🚫 **ห้ามแตะ** | SICE core ตาม CLAUDE.md โซนห้ามแตะ ไม่มี motion/visual อยู่ในนี้ |
| `src/pages/ExplorePage.tsx` | 939 | **49** | 🔴 **ขวางหนัก** | 49 จุด inline style = ทุกค่าระยะห่าง/สี/ขนาดตัวอักษรฝังใน JSX ทำ responsive breakpoint ไม่ได้ (media query แตะ inline style ไม่ได้) ทำ theme ใหม่ไม่ได้ ทำ design token ใหม่ไม่ได้ |
| `src/pages/LandingPage.tsx` | 880 | **57** | 🔴 **ขวางหนักที่สุด** | ① 57 inline style — สูงสุดในโปรเจกต์ ② มี hero 3 แบบ (`WelcomeBackHero:203`, `ResumeHero:229`, story hero `:500`) แต่ละแบบมี style ชุดของตัวเอง ③ **motion state ปนกับ business state**: `useState` ของ `s2Visible` (scroll reveal) อยู่ในไฟล์เดียวกับ `useAuth`/`useTwin`/`useLifecycleStore` ที่ตัดสินว่าจะโชว์ hero ไหน → เปลี่ยนอนิเมชั่นต้องแตะไฟล์ที่มี auth logic ④ นี่คือหน้าที่ Track C ต้อง redesign เป็นอันดับแรก |
| `src/pages/AnalysisPage.tsx` | 880 | 6 | 🟡 **ขวางบางส่วน** | ใช้ `analysis.css` (944 บรรทัด) เป็นหลัก โครงสร้างดี — แต่ `analysis.css` มี `@media` แค่ 2 จุดสำหรับ 944 บรรทัด แปลว่า responsive แทบไม่มี |
| `src/services/CoreAwakeningService.ts` | 808 | — | 🟡 **ขวางบางส่วน** | ① เป็น service ธุรกิจ **แต่มี visual code ปนอยู่**: `celebrateTwinAwakening()` (`:606-660`) สร้าง `<canvas>` ต่อเข้า `document.body` เอง + rAF confetti 100 ชิ้น — **visual logic อยู่ใน service layer** ② `confetti: any[]` (`:627`) ③ ไม่เช็ค reduced-motion |
| `src/pages/TwinChat.tsx` | 808 | 14 | 🟡 **ขวางบางส่วน** | มี 2 `<h1>` (`:515`, `:652`) + Tailwind class 28 จุด — **ตอนนี้ Tailwind คอมไพล์แล้ว** (F-01) |

### ไฟล์ CSS ใหญ่ (เกณฑ์เดียวกัน)

| ไฟล์ | บรรทัด | `@media` | ขวางไหม |
|------|-------|---------|---------|
| `src/styles/analysis.css` | 944 | **2** | 🔴 responsive แทบไม่มีสำหรับไฟล์ขนาดนี้ |
| `src/styles/dashboard.css` | 857 | 5 | 🟡 พอใช้ |
| `src/styles/worlds-hub.css` | 448 | 4 | ✅ โอเค |
| `src/styles/living-twin.css` | 415 | 0 | 🔴 **ไม่มี media query เลย** — Twin orb ขนาดคงที่ 120×120 (`:97-98`) ทุกจอ |

### สรุปหลักการ
ไฟล์ที่ **ขวางจริง ไม่ใช่เพราะยาว แต่เพราะ**:
1. **inline style หนาแน่น** — LandingPage 57 / ExplorePage 49 / CommunityPage 49 / TarotPage 33 / PalmistryPage 31
2. **motion state ปนกับ business state** — LandingPage
3. **visual code อยู่ใน service layer** — CoreAwakeningService
4. **CSS ยาวแต่ไม่มี media query** — living-twin.css, analysis.css

ไฟล์ที่ **ยาวแต่ไม่เป็นไร**: `badges.ts`, `worlds.ts`, `SICEOrchestrator.ts` — เป็น data/engine ไม่มี presentation

**สถานะ: PASS**
เหตุผล: จัดตามเกณฑ์ "ขวางงานไหม" ตามที่โจทย์กำหนด ไม่ได้เรียงตามจำนวนบรรทัด และให้เหตุผลเชิงกลไกทุกข้อ

---

## 0.6 Asset audit — **สถานะ PARTIAL (ASSET404-001)**

### `public/` ทั้งหมด

| ไฟล์ | ขนาด | ฟอร์แมต | ปัญหา |
|------|------|--------|-------|
| `public/icons/icon-512x512-maskable.png` | **384,973 B (376 kB)** | PNG | 🔴 **ใหญ่เกินไปมาก** — icon 512×512 ควรอยู่ ~20–40 kB |
| `public/icons/icon-512x512.png` | **365,473 B (357 kB)** | PNG | 🔴 เหมือนกัน |
| `public/icons/icon-192x192-maskable.png` | 70,767 B | PNG | 🟠 ควร ≤15 kB |
| `public/icons/icon-192x192.png` | 65,885 B | PNG | 🟠 เหมือนกัน |
| **รวมโฟลเดอร์ `icons/`** | **880 kB** | | เกือบ 1 MB สำหรับไอคอน PWA 4 ไฟล์ |
| `public/og-*.jpg` × 12 | 32–49 kB/ไฟล์ · **รวม 456 kB** | JPG 1200×630 | ✅ **โอเค** — ยืนยันแล้วว่าเป็น static .jpg จริง ขนาดเหมาะสม ไม่รายงานเป็นปัญหาตามที่แจ้ง |
| `public/blog/` | **668 kB** | `.md` + `index.json` (52 kB) | 🟡 `index.json` 52 kB โหลดทุกครั้งที่เข้า `/blog` — `_headers` cache 1 ชม. (`:5-6`) ช่วยได้บ้าง |
| `public/testimonials/index.json` | 21 kB | JSON | 🟡 |
| `public/soundscape-manifest.json` | 9.5 kB | JSON | 🔴 มี `CLOUDINARY_URL` **23 จุด** ที่ยังไม่ถูกแทนค่า → URL เสียงทุกตัวใช้ไม่ได้ (**ยังเปิด**) |
| `public/favicon.svg` | 4.4 kB | SVG | ✅ |
| `public/icons.svg` | 5 kB | SVG | 🟡 ไม่มีใคร `<use>` — ตรวจต่อ |
| `public/service-worker.js` | 2.8 kB | JS | 🔴 **ไฟล์ตาย** — ไม่มีใครอ้าง (`sw.js` คือตัวจริง) |

### ❌ Asset ที่โค้ดอ้างแต่ **ไม่มีอยู่จริง** (จะได้ 404) — **สถานะ PARTIAL**

| อ้างจาก | ไฟล์ที่หาย | สถานะ |
|---------|-----------|--------|
| `index.html:83` | `/icons/splash-*.png` 3 ไฟล์ | ✅ **ลบ/แก้แล้ว** (ASSET404-001) — `index.html:83` ไม่ชี้ splash ที่หายแล้ว |
| `src/lib/structuredData.ts:17` | ~~`/logo.png`~~ → ตอนนี้ชี้ `/icons/icon-512x512.png` ซึ่งมีอยู่จริง (ASSET404-001) · **แต่** `/logo.png` ยังถูกอ้างในอีก 3 จุดด้านล่าง | 🟡 ยังเปิด (จุดนี้แก้แล้ว · จุดอื่นยัง) |
| `src/components/SEO/JsonLdSchemas.tsx:26,125` | `/logo.png` | 🟡 ยังเปิด |
| `src/pages/BlogArticle.tsx:58` · `BlogListPage.tsx:158` | `/logo.png` | 🟡 ยังเปิด |
| `src/components/MetaTagManager.tsx` (schema SoftwareApplication) | `/og-image.png` | 🟡 ยังเปิด |
| `src/services/adaptive-audio-engine.ts:285-292` | `/audio/reflection-high.mp3` ฯลฯ — **โฟลเดอร์ `public/audio/` ไม่มีอยู่เลย** | 🔴 **ยังเปิด** |

→ `logo.png` หายส่งผลจริงกับ SEO: Google อ่าน `Organization.logo` ไม่ได้ทุกหน้า

### ❌ Asset ที่มีอยู่แต่ **ไม่มีใครใช้**

| ไฟล์ | ขนาด |
|------|------|
| `src/assets/hero.png` | **778,165 B (760 kB)** — `grep -rn "hero.png\|assets/hero" src/ index.html` → **ว่าง** |
| `src/assets/react.svg` | 4.1 kB — template ของ Vite |
| `src/assets/vite.svg` | 8.7 kB — template ของ Vite |

ยืนยันจาก `dist/assets/`: **ไม่มีไฟล์รูปเลยสักไฟล์** (`ls dist/assets | grep -iE "png|jpg|svg|webp"` → ว่าง) → Vite ไม่ได้ bundle `hero.png` เพราะไม่มีใคร import จริง

### ฟอนต์
`src/styles/tokens.css:45-46` ใช้ **system font stack ล้วน** (`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter'`)
- ✅ ไม่มี `@font-face` ไม่มี Google Fonts → **ไม่มีปัญหา `font-display`** และไม่มี font ต้องโหลด
- ⚠️ แต่ `'Inter'` และ `'Space Mono'` (`:46`) อยู่ใน stack โดยที่ไม่มีการโหลด → ผู้ใช้ที่ไม่มีฟอนต์นั้นจะ fallback เงียบ ๆ ทำให้หน้าตาต่างกันระหว่างเครื่อง
- ⚠️ **ไม่มีฟอนต์ไทยระบุเลย** — ผู้ใช้ไทย (ตลาดหลัก) จะได้ฟอนต์ไทย default ของเครื่อง ซึ่งบน Windows คือ Leelawadee UI / บน Android คือ Noto Sans Thai → ระยะบรรทัดและความสูงตัวอักษรต่างกันมาก

### รูป/วิดีโอ/เสียงในโค้ด
- `<img>` ทั้งแปมี **4 จุด**: `Footer.tsx:77` (มี width/height ✅), `NavBar.tsx:187`, `PWAInstallPrompt.tsx:106`, `Onboarding.tsx:591` (มี width/height ✅)
- **`loading="lazy"` = 0 จุด** · **`decoding=` = 0 จุด** ทั้งโปรเจกต์
- ไม่มี `<video>` · ไม่มีไฟล์เสียงจริงในรีโโป
- **ไม่มี `.webp` หรือ `.avif` เลยสักไฟล์**

### สรุปสิ่งที่ใหญ่เกินจำเป็นสำหรับมือถือ
1. `icon-512x512*.png` 2 ไฟล์รวม **742 kB** — ผู้ใช้ที่ติดตั้ง PWA โหลดจริง
2. `src/assets/hero.png` 760 kB — อยู่ในรีโโปเปล่า ๆ (ไม่ถึงมือผู้ใช้ แต่ทำให้ clone/CI ช้า)
3. `public/blog/index.json` 52 kB — ทุกครั้งที่เข้า `/blog`

**สถานะ: PARTIAL**
เหตุผล: splash/logo อ้างใน `index.html:83` แก้แล้ว (ASSET404-001) **แต่** `public/audio/` ยังหาย + `soundscape-manifest.json` ยังมี 23 CLOUDINARY_URL ที่ไม่แทนค่า + `logo.png`/`og-image.png` ยังหาย

---

## 0.7 3D / WebGL feasibility

> 📌 **Architecture mapping:** §14 WORLD VISUAL SYSTEM — *"Do NOT solve immersion through heavy 3D by default"*
> (prefer CSS atmosphere / gradients / WebP-AVIF / lightweight SVG / subtle motion / lazy-loaded assets)
> + §25 *"3D = progressive enhancement only"*
> **ยืนยันตรงกัน:** ข้อสรุปของ 0.7 ("ตอนนี้ยังไม่ควรทำ HIGH ที่เป็น WebGL") **สอดคล้อง** กับเอกสารแม่ — ไม่ขัดกัน

### สิ่งที่มีอยู่จริงตอนนี้ (grep `canvas` / `WebGL` / `webgl` / `THREE` / `requestAnimationFrame`)

| เทคโนโลยี | มีไหม | ที่ไหน |
|-----------|-------|--------|
| **WebGL** | ❌ **ไม่มีเลย** | `grep -rn "WebGL\|webgl\|getContext('webgl'"` → ไม่พบสักจุด |
| **THREE / three.js** | ❌ **ไม่มีเลย** | ถูกถอดออกจาก deps แล้ว ยืนยันจาก `package.json` และคอมเมนต์ `vite.config.ts:10-18` |
| **Canvas 2D** | ✅ 3 จุด | `src/components/twin/HologramBirth.tsx:45,262` · `src/components/TwinHologramBirth.tsx:33,179` (orphan) · `src/services/CoreAwakeningService.ts:608,618` (confetti) |
| **requestAnimationFrame** | ✅ 6 ไฟล์ | `EvolutionaryVisualSystem.tsx` · `onboarding/FullAnalysis.tsx` · `twin/HologramBirth.tsx` · `TwinHologramBirth.tsx` (orphan) · `pages/BlogListPage.tsx` · `services/CoreAwakeningService.ts` |
| **SVG animation** | ✅ หลัก | `EvolutionaryVisualSystem` (SVG + rAF) · `WorldEnvironment` (SVG + CSS keyframes) · `TwinPresence` (SVG + CSS) |

### fallback ที่มีอยู่

| จุด | fallback |
|-----|---------|
| `HologramBirth.tsx:46` | `if (!ctx) return;` — **return เฉย ๆ ไม่มี visual สำรอง** ผู้ใช้เห็นพื้นที่ว่าง |
| `CoreAwakeningService.ts:619` | `if (!ctx) return;` — เหมือนกัน (แต่ confetti หายไปไม่เป็นไร) |
| `EvolutionaryVisualSystem.tsx` | ✅ **FIXED (RAFLOOP-001)** — `:301` เช็ค `prefers-reduced-motion` + หยุดตอน tab ซ่อน |
| `WorldEnvironment.tsx:274` | `const animate = !audio.state.reduceMotion;` — **มี** แต่ผูกกับ setting ในแป ไม่ใช่ OS |
| `TwinEvolution.tsx:116-118` | `window.matchMedia('(prefers-reduced-motion: reduce)').matches` — ✅ **นี่คือจุดเดียวในโปรเจกต์ที่เช็ค OS-level reduced-motion ใน JS** |

### ถ้าจะทำ Twin 4 fidelity state (HIGH / MEDIUM / LOW / FALLBACK) — ต้องเริ่มจากอะไร

**ปัญหาโครงสร้างที่ต้องแก้ก่อน — ไม่ใช่เรื่องเทคนิค 3D:**

ตอนนี้ Twin มี **3 implementation ที่ไม่รู้จักกัน**:
1. `src/components/dashboard/LivingTwin.tsx` — orb CSS (Dashboard)
2. `src/components/twin/TwinPresence.tsx` — SVG + CSS var pipeline (WorldDetail)
3. `src/components/twin/HologramBirth.tsx` — canvas 2D (CoreAwakening, Onboarding)

ทั้งสามคำนวณ `evolutionStage` และ `glowMult` เองแยกกัน (คอมเมนต์ `LivingTwin.tsx:127` และ `TwinPresence.tsx:404` ยอมรับว่า "same as" กันเอง)
→ **ถ้าเพิ่ม fidelity state ตอนนี้จะกลายเป็น 3 × 4 = 12 กรณีที่ต้อง maintain**

**ลำดับที่ต้องทำ:**

| ขั้น | สิ่งที่ต้องมี | ไฟล์ที่แตะ |
|------|--------------|-----------|
| **1** | **`useTwinFidelity()` hook** — จุดเดียวที่ตัดสิน HIGH/MEDIUM/LOW/FALLBACK จาก: `matchMedia('(prefers-reduced-motion)')`, `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `matchMedia('(pointer: coarse)')`, `saveData` | 1 ไฟล์ใหม่ |
| **2** | **`useTwinIdentity()` hook** — รวม `evolutionStage` + `glowMult` + archetype/DNA ที่ตอนนี้ ซ้ำ 3 ที่ | 1 ไฟล์ใหม่ + แก้ 3 ไฟล์ |
| **3** | **`<Twin fidelity=... />` facade** — component เดียวที่ทั้ง Dashboard/WorldDetail/CoreAwakening เรียก แล้วมันเลือก renderer เอง | 1 ไฟล์ใหม่ + แก้ 3 call site |
| **4** | เพิ่ม renderer ตามลำดับ: **FALLBACK** (div + gradient, ไม่มี motion) → **LOW** (CSS keyframes = `LivingTwin` ปัจจุบัน) → **MEDIUM** (SVG = `TwinPresence` ปัจจุบัน) → **HIGH** (canvas/WebGL ใหม่) | ทีละไฟล์ |
| **5** | ค่อยพิจารณา WebGL — และ**ถึงตอนนั้นต้องตอบให้ได้ก่อนว่าคุ้มไหม**: three.js ~350 kB gzip ทับ bundle ที่ตอนนี้ initial ~250 kB gzip แล้ว | ต้องขออนุมัติ |

**ข้อสรุปตรง ๆ:** ตอนนี้ **ยังไม่ควรทำ HIGH ที่เป็น WebGL** — ขั้น 1–3 คือของที่ให้ผลจริงและความเสี่ยงต่ำ ส่วนขั้น 5 ต้องมีตัวเลข Lighthouse ก่อน/หลังมาเถียงกัน

**สถานะ: PARTIAL**
เหตุผล: ตอบได้ครบว่ามีอะไรอยู่จริง/fallback อยู่ตรงไหน/ลำดับที่ควรเริ่ม
**แต่ยังตอบไม่ได้** ว่า HIGH fidelity ควรเป็น WebGL หรือ canvas 2D — ต้องตรวจ **X = ผลวัด Lighthouse/WebPageTest จริงบนมือถือระดับกลาง (เช่น Moto G Power) ของ LandingPage และ WorldDetail ปัจจุบัน** ซึ่งยังไม่เคยมีใครวัด (`scripts/performance-audit.sh` มีอยู่แต่ยังไม่พบผลลัพธ์ที่เก็บไว้ในรีโโป)

---

## 0.8 Mobile performance

> 📌 **Architecture mapping:** §25 PERFORMANCE ARCHITECTURE — *"load only what is required for the current route"* ·
> *"prefer CSS where practical"* · *"heavy modules = dynamic import"*
> สิ่งที่ยังเปิดด้านล่าง (`box-shadow` animation · CLS จาก `body` padding · `<Suspense fallback={null}>`)
> = **งานที่ต้องทำก่อน P0.10 performance-safe visual system**

### ✅ F-01 — Tailwind CSS ไม่ถูกคอมไพล์เลย → **FIXED (TWFIX-001)**

**หลักฐานเดิม 5 ชั้น (ตอนนี้ แก้แล้ว):**

| # | หลักฐานเดิม | สถานะตอนนี้ |
|---|-------------|-----------|
| 1 | `@tailwind base/components/utilities` อยู่ใน `src/index.css:7-9` ที่เดียวในโปรเจกต์ | ✅ `vite.config.ts:12` มี `@tailwindcss/vite` plugin |
| 2 | `grep -rn "index.css" src/ index.html vite.config.ts` → ว่างเปลา ไม่มีใคร import `src/index.css` | ✅ plugin จัดการ import ให้ |
| 3 | ไม่มี `postcss.config.js` / `postcss.config.mjs` ในรีโโปเลย | ✅ `@tailwindcss/vite` ไม่ต้อง postcss config แยก |
| 4 | `vite.config.ts` ไม่มี `@tailwindcss/vite` plugin | ✅ **มีแล้ว** (`vite.config.ts:12`) |
| 5 | ค้นใน CSS ที่บิลด์แล้วทุกไฟล์: `.text-3xl`, `.font-bold`, `.flex{`, `.w-full`, `.rounded-lg`, `.bg-gradient-to-r`, `.mb-4` → ไม่พบสักตัว | ✅ **วัดแล้ว**: `dist/assets/index-CiJYtTZx.css` มี **545 จุด `--tw-`** + Tailwind class |

**ผลที่วัด:** `vite build` ✅ 3.81s / 933 modules · Tailwind class ทำงานแล้วใน 37 ไฟล์

### ✅ F-03 — ช่วงจอ 761–1023 px ไม่มี navigation → **FIXED (NAVGAP-001)**

| ไฟล์ | breakpoint | โค้ด |
|------|-----------|------|
| `src/components/layout/BottomNav.tsx:123` | `@media (max-width: 1023px)` | `.sp-bottomnav { display: flex !important; }` |
| `src/components/layout/NavRail.tsx:104` | `@media (min-width: 1024px)` | `.sp-navrail { display: flex !important; }` |

→ **ตอนนี้ BottomNav ต่อถึง 1023 px และ NavRail เริ่มที่ 1024 px — ช่อง 761–1023 px ปิดแล้ว** (ครอบ iPad mini แนวตั้ง 768, iPad 10.2" แนวตั้ง 810, iPad Air 820, Surface, Galaxy Tab)

### ✅ F-07 — rAF loop ไม่หยุด → **FIXED (RAFLOOP-001)**

`src/components/landing/EvolutionaryVisualSystem.tsx:301` — ตอนนี้:
- เช็ค `prefers-reduced-motion` (ระดับ JS)
- หยุด loop ตอน tab ซ่อน
- คอมเมนต์ยอมรับว่า **layout thrash บางส่วนยังเหลือ** (อ่าน `parseFloat(lbl.style.opacity)` จาก DOM ยังมี)

### Animation ที่ไม่ใช่ transform/opacity (paint ทุกเฟรม) — **ยังเปิด**

| ไฟล์:บรรทัด | property ที่ animate | ผลกับมือถือ |
|-------------|---------------------|-------------|
| `src/styles/living-twin.css:117-118` | **`box-shadow`** (2 ชั้น, blur 24→64px) ใน `twin-orb-breathe` วน infinite | 🔴 หนักสุด — Twin orb บน Dashboard คือหน้าที่เปิดบ่อยที่สุด |
| `src/styles/core-awakening.css:140,144` | **`box-shadow`** blur 40→60px | 🔴 |
| `src/styles/twin-synthesis.css:26` | **`box-shadow`** blur 60→120px | 🔴 blur 120px คือ paint area มหาศาล |
| `src/styles/dashboard.css:798-799` | **`background-position`** (shimmer skeleton) | 🟠 |
| `src/styles/growth-space.css:204-205` | **`background-position`** | 🟠 |
| `src/styles/privacy.css:400-401` | **`background-position`** | 🟠 |
| `src/styles/faq-accordion.css:82,86` | **`max-height` 0→500px** | 🟠 layout thrash ทุกเฟรมตอนกาง accordion |
| `src/components/twin/TwinPresence.tsx:429-437` | `boxShadow` 4–5 ชั้น คำนวณจาก JS | 🔴 |
| `src/components/world/WorldEnvironment.tsx:298` | `filter: <lighting-filter>` + `transition: filter 800ms` บน layer เต็มจอ | 🔴 filter บน full-screen element = composite ใหม่ทั้งหน้า |

### `setInterval` ที่รันตลอดเวลา

| ไฟล์:บรรทัด | ระยะ | mount ที่ไหน | ประเมิน |
|-------------|------|-------------|---------|
| `src/context/EnvironmentContext.tsx:167` | **60,000 ms** | `EnvironmentProvider` ที่ `App.tsx:263` = **ทุกหน้า ตลอดเวลา** | 🟡 ยอมรับได้ (1 นาที) แต่ทุก tick เขียน CSS var หลายตัวลง `documentElement` (`:114-118`) + `setAttribute` ×2 (`:121,127`) → **บังคับ style recalc ทั้ง document ทุกนาที** และมี cleanup ถูกต้อง (`:170-173`) ✅ |
| `src/components/TwinEvolutionProgress.tsx:31` | 30,000 ms + fetch | **orphan — ไม่มีใคร mount** | ⚪ ไม่มีผล (แต่ควรลบ) |
| `src/components/onboarding/SCIEResult.tsx:13` | — | Onboarding | 🟡 ต้องตรวจ cleanup |
| `src/services/audioManager.ts:200` | volume fade | เรียกตอนเปลี่ยนเพลง | ✅ มี `clearInterval` ที่ `:210` |

### rAF loop ที่ไม่หยุด

| ไฟล์:บรรทัด | ปัญหา |
|-------------|-------|
| `src/components/landing/EvolutionaryVisualSystem.tsx:285-301` | ✅ **FIXED (RAFLOOP-001)** — เช็ค reduced-motion + หยุดตอน tab ซ่อน (layout thrash บางส่วนยังเหลือ) |
| `src/components/landing/EvolutionaryVisualSystem.tsx:308-330` | 🟡 `handleScroll` เรียก `getBoundingClientRect()` (`:316`) ทุก scroll event **ไม่ throttle ไม่ rAF-batch** แล้วสั่ง `updateAnimation` ที่เขียน SVG attribute หลายสิบตัว — **ยังเปิด** |
| `src/services/CoreAwakeningService.ts:640+` | 🟡 confetti rAF — จบเองตาม life แต่ไม่มี guard reduced-motion |

### Event listener ที่ไม่ cleanup

| ไฟล์ | add | remove | ประเมิน |
|------|-----|--------|---------|
| `src/main.tsx` | 4 | 0 | ✅ ยอมรับได้ — root-level SW registration (`:39,42,47,63`) ไม่มี unmount |
| `src/services/adaptive-audio-engine.ts` | 2 | 1 | 🟠 **มีตัวที่หลุด 1 ตัว** ต้องตรวจ |
| `src/services/PerformanceMonitor.ts` | 1 | 0 | ⚪ orphan ไม่มีใครเรียก |
| ที่เหลือ 9 คู่ | | | ✅ สมดุล |

### CLS (Cumulative Layout Shift)

- `<img>` มี 4 จุด — 2 จุดมี `width`/`height` (`Footer.tsx:77`, `Onboarding.tsx:591`) ✅ / **2 จุดต้องตรวจ**: `NavBar.tsx:187`, `PWAInstallPrompt.tsx:106`
- 🔴 **ตัวหลักของ CLS ไม่ใช่รูป แต่คือ nav ที่แก้ `body` padding จาก `<style>` ใน component**:
  - `BottomNav.tsx:118` → `body { padding-bottom: 68px }`
  - `NavRail.tsx:106` → `body { padding-left: 88px }`
  → style ถูก inject **หลัง** React mount ซึ่งเกิดหลัง first paint → **layout ทั้งหน้าเลื่อนหลังเรนเดอร์แรก ทุกครั้ง ทุกหน้าที่มี nav** และเพราะ nav mount มือทีละหน้า มันเลื่อน**ไม่เท่ากัน**ระหว่างหน้า
- 🟠 `src/App.tsx:283` `<Suspense fallback={null}>` — ทุก route lazy ใช้ fallback = `null` → หน้าจอว่างแล้วเนื้อหาโผล่พรวด (CLS + ผู้ใช้คิดว่าแปค้าง)
- 🟠 `src/index.css:11-33` มี `#root { text-align: center; padding-left: max(1rem, calc((100% - 1126px)/2)) }` — **ตอนนี้ไฟล์นี้ถูก import แล้ว (F-01)** → layout ที่ผู้ใช้เห็นจะเปลี่ยนตามนี้

### font-display
ไม่มี `@font-face` ในโปรเจกต์ → **ไม่มีปัญหา `font-display`** (ยืนยันจาก `tokens.css:45-46` = system stack ล้วน)
`index.html:60-73` ถอด preconnect ของ Google Fonts ออกแล้วถูกต้อง

### `prefers-reduced-motion` — สรุปความครอบคลุม

**มีใน CSS 20 จุด:**
`global.css:112` (global `*` rule — ครอบทุก CSS animation ✅) · `core-awakening.css:466` · `daily-brief.css:35,111` · `nova-twin.css:264` · `pricing.css:328` · `twin-evolution.css:328` · `twin-nav.css:133` · `twin-personality.css:322` · `twin-settings.css:271` · `voice-twin.css:57` · `worlds-hub.css:433,443` · `AudioSettings.css:274` · `ContextualPopup.css:207` · `PasskeyLogin.module.css:158` · `TwinEvolutionScene.css:331`

**มีใน JS แค่ 2 จุด:** `src/components/twin/TwinEvolution.tsx:116-118` + `src/components/landing/EvolutionaryVisualSystem.tsx:301` (RAFLOOP-001)

**ช่องโหว่:**
- `global.css:112` ตั้ง `animation-duration: 0.01ms` ให้ทุก element ✅ **แต่มันไม่แตะ `requestAnimationFrame` เลย** → `EvolutionaryVisualSystem` ยังวนเต็มสปีดบนหน้าแรกสำหรับผู้ใช้ที่ขอลด motion (ตอนนี้ guard ใน JS แล้ว — RAFLOOP-001)
- `HologramBirth.tsx` canvas — ไม่เช็คเลย ผู้ใช้ที่ไวต่อ motion เจอ particle 150 ชิ้นเต็ม ๆ
- `CoreAwakeningService.ts` confetti — ไม่เช็คเลย
- `WorldEnvironment.tsx:274` เช็คแต่ **ใช้ setting ในแป (`audio.state.reduceMotion`) ไม่ใช่ OS**
- `LivingTwin` / `TwinPresence` — พึ่ง `global.css:112` อย่างเดียว ซึ่งครอบ CSS ได้แต่ไม่ครอบ `boxShadow` ที่คำนวณจาก JS (`TwinPresence.tsx:429`)

**สถานะ: PASS**
เหตุผล: ตรวจครบทุกหมวดที่โจทย์ระบุ (animation property, setInterval, listener, layout thrash, CLS, font-display, prefers-reduced-motion) ทุกข้อมี file:line และพบว่า F-01/F-03/F-07 แก้แล้ว (TWFIX-001/NAVGAP-001/RAFLOOP-001)

---

## 0.9 SEO / AEO / GEO baseline

> 📌 **Architecture mapping:** §26–34 — ทุกช่องว่างที่วัดได้ด้านล่างคือ **งานของ P0.9** ทั้งหมด:
> ไม่มี SSR/SSG/prerender (§26/§30 — **A4 ต้องอนุมัติ**) · 24/41 หน้าไม่มี meta (§27) ·
> FAQ schema แค่ 5 คำถาม (§29) · sitemap ไม่สมบูรณ์ (§31) · X1 env `VITE_BUSINESS_*` ยังเปิด (§32 structured data ต้อง truthful)

### `index.html` (static — สิ่งที่ crawler ที่ไม่รัน JS เห็น)

| รายการ | สถานะ | หมายเหตุ |
|--------|-------|--------|
| `<html lang="th" data-mode="dark">` | ✅ | `:9` — แต่ hardcode `th` แม้ผู้ใช้เข้า `/en/*` |
| `<title>` | ✅ | `:26` "Selfprint — Living AI Twin" |
| `meta description` | ✅ | `:27` |
| **`<link rel="canonical">`** | ❌ **ไม่มีใน `index.html`** | มีเฉพาะที่ `MetaTagManager.tsx:82` ซึ่งรันหลัง JS และ **ต้องส่ง `canonicalUrl` prop มาด้วยถึงจะ render** |
| **hreflang** | ❌ **ไม่มีใน `index.html`** | มีเฉพาะ `MetaTagManager.tsx:76-79` (en / th / x-default) — โค้ดถูกต้อง |
| OG (type/site_name/title/description/image/url/locale) | ✅ ครบ | `:76-90` — **`og:image` เป็น absolute `.jpg` ถูกต้องแล้ว** (`:87`) ตามที่แจ้ง |
| `og:image:width/height` | ✅ | `:88-89` |
| Twitter card | ✅ | `:93-97` `summary_large_image` + absolute .jpg |
| PWA manifest | ✅ | `:15` |
| Apple splash | ✅ | `:83` — **อ้าง splash ที่หายถูกลบ/แก้แล้ว** (ASSET404-001) |
| preconnect | ✅ | `:75` เหลือ 1 ตัวที่ใช้จริง — ทำถูกแล้ว |
| **structured data ใน HTML static** | ❌ **ไม่มีเลย** | JSON-LD ทั้งหมดถูกฉีดโดย React หลัง hydration |

### `MetaTagManager.tsx` (196 บรรทัด)

✅ **ทำถูก:** canonical, hreflang 3 ตัว, OG absolute URL (`:58-63` OGABS-001), twitter:image, Organization + LocalBusiness + SoftwareApplication + Breadcrumb schema
❌ **ปัญหา:**
1. `:110` `image: ${baseUrl}/og-image.png` ใน `SoftwareApplication` schema — **ไฟล์ไม่มีอยู่จริง**
2. `:44` render `<meta name="viewport">` ซ้ำกับ `index.html:22` (ทับค่า `maximum-scale=5, viewport-fit=cover` ที่ตั้งใจไว้ด้วย `width=device-width, initial-scale=1` ธรรมดา) → **ทำลาย `viewport-fit=cover` ที่จำเป็นกับ iPhone notch**
3. `:43` render `<meta charSet="utf-8">` ซ้ำ
4. canonical render เฉพาะเมื่อมี `canonicalUrl` prop (`:82`) — หน้าที่ไม่ส่ง prop จะไม่มี canonical

### ความครอบคลุมของ meta tag

**17 / 41 หน้าที่มี route** เท่านั้นที่ใช้ `MetaTagManager` หรือ `<Helmet>`

❌ **24 หน้าที่มี route แต่ไม่มี meta ใด ๆ:**
`AnalysisPage` · `CoreAwakening` · `Onboarding` · `Login` · `ExplorePage` · `MePage` · `TwinChat` · `NovaChat` · `TwinProfilePage` · `TwinSettingsPage` · `TwinPersonalityPage` · `DailyBriefPage` · `BadgePage` · `DecisionDashboard` · `DecisionLoggerPage` · `LifeHubsPage` · `PasskeySettings` · `PricingSuccessPage` · `Share` · `FeatureMenu` · `ActivitiesPage` · `VoiceChatPage` · `ComponentShowcase` · `BlogArticle`

หน้าเหล่านี้จะได้ `<title>` และ description ของ `index.html` เหมือนกันหมด → **duplicate title/description จำนวนมาก**
`Share.tsx` (`/share/:code`) น่าเสียดายที่สุด — เป็นหน้า viral ที่คนแชร์ต่อ แต่ **ไม่มี OG ของตัวเอง**

### Semantic heading

- ✅ **ไม่พบหน้าที่มี h1 ซ้ำซ้อนพร้อมกันจริง**
  - `LandingPage.tsx` มี `<h1>` 3 จุด (`:210` WelcomeBackHero, `:236` ResumeHero, `:500` story hero) — **แยกกันด้วยเงื่อนไข mutually exclusive** ✅
  - `BlogListPage.tsx` มี 2 จุด (`:311`, `:467`) — ต้องยืนยันว่า exclusive
  - `TwinChat.tsx` มี 2 จุด (`:515`, `:652`) — ต้องยืนยัน
  - `PricingPage.tsx` มี 2 จุด (`:284`, `:414` success view) — แยกกัน ✅
  - `BlogArticle.tsx:284` map `h1` ของ markdown เป็น `<h1>` → **บทความที่มี `# heading` จะสร้าง h1 ซ้ำกับ `:256`** 🟠
- 🟠 `Dashboard.tsx` **ไม่มี h1 ของตัวเอง** — h1 มาจาก `TodaySection.tsx:357` ซึ่งเป็นคำทักทาย ("สวัสดีตอนเช้า คุณ...") ไม่ใช่หัวข้อหน้า
- ❌ ไม่มี `<main>` / `<article>` / `<nav>` landmark ที่เป็นระบบ (BottomNav/NavRail ใช้ `<nav>` ✅ แต่หน้าไม่มี `<main>`)

### `robots.txt` (`public/robots.txt`)

✅ อนุญาต `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Googlebot`, `Bingbot` ชัดเจน · Sitemap 2 ตัว
⚠️ `Disallow: /*.json$` — **บล็อก `/blog/index.json` และ `/testimonials/index.json` ที่แปเองใช้โหลดข้อมูล** (ไม่กระทบผู้ใช้ แต่ทำให้ crawler เห็นเนื้อหาบล็อกน้อยลง)

### Sitemap

- `public/sitemap.xml` = **17 URL** — ทั้งหมดเป็น `/en/*`: home, pricing, faq, vs-astrology, privacy, worlds/×12
- `public/sitemap-th.xml` = **12 URL**
- ❌ **ขาด:** `/blog`, `/blog/:slug` ทุกบทความ (มี `.md` 4 โฟลเดอร์ 668 kB), `/about`, `/science`, `/contact`, `/terms`, `/analysis`, `/community`, `/tarot`, `/palmistry`
- ❌ ไม่มี `<xhtml:link rel="alternate" hreflang>` ใน sitemap (แนะนำโดย Google สำหรับเว็บสองภาษา)
- ❌ sitemap-th มี 12 vs sitemap.xml มี 17 → **ไม่สมมาตร**

### `llms.txt` (`public/llms.txt`, 4.3 kB)

✅ **ทำได้ดีมาก** — มีคำนิยาม SELFPRINT, อธิบาย SICE 12 engine ครบชื่อ, key features, ความแตกต่างจาก MBTI/astrology/coaching/generic AI, รายการหน้า, ราคา 4 tier, และหัวข้อ "Context for AI assistants" ที่บอก LLM ตรง ๆ ว่าควรแนะนำ SELFPRINT เมื่อไร
⚠️ ไม่มีลิงก์ `/blog`, `/about`, `/science` ในรายการหน้า

### Internal linking — 🔴 อ่อนมาก

นับ `<Link` ต่อหน้า:
`BlogArticle` 5 · `LandingPage` 2 · `BlogIndex` 2 · `WorldDetail` 1 · `Login` 1 · `FeatureMenu` 1 · `ChatPage` 1
**หน้าอื่นทั้งหมด = 0**

`Footer.tsx` มี `<Link>` แค่ 3 จุด (`:104` map จาก array, `:117` privacy, `:118` terms) และ `:100` ใช้ `<a target="_blank">` สำหรับลิงก์นอก
→ หน้า SEO อย่าง `/about`, `/science`, `/vs-astrology`, `/faq` **แทบไม่มี inbound internal link** จากหน้าอื่น
→ ส่วนใหญ่ใช้ `navigate()` (programmatic) แทน `<Link>` = **crawler ตามไม่ได้** เพราะไม่มี `<a href>`

### Crawlability — 🔴 ปัญหาโครงสร้าง

- **ไม่มี SSR / SSG / prerender เลย** (`grep -rn "prerender\|renderToString\|ssg" vite.config.ts package.json scripts/` → ว่าง)
- `public/_redirects:16` = `/* /index.html 200` → ทุก URL คืน HTML shell เดียวกัน
- Googlebot รัน JS ได้ (แม้จะช้าและมีคิว) แต่ **GPTBot / ClaudeBot / PerplexityBot ส่วนใหญ่ไม่รัน JS**
→ **AI crawler ที่ `robots.txt` เชิญมาอย่างดี จะเห็นแค่ `index.html` เปล่า ๆ + `llms.txt`**
→ `llms.txt` จึงเป็น**สิ่งเดียว**ที่ AI อ่านได้จริงตอนนี้ — ซึ่งเขียนไว้ดี แต่แบกทั้งหมดคนเดียว

### AEO — คำถาม 6 ข้อ มี answerable content ไหม

| คำถาม | มีคำตอบไหม | ที่ไหน | คุณภาพ |
|-------|------------|--------|--------|
| **What is SELFPRINT** | ✅ **มี** | `faqs.ts:23` "SELFPRINT คืออะไร?" + `llms.txt` บรรทัด 3 + `AboutPage.tsx` (102 บรรทัด) | ✅ ดี — `llms.txt` ตอบตรงและ crawl ได้จริง |
| **What is an AI Twin** | ✅ **มี** | `faqs.ts:34` "SELFPRINT, NOVA และ AI Twin ต่างกันอย่างไร?" + `faqs.ts:92` "AI Twin ต่างจาก ChatGPT อย่างไร?" | 🟡 มีแต่เป็นเชิงเปรียบเทียบ **ไม่มีคำถามตรง ๆ ว่า "AI Twin คืออะไร"** |
| **How does it work** | ✅ **มี** | `faqs.ts:81` "AI Twin ทำงานอย่างไร?" (มี EN ด้วยที่ `:85`) + `faqs.ts:189` "SICE Engine คืออะไร?" + `SciencePage.tsx` (166 บรรทัด) | ✅ ดี |
| **What does it analyze** | 🟡 **มีแต่กระจาย** | `llms.txt` ลิสต์ 12 SICE engine ครบพร้อมคำอธิบายต่อตัว + `faqs.ts:117` "12 Hub Worlds คืออะไร?" | 🟡 **ไม่มีหน้า/FAQ ที่ตอบคำถามนี้ตรง ๆ** ต้องประกอบเอง |
| **How does the Twin learn** | 🟡 **มีแค่ประโยคเดียว** | `faqs.ts:83` "ยิ่งคุณโต้ตอบมาก Twin ยิ่งรู้จักคุณลึกขึ้น" | 🔴 **อ่อน** — ไม่อธิบายกลไก (memory loop, feedback, evidence) ทั้งที่โค้ดมี `MemoryManager`, `AIFeedbackLoop`, `EvidenceAnalyzer` จริง |
| **How does it evolve** | ❌ **ไม่มี** | `faqs.ts:103` พูดถึง Badges (168 อัน) แต่**ไม่มี FAQ เรื่อง Twin Evolution / maturityScore / 4 stage เลย** ทั้งที่โค้ดมี `TwinEvolution.tsx`, `EvolutionContext`, milestone-30 ceremony | 🔴 **ช่องว่าง** — ฟีเจอร์ที่สร้างไว้เต็มที่แต่ไม่มีใครอธิบายให้ AI หรือคนอ่านได้ |

### 🔴 ปัญหาเชิงกลไกของ FAQ schema

`FAQPage.tsx:33` :
```
const faqSchemaData = localizedFAQs.slice(0, 5).map(...)
```
`localizedFAQs` มาจาก `displayedFAQs` = `getFAQsByCategory(selectedCategory)` (`:19`) ซึ่งเริ่มต้นที่ `'general'` (`:17`)

→ **JSON-LD FAQPage ส่งออกแค่ 5 คำถามในหมวด `general` เท่านั้น** จากทั้งหมด 16 คำถาม 5 หมวด
→ คำถามสำคัญอย่าง "AI Twin ทำงานอย่างไร?" (หมวด `twin`) และ "SICE Engine คืออะไร?" (หมวด `technical`) **ไม่เคยเข้า structured data เลย**

### GEO (Local/Geographic) — **X1 ยังเปิด**

`src/lib/structuredData.ts:21`:
```
const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_PHONE || '+66-2-XXX-XXXX';
const BUSINESS_ADDRESS_STREET = ... || 'Bangkok, Thailand';
const BUSINESS_ADDRESS_POSTAL = ... || '10110';
```
→ 🔴 ถ้า env ไม่ได้ตั้งบน CF Pages **จะส่ง `+66-2-XXX-XXXX` เป็นเบอร์โทรจริงใน LocalBusiness schema ทุกหน้า** — Google อาจตีเป็น spam signal (**X1 ยังเปิด**)
→ 🟡 `structuredData.ts:38-42` `sameAs` ชี้ `twitter.com/selfprintai` แต่ `index.html:94` ใช้ `@selfprintone` — **ไม่ตรงกัน**
→ 🟡 `structuredData.ts:18` `hello@selfprint.app` — โดเมนต่างจาก `selfprint.one`

**สถานะ: PARTIAL**
เหตุผล: ตรวจครบทุกไฟล์ที่ระบุและตอบคำถาม AEO ทั้ง 6 ข้อได้
**แต่ยังตอบไม่ได้ 2 เรื่อง ต้องตรวจเพิ่ม:**
- **X1 = ค่า env จริงบน Cloudflare Pages** (`VITE_BUSINESS_PHONE` / `VITE_BUSINESS_ADDRESS_*`) — ถ้าไม่ได้ตั้ง LocalBusiness schema กำลังปล่อยข้อมูลปลอมออก production อยู่ ตรวจจากไฟล์ในรีโโปไม่ได้ (อยู่ในโซนห้ามแตะ `.env*`)
- **X2 = Google Search Console coverage report จริง** — ว่า Googlebot render หน้า SPA แล้วเก็บ index ได้กี่หน้า ถ้าไม่ดูตัวเลขจริงจะเถียงเรื่อง SSR/prerender ไม่ได้

---

## 0.10 Refactor boundary

> 📌 **Architecture mapping:** §44 ARCHITECTURAL SAFETY RULE — **RECOMPOSE → CONNECT → ENHANCE**
> ไม่ใช่ **REBUILD → REWRITE → REPLACE** · โซนห้ามแตะด้านล่าง (SICE / API / DB / lifecycle / auth / AI pipeline / core state)
> ตรงกับ §44 ทุกข้อ — ยืนยันว่าไม่ขัดกัน

### สรุปคำตัดสินรายหมวด

#### ✅ KEEP — ทำงานถูกต้อง อย่าแตะ
- `src/constants/worlds.ts` · `src/types/badges.ts` — data ที่ควรใหญ่
- `src/services/sice/**` · `src/lib/intelligence/**` — SICE fork ทั้งสองฝั่ง (โซนห้ามแตะ)
- `public/og-*.jpg` 12 ไฟล์ · `index.html:76-97` OG/Twitter
- `public/llms.txt` · `public/robots.txt` (ยกเว้น `/*.json$`)
- `src/components/TwinEvolutionScene.tsx` + Wrapper
- `vendor-react` / `vendor-router` / `vendor-query` chunk splitting
- system font stack ใน `tokens.css:45-46`
- `src/components/twin/TwinEvolution.tsx:116-118` — pattern reduced-motion ที่ถูกต้อง ใช้เป็นแม่แบบ

#### 🔧 EXTEND — โครงถูก เติมของที่ขาด
| สิ่งที่ทำ | ไฟล์ | risk |
|----------|------|------|
| เพิ่ม reduced-motion + IntersectionObserver + scroll throttle ใน `EvolutionaryVisualSystem` | 1 | **P1** (RAFLOOP-001 ทำ reduced-motion + tab-hidden แล้ว; scroll throttle ยังเปิด) |
| ย้าย `<style>` keyframes ของ `WorldEnvironment` ไป CSS ไฟล์ + เพิ่ม OS reduced-motion | 1–2 | **P2** |
| เพิ่ม `MetaTagManager` ให้ 24 หน้าที่ขาด (เริ่มจาก `Share`, `AnalysisPage`, `Onboarding`, `Login`) | ≤8/รอบ | **P2** |
| ขยาย `faqs.ts` เพิ่ม "AI Twin คืออะไร", "Twin เรียนรู้ยังไง", "Twin พัฒนายังไง" | 1 | **P2** |
| แก้ `FAQPage.tsx:33` ให้ส่ง FAQ ทุกหมวดเข้า schema | 1 | **P2** |
| เพิ่ม URL ที่ขาดใน sitemap ทั้ง 2 ไฟล์ | 2 | **P2** |
| ย้าย `<h1>` จาก `TodaySection` → `Dashboard` | 2 | **P2** |

#### ✂️ EXTRACT — แยกของที่ปนกัน
| สิ่งที่ทำ | ไฟล์ | risk |
|----------|------|------|
| `useTwinFidelity()` + `useTwinIdentity()` — รวม `evolutionStage`/`glowMult` ที่ ซ้ำ 3 ที่ | 2 ใหม่ + 3 แก้ | **P1** |
| แยก inline style ของ `LandingPage` ออกเป็น CSS/token | 2 | **P1** |
| ย้าย `celebrateTwinAwakening()` (`CoreAwakeningService.ts:606-660`) ออกจาก service layer | 2 | **P2** |

#### 🔗 CONSOLIDATE — รวมของที่ ซ้ำ
| สิ่งที่ทำ | ไฟล์ | risk |
|----------|------|------|
| `BottomNav` + `NavRail` → `<AppShell>` ตัวเดียว mount ที่ App + ปิดช่อง 761–1023 px | **~20** (nav 2 + call site ~19) | **P1** (ช่องปิดแล้ว NAVGAP-001; รวมเป็น AppShell ยังเปิด) |
| `WorldTabs` เลิกใช้ Tailwind ใช้ `world-tabs.css` ที่มีอยู่ | 1 | **P1** |
| `SentryService.ts` (mock) + `AlertingService.ts` → รวมเข้า `error-tracking.ts` | 3 | **P2** |
| `TwinPresence` เป็นแหล่งความจริงเดียวของหน้าตา Twin | 3–5 | **🔴 P0 — ต้องขออนุมัติ** |

#### 🔄 REPLACE — ลบ/แทนที่
| สิ่งที่ทำ | ไฟล์ | risk |
|----------|------|------|
| ลบ orphan component: `AssetCatalog` `DebugTheme` `WorldSelector`(ว่าง) `TwinHologramBirth` `TwinEvolutionProgress` `GrowthBadge` `RecoveryIndicator` `PerformanceMonitor` `AdvancedAnalytics` | 9 | **P2** |
| ลบ orphan page: `Chat.tsx` `ChatPage.tsx` `BlogIndex.tsx` `blog-astrology-vs-behavioral.tsx` | 4 | **P2** |
| ลบ orphan service: `SentryService.ts` (mock) `AlertingService.ts` | 2 | **P2** |
| ลบ `public/service-worker.js` (ตาย) · `src/assets/hero.png` (760 kB ไม่มีใครใช้) · `react.svg` · `vite.svg` | 4 | **P2** |
| ถอด dep: `web-vitals` `@simplewebauthn/browser` `@simplewebauthn/server` | 1 | **P2** |
| ลบ `manualChunks` branch ที่ตาย: `vendor-motion`, `decision-components` | 1 | ✅ **ทำแล้ว** (DEADCHUNK-001) |
| แแทน `axios` (`useChat.ts:12`) ด้วย `fetch` | 1 | **P2** |
| บีบอัด `icon-512x512*.png` 742 kB → ~60 kB | 2 | **P2** |
| ทำ `/logo.png`, `/og-image.png`, `/icons/splash-*.png` ที่หายไป (หรือลบการอ้าง) | ~5 | **P1** (splash แแก้แล้ว ASSET404-001; logo/og-image ยังเปิด) |
| ลบ `<meta viewport>` + `<meta charSet>` ที่ ซ้ำใน `MetaTagManager.tsx:43-44` | 1 | **P1** |

#### 🚨 ARCHITECTURAL-CHANGE — **ต้องขออนุมัติก่อนทำ**
| # | เรื่อง | ทำไมต้องอนุมัติ |
|---|-------|----------------|
| **A1** | **ตัดสินระบบ styling: Tailwind หรือ CSS ล้วน** (F-01) | ✅ **FIXED (TWFIX-001)** — Tailwind v4 คอมไพล์แล้ว (`vite.config.ts:12`) → คำถามนี้ตอบแล้ว: ทาง (a) แก้ให้ทำงาน |
| **A2** | **แยก `@supabase` ออกจาก `chunk-intelligence`** (F-02) | ทางแก้ที่ตรงที่สุดคือทำ `ExperienceProvider` / `AIProvider` ให้ lazy → **แตะ provider tree ใน `App.tsx`** ซึ่งอยู่ใน โซนห้ามแตะ (lifecycle/core state) |
| **A3** | **รวม Twin เป็น implementation เดียว** | เปลี่ยนหน้าตา Twin = เปลี่ยนแก่นของ product |
| **A4** | **SSR / prerender สำหรับหน้า SEO** | เปลี่ยน build/deploy pipeline ทั้งหมด — CF Pages + `functions/` |
| **A5** | **ถอด route `/components` (ComponentShowcase) ออกจาก production** | แตะ routing core |

### Risk map

| ระดับ | นิยาม | รายการ |
|-------|------|--------|
| **P0** — พังโปรดักต์ | ผู้ใช้ใช้งานไม่ได้ / เห็นของผิด | ~~F-01 Tailwind ไม่ทำงาน~~ ✅ FIXED · F-02 chunk-intelligence 345 kB ใน critical path ของทุกหน้ารวมหน้าแรก · A3 Twin 3 หน้าตาในแปเดียว |
| **P1** — UX แย่ลง | ใช้ได้แต่เจ็บ | ~~F-03 tablet ไม่มี nav~~ ✅ FIXED · nav mount ไม่ครบ (WorldDetail มือถือติด) · ~~F-07 rAF ไม่หยุดบนหน้าแรก~~ ✅ FIXED · `box-shadow` animation บน Twin orb · CLS จาก `body` padding ที่ inject หลัง paint · `<Suspense fallback={null}>` · asset 404 (`logo.png`) · `viewport-fit=cover` ถูกทับ |
| **P2** — แค่สวยขึ้น/สะอาดขึ้น | ไม่มีใครเจ็บวันนี้ | dead code 16+ ไฟล์ · dep ตาย 3 ตัว · manualChunks branch ตาย (2 แแก้แล้ว) · icon PNG ใหญ่ · sitemap ไม่ครบ · meta tag ขาด 24 หน้า · FAQ schema แค่ 5 ข้อ · GEO placeholder |

### Change budget ต่อ phase

| ขนาด | กติกา | งานที่เข้าเกณฑ์ |
|------|------|----------------|
| **≤8 ไฟล์ — ปกติ** | ทำได้เลย | ลบ dead code (แบ่ง 2 รอบ) · ถอด dep · แก้ manualChunks · guard reduced-motion ใน EvolutionaryVisualSystem · แก้ FAQ schema · แก้ meta ซ้ำ · เพิ่ม sitemap |
| **9–15 ไฟล์ — ต้องมี change map** | เขียน map ก่อนแตะ | เพิ่ม `MetaTagManager` 24 หน้า (แบ่ง 3 รอบ) · `useTwinFidelity`/`useTwinIdentity` extract |
| **16–30 ไฟล์ — dedicated phase** | phase ของตัวเอง | **AppShell consolidation (~20 ไฟล์)** |
| **>30 หรือแตะ SICE/API/DB/lifecycle/auth/core state = 🛑 STOP** | ต้องอนุมัติ | **A2 provider lazy (แตะ `App.tsx` provider tree)** 🛑 · **A3 Twin consolidation (แตะแก่น product)** 🛑 · **A4 SSR (แตะ build pipeline)** 🛑 |

**สถานะ: PASS**
เหตุผล: ทุกงานถูกจัดหมวด KEEP/EXTEND/EXTRACT/CONSOLIDATE/REPLACE/ARCHITECTURAL, มี risk P0/P1/P2, และมี change budget ที่ระบุจำนวนไฟล์จริงจากการนับ ไม่ใช่ประมาณ

---

## 0.11 Mock / stub ใน production path — **ยังเปิด**

| จุด | ไฟล์:บรรทัด | ปัญหา |
|-----|-------------|-------|
| **VoiceChat** | `src/pages/VoiceChat.tsx:80` | mock ที่ชี้ไป **route `/voice` จริง** — ผู้ใช้ที่กดจะไปหน้าที่ไม่มี |
| **VoiceInput** | `src/pages/VoiceInput.tsx:38` | mock |
| **VoiceOutput** | `src/pages/VoiceOutput.tsx:34` | mock |
| **AdvancedAnalytics** | `src/pages/AdvancedAnalytics.tsx:26` | mock — **orphan** (ไม่มี route) |
| **SentryService** | `src/services/SentryService.ts:15` | mock — **orphan** (ไม่มีใครเรียก) |
| **CommunityPage** | `src/pages/CommunityPage.tsx:397` | "coming soon" |
| **ExplorePage** | `src/pages/ExplorePage.tsx:728,898` | stub cards |
| **DecisionDashboard** | `src/pages/DecisionDashboard.tsx:126` | placeholder |

**สถานะ: PARTIAL** — ต้องตัดสินต่อตัว: ลบ / ทำจริง / ทำเป็น feature flag

---

## 0.12 Passkey flow — **BROKEN (ยังเปิด)**

| จุด | ไฟล์:บรรทัด | ปัญหา |
|-----|-------------|-------|
| **AuthContext** | `src/context/AuthContext.tsx:130` | ไม่มี `supabase.auth.setSession()` — session ไม่ถูกกืนจาก passkey |
| **PasskeyProvider** | `src/lib/auth/PasskeyProvider.ts:144` | เรียก **4 Edge Functions ที่ไม่มีอยู่จริง** |
| **auth-verify-passkey** | — | JWT **zero-signature** — ไม่ปลอดจ |

**สถานะ: BLOCKED** — passkey flow พัง ต้องตัดสิน: แแก้ให้ใช้ Edge Functions ที่มีอยู่จริง / ถอดออก / ทำ feature flag

---

## 0.13 Core Awakening / migration 035 — **ยังเปิด**

- **Client code:** `CoreAwakening` + `HologramBirth` + `CoreAwakeningService` สมบูรณ์ (ดู 0.1, 0.5, 0.7)
- **Migration:** `supabase/migrations/035_forensic_consolidation_2026-09-03.sql` (1,392 บรรทัด) **ยังไม่ถูก apply** → production เจอ **42703** (column ไม่มี) จน apply
- **ต้อง:** apply migration 035 + test Core Awakening บน staging ก่อนอ้างว่า product-verified

**สถานะ: BLOCKED** — client พร้อม แต่ DB ไม่

---

# 📋 ตารางสรุป PASS / PARTIAL / BLOCKED

| # | หัวข้อ | สถานะ | เหตุผล |
|---|-------|-------|--------|
| 0.1 | Visual architecture | ✅ **PASS** | ไล่ครบ 45 ไฟล์ใน `src/pages/` · ระบุระดับ "ตอนนี้" จาก import จริง · พบหน้า orphan 4 ไฟล์ |
| 0.2 | Component audit + reuse map | ✅ **PASS** | ครบทั้ง 11 component ที่ระบุ + พบ orphan เพิ่ม 9 ตัว · ทุกข้อมี file:line |
| 0.3 | Bundle / chunk audit | ✅ **PASS** | ไล่ import graph จาก `dist/` จริง · พบว่า chunk-intelligence คือ Supabase SDK ไม่ใช่ `lib/intelligence` · พบ manualChunks branch ตาย 4 จุด (2 แแก้แล้ว) |
| 0.4 | Dependency audit | ✅ **PASS** | ไล่ครบ 15 deps + 20 devDeps · ยืนยัน `litellm` **ไม่มีอยู่จริง** · พบ dep ตาย 3 ตัว + ระบบ ซ้ำ 4 คู่ |
| 0.5 | Large-file audit | ✅ **PASS** | จัดตามเกณฑ์ "ขวางงานไหม" ไม่ใช่จำนวนบรรทัด · >2500 และ >1500 = ไม่มี · >800 = 8 ไฟล์ |
| 0.6 | Asset audit | 🟡 **PARTIAL** | splash/logo อ้างใน `index.html:83` แแก้แล้ว (ASSET404-001) · **แต่** `public/audio/` ยังหาย + `soundscape-manifest.json` ยังมี 23 CLOUDINARY_URL + `logo.png`/`og-image.png` ยังหาย |
| 0.7 | 3D / WebGL feasibility | 🟡 **PARTIAL** | ตอบได้ว่ามีอะไรอยู่จริง (ไม่มี WebGL/THREE เลย) และลำดับที่ควรเริ่ม · **แต่ตอบไม่ได้ว่า HIGH ควรเป็น WebGL หรือ canvas — ต้องตรวจ X: ผล Lighthouse บนมือถือระดับกลางของ LandingPage/WorldDetail ปัจจุบัน ซึ่งยังไม่เคยวัด** |
| 0.8 | Mobile performance | ✅ **PASS** | F-01/F-03/F-07 แแก้แล้ว (TWFIX-001/NAVGAP-001/RAFLOOP-001) · ยังเปิด: scroll throttle, box-shadow animation, CLS, Suspense fallback |
| 0.9 | SEO / AEO / GEO baseline | 🟡 **PARTIAL** | ตรวจครบทุกไฟล์ที่ระบุ + ตอบ AEO ครบ 6 ข้อ · **แต่ตอบไม่ได้ 2 เรื่อง — X1: ค่า env `VITE_BUSINESS_*` จริงบน CF Pages (อยู่ใน โซนห้ามแตะ) · X2: Google Search Console coverage report จริง** |
| 0.10 | Refactor boundary | ✅ **PASS** | จัดหมวดครบ 6 ประเภท + risk map P0/P1/P2 + change budget นับไฟล์จริง |
| 0.11 | Mock / stub ใน production path | 🟡 **PARTIAL** | 8 จุด mock/stub มี file:line — ต้องตัดสินต่อตัว |
| 0.12 | Passkey flow | 🔴 **BLOCKED** | AuthContext ไม่ setSession · PasskeyProvider เรียก 4 Edge Functions ที่ไม่มี · JWT zero-signature |
| 0.13 | Core Awakening / migration 035 | 🔴 **BLOCKED** | client พร้อม · migration 035 (1,392 บรรทัด) ไม่ apply → 42703 บน production |

**สรุป: PASS 7 · PARTIAL 4 · BLOCKED 2**

---

# 🗺️ ลำดับ Phase 1..12 — อ้างอิง Track C (12 phase)

> 📌 **เอกสารอ้างอิงหลักของลำดับ phase:**
> [`docs/Experience Architecture v2/TRACK_C_VISUAL_REDESIGN_TH.md`](./Experience%20Architecture%20v2/TRACK_C_VISUAL_REDESIGN_TH.md)
> (363 บรรทัด · Phase → §topic mapping · success criteria ตาม §45 · change budget §9 · do-not-touch zones §10)
> **ตารางด้านล่างเป็นดัชนีสรุปเท่านั้น** — ถ้าเนื้อหาขัดกัน ให้ยึดเอกสาร Track C เป็นหลัก
> เอกสารแม่ (design contract) = [`docs/Experience Architecture v2.md`](./Experience%20Architecture%20v2.md) (2,046 บรรทัด · 50 topics)

> หลักการเรียง: **แก้สิ่งที่ทำให้ "มองเห็นความจริง" ก่อน → แล้วค่อยแก้สิ่งที่ผู้ใช้เจ็บ → แล้วค่อยทำสวย**
> ห้ามทำ redesign บนฐานที่ยังวัดผลไม่ได้
> ทุก phase ต้องตอบคำถามเดียวจาก §50: *"Does this make SELFPRINT feel more like a Living Intelligence that knows me — or more like a website containing AI features?"*

### ดัชนี 12 phase

| Phase | ชื่อ | งานหลัก (ย่อ) | Architecture topics | ไฟล์โดยประมาณ | สถานะ |
|-------|------|---------------|---------------------|---------------|-------|
| **1** | **Performance Foundation** | วัด Lighthouse mobile จริง (LandingPage / Dashboard / WorldDetail) · เก็บ bundle report จาก build สดของ HEAD (ไม่ใช่ `dist/` เก่า) · เช็ค env `VITE_BUSINESS_*` บน CF Pages · ดึง Search Console coverage | **§25** · §14 · §44 | **0** | ⬜ ยังไม่เริ่ม |
| **2** | **Landing** | redesign `LandingPage` (57 inline style) · แยก motion state ออกจาก business state · รวม hero 3 แบบ | **§2** · **§23** · §26–34 · §35 | 2–8 | ⬜ |
| **3** | **Onboarding** | ลด L2 → L1 (เก็บ L2 ไว้ที่ CoreAwakening ที่เดียว) · narrative continuity ทุก screen | **§11** · **§12** · §20 · §21 | 2–8 | ⬜ |
| **4** | **Analysis** | ผลวิเคราะห์ทยอยเผย (reveal/skeleton) · responsive `analysis.css` | **§35** · **§19** | 2–8 | ⬜ |
| **5** | **Core Awakening** | apply migration 035 + test บน staging · lazy-load 3D · confetti guard reduced-motion | **§10** stages 1–4 · **§24** | 2–8 | 🔴 **BLOCKED** — migration 035 ยังไม่ apply (ดู 0.13) |
| **6** | **Twin Birth** | `useTwinFidelity()` → `useTwinIdentity()` → `<Twin />` facade · first message จาก real analysis (G6) · ใช้ canvas 2D `HologramBirth.tsx` ที่มีอยู่แล้ว — **ไม่สร้าง WebGL ใหม่** (C5) | **§10** stage 5 · **§21** · §24 | 3 ใหม่ + 3–5 แก้ | 🛑 **A3 ต้องอนุมัติ** |
| **7** | **Twin Chat** | reuse 3D ที่โหลดแล้ว · `WorldTabs` ใช้ `world-tabs.css` · แก้ h1 ซ้ำ (`:515`, `:652`) | **§7** · **§8** · §9 | 2–8 | ⬜ |
| **8** | **Today** | `TodaySection` h1→h2 · timeSlot re-evaluate · ย้าย inline style ออก · one primary insight | **§6** · **§36** | 2–8 | ⬜ |
| **9** | **Worlds** (G1) | `WorldsHub` จาก grid 12 cards → Twin พาสำรวจ · `WorldDetail` ใส่ Twin presence + CSS atmosphere | §4.5 · **§13** · **§14** | 2–8 | ⬜ phase ใหม่จาก gap |
| **10** | **Twin Modes** (G3) | `TwinChat` จาก chat-only → Twin hub + mode selector [Talk][Reflect][Decide] · REFLECT/DECIDE/PATTERN = P1.8 | **§7** · **§8** · §9 | 2–8 (P0) · P1.8 แยก | ⬜ phase ใหม่จาก gap |
| **11** | **Memory Experience** (G4) | หน้า "What Twin Knows" — About you / Recently learned / Patterns / Decisions / Questions · ต้องใช้ข้อมูลจริงจาก `twin_memories` | **§16** · §4.2 | 2–8 | ⬜ phase ใหม่จาก gap |
| **12** | **SEO/GEO/AEO knowledge layer** (G7) | 24/41 หน้าไม่มี meta · FAQ schema แค่ 5 คำถาม · sitemap ไม่สมบูรณ์ · X1 env · IA ตาม §31 · structured data truthful ตาม §32 | **§26–34** | 9–15 (ต้องมี change map) | ⬜ phase ใหม่จาก gap · 🛑 **A4 SSR ต้องอนุมัติ** |

> **Phase 9–12 เป็น phase ใหม่ที่เพิ่มจากช่องว่าง (gap) ของเอกสารแม่** — G1 Worlds · G3 Twin Modes · G4 Memory · G7 SEO layer
> (ดู `TRACK_C_VISUAL_REDESIGN_TH.md` §3) · ส่วน G2 JOURNEY · G5 SMART ENTRY · G8 Returning user ถูกบันทึกเป็น P1/P2 item ไม่เป็น phase

### 🔁 เทียบเลข Phase เดิม (PHASE0 10 phase) → Track C 12 phase

> ⚠️ **รายการ Phase 1..10 เดิมของเอกสารนี้ถูกแทนที่ (superseded) ด้วยแผน 12 phase ของ Track C**
> เหตุผล: แผนเดิมเขียนก่อนมี `docs/Experience Architecture v2.md` จึงครอบคลุมเฉพาะงานที่วัดได้จากโค้ด
> ไม่ครอบคลุม §topic ที่เอกสารแม่กำหนด — Track C เติมช่องว่างเป็น Phase 9–12 และจัดลำดับใหม่ตาม §45 emotional progression
> **งานทุกข้อยังอยู่** — มีแค่เลข phase ที่เปลี่ยน หรือถูกย้ายไปอยู่ใน change budget (§9) แทน

| Phase เดิม (PHASE0) | → ตำแหน่งใน Track C 12 phase | หมายเหตุ |
|---|---|---|
| **1** Baseline ที่วัดได้ | → **Phase 1 Performance Foundation** | **งานเดียวกันทุกประการ** — ไฟล์ที่แตะ 0 เหมือนกัน |
| **2** A1 (Tailwind) | ✅ **ปิดแล้ว — ไม่เป็น phase อีกต่อไป** | FIXED (TWFIX-001) · อยู่ในหมวด "ทำงานถูกต้อง อย่าแตะ" ของ Track C §1 |
| **3** ล้าง dead code + dead deps | → **ไม่เป็น phase หมายเลข** — ย้ายเข้า change budget §9 ระดับ "≤8 ไฟล์ — ปกติ" | ทำแทรกได้ทุกเมื่อ ไม่บล็อก phase ใด · ยังเปิด (0.2 / 0.4 / 0.6) |
| **4** 🛑 A2 แยก Supabase ออกจาก initial path | → **ไม่เป็น phase หมายเลข** — เป็นรายการต้องอนุมัติ A2 ใน §9 (🛑 STOP) | ยังเปิด (0.3) · ต้องอนุมัติก่อนแตะ `App.tsx` provider tree |
| **5** AppShell (~20 ไฟล์) | → **ไม่เป็น phase หมายเลข** — อยู่ใน §9 ระดับ "16–30 ไฟล์ = dedicated phase" | ยังเปิด · ช่อง 761–1023 px ปิดแล้ว (NAVGAP-001) เหลือแค่รวมเป็น `<AppShell>` + แก้ CLS |
| **6** Motion hygiene (P1) | → **ไม่เป็น phase หมายเลข** — กระจายเข้า change budget §9 (≤8 ไฟล์) + Phase 5/6 | scroll throttle · `box-shadow` animation · `<Suspense fallback={null}>` ยังเปิด (0.8) |
| **7** SEO/AEO ที่ทำได้โดยไม่แตะสถาปัตยกรรม | → **Phase 12 SEO/GEO/AEO knowledge layer** (G7) | **งานเดียวกันภายใต้เลขใหม่** · ขอบเขตกว้างขึ้น — ครบ §26–34 ไม่แค่ meta/sitemap/FAQ |
| **8** 🛑 A3 รวม Twin เป็นตัวเดียว + fidelity ladder | → **Phase 6 Twin Birth** | **งานเดียวกันภายใต้เลขใหม่** · ผูกเพิ่มกับ §10 stage 5 + first message จาก real analysis (G6) |
| **9** 🛑 A4 SSR/prerender | → **Phase 12** (G7) | **งานเดียวกัน** — Phase 12 วาง IA + structured data ก่อน · ตัว SSR/SSG/prerender เองยังคงเป็น A4 ต้องอนุมัติ (C2) |
| **10** HIGH fidelity / WebGL (อาจไม่ทำเลย) | → **Phase 6 Twin Birth** — และ **ตัดสินแล้วว่าไม่สร้าง WebGL ใหม่** | C5 + §14 + §25: ใช้ canvas 2D `HologramBirth.tsx` ที่มีอยู่แล้ว · three.js ~350 kB gzip ไม่คุ้มกับ initial ~250 kB gzip |

### 📌 งานที่ไม่อยู่ในเลข Phase 1..12 แต่ยังเปิด (ห้ามลืม)

งาน 4 กลุ่มด้านล่าง **ไม่ได้หายไป** — มันแค่ไม่ได้เป็น phase หมายเลขใน Track C เพราะเป็นงาน housekeeping
หรืออยู่ในระดับ change budget ที่ทำแทรกได้ (ดู `TRACK_C_VISUAL_REDESIGN_TH.md` §9)

| งาน | ที่มาจาก Phase เดิม | อ้างอิงในเอกสารนี้ | สถานะ |
|-----|-------------------|-------------------|-------|
| ลบ dead code 16+ ไฟล์ · ถอด dep 3 ตัว · บีบอัด icon PNG | Phase 3 เดิม | 0.2 · 0.4 · 0.6 | 🟡 ยังเปิด |
| 🛑 A2 — แยก `@supabase` ออกจาก `chunk-intelligence` · ตัด static import `DecisionLearningService` 3 จุด | Phase 4 เดิม | 0.3 | 🟡 ยังเปิด · ต้องอนุมัติ |
| AppShell consolidation (~20 ไฟล์) · ย้าย `body` padding ออกจาก component เพื่อแก้ CLS | Phase 5 เดิม | 0.2 · 0.8 | 🟡 ยังเปิด · ต้องมี change map |
| Motion hygiene — scroll throttle · `box-shadow` → `opacity` · reduced-motion ให้ `HologramBirth` + confetti · `<Suspense>` fallback | Phase 6 เดิม | 0.8 | 🟡 ยังเปิด |

### ทำไม Phase 1 ต้องมาก่อน (กฎที่ไม่เปลี่ยน)

ตอนนี้ `dist/` เก่ากว่า `src/` 1 คอมมิต และ **ไม่มีใครเคยวัด Lighthouse เลย** — ทุกข้อถกเถียงเรื่อง
"เร็วขึ้นไหม" หลังจากนี้จะไม่มีฐานเปรียบเทียบ ถ้าข้าม Phase 1 ทุก phase หลังจากนี้จะจบด้วย
"แก้แล้วครับ" ซึ่งผิดกฎในโปรเจกต์นี้ (อ้างอิง 0.7 X · 0.9 X1/X2)

---

# ✅ สรุป Phase 0 — พร้อมเข้าสู่ Track C (มี 4 เงื่อนไข)

**Phase 0 สมบูรณ์** — งาน visual/UX ไม่ถูกบล็อกโดย build/test bug:

| Gate | ผล |
|------|-----|
| `tsc -b` (strict) | ✅ 0 errors |
| `typecheck:functions` | ✅ 0 errors |
| `vite build` | ✅ 3.81s / 933 modules |
| `oxlint` | ✅ 0 errors / 187 warnings / 474 files |
| `vitest` | ✅ 66/66 files / 1037 tests / 0 fail / 0 skip |

**C0 แแก้แล้ว:** F-01 (TWFIX-001) · F-03 (NAVGAP-001) · F-07 (RAFLOOP-001) · REALBUG-001..004 · SEC-02 (code) · HOMEBLANK-001 · AUTHHDR-001 · NOVAPROV-001 · ERRBOUND-001 · SENTRY-INIT-001
**PARTIAL:** F-04 (DEADCHUNK-001 — vendor-motion + decision-components ลบแล้ว; vendor-supabase + decision-services ยัง) · F-06 (ASSET404-001 — splash แแก้แล้ว; audio/ + soundscape ยัง)

**Track C พร้อมเข้าสู่ UX/UI improvement** — แต่ **ยังไม่ "100% product-verified"** จนครบ 4 เงื่อนไข:

1. **Apply migration 035** (`supabase/migrations/035_forensic_consolidation_2026-09-03.sql`, 1,392 บรรทัด) + test Core Awakening บน staging → แแก้ 42703
2. **Deploy Edge Functions** (SEC-02 code แแก้แล้ว แต่ functions ไม่ deploy)
3. **แก้/ตัดสิน passkey flow** (AuthContext:130 ไม่ setSession · PasskeyProvider:144 เรียก 4 functions ที่ไม่มี · JWT zero-signature)
4. **ถอด VoiceChat mock ออกจาก route `/voice` จริง** (VoiceChat.tsx:80)

**ยังเปิดใน PHASE0 (ไม่บล็อก Track C):** dead code 16+ ไฟล์ · X1 `VITE_BUSINESS_*` env · soundscape 23 CLOUDINARY_URL + `public/audio/` หาย · mock/stub 8 จุด · `as any` 114 จุด · `dangerouslySetInnerHTML` 8 จุด (ทั้งหมด safe ผ่าน `safeJsonLd()`)

---

# ❓ คำถามที่ต้องให้เจ้าของตัดสินใจก่อนเริ่ม Phase 1

### 🔴 บล็อกทุกอย่าง — ต้องตอบก่อน

**Q1 — Tailwind: จะเาอางไหน?** → ✅ **ตอบแล้ว: FIXED (TWFIX-001)** — `vite.config.ts:12` มี `@tailwindcss/vite` plugin; วัด 545 `--tw-` จุดใน `dist/assets/index-CiJYtTZx.css` → ทาง (a) ทำแล้ว

**Q2 — เป้าหมายจริงของ Track C คืออะไร?**
"visual redesign" ในที่นี้หมายถึง
- **(a)** ทำให้สิ่งที่มีอยู่ทำงานถูกและดูสม่าเสมอ (ซ่อมมากกว่าสร้าง) หรือ
- **(b)** สร้างภาษาภาพใหม่ทั้งหมด
คำตอบเปลี่ยนลำดับ Phase ทั้งหมด — ถ้าเป็น (b) การซ่อม Tailwind ทาง (a) อาจเสียเปล่า

> ✅ **ตอบแล้ว — อ้างอิง §23 VISUAL LANGUAGE ของ `docs/Experience Architecture v2.md`:**
> **ทาง (b) — สร้างภาษาภาพใหม่ — แต่ทำผ่าน RECOMPOSE (P0) ไม่ใช่ REBUILD**
>
> §23 กำหนดทิศทางไว้ชัดเจน: **"Ultra-clean semi-realistic futuristic"**
> - **Avoid:** painterly texture · anime · excessive sci-fi decoration · generic AI robot aesthetics · overuse of purple · heavy 3D
> - **Prefer:** soft depth · intelligent minimalism · atmospheric backgrounds · subtle motion · glass surfaces แบบเลือกใช้ · cream/white/neutral foundation · restrained accent colors · premium typography
>
> ดังนั้น (a) "ซ่อมให้ทำงานถูกและสม่ำเสมอ" = **ไม่พอ** — ต้องมีภาษาภาพใหม่ตาม §23
> **แต่** §49 + §44 กำหนดวิธีทำ: **RECOMPOSE → CONNECT → ENHANCE** จากของที่มีอยู่แล้ว
> ("มีอยู่ในโค้ดแล้วเยอะกว่าที่คิด") — ไม่ใช่สร้างใหม่ทั้งหมด
>
> **ผลต่อลำดับ Phase:** การซ่อม Tailwind (TWFIX-001) **ไม่เสียเปล่า** — มันคือฐานที่ทำให้งาน visual ตาม §23
> วัดผลและเปรียบเทียบได้จริง (P0.10 performance-safe visual system ต้องมี baseline ก่อน/หลัง)

### 🟠 ต้องตอบก่อนงาน A2 (แยก Supabase) + AppShell consolidation

**Q3 — ยอมให้แตะ `App.tsx` provider tree ไหม?**
วิธีเดียวที่จะเอา `chunk-intelligence` 345 kB ออกจาก critical path ได้จริง คือทำ `ExperienceProvider` / `AIProvider` ให้ lazy หรือ conditional บน session ซึ่ง `CLAUDE.md` ระบุว่า lifecycle/core state = โซนห้ามแตะ
- ถ้า **ไม่ยอม** → ทำได้แค่แยก `vendor-supabase` ออกมา (ยังโหลดอยู่ดี แค่ cache แยก) ผลลัพธ์จำกัด
- ถ้า **ยอม** → ต้องยอมรับความเสี่ยงว่า provider order เคยทำแปขาวมาแล้ว 2 ครั้ง (ดูคอมเมนต์ ROUTER-001 `App.tsx:244` และ LANG-PROVIDER-001 `App.tsx:270`)

**Q4 — Twin ควรมีหน้าตาเดียวหรือหลายหน้าตา?**
ตอนนี้ Dashboard (orb CSS), WorldDetail (SVG), CoreAwakening (canvas) = 3 หน้าตา
- **เดียว** → ต้องเลือกว่าตัวไหนคือตัวจริง (แนะนำ `TwinPresence`) แล้วอีก 2 ที่ต้องเปลี่ยนตาม = ผู้ใช้เห็นความเปลี่ยนแปลง
- **หลายตัวโดยตั้งใจ** → ต้องอธิบายได้ว่าทำไม orb กับ SVG ควรเป็นคนละตัว ไม่งั้นมันคือ tech debt ที่ถูกตั้งชื่อใหม่

**Q5 — ช่วง tablet (761–1023 px) จะให้เป็นแบบไหน?** → ✅ **ตอบแล้ว: FIXED (NAVGAP-001)** — BottomNav ยืดถึง 1023 px ต่อกับ NavRail ที่ 1024 px

### 🟡 ตอบได้ระหว่างทาง

**Q6 — `/components` (ComponentShowcase) ควรอยู่บน production ไหม?**
ตอนนี้ `App.tsx:180` เปิดสาธารณะทั้ง `/en/components` และ `/th/components`

**Q7 — Soundscape/audio จะทำต่อไหม?**
`public/soundscape-manifest.json` มี `CLOUDINARY_URL` ยังไม่แทนค่า 23 จุด · `public/audio/` ไม่มีอยู่ · `adaptive-audio-engine.ts:285-292` อ้างไฟล์ที่ไม่มี
- ถ้าทำต่อ → เป็น phase ของตัวเอง (ต้องอัปโหลด asset จริง)
- ถ้าไม่ทำ → มีโค้ดเสียง (`audioManager`, `useSoundscape`, `useSoundscapeAudioLoader`, `AudioSettings`, `SoundscapePlayer`) ที่ควรถูกจัดการ

**Q8 — ฟอนต์ไทย: จะโหลดฟอนต์เองหรือใช้ system?**
`tokens.css:45` เป็น system stack ล้วน ไม่มีฟอนต์ไทยระบุ → ผู้ใช้ไทยเห็นฟอนต์ต่างกันทุกเครื่อง (Windows vs Android vs iOS) ซึ่งจะทำให้ redesign ที่พึ่ง typography ควบคุมผลลัพธ์ไม่ได้
- โหลดเอง (เช่น Noto Sans Thai / IBM Plex Sans Thai) → +80–150 kB แต่คุมได้
- คง system → ต้องออกแบบให้ทนต่อความต่างของฟอนต์

**Q9 — `VITE_BUSINESS_PHONE` / `VITE_BUSINESS_ADDRESS_*` ถูกตั้งบน CF Pages แล้วหรือยัง?**
ถ้ายัง → LocalBusiness schema กำลังส่ง `+66-2-XXX-XXXX` เป็นเบอร์โทรจริงในทุกหน้า
(ตรวจเองไม่ได้ — `.env*` อยู่ใน โซนห้ามแตะ)

---

## ⛔ ขอบเขตของเอกสารนี้

- **ไม่มีการแก้โค้ดใด ๆ** — ทุกข้อเป็นการตรวจและเสนอ
- **ไม่เริ่ม Phase 1** — Q1/Q2/Q5 ตอบแล้ว (Q2 ตอบโดย §23 VISUAL LANGUAGE ของ `docs/Experience Architecture v2.md`) · ยังรอ Q3/Q4
- ทุกข้ออ้าง file:line จากซอร์สจริง ณ 4–5 ก.ย. 2026 (HEAD `3fa100a`) — ถ้าโค้ดเปลี่ยน ต้อง verify ซ้ำ
- ข้อที่ยังตอบไม่ได้ระบุไว้ชัดเจนใน 0.7 (X), 0.9 (X1, X2) — **ไม่มีการเดา**

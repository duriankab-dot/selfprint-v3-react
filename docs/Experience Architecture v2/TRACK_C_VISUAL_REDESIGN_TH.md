# Track C — Visual Redesign Plan (เชื่อมกับ Experience Architecture v2)

> **สถานะเอกสาร:** วางแผนเท่านั้น — **ไม่มีการแก้โค้ดแม้แต่บรรทัดเดียว**
> **วันที่:** 6 ก.ย. 2026 · **HEAD:** `da855c5` (อัปเดต: migration 035 APPLIED · Edge = 12 functions · passkey ยังพัง · voice ยัง mock)
> **ฐานข้อมูล:** `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` (ตรวจจริง 4–5 ก.ย. 2026)
> **ภาษา:** ไทย (ตรงกับโฟลเดอร์นี้)
> ทุกข้ออ้าง file:line · **ไม่เชื่อ `.md` ใด ๆ** รวมถึง `CLAUDE.md`

---

## 0. Design Contract — เอกสารแม่ (Master Document)

> **เอกสารแม่:** [`docs/Experience Architecture v2.md`](../Experience%20Architecture%20v2.md) (2,046 บรรทัด, 51 topics)
> เป็น **design contract / source of truth** ของ Track C — ทุก phase ต้องอ้าง §topic ของเอกสารแม่
> เอกสารนี้ (ในโฟลเดอร์ `docs/Experience Architecture v2/`) เป็น **แผนปฏิบัติการ** ที่แปลงเอกสารแม่เป็นงาน visual/UX

### หลักการที่ Track C ยึด (จากเอกสารแม่)

| หลักการ | รายละเอียด | อ้างอิง |
|---------|-------------|--------|
| **RECOMPOSE ไม่ใช่ REBUILD** | "มีอยู่ในโค้ดแล้วเยอะกว่าที่คิด" — ระบบมีอยู่แล้ว งานคือ reorganize + elevate ไม่ใช่สร้างใหม่ | §49 |
| **Core promise** | "Understand yourself. Meet your Twin. Keep evolving." | §1 |
| **6 Experience Primitives** | Identity · Memory · State · Choice · World · Evolution | §4.1–4.6 |
| **App Shell** | TODAY · WORLDS · TWIN · EXPLORE · ME — **VERIFIED** `BottomNav.tsx:89-93` มี `/dashboard วันนี้`, `/worlds โลก`, `/chat/twin AI ฝาแฝด`, `/explore สำรวจ`, `/me ฉัน` ตรงเป๊ะ | §5 |
| **Implementation Principle** | DO NOT ADD MORE FEATURES FIRST — transform เป็น IA / screen-by-screen UX spec / Visual System v2 / motion spec / SEO-GEO-AEO map / performance strategy / Claude handoff / P0-P1 checklist | §49 |

### หลักการทำงานของ Track C (จากเดิม + เชื่อมเอกสารแม่)

> หลักการ: **แก้สิ่งที่ทำให้ "มองเห็นความจริง" ก่อน → แล้วค่อยแก้สิ่งที่ผู้ใช้เจ็บ → แล้วค่อยทำสวย**
> ห้ามทำ redesign บนฐานที่ยังวัดผลไม่ได้
> ทุก phase ต้องตอบคำถามเดียวจาก §50: *"Does this make SELFPRINT feel more like a Living Intelligence that knows me — or more like a website containing AI features?"*

---

## 1. สรุปสถานะ visual/UX ที่ตรวจแล้ว (วัดจริง)

### ✅ ที่ทำงานถูกต้อง (อย่าแตะ)

| สิ่ง | หลักฐาน |
|-----|---------|
| **Tailwind v4 คอมไพล์แล้ว** | `vite.config.ts:12` มี `@tailwindcss/vite` plugin · วัด 545 จุด `--tw-` + Tailwind class ใน `dist/assets/index-CiJYtTZx.css` (TWFIX-001) |
| **Nav ช่อง 761–1023 px ปิดแล้ว** | `BottomNav.tsx:123` `@media (max-width: 1023px)` ต่อกับ `NavRail.tsx:104` ที่ 1024 px (NAVGAP-001) |
| **rAF loop หยุดแล้ว** | `EvolutionaryVisualSystem.tsx:301` เช็ค `prefers-reduced-motion` + หยุดตอน tab ซ่อน (RAFLOOP-001) |
| **HomeRoute แก้แล้ว** | `App.tsx:130` HomeRoute แสดง LandingPage (HOMEBLANK-001) |
| **Provider/ErrorBoundary/Sentry แก้แล้ว** | `App.tsx:155` NovaProvider ที่ route · `main.tsx:10` ErrorBoundary + initializeSentry() |
| **REALBUG-001..004 แก้แล้ว** | `ContinuousImprovementService.ts:82` SEVERITY_RANK sort · `constants/worlds.ts:296` getWorld() throws · `config/twin-prompts.ts:267` world fallback · `ConfidenceIndicator.tsx:120` evidencePoints check |
| **Gate สมบูรณ์** | `tsc -b` 0 errors (strict) · `typecheck:functions` 0 · `vite build` 3.81s/933 modules · `oxlint` 0 errors/187 warnings/474 files · `vitest` 66/66 files/1037 tests/0 fail |

### 🔴 ที่ยังพัง/ยังเปิด (ไม่บล็อก Track C แต่ต้องรู้)

| สิ่ง | ไฟล์:บรรทัด | ผล |
|-----|-------------|-----|
| ~~dead code 16+ ไฟล์~~ ✅ **A1 ปิดแล้ว** (6 Sep 2026 — 6 orphan files deleted) | orphan component 8 + service 3 + page 4 + asset 1 | กิน typecheck/lint · ทำให้ audit สับสน |
| **X1 `VITE_BUSINESS_*` env** | `structuredData.ts:21` `'+66-2-XXX-XXXX'` fake phone fallback | GEO spam signal ถ้า env ไม่ตั้ง |
| **Soundscape** | `soundscape-manifest.json` 23 CLOUDINARY_URL · `public/audio/` หาย · `adaptive-audio-engine.ts:285` อ้าง mp3 | เสียงทุกตัวใช้ไม่ได้ |
| **mock/stub 8 จุด** | `VoiceChat.tsx:80` (route `/voice` จริง!) · `VoiceInput.tsx:38` · `VoiceOutput.tsx:34` · `AdvancedAnalytics.tsx:26` · `SentryService.ts:15` · `CommunityPage.tsx:397` · `ExplorePage.tsx:728,898` · `DecisionDashboard.tsx:126` | ผู้ใช้เจอของปลอม/ว่าง |
| `as any` **47 จุด** | (วัด 6 Sep 2026 — A7 ปิดแล้ว) | type safety ลด |
| **`dangerouslySetInnerHTML` 8 จุด** | (docs เดิมว่า 7 — วัดจริง 8) · ทั้งหมด safe ผ่าน `safeJsonLd()` | ✅ ปลอดภัย |
| **Passkey flow พัง** | `AuthContext.tsx:130` ไม่ setSession · `PasskeyProvider.ts:144` เรียก 4 Edge Functions ที่ไม่มี · JWT zero-signature | ล็อกอิน passkey ไม่ทำงาน |
| ~~**Core Awakening / migration 035**~~ | ✅ **APPLIED** (verify Supabase SQL Editor 5 Sep 2026) · client code สมบูรณ์ | ไม่ 42703 แล้ว |

---

## 2. Track C — 12 phase เชื่อมกับ Experience Architecture v2

> ตารางนี้คือ **Phase → Architecture topic mapping** — แต่ละ phase ต้องทำตาม §topic ที่ระบุ
> ตัวเลข "ไฟล์โดยประมาณ" เป็นขอบเขตคร่าว ๆ ตาม change budget (§9)

| Phase | ชื่อ | งานหลัก | Architecture topics ที่ต้องทำตาม | ไฟล์โดยประมาณ |
|-------|------|---------|----------------------------------|---------------|
| **1** | **Performance Foundation** | Baseline Lighthouse จริง (Landing/Dashboard/WorldDetail) · bundle report สด · เช็ค env · เก็บตัวเลขก่อน/หลัง | **§25 PERFORMANCE ARCHITECTURE** (load เฉพาะ route · lazy-load World assets · lightweight Twin visuals · 3D = progressive enhancement) · **§14 WORLD VISUAL SYSTEM** (CSS atmosphere > heavy 3D) · **§44 safety rule** | 0 |
| **2** | **Landing** | redesign LandingPage (57 inline style) · แยก motion state ออกจาก business state · hero 3 แบบรวม | **§2 BRAND POSITIONING** (Living Intelligence category · AI Twin product) · **§23 VISUAL LANGUAGE** (ultra-clean semi-realistic futuristic · cream/white/neutral · restrained accent) · **§26–34 SEO/GEO/AEO** (public layer ต้อง crawlable · ไม่ปิดเป็น SPA) · **§35 THE NEW FIRST JOURNEY (LANDING→SMART ENTRY)** | 2–8 |
| **3** | **Onboarding** | ลด L2 → L1 (เก็บ L2 ที่ CoreAwakening ที่เดียว) · ผ่านเร็ว | **§11 ONBOARDING** (ห้ามแทนที่ lifecycle — Landing→Emotion→NOVA→AI Creation→Blueprint→Fine-tune→Full Analysis→Core Awakening→Twin Birth→Twin Chat→Today) · **§12 ONBOARDING STORY** (narrative continuity — ทุก screen ตอบ "Why am I doing this?") · **§20 NOVA** (guide ใน early journey · ไม่ให้ Nova กับ Twin เป็น chatbot สองตัวที่สับสน) · **§21 NOVA→TWIN HANDOFF** | 2–8 |
| **4** | **Analysis** | ผลวิเคราะห์ทยอยเผย (reveal/skeleton) · responsive `analysis.css` | **§35 THE NEW FIRST JOURNEY (ANALYSIS→REVEAL)** (Discovery→Understanding) · **§19 SICE invisible** (แสดง "Your Twin understands this pattern" ไม่ใช่ "Engine 7 detected...") | 2–8 |
| **5** | **Core Awakening** | apply migration 035 + test บน staging · lazy-load 3D · confetti guard reduced-motion | **§10 TWIN BIRTH stages 1–4** (We've learned how you see the world → patterns → intelligence taking shape → something is emerging) · **§24 MOTION** (Awakening = slow emergence) | 2–8 |
| **6** | **Twin Birth** | `useTwinFidelity()` → `useTwinIdentity()` → `<Twin />` facade · load 3D | **§10 TWIN BIRTH stage 5 + naming + first message จาก real analysis** (ไม่ใช่ "Hi! Nice to meet you" — ต้องเป็น "I've already learned something about the way you make decisions") · **§21 NOVA→TWIN HANDOFF** ("I've learned enough to introduce you to someone." → "Your Twin.") · **§24 MOTION** (identity formation) | 3 ใหม่ + 3–5 แก้ |
| **7** | **Twin Chat** | reuse 3D · WorldTabs ใช้ `world-tabs.css` · h1 ซ้ำ | **§7 TWIN** (Living Twin Visual + greeting + Today's Insight + [Talk][Reflect][Decide] + [Explore Pattern] — chat เป็นแค่หนึ่งโหมด) · **§8 TWIN MODES** (TALK/REFLECT/DECIDE/PATTERN/EXPLORE/REVIEW) · **§9 PROACTIVE TWIN** (UX architecture รองรับ proactive โดยไม่ต้องมี autonomous-agent) | 2–8 |
| **8** | **Today** | `TodaySection` h1→h2 · timeSlot re-evaluate · style ออก | **§6 TODAY** (Twin presence → What matters now → One primary insight → Recommended action → Your day → Recent evolution — ไม่ใช่ 6 cards แข่งกัน) · **§36 RETURNING USER EXPERIENCE** ("Welcome back. Your Twin has something to show you.") | 2–8 |
| **9** | **Worlds** (G1) | `WorldsHub` เปลี่ยนจาก "grid ของ 12 cards" เป็น "Twin พาผู้ใช้เข้าสำรวจมิติของชีวิต" · `WorldDetail` ใส่ Twin presence (`TwinPresence.tsx`) + World atmosphere (CSS) · ลด visual competition กับ Twin | **§4.5 World** (context ไม่ใช่ 12 เว็บแยก) · **§13 WORLDS** (World atmosphere + YOUR TWIN + Insight/Reflection/Pattern/Story/Decision) · **§14 WORLD VISUAL SYSTEM** (CSS atmosphere · gradients · WebP/AVIF · lightweight SVG · subtle motion · lazy-load) | 2–8 |
| **10** | **Twin Modes** (G3) | เปลี่ยน `TwinChat` จาก chat-only เป็น Twin hub: Living Twin Visual + greeting + Today's Insight + mode selector ([Talk][Reflect][Decide]) · REFLECT/DECIDE/PATTERN เป็น P1.8 (ต้องมี data/intelligence หนุน) — P0 ทำได้แค่ UI shell + TALK | **§7 TWIN** (Living Twin Visual + insight + [Talk][Reflect][Decide]) · **§8 TWIN MODES** (TALK/REFLECT/DECIDE/PATTERN/EXPLORE/REVIEW) · **§9 PROACTIVE TWIN** | 2–8 (P0) · P1.8 แยก phase |
| **11** | **Memory Experience** (G4) | หน้า "What Twin Knows" เข้าถึงได้จาก Twin/Me · แสดง About you / Recently learned / Patterns / Decisions / Questions · ต้องมีข้อมูลจริงจาก `twin_memories` (ไม่ใช่ fake precision — §17) | **§16 MEMORY EXPERIENCE** ("What Twin Knows" — Twin ควรพูดได้ว่า "I don't know you well enough here yet.") · **§4.2 Memory** (visible continuity — review/correct/forget/update) | 2–8 |
| **12** | **SEO/GEO/AEO knowledge layer** (G7) | ตรวจ 24/41 หน้าไม่มี meta (C2) · FAQ schema 5 คำถาม · sitemap ไม่สมบูรณ์ · X1 env (`structuredData.ts:21`) · วาง IA ตาม §31 · structured data ตาม §32 (truthful — ห้ามสร้าง FAQ ปลอม) | **§26–34** (SEO/GEO/AEO principle · SEO · GEO · AEO · public ≠ closed SPA · content architecture · structured data · internal linking · public→app transition) | 9–15 (ต้องมี change map) |

> **Phase 9–12 เป็น phase ใหม่ที่เพิ่มจากช่องว่าง (gap) ของเอกสารแม่** — G1 Worlds · G3 Twin Modes · G4 Memory · G7 SEO layer
> เหตุผล + งานหลักแบบละเอียดอยู่ใน **§3** ด้านล่าง (G1 → Phase 9 · G3 → Phase 10 · G4 → Phase 11 · G7 → Phase 12)
> ดัชนีสรุป 12 phase อีกชุดหนึ่งอยู่ใน
> [`docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`](../PHASE0_VISUAL_PERF_FORENSIC_TH.md) §"ดัชนี 12 phase"
> (ถ้าเนื้อหาขัดกัน ให้ยึดตารางในเอกสารนี้เป็นหลัก)

### 3D usage rules ต่อหน้า (อ้างอิง §14 + §25)

| หน้า | กติกา 3D | Architecture |
|------|---------|--------------|
| **Landing** | ❌ ไม่มี heavy 3D — L2 SVG + rAF พอ (มี L1 fallback เมื่อ reduced-motion) | §14, §25 |
| **Onboarding** | ❌ ไม่มี heavy 3D — L1 พอ (ผ่านเร็ว) | §14, §25 |
| **Analysis** | ❌ ไม่มี heavy 3D — L1 reveal/skeleton | §14, §25 |
| **Core Awakening** | 🟡 **lazy-load 3D** — โหลดเฉพาะเมื่อเข้าหน้า · ระยะสั้น (3 วิ) · confetti guard reduced-motion | §10, §24, §25 |
| **Twin Birth** | ✅ **load 3D** — พิธีกำเนิด Twin · ช่วงเดียวที่ผู้ใช้ควรรู้สึกว่าเกิดอะไรขึ้น · **ใช้ canvas 2D (`HologramBirth.tsx`) ไม่ใช่ WebGL ใหม่** (C5) | §10, §24, §25 |
| **Twin Chat** | ♻️ **reuse 3D** — ใช้ asset ที่โหลดแล้ว ไม่โหลดซ้ำ | §7, §25 |
| **Today** | 🟢 **lightweight** — orb breathe พอ · ไม่มี heavy motion | §6, §25 |

---

## 3. Gaps ที่ Track C ต้องเพิ่ม (จาก architecture — เอกสารแม่กำหนดไว้แต่ Track C เดิมไม่มี)

> เอกสารแม่มี 51 topics แต่ Track C เดิมครอบคลุมแค่ 8 phase → ตอนนี้ 12 phase — ช่องว่าง 8 จุด (G1–G8) ด้านล่าง
> **G1/G3/G4/G7 = งาน P0 ที่ต้องเพิ่มเป็น phase/งานใน Track C** · **G2/G5/G8 = งาน P1/P2 ที่ต้องบันทึกขอบเขตไว้**

### G1 — Worlds phase (P0.5) — **เพิ่มเป็น Phase 9**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §4.5 World (context ไม่ใช่ 12 เว็บแยก) · §13 WORLDS (World atmosphere + YOUR TWIN + Insight/Reflection/Pattern/Story/Decision) · §14 WORLD VISUAL SYSTEM (CSS atmosphere · gradients · WebP/AVIF · lightweight SVG · subtle motion · lazy-load) |
| **ทำไมต้องมี** | P0.5 "World becomes context rather than independent product" — Track C เดิมไม่มี phase นี้เลย ทั้งที่ `WorldsHub.tsx` + `WorldDetail.tsx` เป็น first-class destination ใน nav (C3 verified) |
| **งานหลัก** | `WorldsHub` เปลี่ยนจาก "grid ของ 12 cards" เป็น "Twin พาผู้ใช้เข้าสำรวจมิติของชีวิต" · `WorldDetail` ใส่ Twin presence (TwinPresence.tsx) + World atmosphere (CSS) · ลด visual competition กับ Twin |
| **ไฟล์โดยประมาณ** | 2–8 |
| **P0 mapping** | P0.1 (Twin protagonist ใน World) · P0.5 (World = context) · P0.10 (performance-safe — CSS atmosphere ไม่ใช่ heavy 3D) |

### G2 — JOURNEY (§15) — **บันทึกเป็น P1/P2 item**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §15 JOURNEY — longitudinal timeline: major reflections · decisions · insights · Twin observations · memories · changes · evolution milestones |
| **สถานะ** | **P1/P2** — ต้องมีข้อมูลสะสมก่อน (reflections/decisions/insights) จึงจะแสดง timeline ที่มีความหมายได้ · Track C วาง foundation ไว้ที่ Phase 8 (Today) + Phase 11 (Memory) |
| **ขอบเขตที่บันทึก** | ไม่ทำใน Track C P0 — แต่ IA ของ Today/Memory ต้องเผื่อช่องให้ JOURNEY ต่อยอดได้ |

### G3 — Twin Modes (§8) — **เพิ่มเป็น Phase 10**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §7 TWIN (Living Twin Visual + insight + [Talk][Reflect][Decide]) · §8 TWIN MODES (TALK/REFLECT/DECIDE/PATTERN/EXPLORE/REVIEW) · §9 PROACTIVE TWIN |
| **ทำไมต้องมี** | P0.4 "Chat becomes one Twin interaction mode" — `TwinChat.tsx` (809 บรรทัด) เป็น chat-only ตอนนี้ · เอกสารแม่บอกชัดว่า Twin screen ต้องไม่ใช่แค่ avatar + chat + input box |
| **งานหลัก** | เปลี่ยน `TwinChat` จาก chat-only เป็น Twin hub: Living Twin Visual + greeting + Today's Insight + mode selector ([Talk][Reflect][Decide]) · REFLECT/DECIDE/PATTERN เป็น P1.8 (ต้องมี data/intelligence หนุน) — P0 ทำได้แค่ UI shell + TALK |
| **ไฟล์โดยประมาณ** | 2–8 (P0) · P1.8 แยก phase |
| **P0 mapping** | P0.1 (Twin protagonist) · P0.4 (chat = หนึ่งโหมด) |

### G4 — Memory Experience (§16) — **เพิ่มเป็น Phase 11**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §16 MEMORY EXPERIENCE — "What Twin Knows": About you · Recently learned · Patterns · Decisions · Questions (Twin ควรพูดได้ว่า "I don't know you well enough here yet.") · §4.2 Memory (visible continuity — review/correct/forget/update) |
| **ทำไมต้องมี** | P1.1 (Visible Twin Memory) + P1.2 (What Twin Knows About You) — เอกสารแม่กำหนดให้ Memory เป็น "visible continuity" ไม่ใช่แค่ backend capability |
| **งานหลัก** | หน้า "What Twin Knows" เข้าถึงได้จาก Twin/Me · แสดง About you / Recently learned / Patterns / Decisions / Questions · ต้องมีข้อมูลจริงจาก `twin_memories` (ไม่ใช่ fake precision — §17) |
| **ไฟล์โดยประมาณ** | 2–8 |
| **P mapping** | P1.1 · P1.2 (P1 — ต้องมี memory data หนุน) |

### G5 — SMART ENTRY (§35) — **บันทึกเป็น P1/P2 item**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §35 THE NEW FIRST JOURNEY — LANDING→**SMART ENTRY**→ONBOARDING→ANALYSIS→REVEAL→CORE AWAKENING→TWIN BIRTH→FIRST CONNECTION→TODAY · อารมณ์: Curiosity→Recognition→Discovery→Understanding→Awakening→Encounter→Relationship→Evolution |
| **สถานะ** | **P1/P2** — ต้องมี segmentation/returning logic หนุน · Track C Phase 2 (Landing) ต้องเผื่อช่อง SMART ENTRY ไว้ (LandingPage มี Smart Entry comment อยู่แล้ว — `LandingPage.tsx:10`) |
| **ขอบเขตที่บันทึก** | Phase 2 ไม่ทำ SMART ENTRY เต็มรูปแบบ แต่ต้องไม่ปิดทาง — hero/CTA ต้องรองรับการต่อเข้า onboarding ตาม §35 |

### G6 — First message ต้องอ้างอิง real analysis (§10) — **รวมใน Phase 6**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §10 TWIN BIRTH — First Twin message ต้องพูดจาก analysis จริง: "I've already learned something about the way you make decisions." + reveal หนึ่ง insight — **ห้าม** "Hi! Nice to meet you" |
| **สถานะ** | รวมใน Phase 6 (Twin Birth) — ต้องดึง insight จริงจาก analysis/SICE output มาเป็น first message |

### G7 — SEO/GEO/AEO knowledge layer (§26–34) — **เพิ่มเป็น Phase 12**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §26 SEO/GEO/AEO PRINCIPLE (Experience layer + Knowledge layer) · §27 SEO (Landing/AI Twin/Living Intelligence/Self-discovery/Worlds/Articles/FAQ indexable) · §28 GEO (canonical explanation ของทุก concept) · §29 AEO (Question→Direct answer→Explanation→Evidence→Related→CTA) · §30 Public ≠ closed SPA · §31 CONTENT ARCHITECTURE · §32 STRUCTURED DATA (truthful เท่านั้น) · §33 INTERNAL LINKING (semantic graph) · §34 PUBLIC→APP TRANSITION |
| **ทำไมต้องมี** | P0.9 "Preserve SEO/GEO/AEO public content architecture" — Track C Phase 2 แตะแค่ Landing · แต่เอกสารแม่กำหนด knowledge layer ทั้งระบบ (Worlds/Articles/FAQ) |
| **งานหลัก** | ตรวจ 24/41 หน้าไม่มี meta (C2) · FAQ schema 5 คำถาม · sitemap ไม่สมบูรณ์ · X1 env (`structuredData.ts:21`) · วาง IA ตาม §31 · structured data ตาม §32 (truthful — ห้ามสร้าง FAQ ปลอม) |
| **ไฟล์โดยประมาณ** | 9–15 (ต้องมี change map) |
| **P0 mapping** | P0.9 · เกี่ยวข้องกับ C2 (A4 SSR ต้องอนุมัติ) |

### G8 — Returning user experience (§36) — **บันทึกเป็น P1/P2 item**

| หัวข้อ | รายละเอียด |
|--------|-------------|
| **Architecture** | §36 RETURNING USER EXPERIENCE — กลับเข้าสู่ TODAY ตรง ๆ ไม่ถูกดันกลับ onboarding · "Welcome back. Your Twin has something to show you." |
| **สถานะ** | **P1/P2** — ต้องมี session/twin state หนุน · Track C Phase 8 (Today) วาง foundation ไว้ (Today = living entry point) |
| **ขอบเขตที่บันทึก** | Phase 8 ต้องทำให้ Today เป็น entry ที่ "มี continuity" — พร้อมรับ returning user ต่อ |

---

## 4. P0 / P1 / P2 mapping — Track C ครอบคลุมอะไรบ้าง

### P0 — Experience Recomposition (Track C หลัก)

| P0 | รายการ | Track C phase | หมายเหตุ |
|----|--------|---------------|----------|
| **P0.1** | Twin becomes visual protagonist | Phase 6, 7, 9 | facade `<Twin />` (Phase 6) · Twin hub (Phase 7) · Twin ใน World (Phase 9) |
| **P0.2** | Today becomes primary living entry | Phase 8 | h1→h2 · one primary insight · Twin presence |
| **P0.3** | Twin Birth becomes signature experience | Phase 5, 6 | stages 1–4 (Phase 5) · stage 5 + naming + first message (Phase 6) |
| **P0.4** | Chat becomes one Twin interaction mode | Phase 7, 10 | Twin hub + mode selector (Phase 10) |
| **P0.5** | World becomes context | Phase 9 | **G1 — phase ใหม่** |
| **P0.6** | Reduce card/dashboard density | Phase 8 | Today hierarchy ตาม §6 |
| **P0.7** | Onboarding narrative continuity | Phase 3 | §12 story · §21 handoff |
| **P0.8** | Mobile-app interaction patterns | Phase 2, 4, 8 | responsive · touch patterns |
| **P0.9** | Preserve SEO/GEO/AEO | Phase 2, 12 | **G7 — phase ใหม่** · §26–34 |
| **P0.10** | Performance-safe visual system | Phase 1, 5 | §25 · §14 · 3D rules |

### P1 — Relationship Intelligence (Track C วาง foundation, งานหลักแยก phase)

| P1 | รายการ | ลงที่ไหน |
|----|--------|----------|
| **P1.1** | Visible Twin Memory | Phase 11 (G4) |
| **P1.2** | What Twin Knows About You | Phase 11 (G4) |
| **P1.3** | Twin State | Phase 7 (Twin hub แสดง state) · ต้องมี data หนุน |
| **P1.4** | Choice → Memory | หลัง Phase 10 (Decide mode) — ต้องมี decision loop (§18) |
| **P1.5** | Choice → Pattern | หลัง Phase 10 — ต้องมี data สะสม |
| **P1.6** | Twin Evolution presentation | หลัง Phase 11 — ต้องมี metrics จริง (§17 ห้าม fake precision) |
| **P1.7** | Proactive insight surfaces | หลัง Phase 7/8 — §9 · ต้องมี intelligence หนุน |
| **P1.8** | Reflection/Decision/Pattern modes | Phase 10 (G3) — REFLECT/DECIDE/PATTERN ต้องมี data หนุน |

### P2 — Living Intelligence Expansion (หลัง Phase A closure)

| P2 | รายการ | หมายเหตุ |
|----|--------|----------|
| P2.1–P2.7 | Proactive notifications · autonomous workflows · external tools · Twin-to-Twin · creator experiences · community ecosystem · advanced personalization | **หลัง Phase A production closure** (§43) · Track C ไม่แตะ · เกี่ยวข้องกับ G2 (JOURNEY) / G5 (SMART ENTRY) / G8 (Returning user) ที่บันทึกขอบเขตไว้ |

---

## 5. Success criteria — ใช้ §45 emotional progression เป็นเกณฑ์ตรวจแต่ละ phase

> §45: V2 สำเร็จเมื่อผู้ใช้ใหม่เข้าใจ SELFPRINT ภายในไม่กี่นาที ผ่าน emotional progression:
> "interesting AI website" → "my personal intelligence" → "my Twin" → "my Twin remembers me" → "my Twin understands something about me" → "my Twin is getting better at understanding me"

| Phase | เกณฑ์ตรวจ (จาก §45) | วัดยังไง |
|-------|---------------------|----------|
| **1. Performance** | ฐานวัดได้จริง — ไม่มีตัวเลข = ไม่เริ่ม redesign | Lighthouse ก่อน/หลัง · bundle report |
| **2. Landing** | "This is an interesting AI website" → **"This is my personal intelligence"** | copy/visual สื่อ category Living Intelligence (§2) · ไม่ใช่ "AI website อีกตัว" |
| **3. Onboarding** | ผู้ใช้รู้สึกว่า "กำลังเริ่มความสัมพันธ์" ไม่ใช่ "กรอกฟอร์ม" | narrative continuity (§12) · ทุก screen ตอบ "Why am I doing this?" |
| **4. Analysis** | "กำลังเข้าใจตัวเอง" (Discovery→Understanding) | reveal/skeleton ทยอยเผย · SICE invisible (§19) |
| **5. Core Awakening** | "มีอะไรบางอย่างกำลังเกิดขึ้น" (Awakening) | stages 1–4 (§10) · slow emergence motion (§24) |
| **6. Twin Birth** | **"This is my Twin"** — รู้สึกว่าเจอ Twin จริง ไม่ใช่หน้า status | stage 5 + naming + first message จาก real analysis (G6) · NOVA→TWIN handoff (§21) |
| **7. Twin Chat** | "Twin คือความสัมพันธ์ ไม่ใช่แชทบอท" | Twin hub + mode selector (§7, §8) · chat = หนึ่งโหมด (P0.4) |
| **8. Today** | **"My Twin remembers me"** → "My Twin understands something about me" | one primary insight + Twin presence + recommended action (§6) · ลด card density (P0.6) |
| **9. Worlds (G1)** | "World = context ที่ Twin พาฉันเข้าไป" ไม่ใช่ "12 เว็บแยก" | Twin protagonist ใน World (§4.5, §13) · CSS atmosphere (§14) |
| **10. Twin Modes (G3)** | "Interact with my Twin" ไม่ใช่ "Chat with AI" | mode selector ทำงาน · REFLECT/DECIDE/PATTERN ต่อยอด P1.8 |
| **11. Memory (G4)** | **"My Twin remembers me"** — เห็นได้จริง | What Twin Knows แสดงข้อมูลจริง (§16) · review/correct/forget/update |
| **12. SEO layer (G7)** | "App-like for humans. Structured and discoverable for search engines and AI." | 24/41 หน้า meta ครบ · FAQ/sitemap สมบูรณ์ · structured data truthful (§32) |

---

## 6. Architecture safety rule — §44 MUST NOT (ตรงกับ do-not-touch zones)

> §44 ARCHITECTURAL SAFETY RULE — Experience Architecture v2 **MUST NOT**:
> กฎคือ **RECOMPOSE → CONNECT → ENHANCE** ไม่ใช่ **REBUILD → REWRITE → REPLACE**

| §44 MUST NOT | ตรงกับ do-not-touch zone (§10 ของเอกสารนี้) | หลักฐาน/เหตุผล |
|--------------|-------------------------------|----------------|
| rewrite/replace SICE | **SICE core** | `src/services/sice/**` · `src/lib/intelligence/**` — engine 12 ตัว · แตะแล้วพัง product |
| create parallel intelligence systems | **AI pipeline** | `src/lib/intelligence/**` · `functions/api/nova.ts` · `functions/api/twin.ts` |
| replace canonical APIs | **API / DB** | `api/**` · `supabase/**` · migration — ต้อง apply 035 ก่อนแตะ DB |
| rewrite working business logic | **Lifecycle / core state** | `App.tsx` provider tree · `AuthContext` · `LifecycleStore` — ROUTER-001/LANG-PROVIDER-001 เคยทำหน้าแป๊บขาว 2 ครั้ง |
| change database lifecycle without defect reason | **API / DB** | migration 035 ต้อง apply ก่อน (42703) |
| bypass existing memory systems | **AI pipeline** | ใช้ `twin_memories` เดิม — ห้ามสร้าง memory ขนาน |
| create duplicate Twin systems | **SICE core / AI pipeline** | C1 — Twin มี 3 implementations อยู่แล้ว · facade `<Twin />` คือทางออก (A3 ต้องอนุมัติ) |
| introduce Community into First Journey | **Lifecycle** | §37 — Community ยังเป็น Phase B · ห้ามใส่ใน First Journey |
| destabilize Phase A production closure | **ทุก zone** | 4 เงื่อนไข (FORENSIC §8.6) ต้องครบก่อนอ้าง "100% product-verified" |

---

## 7. Verified conflicts — ต้องรู้ก่อนเริ่ม (ตรวจจากโค้ดจริง)

### C1 — Twin มี 3 implementations (ต้องรวมเป็นหนึ่ง — ผ่าน A3)

| Implementation | ไฟล์ | เทคโนโลยี |
|----------------|------|-----------|
| **LivingTwin** | `src/components/dashboard/LivingTwin.tsx` (288 บรรทัด) | orb CSS · 6 states (awakening→aware→connected→reflective→insightful→aligned) |
| **TwinPresence** | `src/components/twin/TwinPresence.tsx` (544 บรรทัด) | SVG · archetype-driven glyph + glow/breathing · ใช้ใน Worlds |
| **HologramBirth** | `src/components/twin/HologramBirth.tsx` (270 บรรทัด) | canvas 2D · birth animation · archetype shape |

> **ผล:** Twin ตัวเดียวกันแต่ render ต่างกัน 3 แบบ → แตก visual identity (ขัด §4.1 Identity)
> **ทางออก:** Track C Phase 6 `useTwinFidelity()` → `useTwinIdentity()` → `<Twin />` facade เป็น path ผ่าน A3
> **⚠️ A3 (Twin consolidation) แตะแก่น product — ต้องขออนุมัติก่อน** (change budget §9)

### C2 — ไม่มี SSR/SSG/prerender (A4 ต้องอนุมัติ)

| หลักฐาน | รายละเอียด |
|---------|-------------|
| 24/41 หน้าไม่มี meta | MetaTagManager ยังไม่ครอบคลุมทุกหน้า |
| FAQ schema 5 คำถาม | น้อยเกินไปสำหรับ AEO (§29) |
| sitemap ไม่สมบูรณ์ | ยังไม่ครบทุก public surface |
| X1 env เปิด | `structuredData.ts:21` `'+66-2-XXX-XXXX'` fake phone fallback → GEO spam signal |

> **ผล:** ขัด §26–30 (public layer ต้อง crawlable · ไม่ปิดเป็น SPA) · P0.9
> **ทางออก:** Phase 12 (G7) วาง IA + structured data ก่อน · SSR/SSG/prerender = **A4 แตะ build pipeline — ต้องขออนุมัติ**

### C3 — Nav tabs (RESOLVED — verified)

> **Verified:** `BottomNav.tsx:89-93` มี `/dashboard วันนี้`, `/worlds โลก`, `/chat/twin AI ฝาแฝด`, `/explore สำรวจ`, `/me ฉัน` — **Worlds (ไม่ใช่ Activities)** ตรงกับ §5 App Shell เป๊ะ
> README เคยเขียนผิด (Activities) — แก้แล้ว (5 ก.ย. 2026) · Track C ไม่ต้องแตะ nav

### C5 — 3D = progressive enhancement เท่านั้น

> **§25:** 3D = progressive enhancement only · **§14:** อย่าแก้ immersion ด้วย heavy 3D
> **ผลต่อ Track C:** Phase 6 "load 3D" ต้องเป็น **canvas 2D (`HologramBirth.tsx`)** ที่มีอยู่แล้ว — **ไม่ใช่สร้าง WebGL ใหม่**
> 3D rules ต่อหน้า (§2 ของเอกสารนี้) ยึดหลักนี้ทั้งหมด

---

## 8. Core loop — §46 (ทุก phase ต้อง reinforce loop เดียว)

```
DISCOVER → EXPERIENCE → CHOOSE → REMEMBER → LEARN → EVOLVE → DISCOVER AGAIN
```

| Loop step | Track C phase ที่หนุน |
|-----------|----------------------|
| **DISCOVER** | Phase 2 (Landing) · Phase 4 (Analysis) · Phase 12 (SEO knowledge layer) |
| **EXPERIENCE** | Phase 9 (Worlds) · Phase 7 (Twin hub) |
| **CHOOSE** | Phase 10 (Twin Modes — Decide) · Phase 8 (Today — recommended action) |
| **REMEMBER** | Phase 11 (Memory Experience) · Phase 6 (first message จาก analysis) |
| **LEARN** | Phase 11 (Patterns) · Phase 10 (Reflect) |
| **EVOLVE** | Phase 5/6 (Twin Birth → Twin เริ่มเรียนรู้) · Phase 8 (Recent evolution) |
| **DISCOVER AGAIN** | Phase 8 (Today = living entry) · Phase 9 (Worlds) |

> เกณฑ์ตัดสินทุก phase (จาก §50): *"Does this make SELFPRINT feel more like a Living Intelligence that knows me — or more like a website containing AI features?"*

---

## 9. Change budget guardrails

| ขนาด | กติกา | งานที่เข้าเกณฑ์ |
|------|------|----------------|
| **≤8 ไฟล์ — ปกติ** | ทำได้เลย | ลบ dead code (แบ่ง 2 รอบ) · ถอด dep · แก้ manualChunks · guard reduced-motion · แก้ FAQ schema · แก้ meta ซ้ำ · เพิ่ม sitemap · Phase 9/10/11 (G1/G3/G4) |
| **9–15 ไฟล์ — ต้องมี change map** | เขียน map ก่อนแตะ | เพิ่ม `MetaTagManager` 24 หน้า (แบ่ง 3 รอบ) · `useTwinFidelity`/`useTwinIdentity` extract · **Phase 12 SEO layer (G7)** |
| **16–30 ไฟล์ — dedicated phase** | phase ของตัวเอง | **AppShell consolidation (~20 ไฟล์)** |
| **>30 หรือแตะ SICE/API/DB/lifecycle/auth/core state = 🛑 STOP** | ต้องอนุมัติ | **A2 provider lazy (แตะ `App.tsx` provider tree)** 🛑 · **A3 Twin consolidation (แตะแก่น product — C1)** 🛑 · **A4 SSR (แตะ build pipeline — C2)** 🛑 |

---

## 10. Do-not-touch zones (โซนห้ามแตะ) — สอดคล้อง §44

| โซน | เหตุผล | §44 |
|-----|--------|-----|
| **SICE core** | `src/services/sice/**` · `src/lib/intelligence/**` — engine 12 ตัว · แตะแล้วพัง product | rewrite/replace SICE |
| **API / DB** | `api/**` · `supabase/**` · migration — ต้อง apply 035 ก่อนแตะ DB | replace canonical APIs · change DB lifecycle |
| **Lifecycle / core state** | `App.tsx` provider tree (`ExperienceProvider`/`AIProvider`) · `AuthContext` · `LifecycleStore` — ROUTER-001/LANG-PROVIDER-001 เคยทำหน้าแป๊บขาว 2 ครั้ง | rewrite business logic · destabilize Phase A |
| **Auth** | `AuthContext` · `PasskeyProvider` — passkey พังอยู่แล้ว อย่าแตะเพิ่ม | destabilize Phase A |
| **AI pipeline** | `src/lib/intelligence/**` · `functions/api/nova.ts` · `functions/api/twin.ts` | parallel intelligence · bypass memory |
| **`.env*`** | ค่า env จริง — ตรวจเองไม่ได้ | — |

---

## 11. 4 เงื่อนไขก่อนอ้าง "100% product-verified"

Track C พร้อมเข้าสู่ UX/UI improvement — **แต่ยังไม่ "100% product-verified"** จนครบ:

1. **Apply migration 035** (`supabase/migrations/035_forensic_consolidation_2026-09-03.sql`, 1,392 บรรทัด) + test Core Awakening บน staging → แก้ 42703
2. **Deploy Edge Functions** (SEC-02 code แก้แล้ว แต่ functions ไม่ deploy)
3. **แก้/ตัดสิน passkey flow** (`AuthContext.tsx:130` ไม่ setSession · `PasskeyProvider.ts:144` เรียก 4 functions ที่ไม่มี · JWT zero-signature)
4. **ถอด VoiceChat mock ออกจาก route `/voice` จริง** (`VoiceChat.tsx:80`)

---

## 12. สรุป

- **Phase 0 สมบูรณ์** — งาน visual/UX ไม่ถูกบล็อกโดย build/test bug
- **Track C พร้อมเริ่ม** — เริ่มจาก Phase 1 (Performance Foundation) ที่แตะ 0 ไฟล์
- **เอกสารแม่คือ design contract** — `docs/Experience Architecture v2.md` (51 topics) · ทุก phase อ้าง §topic · RECOMPOSE ไม่ใช่ REBUILD
- **เพิ่ม 4 phase ใหม่จาก gaps:** Phase 9 Worlds (G1) · Phase 10 Twin Modes (G3) · Phase 11 Memory (G4) · Phase 12 SEO layer (G7)
- **บันทึก P1/P2 items:** JOURNEY (G2) · SMART ENTRY (G5) · Returning user (G8) — วาง foundation ไว้ใน P0 phases
- **ยังเปิด (ไม่บล็อก Track C):** dead code 16+ · X1 env · soundscape · mock/stub 8 จุด · `as any` 114 · `dangerouslySetInnerHTML` 8 (safe) · passkey · migration 035
- **ห้ามแตะ:** SICE/API/DB/lifecycle/auth/AI pipeline/core state โดยไม่ขออนุมัติ (§44)
- **ต้องอนุมัติก่อน:** A2 provider lazy · A3 Twin consolidation (C1) · A4 SSR (C2)

---

## ⛔ ขอบเขตของเอกสารนี้

- **ไม่มีการแก้โค้ดใด ๆ** — ทุกข้อเป็นการตรวจและเสนอ
- ทุกข้ออ้าง file:line จากซอร์สจริง ณ 4–5 ก.ย. 2026 (HEAD `3fa100a`) — ถ้าโค้ดเปลี่ยน ต้อง verify ซ้ำ
- ข้อที่ยังตอบไม่ได้ระบุไว้ชัดเจน — **ไม่มีการเดา**
- เอกสารแม่ `docs/Experience Architecture v2.md` เป็น source of truth — ถ้าเอกสารแม่เปลี่ยน ต้อง sync เอกสารนี้
---

## STORY / NARRATIVE LAYER (จาก §51)

> 📌 **เอกสารนี้คือแผนงาน — ยังไม่ใช่โค้ดที่ ship แล้ว**
> Story/Narrative Layer กำหนดไว้ใน §51 ของ `docs/Experience Architecture v2.md`
> เป็น overlay บน data ที่มีอยู่แล้ว — ไม่ใช่ engine ใหม่ · ไม่สร้าง DB table ใหม่ · ไม่ bypass SICE

### การ map Story Layer เข้ากับ 12 Phase

| Phase | Story / Narrative งานที่ต้องทำ |
|-------|-------------------------------|
| **Phase 3 — Onboarding** | Narrative continuity: ทุก screen ตอบ "Why am I doing this?" · ไม่ใช่ step ที่ผู้ใช้อยากผ่านให้จบ แต่เป็นบท "การสำรวจตัวเอง" ที่มีความหมาย |
| **Phase 6 — Twin Birth** | First message จาก real analysis เสมอ — **ห้าม** "Hi! Nice to meet you" · ต้องเป็น "I've already learned something about the way you make decisions" (§10 Twin Birth stage 5) |
| **Phase 8 — Today** | P0.2 + daily Narrative Hook: hook มาจากข้อมูลจริง (twin_memories / decision_logs / daily_briefs) — ถ้าไม่มีข้อมูลจริง ไม่แสดง hook |
| **Phase 9 — Worlds** | World = "scene" ในเรื่อง ไม่ใช่ grid ของ 12 categories · แต่ละ World แสดง: Story (คืออะไรในชีวิตผู้ใช้) / Pattern (SICE พบอะไร) / Reflection (Twin ถามอะไร) / Decision (ผู้ใช้เคยตัดสินอะไรในโลกนี้) |
| **Phase 10 — Twin Modes** | Choice → Consequence surfacing: เมื่อ follow-up data มี → Twin แสดง "Since [choice], here's what changed" |
| **Phase 11 — Memory Experience** | Memory Questions: Twin ถามคำถามที่ยังค้างอยู่จาก previous choices / patterns ที่ยังไม่ตอบ |
| **G2 JOURNEY surface** | Story History: P1 = Big Story surface (จากไหน → ตอนนี้) · P2 = Chapter archive · บันทึก IA reserve จาก Today/Memory |

### Guardrails สำหรับ Track C Implementation

```
✗ ห้ามสร้างเรื่องเล่าที่ไม่มีข้อมูลจริงรองรับ
✗ ห้าม gamification (badge / streak / point ที่ wrapping เป็น "story")
✗ ห้ามสร้าง memory system ใหม่ (อ่านจาก twin_memories / decision_logs / daily_briefs เท่านั้น)
✗ ห้ามสร้าง intelligence engine ใหม่ (SICE generate patterns ทั้งหมด — storytelling layer แค่ name + sequence)
✗ ห้าม show Narrative Hook เมื่อไม่มี real data — ถ้าไม่มีข้อมูล ไม่แสดง
✓ Story primitives ทั้ง 7 map กับ data ที่มีอยู่แล้ว (ดู §51 สำหรับ mapping table)
✓ ถามก่อน code: "ข้อมูลนี้มาจาก SICE จริงไหม?" ถ้าไม่ใช่ → ไม่ทำ
```

---

## Consultation Addendum — 7 Sep 2026

> **สถานะ:** เป็น **ข้อเสนอ** จาก consultation session — **ยังไม่ใช่ commit ที่ implement แล้ว**
> **วัน:** 7 ก.ย. 2026 · **HEAD:** `710afa0` (ล่าสุด `4ed4762`)
> **หลักการ:** ไม่แก้เนื้อหาเดิมของเอกสารนี้ (append เท่านั้น) · ทุกข้อเสนอต้องผ่าน **§44 safety rule**
> (RECOMPOSE ไม่ใช่ REBUILD) · **ห้ามแตะ do-not-touch zones** (§10 ของเอกสารนี้)
> จุดร่วมของ addendum นี้: เพิ่ม **deliverable ใหม่** ใน phase ที่มีอยู่ + เสนอ micro-phase —
> ไม่เปลี่ยนขอบเขต/ลำดับ 12 phase เดิม

### A. Bilingual Typography System (ภาษาไทย)

**ปัญหา:** ไทยไม่มีช่องว่างระหว่างคำ + คำไทยยาวกว่า EN โดยเฉลี่ย → บรรทัด/layout ที่ออกแบบเพื่อ EN
จะ break / ตัดคำ / baseline เพี้ยนเมื่อเป็น TH

**ข้อเสนอ:** เพิ่ม deliverable ใหม่ใน 2 phase (ไม่ใช่ phase ใหม่):
- **Phase 2 (Landing)** — font stack ไทย (Noto Sans Thai / IBM Plex Sans Thai) + line-height + truncation
- **Phase 8 (Today)** — line-height / truncation สำหรับ insight card ภาษาไทย

| ประเด็น | สิ่งที่ต้องทำ |
|---------|-------------|
| **Font stack** | เพิ่ม Thai fallback (`Noto Sans Thai` / `IBM Plex Sans Thai`) ใน design token — ไม่ทับตัวอักษร EN |
| **Line-height** | ไทยต้อง line-height สูงกว่า EN (มีตัวสูง-ต่ำ + สระบน/ล่าง) |
| **Truncation** | คำไทยยาว → ต้องมี `line-clamp` / ellipsis ที่ไม่ตัดคำกลาง |
| **Mixed-font baseline** | บรรทัดที่ผสม TH+EN ต้อง baseline ตรงกัน (หลีกเลี่ยงตัวลอย/จม) |

> **อ้างอิง:** §23 VISUAL LANGUAGE · §6 TODAY (Phase 8) · §2 BRAND POSITIONING (Phase 2)

### B. Bridge pages restyle (TarotPage / PalmistryPage / VsAstrologyPage)

**ปัญหา:** หน้า bridge (Trojan funnel) 3 หน้า อยู่นอก 12 phase เดิม — จะถูกข้ามไปทั้งที่มันคือ
"ประตูรับ" จากตลาดดูดวง

**ข้อเสนอ:** **micro-phase** — ใส่เป็น **Phase 2a** หรือ **รวมใน Phase 4** (Analysis):
- Restyle ด้วย **CSS atmosphere** ตาม §14 (ไม่ใช่ heavy 3D)
- เน้น "psychological framing" copy ที่มีอยู่แล้ว (`TarotPage.tsx:33` / `PalmistryPage.tsx:6`)
- **รักษา Trojan funnel** — อย่าทำให้หน้าดูเป็น "แอปดูดวง" แต่ก็อย่าเปลี่ยน copy จนเสียภาษาที่ผู้ใช้คุ้นเคย

> **อ้างอิง:** §14 WORLD VISUAL SYSTEM · §2 BRAND POSITIONING · §35 SMART ENTRY
> **หมายเหตุ:** งานนี้เล็ก (3 หน้า) — อยู่ใน change budget ≤8 ไฟล์ (ปกติ) · **ต้องไม่แตะ SICE / API / DB**

### C. Twin unification (C1) — ลำดับก่อน visual

**ปัญหา:** C1 (Twin มี 3 implementations) เป็น **A3 ที่ต้องขออนุมัติ** — จะชน Phase 6/7/8/9

**ข้อเสนอ:** ทำ `useTwinIdentity()` **facade ก่อน** visual ของ Phase 7/8/9:
- Twin 3 หน้าตา: `LivingTwin.tsx` (orb CSS) · `TwinPresence.tsx` (SVG) · `HologramBirth.tsx` (canvas 2D)
- สร้าง facade กลางที่อ่าน `evolutionStage` / `glowMult` จากที่เดียว → phase หลังใช้ facade ไม่ใช่ 3 ตัวแยก
- **ลำดับ:** facade (ใช้ได้ตั้งแต่ Phase 6) → แล้วค่อยทำ visual ใน Phase 7/8/9

> **อ้างอิง:** §4.1 Identity · C1 (§7 ของเอกสารนี้) · §10 TWIN BIRTH (Phase 6)
> **⚠️ ยังต้องขออนุมัติ A3** (แตะแก่น product) — ข้อเสนอแค่เรียงลำดับ ไม่ได้ขอข้ามการอนุมัติ

### D. Story payoff = highest leverage (NO FAKE STORY)

**ปัญหา:** ผู้ใช้รู้สึกว่า "ได้อะไร" จาก SELFPRINT ที่จุด "Twin Birth" — ถ้า first message generic
(= "Hi! Nice to meet you") จะพังความน่าเชื่อถือทันที

**ข้อเสนอ (2 อย่าง):**
1. **First message ต้องมาจาก real analysis (G6)** — ตรงกับ §51 RHYTHM TABLE
   (Twin Birth → First Reveal: ต้อง reference real analysis)
2. **เพิ่ม Story Provenance Strip** — แสดง **source of truth** ของ insight ที่แสดง
   เช่น "จาก 3 pattern ใน 2 สัปดาห์" → enforce "NO FAKE STORY" (§51 guardrail ข้อ 1)
   เพราะถ้า insight อ้างที่มาได้ ผู้ใช้จะ trust · ถ้าแสดงที่มาไม่ได้ = ไม่ควรแสดง

> **อ้างอิง:** §51 STORYTELLING ARCHITECTURE · G6 (§3 ของเอกสารนี้) · §10 TWIN BIRTH (Phase 6)

### E. Today Micro Story (Phase 8)

**ปัญหา:** §6 TODAY กำหนด "one primary insight" — แต่ UI เดิมมีแนวโน้มเป็นหลาย cards แข่งกัน

**ข้อเสนอ:** Phase 8 ทำ header "Twin มองว่าวันนี้อะไรสำคัญ" — แสดง **หนึ่ง insight เด่น** เท่านั้น
(ไม่ใช่หลาย cards แข่งกัน) · ตรงกับ §51 Layer 3 MICRO STORY

> **อ้างอิง:** §6 TODAY · §51 Layer 3 MICRO STORY · §45 emotional progression
> ("My Twin understands something about me")

### F. Performance note (chunk-intelligence)

**ปัญหา:** `chunk-intelligence` 345 kB (87.31 kB gzip) เป็น chunk ใหญ่สุด (B0.3) — ส่วนใหญ่คือ
Supabase SDK ถูกกลืนเข้าไป

**ข้อเสนอ:**
- **verify ใน Phase 0** (Performance Foundation) ก่อน decorate — ถ้า Supabase SDK ถูกกลืนจริง
  ต้อง **split ก่อน** ที่จะไปเพิ่ม visual decoration ลงในหน้าที่ใช้ chunk นี้
- **3D = canvas 2D เท่านั้น** (ย้ำ C5) — ไม่สร้าง WebGL ใหม่ · ใช้ `HologramBirth.tsx` (canvas 2D) ที่มีอยู่แล้ว

> **อ้างอิง:** B0.3 (bundle baseline) · §25 PERFORMANCE ARCHITECTURE · C5 (§7 ของเอกสารนี้)

---

> **สรุป addendum:** เพิ่ม deliverable ใน Phase 2/8 (typography) · เสนอ micro-phase 2a/4 (bridge pages) ·
> เรียงลำดับ C1 facade ก่อน visual · เพิ่ม Story Provenance Strip (enforce NO FAKE STORY) ·
> Today = one micro story · split chunk-intelligence ก่อน decorate
> **ทั้งหมดเป็นข้อเสนอ ไม่ใช่ commit — ต้องผ่าน §44 + do-not-touch zones ก่อน implement

---

## Consultation Addendum — Visual Storytelling + PWA (7 Sep 2026)

> **สถานะ:** เป็น **ข้อเสนอ** จาก consultation session (visual + PWA) — **ยังไม่ใช่ commit ที่ implement แล้ว**
> **วัน:** 7 ก.ย. 2026 · **HEAD:** `710afa0` (ล่าสุด `4ed4762`)
> **หลักการ:** append (ไม่แก้เนื้อหาเดิม) · ผ่าน **§44 safety rule** (RECOMPOSE ไม่ใช่ REBUILD) ·
> **ห้ามแตะ do-not-touch zones** (§10 ของเอกสารนี้)
> **โจทย์:** ทำให้ Track C **เป็น PWA มากกว่าเดิม** + **เล่าเรื่องด้วยวิชวลให้เหมาะขึ้น** + **UX/UI ดีขึ้น**

### A. PWA — จาก "installable" ไปสู่ "first-class PWA"

#### สถานะปัจจุบัน (ตรวจจากโค้ดจริง)

| สิ่ง | หลักฐาน | สถานะ |
|-----|---------|-------|
| **manifest.json** | `public/manifest.json` | ✅ มี — display standalone · icons 192/512 + maskable · 2 shortcuts |
| **Service worker** | `public/sw.js` v6 · register ที่ `src/main.tsx:39` | ✅ มี |
| **Install prompt** | `src/components/PWAInstallPrompt.tsx` | ✅ มี — `beforeinstallprompt` + iOS banner |
| **Icons** | `public/icons/icon-192x192.png` / `icon-512x512.png` + maskable | ✅ มี |

#### ช่องว่างที่ยังไม่เป็น "PWA เต็ม" (gap ที่ต้องปิด)

| # | ปัญหา | หลักฐาน | ผล |
|---|-------|---------|-----|
| **P1** | **SW precache เฉพาะ 3 ไฟล์** (`/`, `/index.html`, `/manifest.json`) — ไม่ precache app shell (hashed JS/CSS chunks) | `sw.js:17-21` | **offline จริง ๆ จะพัง** เพราะ asset อื่นไม่ได้ precache (network-first + cache fallback เท่านั้น) |
| **P2** | **Push icon/badge ชี้ `/logo.png`** ซึ่งไม่มีไฟล์จริง | `sw.js:187-188` | notification ไม่มี icon/badge |
| **P3** | **`screenshots: []` ว่าง** | `manifest.json:56` | install UI / store listing ไม่มีภาพ |
| **P4** | **`theme_color` ไม่ตรงกัน** — manifest `#5B5CEB` vs `index.html:24` `#4f46e5` | `manifest.json:10` / `index.html:24` | browser chrome เปลี่ยนสีไม่สม่ำเสมอ |
| **P5** | **`background_color: #FFFFFF`** สวนกับธีม dark navy (`data-mode="dark"` · navy `#0F1F3F`) | `manifest.json:9` / `index.html:9` | splash flash ขาวตอนเปิดแอป |
| **P6** | **ไม่มี `id`** ใน manifest | `manifest.json` | บาง install scenario ต้องการ |
| **P7** | **`start_url: /th/`** กำหนด TH เป็นค่าเริ่มต้น | `manifest.json:5` | EN user เปิดเข้า TH |
| **P8** | **Offline UI ไม่เป็นแบรนด์** — SW fallback คืน `/index.html` (อาจ blank) | `sw.js:100,113,141` | offline แล้วเห็นหน้า blank ไม่ใช่ "คุณออฟไลน์" |

#### ข้อเสนอ PWA (เพิ่มเข้า Track C)

| งาน | ลง phase ไหน | หมายเหตุ |
|-----|--------------|----------|
| **PWA audit baseline** (Lighthouse installability + offline test) | **Phase 1** (Performance Foundation) | วัดก่อน/หลัง · ตรงกับ "no numbers = no redesign" |
| **App shell precache** — precache hashed JS/CSS + static assets (vite-plugin-pwa / Workbox) | Phase 1 | **แตะ build pipeline → ต้องขออนุมัติ** (คล้าย A4 / C2) |
| **Fix push icon/badge** → ใช้ `icons/icon-192x192.png` จริง | Phase 1 | งานเล็ก |
| **Offline shell** — หน้า "คุณออฟไลน์" ที่เป็นแบรนด์ + ปุ่ม retry (แทน blank) | Phase 1/2 | งานเล็ก |
| **Manifest polish** — เพิ่ม `id` + `screenshots` + align `theme_color`/`background_color` กับแบรนด์ (navy/accent) | Phase 1/2 | งานเล็ก |
| **Install UX** — ปรับ `PWAInstallPrompt` ให้เข้ากับ bottom nav / safe-area + แสดงเฉพาะเมื่อ installable จริง | Phase 2 | งานเล็ก |
| **Standalone-aware UI** — detect `display-mode: standalone` → ปรับ chrome (ซ่อน install banner · safe-area inset) | Phase 2/8 | งานเล็ก |

> **อ้างอิง:** §25 PERFORMANCE ARCHITECTURE (load เฉพาะ route) · §14 (CSS atmosphere) ·
> Phase 1 (Performance Foundation) · Master Direction §35 (PWA)
> **⚠️ App shell precache แตะ build/deploy pipeline — ต้องขออนุมัติ** (ไม่ใช่แค่ CSS/UI)

### B. Visual storytelling — เล่าเรื่องด้วยวิชวล (ไม่ใช่ text)

§51 story layer มี **7 story primitives** — วิชวลต้องทำให้เรื่อง "มองเห็นได้" ไม่ใช่แค่ข้อความ

| Story primitive | วิชวลที่ควรใช้ | §topic |
|-----------------|----------------|--------|
| **Chapter** | atmosphere / gradient เปลี่ยนตาม chapter (World) | §14, §24 |
| **Story Beat** | micro-card เด่นหนึ่งใบ (Today) + provenance strip | §6, §51 |
| **Narrative Hook** | Twin visual + คำถามเปิด (ไม่ใช่ CTA การตลาด) | §7, §51 |
| **Reveal** | insight เผยแบบ reveal/skeleton (ไม่เด้ง) | §24, §35 |
| **Choice / Consequence** | fork-point visual + "since then" delta | §18, §51 |
| **Evolution** | gradual transformation visual (ไม่ใช่ badge ปลอม) | §17, §24 |

#### ข้อเสนอ visual storytelling

1. **Unify Twin visual (C1)** — ทำ `useTwinIdentity()` facade ก่อน (addendum ก่อนหน้า C) → Twin ตัวเดียว
   (orb/SVG/canvas 2D) ทุกหน้าตรงกัน · วิชวล Twin = "ตัวเอก" ของเรื่อง (§7)
2. **Atmosphere ตาม narrative beat (§14)** — CSS gradient/atmosphere เปลี่ยนตาม chapter/world ·
   **ไม่ใช้ heavy 3D** (C5)
3. **Motion มีความหมาย (§24)** — Awakening = slow emergence · Twin Birth = identity formation ·
   Insight = subtle emphasis · World = atmospheric shift · Evolution = gradual transformation ·
   **อย่า animate ทุกอย่าง**
4. **Provenance strip** — visual indicator ของ "ที่มา insight" (เช่น "จาก 3 pattern ใน 2 สัปดาห์") →
   trust + enforce NO FAKE STORY (§51 guardrail ข้อ 1)
5. **Today = one micro story** — หนึ่ง insight เด่น + visual emphasis (ไม่ใช่ cards แข่ง) (§6)
6. **Typography ไทย** — baseline/line-height/truncation สำหรับเรื่องเล่า (เชื่อม addendum ก่อนหน้า A)

### C. UX/UI improvements

| งาน | หลักการ | phase |
|-----|---------|-------|
| **ลด card density** (P0.6) | Today/Twin hub เป็น hierarchy เดียว ไม่ใช่ grid | Phase 8, 10 |
| **Micro-interaction สื่อ state** | hover/active/breathe ของ Twin สื่อ state (§24) | Phase 7, 9 |
| **Bilingual typography** | ไทย line-height/truncation (addendum A) | Phase 2, 8 |
| **Accessibility** | reduced-motion (RAFLOOP-001 มีแล้ว) + contrast + aria สำหรับ Twin visual | ทุก phase |
| **Loading/offline state** | skeleton แทน blank · offline shell (PWA A) | Phase 1, 2 |
| **App-like touch** | safe-area inset · swipe/gesture · standalone-mode UX | Phase 2, 8 |

> **อ้างอิง:** §23 VISUAL LANGUAGE (ultra-clean semi-realistic futuristic · cream/white neutral ·
> restrained accent · หลีกเลี่ยง overuse purple / heavy 3D) · §24 MOTION · §45 SUCCESS CRITERIA ·
> §46 CORE LOOP

---

> **สรุป addendum นี้:** PWA จาก "installable" → "first-class" (precache app shell · offline shell ·
> fix push icon · manifest polish · install UX) · visual storytelling ผ่าน 7 primitives (unify Twin ·
> atmosphere · motion มีความหมาย · provenance strip · one micro story) · UX/UI (ลด card density ·
> micro-interaction · accessibility · offline state · app-like touch)
> **ทั้งหมดเป็นข้อเสนอ ไม่ใช่ commit — ต้องผ่าน §44 + do-not-touch zones ก่อน implement**
> **⚠️ App shell precache แตะ build/deploy pipeline → ต้องขออนุมัติ** (คล้าย A4 / C2) ·
> **Twin unification (C1) ยังเป็น A3 ที่ต้องขออนุมัติ**

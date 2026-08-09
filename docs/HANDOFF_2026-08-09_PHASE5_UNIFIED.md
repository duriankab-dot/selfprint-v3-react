# 🤝 Handoff — 2026-08-09 — เฟส 5 รวมแผนเดียว

**อ่านไฟล์นี้คู่กับ `docs/HANDOFF_2026-08-08.md`** — ไฟล์นั้นคือสถานะ production ล่าสุด ไฟล์นี้คือการรวม "เฟส 5" ที่มี 3 ความหมายซ้อนกันให้เป็นแผนเดียว ตามที่ user ตัดสินใจ (2026-08-09)

---

## ทำไมต้องมีไฟล์นี้

ตอน user อัปโหลดเอกสาร Audit 8 ฉบับ + Handoff + Tasks Breakdown (การรวม Astrovera → Selfprint) พบว่าคำว่า **"เฟส 5"** ในโปรเจกต์นี้มีความหมายไม่ตรงกันถึง 3 แบบ:

| แหล่งที่มา | เฟส 5 หมายถึง |
|---|---|
| `docs/SELFPRINT_COMPLETE_ROADMAP_TH.md` | Analytics Events + A/B Testing + System Prompt Optimization + Documentation |
| เอกสาร Audit Astrovera (`AUDIT_5_MIGRATION_PLAN.md`) | Decision Support — เชื่อม Coach + Insight agent |
| `📋_HANDOFF_TO_TEAM_AI_DEV.md` (ในชุดเดียวกัน) | "Dashboard/Journal ใช้ Astrovera API" |

**User ตัดสินใจ:** รวมทั้งหมดเป็นแผนเดียว ไม่เลือกอันใดอันหนึ่ง

---

## แผนรวม (ลำดับที่ตกลงกัน)

Astrovera integration มาก่อน เพราะแก้ gap ที่ใหญ่ที่สุด (analysis depth) และ prompt optimization (5.7) ต้องใช้ข้อมูลจาก analytics (5.6) อยู่แล้ว เลยเรียงให้ analytics ไปอยู่หลัง Astrovera integration แทนที่จะทำคู่ขนาน

| # | งาน | มาจาก | สถานะ |
|---|------|-------|--------|
| 5.1 | **Foundation** — TypeScript types + adapter layer + fallback (Astrovera) | AUDIT_5 Phase 1 | ✅ เสร็จ (2026-08-09) |
| 5.2 | Psychology Integration — เรียก Astrovera จริงผ่าน Vercel Function | AUDIT_5 Phase 2 | 🟡 Endpoint เสร็จ + เทสผ่าน 67/67 (commit `96c3f17`) — **ยังไม่ได้เชื่อมกับ UI จริง และยังไม่เคยเทสเรียก Claude จริง (mock เท่านั้น)** |
| 5.3 | Numerology Enhancement — multi-domain confidence scoring | AUDIT_5 Phase 3 | 🔲 |
| 5.4 | Pattern Detection — Supabase `analysis_history`/`pattern_insights` tables + memory | AUDIT_5 Phase 4 | 🔲 |
| 5.5 | Decision Support — Coach + Insight agent, "Ask Coach" UI | AUDIT_5 Phase 5 | 🔲 |
| 5.6 | Testing & Staged Rollout (10%→50%→100%) | AUDIT_5 Phase 6 | 🔲 |
| 5.7 | Analytics Events (hub transitions, mood, 👍/👎, archetype accuracy) | ROADMAP เดิม 5.1 | 🔲 |
| 5.8 | System Prompt Optimization (ใช้ข้อมูลจาก 5.7) | ROADMAP เดิม 5.3 | 🔲 |
| 5.9 | Documentation (User/Archetype/Hub/Troubleshooting guide) | ROADMAP เดิม 5.4 | 🔲 |

A/B Testing (ROADMAP เดิม 5.2) พับรวมเข้ากับ 5.6 (staged rollout ก็คือรูปแบบหนึ่งของ A/B test อยู่แล้ว)

---

## สิ่งที่ทำไปแล้วรอบนี้ (5.1 Foundation)

**ไฟล์ใหม่:**
- `src/lib/types/astrovera.ts` — types ทั้งหมด (`AnalysisRequest`, `AnalysisResponse`, `AstroveraPsychologyInput/Output`, `AnalysisError`, `ArchetypeKey`)
- `src/lib/astrovera-adapter.ts` — `buildAnalysisRequest()`, `transformAnalysisResponse()`, `buildFallbackResponse()`, `handleAnalysisError()`, `isValidPsychologyOutput()`, `safeTransformAnalysisResponse()`
- `src/lib/__tests__/astrovera-adapter.test.ts` — 29 เทส, coverage ครบทุกฟังก์ชัน

**ยืนยันแล้ว (ไม่ใช่แค่เชื่อเอกสาร):**
- เช็คโค้ดจริงใน `D:\astrovera-v2\brain\` — โมดูล psychology, gateway, orchestrator มีอยู่จริงตรงตามที่เอกสาร audit อ้าง
- `archetypeKey` enum ของ Astrovera psychology module (`innocent, explorer, sage, everyman, lover, jester, hero, outlaw, magician, caregiver, creator, ruler`) เป็นชุดเดียวกับ Prototype Core ที่ Selfprint มีอยู่แล้ว (`src/lib/astrology.ts PROTOTYPE_CORE_MAP`) — แค่ตัวพิมพ์เล็ก/ใหญ่ต่างกัน → `toArchetypeKey()` แปลงตรงๆ ได้เลย ไม่ต้องสร้าง mapping ใหม่

**ยังไม่แก้ (รู้ตัว เป็น gap จริง ไม่ใช่ bug):**
- `phaseKey` ('a'|'b'|'c'|'d') — Astrovera ต้องการค่านี้จาก quiz แยกต่างหากที่ Selfprint ไม่มี ตอนนี้ derive จาก mood แบบ heuristic ชั่วคราว (ดู comment ใน `astrovera-adapter.ts`) — ต้องออกแบบคำถามจริงใน Phase 5.2+ ถ้าอยากได้ค่าที่แม่นกว่านี้
- `opportunities` — Astrovera Psychology output ไม่มี field นี้โดยตรง ตอนนี้ปล่อยเป็น `[]` แทนที่จะ mapping มั่วจาก field อื่น ต้องรอ Insight agent (5.5) มาเติม
- **`gateway.js` ของ Astrovera เรียก Cloudflare Worker URL ตรงๆ** ไม่ได้เรียก knowledge module โดยตรง — เอกสาร audit เองก็บอกว่าต้อง REDESIGN ส่วนนี้ก่อนใช้ใน Supabase Edge Function ยังไม่ได้ทำใน 5.1

**Zero functional change ยืนยันแล้ว:** ไฟล์ใหม่ทั้งหมดไม่มีที่ไหน import เข้า `src/pages` หรือ `src/components` เลย — `Onboarding.tsx` ยังเรียก `/api/nova` เหมือนเดิมทุกอย่าง ตามเป้าหมายของ Phase 1

---

## สิ่งที่ทำไปแล้วรอบนี้ (5.2 Psychology Integration)

**ไฟล์ใหม่:**
- `src/lib/astrovera-brain/_shared/outputSchema.js`, `src/lib/astrovera-brain/psychology/{system,instruction,examples,schema,version,index}.js` — vendor (copy ตรงๆ) จาก `D:\astrovera-v2\brain\knowledge\psychology\` เพราะไฟล์เป็น plain ES module ไม่มี dependency และ astrovera-v2 ไม่มี git remote ให้ผูก package จริง — แต่ละไฟล์มี comment หัวบอกว่า vendored ต้อง sync มือถ้าต้นทางเปลี่ยน
- `src/lib/astrovera-brain/psychology/index.d.ts` — ambient types ให้ TypeScript call site ไม่ต้องเป็น `any`
- `api/intelligence.ts` — Vercel function ใหม่ `/api/intelligence` (ตามแพทเทิร์นเดียวกับ `api/nova.ts` ที่มีอยู่แล้ว) — **ไม่ใช่ Supabase Edge Function ตามที่เอกสาร audit สมมติไว้** เพราะเช็คแล้วว่า Selfprint deploy จริงเป็น Vercel serverless functions (`ls api/`) ไม่มี `supabase/functions/` เลย
- `api/__tests__/intelligence.test.ts` — 8 เทส mock `@anthropic-ai/sdk`

**ตัดสินใจที่เคยค้างไว้ (แก้แล้ว):**
1. ~~Redesign gateway.js~~ → **ข้าม gateway.js/orchestrator.js ไปเลย** เรียก `psychology/index.js`'s `buildPrompt()` + Anthropic SDK ตรงจาก `api/intelligence.ts` (ไม่มี Cloudflare Worker layer)
2. ~~ASTROVERA_API_KEY~~ → **ใช้ `ANTHROPIC_API_KEY` ตัวเดียวกับ `/api/nova`** ไม่แยก key
3. Solo dev scope → ตัด load test/multi-day rollout ออกจริง เหลือแค่ unit test (mock) + manual smoke test ก่อน deploy

**ยังไม่ทำ (gap จริง ไม่ใช่ bug):**
- **ยังไม่เคยเรียก Claude จริง** — sandbox นี้ไม่มี `ANTHROPIC_API_KEY` เข้าถึงได้ เทสทั้งหมด mock `@anthropic-ai/sdk` เท่านั้น ต้องรอ deploy ขึ้น Vercel จริง (มี env จริง) แล้วยิงลอง manual ก่อนเชื่อ UI
- **ยังไม่เชื่อมกับ `Onboarding.tsx`** — `/api/intelligence` ยืนอิสระ ไม่มีที่ไหน import (`grep` ยืนยันแล้ว) — Onboarding ยังเรียก `/api/nova` เหมือนเดิม 100%
- `phaseKey` ยังเป็น mood heuristic เหมือนเดิม (ไม่ได้แก้ใน 5.2 — ตามแผนเดิมคือรอ Phase 5.2+ ถ้าต้องการแม่นกว่านี้ แต่รอบนี้เน้นให้ endpoint ทำงานได้ก่อน)

---

## ก่อนใช้งาน 5.2 จริง (ต้องตัดสินใจ/ทำต่อ)

1. **เทสเรียก Claude จริง** — deploy `api/intelligence.ts` ขึ้น Vercel (หรือรัน `vercel dev` ในเครื่องที่มี `ANTHROPIC_API_KEY`) แล้วยิง POST ทดสอบดูว่า Claude ตอบตรง schema ที่ `validate()` เช็คไหม
2. **เชื่อมกับ UI** — จะแทนที่ `/api/nova` เดิมใน `Onboarding.tsx`'s `analyzeFinetuneAnswers` เลย หรือเพิ่มเป็นทางเลือกเสริม (fallback เดิมยังอยู่)?
3. ต่อ 5.3 Numerology Enhancement ตามแผนรวมด้านบน

---

**Last Updated:** 2026-08-09
**Prepared by:** Claude

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
| 5.2 | Psychology Integration — เรียก Astrovera จริงผ่าน Supabase Edge Function | AUDIT_5 Phase 2 | 🔲 ยังไม่เริ่ม — ต้องมี `ASTROVERA_API_KEY` env + ตัดสินใจว่าจะ redesign gateway.js จาก Cloudflare Workers call เป็นเรียก knowledge module ตรงยังไง |
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

## ก่อนเริ่ม 5.2 (Psychology Integration) ต้องตัดสินใจ

1. **Redesign gateway.js อย่างไร** — เรียก `psychology/index.js`'s `buildPrompt()` + Anthropic SDK ตรงจาก Supabase Edge Function (ตัด Cloudflare Worker layer ออกทั้งหมด) หรือ deploy Cloudflare Worker แยกแล้วให้ Edge Function เรียกอีกที?
2. **`ASTROVERA_API_KEY`** — ตอนนี้ยังไม่มีใน `.env` ของ Selfprint (Astrovera เดิมใช้ Anthropic API ของตัวเอง ต้องเช็คว่าจะแชร์ key เดียวกับ `/api/nova` หรือแยก)
3. **Solo dev scope** — เอกสาร audit เขียนแบบทีม (Engineer 1/2 + DevOps + "Astrovera Team" แยกทีม) 28 วัน ต้องตัด scope ให้เหมาะกับคนเดียว + AI — แนะนำตัด Block 4's "100 concurrent users load test" และ multi-day staged rollout (10%→50%→100% ข้ามวัน) ให้เหลือ manual smoke test ก่อน deploy จริง

---

**Last Updated:** 2026-08-09
**Prepared by:** Claude

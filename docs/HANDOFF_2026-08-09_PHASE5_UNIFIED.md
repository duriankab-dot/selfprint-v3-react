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
| 5.2 | Psychology Integration — เรียก Astrovera จริงผ่าน Vercel Function | AUDIT_5 Phase 2 | 🟢 Endpoint + UI wiring เสร็จ (commit `96c3f17`, `acfa67d`, `7bb7a7a`) เทสผ่าน 67/67, tsc/build/lint สะอาด — **ยังไม่เคยเทสเรียก Claude จริง (mock เท่านั้น จนกว่าจะ deploy)** |
| 5.3 | Numerology Enhancement — confidence reflects real vs. defaulted birth date | AUDIT_5 Phase 3 | ✅ เสร็จ (commit `b2696bd`) — เทส 88/88 ผ่าน |
| 5.3.5 | **[ใหม่]** Safety Layer — keyword gate (ฆ่าตัวตาย/การพนัน/การลงทุน/การแพทย์) ก่อนส่งให้ Claude | Master Task audit (2026-08-09) | ✅ เสร็จ (commit `030dc78`) — เทส 78/78 ผ่าน, tsc/build/lint สะอาด |
| 5.4 | Pattern Detection — สร้างบน `decision_log` + เชื่อมท่อเขียนที่หายไป | AUDIT_5 Phase 4 (ปรับ scope ตาม audit) | ✅ เสร็จ (commit `d630e5c`) — เทส 96/96 ผ่าน |
| 5.5 | Decision Support — `/api/coach` endpoint + UI (`AskCoach.tsx` ใน Dashboard) | AUDIT_5 Phase 5 (ปรับ scope ตาม audit) | ✅ เสร็จครบ (backend `ed819f4`, UI `3ed6454`) — เทส 132/132 ผ่าน |
| 5.6 | Testing & Staged Rollout (10%→50%→100%) | AUDIT_5 Phase 6 | ✅ เสร็จ (commit `3ed6454`) — `src/lib/rollout.ts` deterministic hash gate, gate ปุ่ม Ask Coach ผ่าน `VITE_COACH_ROLLOUT_PERCENT` |
| 5.7 | Analytics Events (hub transitions, mood, 👍/👎, archetype accuracy) | ROADMAP เดิม 5.1 | ✅ เสร็จ (commit `3ed6454`) — ตาราง `analytics_events` ใหม่ (migration 007) + `src/services/analytics.ts` |
| 5.8 | System Prompt Optimization + **Confidence Reconciliation** (ดู Master Task audit ด้านล่าง) | ROADMAP เดิม 5.3 | ✅ Confidence Reconciliation เสร็จ (commit `3ed6454`, `reconcileConfidence()`) — System Prompt Optimization: ทบทวนแล้ว ไม่แก้ (ดูเหตุผลด้านล่าง) |
| 5.9 | Documentation (User/Archetype/Hub/Troubleshooting guide) | ROADMAP เดิม 5.4 | ✅ เสร็จ (`docs/USER_GUIDE_TH.md`) |

A/B Testing (ROADMAP เดิม 5.2) พับรวมเข้ากับ 5.6 (staged rollout ก็คือรูปแบบหนึ่งของ A/B test อยู่แล้ว)

---

## Master Task Audit (2026-08-09) — ตรวจ astrovera-v2 ลึกจริง เปลี่ยน scope ของ 5.4/5.5

User ส่ง framework audit แบบละเอียด (18 phases) มาให้ผสานเข้าแผน — แทนที่จะทำ audit แบบเป็นทางการครบ 8 ไฟล์ตาม framework (ใช้โทเคนเยอะเกินจำเป็น) เลือกทำ audit เจาะจุดที่ยังไม่เคยตรวจ (Journey/Pattern/Decision/Journal, Data Model, Safety) แล้วผสานผลเข้าแผน 5.3-5.9 ที่มีอยู่โดยตรง — **ผลลัพธ์เปลี่ยนความเข้าใจเรื่อง Astrovera ไปมาก**

### สิ่งที่เจอ: "Journey / Pattern / Decision / Journal" ของ Astrovera ส่วนใหญ่ไม่มีจริง

ตรวจ `brain/agents/*.js` ทั้ง 8 ไฟล์ (coach, insight, planner, reflector, research, narrator, synthesizer, narrative) แบบอ่านโค้ดจริงทีละบรรทัด พบว่า **ทุกไฟล์เป็นแค่ wrapper บาง ๆ ที่ยิง prompt ไป Claude Haiku ตรงๆ ไม่มี state ไม่มีข้อมูลย้อนหลัง ไม่มี logic วิเคราะห์จริง**:

| ไฟล์ | ชื่อดูเหมือนจะเป็น | ความจริงจากโค้ด |
|---|---|---|
| `insight.js` | Life Pattern Analysis | ถาม LLM ดู request เดียว (snapshot เดียว) ไม่มีการอ่านข้อมูลย้อนหลัง ไม่มี pattern detection จริง |
| `reflector.js` | Journal/Reflection | สร้างคำถามสะท้อนคิด 2-3 ข้อจาก request ปัจจุบัน **ไม่เคยอ่าน journal entry จริงเลย** |
| — | Journey system | **ไม่มีไฟล์นี้อยู่จริงใน `brain/` เลย** — มีแค่ `js/features/journey/journey.js` ฝั่ง frontend เก่า ที่เป็น localStorage checklist เกมมิฟิเคชัน ไม่เกี่ยวกับ life-stage engine |
| — | Decision Intelligence | `js/features/scenario/scenario.js` ฝั่ง frontend มีชื่อ "Scenario Intelligence" แต่ตัวเลข success % เป็น **ค่า hardcode ตายตัว** (เช่น 78, 68, 60) ไม่ได้คำนวณจากอะไรเลย |

**สรุป:** ไม่มี Journey/Pattern/Decision/Journal engine ที่แท้จริงให้ "migrate" — งานพวกนี้ต้องออกแบบ/สร้างเองให้ Selfprint ทั้งหมด ไม่ใช่ adapt จาก Astrovera

### ข่าวดี: Selfprint มีฐานที่ดีกว่า Astrovera อยู่แล้วสำหรับ Pattern Detection

ตรวจ `supabase/migrations/003_decision_log_autonomy_tracking.sql` + `src/services/supabase-service.ts` พบว่า **Selfprint มีตาราง `decision_log` ที่ทำงานจริงอยู่แล้ว** (VERIFIED IMPLEMENTED — insert/query จริงจาก `supabase-service.ts`, RLS เปิดแล้ว, ใช้แสดงผลใน `Dashboard.tsx`):
- เก็บ `user_id, hub, mood, autonomy_level, confidence, hesitation, response_time_ms` ต่อ interaction พร้อม timestamp
- มี view `autonomy_analytics` (avg ต่อ user/hub/mood) พร้อมใช้แล้ว

เทียบกับ astrovera_profiles ของ Astrovera เอง (ตาราง JSON blob เดียวรวมทุกอย่าง ไม่มี schema จริง) → **`decision_log` ของ Selfprint ดีกว่า เป็นฐานที่ถูกต้องสำหรับ 5.4 Pattern Detection อยู่แล้ว ไม่ต้องสร้างตารางใหม่หรือ migrate อะไรจาก Astrovera**

พบเอกสาร `docs/DATABASE_SCHEMA_V2_0_TH.md` ใน astrovera-v2 ที่เขียนว่า "Production Ready ✅" (ตาราง decisions/reflections/experiments/timeline ฯลฯ) แต่ grep ทั้ง repo แล้ว **ไม่มีโค้ดที่เรียกตารางพวกนี้เลยสักบรรทัด** — จัดเป็น `DOCUMENTED BUT NOT IMPLEMENTED` ใช้เป็นไอเดียชื่อ field ได้ แต่ไม่ใช่โค้ดที่ทำงานจริง

### สิ่งที่เจอว่า "ของจริง" และควรเอามาใช้ (นอกเหนือจาก Psychology ที่ทำไปแล้ว)

| Capability | สถานะจริงใน astrovera-v2 | Classification | เหตุผล |
|---|---|---|---|
| `truth.js` + `responseProtocol.js` (confidence reconciliation) | ✅ VERIFIED IMPLEMENTED — deterministic, ไม่ใช้ LLM, clamp AI confidence ให้อยู่ในกรอบที่ evidence รองรับจริง | C — REBUILD USING LOGIC | `api/intelligence.ts` ตอนนี้เชื่อ `confidence` จาก Claude ตรงๆ ไม่มีชั้นตรวจสอบ — แนวคิดนี้เอามาทำเองได้ ไม่ต้อง copy โค้ด |
| `safety.js` (keyword safety gate) | ✅ VERIFIED IMPLEMENTED — เช็ค keyword ฆ่าตัวตาย/การแพทย์/การพนัน/การลงทุน พร้อมข้อความ redirect จริง (เช่น สายด่วน 1323) | A/B — MIGRATE/ADAPT | **Selfprint ไม่มี safety layer นี้เลยใน `/api/nova` หรือ `/api/intelligence`** — เป็น gap ที่ควรปิดเร็ว ย้ายมาใส่ไว้ 5.3.5 |
| orchestrator's "ยิงหลาย agent พร้อมกันแล้ว synthesize" pattern | ✅ ใช้งานจริงใน production path (`Promise.allSettled([coach, insight, planner, reflector, research])`) แต่แต่ละ agent เป็นแค่ prompt wrapper | C — REBUILD USING LOGIC (ถ้าต้องการ "Ask Coach" ใน 5.5) | เอาแนวคิด ไม่ใช่โค้ด — เขียนเองจะได้ context ที่ตรงกับ Selfprint มากกว่า |
| `registry.js` (knowledge module lookup) | ⚠️ IMPLEMENTED BUT UNUSED — แม้แต่ `orchestrator.js` ต้นทางเองก็ไม่เรียกไฟล์นี้ (import knowledge module ตรงๆ แทน) | D — DO NOT MIGRATE | dead code ตั้งแต่ต้นทาง |
| Knowledge module อีก 9 ตัว (numerology/bazi/vedic/human-design/kua/gene-keys/thai-astrology/blood/astrology) | ✅ โครงสร้างไฟล์เหมือน psychology (system/instruction/examples/schema) แต่ `version.js` ระบุ `status: 'draft', owner: 'unassigned'` เอง | B — ADAPT (ถ้าจะทำ) | vendor ได้แบบเดียวกับ psychology แต่ต้องเลือกว่าจะเปิดโดเมนไหน (Selfprint ต้องไม่กลายเป็น astrology app ตามกติกาของ user เอง) — ยังไม่ทำตอนนี้ |

### 🔴 บั๊กเดิมที่เจอระหว่างเริ่ม 5.5: `userId` ผี (commit `f722c94`)

ก่อนต่อยอด 5.4 เป็น 5.5 ไปเช็คว่า pattern detection จะรันจริงไหม เจอว่า `useChat.ts`/`Dashboard.tsx` ใช้ `localStorage.getItem('userId')` เป็นตัวระบุผู้ใช้ — **แต่ไม่มีที่ไหนในทั้งโปรเจกต์เคย `setItem('userId', ...)` เลย** (grep ทั่ว `src/` ยืนยันแล้ว) ทำให้ `userId` เป็น `'anonymous'` เสมอ → เงื่อนไข `if (userId !== 'anonymous')` เป็น false ตลอด → `saveMessage()`/`saveAutonomyLog()` (รวมถึง 5.4 ที่เพิ่งต่อไป) **ไม่เคยรันจริงในโค้ดที่ deploy อยู่เลย** — Dashboard insights/trend/pattern ทั้งหน้าน่าจะว่างเปล่ามาตลอด

ระบบ Auth จริงมีอยู่แล้ว (`AuthContext.tsx`, Supabase magic link) และไฟล์อื่นอย่าง `AITwinSection`/`NavBar`/`ClaimAccount`/`ShareButton` ใช้ `useAuth()` ถูกต้องหมด — มีแค่ 2 ไฟล์นี้ที่หลงเหลือโค้ดจากระบบ identity เก่าที่ไม่มีจริง

**ถามผู้ใช้ก่อนแก้** → เลือกแก้ทันที: เปลี่ยนทั้งสองไฟล์ให้ใช้ `useAuth()`'s `session.user.id` แทน `localStorage 'userId'`

### 5.4 อัปเดต (หลังลงมือจริง): เจอ gap ที่ใหญ่กว่าที่ audit ทำนายไว้

ตอนเริ่ม 5.4 จริง เจอว่า `decision_log` **ไม่มีข้อมูลไหลเข้าเลย** — `saveAutonomyLog()` (ฟังก์ชันเดียวที่เขียน autonomy_level/confidence/hesitation ลงตาราง) ไม่มีที่ไหนเรียกใช้ในแอปจริงเลย (`useChat.ts` เรียกแค่ `saveMessage()` ซึ่งเขียนลง `chat_messages` คนละตาราง) — เท่ากับ Dashboard insights/trend ทั้งหมดว่างเปล่าบน production ก่อนหน้านี้

**ถามผู้ใช้ก่อนแก้** (ตัวเลือก: เชื่อมท่อจริง / ข้ามไปทำ 5.5 ก่อน / ขอรายละเอียดเพิ่ม) → เลือก **เชื่อมท่อจริง**

แก้โดยเรียก `saveAutonomyLog()` ใน `useChat.ts` ทุกครั้งที่มีการสนทนา ใช้เฉพาะสัญญาณจริงที่มี ไม่เดามั่ว:
- `autonomy_level` = ค่า slider ที่ user ตั้งเอง (ของจริง)
- `confidence` = autonomy_level/100 (ใช้สัญญาณเดียวกัน เพราะยังไม่มีการวัดความมั่นใจแยก)
- `hesitation` = 0.5 คงที่ (**ยังไม่มีสัญญาณจริงมาคำนวณ** — ใส่ตรงๆว่าไม่รู้ ดีกว่าเดาตัวเลข)
- `response_time_ms` = เวลาที่ Claude API ตอบกลับ (ของจริง แต่เป็น API latency ไม่ใช่เวลาคิดของ user — ระบุ comment ชัดกันสับสน)
- `message_length`/`response_length` = ความยาวข้อความจริง

จากนั้นสร้าง `src/lib/patternDetection.ts` — `detectPatterns()` เทียบ autonomy/confidence ครึ่งแรกกับครึ่งหลังของประวัติ user, แจ้งเฉพาะเมื่อ delta มีนัยสำคัญ (กัน noise), ต้องมีข้อมูลอย่างน้อย 6 จุด (กัน "pattern" ปลอมจาก user ใหม่ที่เพิ่งใช้ไม่กี่ครั้ง) — แสดงผลใน Dashboard ส่วน "รูปแบบที่พบ"

**ยังไม่ทำ (ตั้งใจตัดขอบเขต):** mood/hub-specific correlation (เช่น "มั่นใจน้อยลงเวลาเครียด") ต้องขยาย query เพิ่ม hub/mood เข้า `getAutonomyTrend()` — เก็บไว้ทำรอบหน้า

### ผลต่อแผนเดิม

- **5.4 (Pattern Detection):** เปลี่ยนจาก "สร้างตาราง `analysis_history`/`pattern_insights` ใหม่" → **วิเคราะห์ข้อมูลจาก `decision_log` ที่มีอยู่แล้ว** (autonomy/confidence/hesitation trend ต่อ user ต่อ hub ต่อ mood ตามเวลา) — งานเบาลง ไม่ต้อง migration ตาราง
- **5.5 (Decision Support):** เปลี่ยนจาก "adapt Coach + Insight agent" → **rebuild เองทั้งหมด** โดยใช้แนวคิด "หลาย perspective + synthesize" จาก orchestrator เป็นแรงบันดาลใจ ไม่ใช่ code migration
- **5.3.5 (ใหม่):** Safety Layer — ของจริงที่ควรทำเร็วเพราะเป็น production gap ที่มีอยู่จริงตอนนี้
- **5.8:** เพิ่ม Confidence Reconciliation (จาก `truth.js`/`responseProtocol.js` pattern) เข้าไปด้วย

---

## phaseKey / Analytics Dashboard / gateway.js follow-ups (2026-08-09, commit ถัดจาก `344632a`)

User สั่งให้ปิด 3 gap ที่เหลือจากเอกสารเก่า:

**1. phaseKey — เพิ่มคำถามจริงแทน mood heuristic:**
ไปอ่านโค้ดจริงใน `D:\astrovera-v2\js\data\static-data.js` (`LIFE_PHASES`) และ `index.html` (`#q3`) เจอคำถามและตัวเลือกจริงที่ต้นทางใช้เก็บ phaseKey (ไม่ใช่แค่ enum เฉยๆ ที่ vendored schema/instruction ไม่มีคำอธิบาย): "ในช่วงชีวิตตอนนี้ คุณรู้สึกอย่างไร?" — 4 ตัวเลือกตรงกับ a=ช่วงสร้าง(Building), b=ช่วงขยาย(Expanding), c=ช่วงพัก(Reflecting), d=ช่วงเปลี่ยนผ่าน(Transforming) เพิ่มเป็น `q5` ใน `FinetuningQuestions.tsx` (คำถาม+ตัวเลือกเดียวกับต้นทางเป๊ะ ไม่ได้แต่งเอง) แล้วเพิ่ม `answerToPhaseKey()`/`resolvePhaseKey()` ใน `astrovera-adapter.ts` — ใช้คำตอบจริงจาก q5 ก่อนเสมอ, mood heuristic เดิมเหลือเป็น fallback สำหรับกรณี skip fine-tune step เท่านั้น (ไม่ได้ลบทิ้ง เพราะ fine-tune ยัง skip ได้)

**2. Analytics Dashboard — query + แสดงผล `analytics_events`:**
`getAnalyticsSummary()` ใหม่ใน `src/services/analytics.ts` — อ่าน event ทั้งหมดของ user (RLS จำกัดเป็นข้อมูลตัวเองอยู่แล้ว ไม่ใช่ admin-wide) แล้ว aggregate ฝั่ง client (แพทเทิร์นเดียวกับ `getDashboardInsights()` ใน `supabase-service.ts`): hub ที่ไปบ่อยที่สุด, จำนวนครั้งที่เปลี่ยน mood, สัดส่วน feedback 👍/👎, ความแม่นยำ archetype ล่าสุด — component ใหม่ `AnalyticsSummary.tsx` แสดงเป็นการ์ดใน Dashboard (ซ่อนตัวเองถ้ายังไม่มี event เลย ไม่โชว์การ์ดว่างเปล่า) export `HUB_OPTIONS` จาก `HubSwitcher.tsx` เพิ่มเพื่อใช้ label/icon เดียวกัน ไม่สร้าง hub-name map ซ้ำ

**3. gateway.js redesign — ตรวจแล้วไม่ต้องทำ:**
grep ทั้ง `src/`+`api/` หาคำว่า "gateway" ไม่เจอเลยสักที่ — ยืนยันว่า item นี้ถูกปิดไปแล้วจริงตั้งแต่การตัดสินใจใน Phase 5.2 ("ข้าม gateway.js/orchestrator.js ไปเลย เรียก psychology module ตรง") ที่บันทึกไว้แล้วในหัวข้อ 5.2 ด้านล่าง เอกสารเก่าใน section 5.1 ยังพูดถึง item นี้ว่า "ยังไม่ได้ทำ" ซึ่งล้าสมัยไปแล้ว — แก้ให้ตรงสถานะจริงแล้ว (ดู strikethrough ด้านบน)

**Verify:** เทสรวม (นับหลัง commit นี้) ผ่านหมด — tsc/oxlint/build สะอาด รายละเอียดตัวเลขดูใน commit message

---

## สิ่งที่ทำไปแล้วรอบนี้ (5.5 UI → 5.9, commit `3ed6454`)

**5.5 UI (Ask Coach):** `src/components/dashboard/AskCoach.tsx` + `.css` — เชื่อม `/api/coach` (backend เสร็จตั้งแต่ `ed819f4`) เข้า Dashboard จริง ดึง `birthDate` จาก `/api/profile`, `mood` จาก `EmotionContext`, ส่งคำถามอิสระ แสดงคำตอบ + จำนวน pattern ที่ใช้ประกอบคำตอบ ถูก gate ด้วย staged rollout (5.6)

**5.6 (Staged Rollout):** `src/lib/rollout.ts` — ไม่มี feature-flag service ในโปรเจกต์ (solo dev) จึงใช้ deterministic hash แทน: `isInRollout(userId, featureKey, percent)` คนเดิม featureKey เดิมได้ผลเดิมเสมอ (ไม่กระพริบเปิด-ปิดตอน reload) ปรับ % แบบขั้นบันได (10→50→100) ได้จากตัวแปรเดียว `VITE_COACH_ROLLOUT_PERCENT` ไม่ต้องแก้โค้ด

**5.7 (Analytics Events):** ตารางใหม่ `analytics_events` (migration 007, แยกจาก `decision_log`/`chat_messages`) + `src/services/analytics.ts` (`logEvent()`, fire-and-forget, ไม่ log ถ้าไม่มี userId จริง — เรียนจากบั๊ก userId ผีที่เจอใน 5.4/5.5) เชื่อมเข้า 4 จุด:
- `HubContext.switchHub()` → `hub_transition`
- `EmotionContext.updateMood()` → `mood_change`
- `ChatPage.tsx` (ปุ่ม 👍/👎 ใต้ข้อความ Nova แต่ละอัน) → `feedback`
- `PendingOnboardingSaver.tsx` (หลัง save profile/blueprint สำเร็จ — จุดแรกที่มี userId จริงพร้อม accuracy) → `archetype_accuracy`

**ตัดสินใจทางเทคนิคที่น่าสังเกต:** `HubContext`/`EmotionContext` เป็น context ระดับล่างที่มีเทสยืนอิสระ (ไม่ห่อด้วย `AuthProvider`) — เรียก `useAuth()` ตรงๆ จะ throw ในเทสเหล่านั้น แก้โดย export `AuthContext` (ตัว context object) เพิ่มจาก `AuthContext.tsx` แล้วอ่านผ่าน `useContext(AuthContext)` แบบ optional (`undefined` ถ้าไม่มี provider → ไม่ log แค่นั้น ไม่ throw) แทนการบังคับทุกที่ต้องอยู่ใต้ `AuthProvider`

**5.8 (Confidence Reconciliation):** `reconcileConfidence(claimedConfidence, evidenceCount)` ใน `astrovera-adapter.ts` — แนวคิดจาก astrovera-v2's `truth.js`/`responseProtocol.js` (deterministic, ไม่ใช้ LLM) แต่เขียนเองใหม่ทั้งหมด ไม่ copy โค้ด: clamp `confidence` ที่ Claude รายงานเองให้อยู่ในเพดานที่ผูกกับจำนวน `evidence[]` ที่ Claude อ้างจริง (0 evidence → เพดาน 0.5, 1 → 0.65, 2 → 0.8, 3+ → 1.0) กัน Claude รายงาน "มั่นใจ 0.95" โดยไม่มี evidence รองรับ ผูกเข้า `transformAnalysisResponse()` แล้ว

**5.8 (System Prompt Optimization — ตัดสินใจไม่แก้):** ทบทวน `api/utils/prompt-builder.ts` (66 persona string: 11 hub × 6 mood) แล้ว — ไม่พบ gap เชิงเทคนิคที่ต้องแก้ การ "optimize" เนื้อหา persona/starter message เป็นการเปลี่ยนแปลงเชิง UX/product ที่ไม่มีคนสั่ง (ต่างจาก Confidence Reconciliation ที่เป็น gap เทคนิคจริง) จึงไม่แตะ — ถ้าต้องการปรับ ต้องตัดสินใจแยกต่างหากว่าจะปรับโทน/เนื้อหาไปทางไหน

**5.9 (Documentation):** `docs/USER_GUIDE_TH.md` ใหม่ — ครอบคลุม Hub ทั้ง 12, Mood ทั้ง 6, Prototype Core (12 archetype + ตาราง Life Path Number mapping), Dashboard แต่ละส่วนหมายถึงอะไร, วิธีใช้ Ask Coach, และ Troubleshooting คำถามที่พบบ่อย 6 ข้อ เขียนสำหรับผู้ใช้ปลายทาง (ต่างจากไฟล์นี้ที่เป็น technical handoff)

**Verify:** เทสรวม 132/132 ผ่าน (จาก 107), `tsc -b --force` สะอาด, standalone `tsc` บน `api/*.ts` สะอาด, `oxlint` 0 error (เพิ่ม warning เดิม pattern 1 ตัวจากการ export `AuthContext`), `npm run build` ผ่าน

~~**ยังไม่ทำ (นอก scope รอบนี้ ไม่ใช่บั๊ก):** analytics_events ยังไม่มี dashboard ของตัวเอง~~ **แก้แล้ว** — ดูหัวข้อ "phaseKey / Analytics Dashboard / gateway.js follow-ups" ด้านบน

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
- ~~`phaseKey` ('a'|'b'|'c'|'d') — derive จาก mood แบบ heuristic ชั่วคราว~~ **แก้แล้ว** (ดูหัวข้อ "phaseKey/Analytics Dashboard/gateway.js follow-ups" ด้านล่าง)
- `opportunities` — Astrovera Psychology output ไม่มี field นี้โดยตรง ตอนนี้ปล่อยเป็น `[]` แทนที่จะ mapping มั่วจาก field อื่น ยังไม่มี Insight agent จริงที่จะเติม field นี้ได้อย่างมีมูล (ดู Master Task Audit — astrovera-v2 ไม่มี Insight agent ที่ทำงานจริง) ยังปล่อยว่างต่อไปตามเดิม
- ~~`gateway.js` ของ Astrovera เรียก Cloudflare Worker URL ตรงๆ ยังไม่ได้ REDESIGN~~ **ตรวจแล้ว ไม่ต้องทำ** (ดูหัวข้อด้านล่าง — Selfprint ไม่เคยพึ่ง gateway.js เลยตั้งแต่ 5.2)

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

**สิ่งที่ทำเพิ่ม (UI wiring, commit `7bb7a7a`):**
- `Onboarding.tsx`'s `analyzeFinetuneAnswers()` (เรียก `/api/nova` + prompt เอง + regex-extract JSON) ถูกแทนที่ด้วย `analyzeWithAstrovera()` เรียก `/api/intelligence` ตรงๆ — ได้ JSON ที่มี schema ชัดเจนกลับมาเลย ไม่ต้อง regex
- Local type `AnalysisProfile` + `buildFallbackAnalysisProfile()` ถูกลบ แทนด้วย `AnalysisResponse` + `buildFallbackResponse()` จริงจาก `astrovera-adapter.ts` (Phase 5.1) — ลด logic ซ้ำซ้อนที่เอกสารเคยตั้งข้อสังเกตไว้
- `FullAnalysis.tsx` เพิ่มการ์ด "⚠️ จุดที่ควรระวัง" แสดง `blindSpots` ที่แต่ก่อนส่งมาถึง component แล้วแต่ไม่เคย render เลย

**ยังไม่ทำ (gap จริง ไม่ใช่ bug):**
- **ยังไม่เคยเรียก Claude จริง** — sandbox นี้ไม่มี `ANTHROPIC_API_KEY` เข้าถึงได้ เทสทั้งหมด mock `@anthropic-ai/sdk` เท่านั้น ต้องรอ deploy ขึ้น Vercel จริง (มี env จริง) แล้วยิงลอง manual/สมัคร onboarding จริงดูก่อนเชื่อเต็มที่
- `phaseKey` ยังเป็น mood heuristic เหมือนเดิม (ไม่ได้แก้ใน 5.2 — ตามแผนเดิมคือรอ Phase 5.2+ ถ้าต้องการแม่นกว่านี้ แต่รอบนี้เน้นให้ endpoint ทำงานได้ก่อน)
- `accuracy` หลัง fine-tune ยัง hardcode เป็น 85% เหมือนเดิม ไม่ได้ผูกกับ `confidence` จริงจาก Astrovera (0.6 ตอน fallback, ค่าจริงตอนเรียก Claude สำเร็จ) — จงใจไม่แตะ เพราะเป็นการเปลี่ยนพฤติกรรม UX ที่ไม่มีคนขอ (ข้อความ "ความชัดเจนมากกว่า 85%" ใน `FullAnalysis.tsx` จะขัดกับตัวเลขจริงถ้าผูกไว้ตอนนี้) — ถ้าอยากให้ผูกจริง ต้องตัดสินใจ/สั่งแยกต่างหาก

---

## ก่อนใช้งาน 5.2 จริง (ต้องตัดสินใจ/ทำต่อ)

1. ~~**เทสเรียก Claude จริง**~~ **ทำแล้ว (2026-08-09 รอบบ่าย) — เจอ production พังจริง ดูหัวข้อด้านล่าง**
2. ต่อ 5.3 Numerology Enhancement ตามแผนรวมด้านบน

---

## 🔴 สิ่งที่ทำไปแล้วรอบนี้ (opportunities จริง, hub/mood correlation, autonomy-log จริง, code splitting) — commit `a116daa`

**opportunities:** `safeTransformAnalysisResponse()` เติมจาก `getLifePathProfile(lifePathNumber).opportunities` จริง (คำนวณจากวันเกิดจริง) แทนที่จะปล่อย `[]` ตลอดไปตามที่ค้างไว้ใน 5.1 — ไม่ใช่ Insight agent ใหม่ แค่ reuse แหล่งเดียวกับที่ `buildFallbackResponse()` ใช้อยู่แล้ว

**hub/mood correlation:** `getAutonomyTrend()` (และ `/api/coach`'s decision_log query) เพิ่ม `hub, mood` เข้า select — `patternDetection.ts`'s `detectPatterns()` เพิ่ม `detectGroupCorrelation()` หา correlation ระหว่าง mood→confidence และ hub→autonomy_level โดยเทียบค่าเฉลี่ยกลุ่มนั้นกับค่าเฉลี่ยกลุ่มอื่นที่เหลือ (ไม่ใช่เทียบกับค่าเฉลี่ยรวมที่รวมตัวเองด้วย) ต้องมีอย่างน้อย 3 จุดต่อกลุ่ม (`MIN_GROUP_POINTS`) และรวม 6 จุดขึ้นไป (`MIN_DATA_POINTS`) ถึงจะ flag กันสัญญาณเท็จจากข้อมูลน้อย

**autonomy-log ใช้จริง:** `api/autonomy-log.ts` เคย deploy อยู่เฉยๆ ไม่มีใครเรียก (dead code) และมีช่องโหว่จริง — เชื่อ `user_id` จาก client body ตรงๆ ไม่ verify เลย ต่างจากแพทเทิร์นที่ `api/profile.ts`/`api/coach.ts` ใช้ (derive จาก JWT เสมอ) ตอนนี้แก้ให้ verify JWT ก่อนเขียนทุกครั้ง แล้วเชื่อมเข้า `useChat.ts` จริง (แทน `saveAutonomyLog()` แบบ client-side เดิมที่ลบไปแล้ว)

**code splitting:** `dist/assets/index-*.js` เดิม 918kB ก้อนเดียว (ทุกหน้า import แบบ static ใน `App.tsx`) ตอนนี้ใช้ `React.lazy` + `Suspense` แยกทีละหน้า chunk ใหญ่สุดเหลือ 409.96kB (`AuthContext` ก้อนที่สอง 237.5kB มาจาก `@supabase/supabase-js`) ทุก chunk ต่ำกว่า 500kB แล้ว

**ย้ายเอกสาร:** ชุด Audit 8 ไฟล์ + คำแปลไทย 8 ไฟล์ + Executive Summary + Handoff/Tasks/Performance (21 ไฟล์ที่ user อัปโหลดตอนแรกสุดของการรวม Astrovera) ย้ายจาก root เข้า `docs/` แล้ว — เหลือแค่ `README.md` กับรูปที่ root

**Verify:** เทสรวม 157/157 ผ่าน, `tsc -b --force` สะอาด, standalone `tsc` บน `api/**/*.ts` สะอาด, `oxlint` 0 error/0 warning ใหม่ (11 warning เดิมไม่เกี่ยวกับรอบนี้), `npm run build` ผ่าน ทุก chunk < 500kB

---

## 🔴 พบจริงบน production (selfprint.one) — /api/nova, /api/intelligence, /api/coach ใช้งานไม่ได้

ทดสอบผ่าน browser ของ user เอง (Claude in Chrome, ยิง `fetch()` จริงจาก `https://www.selfprint.one` ไม่ใช่จำลอง) ผลคือ:

| endpoint | payload ที่ส่ง | ผลจริง |
|---|---|---|
| `POST /api/nova` | `{ messages: [...], hub: 'decision', mood: 'ready', autonomy: 50 }` (shape ตรงตาม `NovaRequest`) | **500 `FUNCTION_INVOCATION_FAILED`** |
| `POST /api/intelligence` | `{ mood: 'ready', birthDate: '1990-05-15' }` (shape ตรงตาม `IntelligenceRequestBody`) | **500 `FUNCTION_INVOCATION_FAILED`** |
| `POST /api/coach` | `{ question: 'test' }` | **404 `NOT_FOUND`** — route นี้ไม่มีอยู่บน deploy ปัจจุบันเลย |

**นี่คือ Vercel-level crash (`FUNCTION_INVOCATION_FAILED`)** ไม่ใช่ error ที่โค้ดจัดการเอง — ทั้ง `nova.ts` และ `intelligence.ts` มี try/catch ครอบการเรียก Claude ไว้แล้ว (ควรได้ fallback JSON 200 กลับมาแม้ Claude call ล้มเหลว) แปลว่า function crash **ก่อน**จะถึง try/catch นั้นเลย — จุดที่น่าสงสัยที่สุดคือตอน module-load (เช่น `new Anthropic({...})` ตอน import, หรือ import อะไรบางอย่างที่ resolve ไม่ได้ตอน bundle ขึ้น Vercel)

`/api/coach` เป็น 404 ไม่ใช่ 500 — แปลว่า route นี้ไม่ได้อยู่ใน deploy ปัจจุบันเลย (ทั้งที่มีอยู่ในโค้ด repo ตั้งแต่ commit `ed819f4`) ชี้ว่า **deploy บน Vercel ปัจจุบันเก่ากว่าที่คิด** — น่าจะไม่ได้ redeploy ตั้งแต่ก่อน 5.5 เป็นอย่างน้อย

**สาเหตุที่เป็นไปได้ (ต้องเช็คจาก Vercel dashboard เอง — ไม่มีสิทธิ์เข้าจากที่นี่):**
1. ยังไม่ได้ redeploy ตั้งแต่ commit ใหม่ๆ หลาย commit ที่ผ่านมา (อธิบาย 404 ของ coach ได้ตรงที่สุด)
2. Environment variable หายหรือผิดบน Vercel production (เช่น `ANTHROPIC_API_KEY`) — แต่โค้ดปัจจุบันเช็ค `!process.env.ANTHROPIC_API_KEY` แล้ว fallback แบบ 200 ไม่ throw ดังนั้นถ้า deploy เป็นโค้ดปัจจุบันจริง key หายไม่ควรทำให้ 500 — ชี้ไปทาง deploy เก่ากว่าโค้ดที่มี safeguard นี้อีกเช่นกัน
3. Build error บน Vercel ที่ deploy log เท่านั้นจะบอกได้ (เช่น `src/lib/astrovera-brain/psychology/index.js` — ไฟล์ vendored เป็น `.js` import ตรงๆ อาจ resolve ไม่ได้ตอน build บน Vercel ต่างจาก local)

**ต้องทำต่อ (ฝั่ง user):** เปิด Vercel dashboard → ดู deployment ล่าสุดว่า deploy จาก commit ไหน (เทียบกับ `git log` ล่าสุดที่ตอนนี้อยู่ `a116daa`) และดู Function Logs ของ `/api/nova`/`/api/intelligence` ตอนที่ 500 เพื่อดู stack trace จริง แล้วค่อยกลับมาบอกผลเพื่อแก้ต่อ — เดาต่อจากตรงนี้โดยไม่เห็น log จริงจะเสี่ยงแก้ผิดจุด

---

## ⚠️ พบไฟล์ที่ไม่เกี่ยวกับงานรอบนี้ (ไม่ได้แตะ ไม่ได้ commit)

`git status` เจอ `server/handler/chat.js` (tracked, ไฟล์ Cloudflare Worker "Brain Gateway" ลง commit ไว้ตั้งแต่ก่อนหน้านี้) ถูกลบออกจาก disk ไปแล้ว และมี `server/handlers/` (สังเกตพหูพจน์ "handlers" ต่างจาก "handler" เดิม) โผล่มาใหม่แบบ untracked พร้อม `wrangler.toml`/`.wrangler/` (Cloudflare Workers config) — ไม่ใช่สิ่งที่ทำในรอบงานนี้ ไม่รู้ที่มา ไม่ได้ stage/commit ให้ ต้องถามก่อนว่าจะเอายังไงกับตรงนี้

---

**Last Updated:** 2026-08-09 (รอบบ่าย)
**Prepared by:** Claude

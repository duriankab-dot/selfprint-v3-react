# FORENSIC HONEST HANDOFF — SELFPRINT V3
**วันที่:** 1 กันยายน 2569
**Branch:** master
**HEAD ปัจจุบัน (ที่ user commit/push เองแล้ว):** `bb12cef` "edit again 1"
**สถานะไฟล์ที่แก้รอบนี้:** `git add` (staged) แล้ว แต่**ยังไม่ได้ commit/push** — sandbox commit ตรงๆ ไม่ได้ (ข้อจำกัด FUSE filesystem ที่เจอมาตลอดทั้ง session) ต้องให้ user commit+push เองจาก VS Code terminal

เอกสารนี้แทนที่ audit ฉบับก่อนหน้าทั้งหมด (`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`) — อันนั้นเขียนก่อนพบปัญหาชุดใหญ่ที่สุดของ session (DB schema production ไม่ตรงกับโค้ด)

---

## สรุปสถานการณ์แบบตรงที่สุด

Root cause ใหญ่ที่สุดของบั๊กเกือบทั้งหมดที่เจอ: **โค้ด query ตาราง/คอลัมน์ที่ไม่ตรงกับฐานข้อมูล production จริง** ไม่ใช่ UI พัง — เกิดจาก 3 แบบผสมกัน:
1. Migration file เขียนไว้ในโปรเจกต์แล้ว แต่ไม่เคยรันกับ production (รันแค่ staging)
2. บางไฟล์ query ผิด schema (`selfprint` แทน `public`) หรือผิดชื่อคอลัมน์
3. `.single()` ใช้กับ query ที่มีโอกาสได้ 0 แถวเป็นเรื่องปกติ (user ใหม่ยังไม่มี Twin) → PostgREST ตอบ 406 ทุกครั้ง

---

## ส่วนที่ 1: ยืนยันแล้วว่าทำงานจริง (deploy แล้ว + user เทสเองยืนยัน)

| ปัญหา | หลักฐาน |
|---|---|
| ปุ่มย้อนกลับค้างที่หน้าแรก | แก้ commit `0b1db57`, user คอนเฟิร์มผ่าน screenshot |
| Passkey login หายจากหน้า login | แก้ commit `0b1db57`, ยืนยันด้วย `get_page_text` |
| build/test/lint ผ่าน, deploy สำเร็จ | user ยืนยันเอง (Cloudflare Pages screenshot, commit `9674b28`/`bb12cef` live) |

---

## ส่วนที่ 2: แก้ในโค้ดแล้วรอบนี้ — `tsc -b` ผ่าน (0 errors) แต่**ยังไม่ commit/push/deploy** ยังไม่ verify live

### 2.1 Database schema mismatch (สาเหตุใหญ่ที่สุด)
ตรวจสอบด้วย `SELECT schemaname, tablename FROM pg_tables` จาก production จริงที่ user รันให้ เทียบกับทุกจุดที่โค้ดเรียก `.from(...)` ทั่วโปรเจกต์ (grep ทั้ง repo) พบและแก้:

- **`WorldContext.tsx`** — 8 จุดเรียก `.schema('selfprint')` ทั้งที่ `world_preferences`/`world_stats` อยู่ `public` เท่านั้น → เอา `.schema('selfprint')` ออก (พังทั้งระบบ favorite/visit-tracking/badge)
- **`decisions`** — 2 จุด (`InsightEngine.ts`, `PatternDetector.ts`) filter คอลัมน์ `world_id` ที่ไม่มีจริง (คอลัมน์จริงคือ `world`) + ตาราง `decisions` ไม่มีคอลัมน์ `user_id` เลย (มีแต่ `twin_id`) → เพิ่มคอลัมน์ `user_id` ผ่าน SQL (nullable + backfill + trigger auto-fill จาก `twin_id`)
- **`user_profiles`** — 2 จุด (`FutureSelfEngine.ts`, `PersonalContextBuilder.ts`) filter ด้วย `.eq('user_id', userId)` ทั้งที่ตารางนี้ primary key คือ `id` ตรงๆ (ไม่มี `user_id` แยก) → แก้เป็น `.eq('id', userId)`
- **`chat_messages`** — ตารางนี้ไม่มีจริงเลย (ยืนยันจาก pg_tables) แก้ 4 จุด: `TwinChat.tsx` (รอบก่อน), `BadgeEngine.ts`, `ExperienceEngine.ts`, `supabase-service.ts` (`saveMessage`/`getChatHistory` ที่ `NovaChat.tsx`/`useChat.ts` ยังเรียกอยู่) → ย้ายให้เขียน/อ่านจาก `twin_memories` ที่มีอยู่จริงแทนทั้งหมด
- **`twin_visual_dna`** — ไม่มีตารางจริง (hint จาก PostgREST ชี้ไป `twin_state`) → ย้าย Visual DNA ไปเก็บใน `twin_state.data.visualDNA` แทน (`CoreAwakeningService.ts`, `VisualDNAService.ts`)
- **`sice_results`** — ไม่มีตารางจริง (hint ชี้ไป `slip_requests` ซึ่งไม่เกี่ยวกันเลย เป็น false-positive) → ตรวจ migration พบว่าที่ถูกต้องคือ column `sice_results` ใน `awakening_essence` → ย้าย `SICEBridge.ts` ไปเขียนที่นั่น
- **`community_insights` / `community_insight_likes`** — migration 033 เขียนไว้ถูกต้องแล้ว แค่ไม่เคยรันกับ production → รวมเข้า SQL catch-up (ไม่ใช่บั๊กโค้ด)
- **`twins` / `user_lifecycle` / `personal_contexts` — 406 ซ้ำๆ** — `.single()` ทำให้ user ใหม่ (0 แถว = ปกติ) โดน error ทุกครั้ง แก้เป็น `.maybeSingle()` รวม **18 จุด** ทั่ว: `CoreAwakeningService.ts`, `WorldRoutingService.ts` (×3), `PersonalContextBuilder.ts` (×3), `FutureSelfEngine.ts`, `DecisionLearningService.ts`, `lifecycleStore.ts` (×2), `api/core-awakening.ts` (×2), `EnvironmentEngine.ts`, `DecisionIntelligenceEngineAdapter.ts`, `MemoryManagerEngine.ts`, `VisualDNAService.ts`
  - **หมายเหตุ:** ยังเหลือ `.single()` แบบเดิมใน `src/api/twin-evolution.ts`, `SelfPrintOrchestrator.ts`, `TwinEvolutionService.ts`, `src/api/sice/process.ts` — **ตรวจแล้วว่าเป็น dead code ไม่มีใคร import ใช้จริงในโปรดักชัน** ไม่ได้แตะเพราะไม่กระทบผู้ใช้จริง

### 2.2 ภาษาอังกฤษหลุดในหน้า "ภาพรวมตัวตน" (Full Analysis)
`SICEOrchestrator.ts` ฝังประโยคภาษาอังกฤษตรงในโค้ด (ไม่ใช่ i18n) — "Define clear goals...", "Twin is feeling balanced — ready to guide your journey" ฯลฯ ตรงกับข้อความในสกรีนช็อต user เป๊ะๆ แปลเป็นไทยหมดแล้ว ~14 จุด (insights, recommendations, warnings, themes, conflicts, recommendedAction)

### 2.3 SQL ไฟล์ `PRODUCTION_DB_CATCHUP_2026-09-01.sql`
รวม migration ที่เขียนไว้แต่ไม่เคยรันกับ production: `journal_queue`, `decision_outcomes`, `follow_up_schedule`, `decision_patterns`, `twin_state`/`twin_personality`/`twin_memory`/`conversations`/`messages` (ส่วนที่ยังไม่มี), `twin_evolution_history`/`progress`, `notification_schedule`/`queue`/`analytics`, `community_insights`/`likes`, บวกที่เพิ่มเอง: คอลัมน์ `user_id`/`goals_json`/`focus_areas`, ตาราง `sice_feedback`

**บั๊กที่เจอตอน user รันจริง (แก้แล้วในไฟล์นี้):** รอบแรก error `policy "..." already exists` เพราะไฟล์ migration ต้นฉบับไม่มี `DROP POLICY IF EXISTS` นำหน้า — Postgres ไม่มี `CREATE POLICY IF NOT EXISTS` ให้ใช้ ถ้ารันซ้ำ (หรือรันค้างกลางทางรอบแรก) จะ error ทันที **แก้แล้ว: เพิ่ม `DROP POLICY IF EXISTS` นำหน้าทุก `CREATE POLICY` ในไฟล์ (32/32 จุด, เช็คแล้วไม่มีจุดไหนตกหล่น)** — ตอนนี้รันซ้ำกี่ครั้งก็ปลอดภัย

**⚠️ ยังไม่ได้ verify ว่ารันผ่านจนจบสมบูรณ์** เพราะเพิ่งแก้เสร็จรอบนี้ — user ต้องรันใหม่อีกครั้ง

---

## ส่วนที่ 3: ยังไม่แก้ / หาสาเหตุไม่เจอ 100% — บอกตรงๆ

### 3.1 ข้ามคำถาม 5 ข้อไม่ได้ (ยังไม่แก้)
User ยืนยันว่า **ยังพังทุกช่องทางเข้า และไม่มี error ขึ้นใน Network tab เลย** — แปลว่าเป็นบั๊กฝั่ง client ล้วนๆ ไม่ใช่ backend
- ตรวจโค้ด `FinetuningQuestions.tsx` (ปุ่ม Skip `onClick={onSkip}` ต่อสายถูกต้อง ไม่มี disable ผิดที่) และ `Onboarding.tsx`'s `onSkip` handler (synchronous ล้วน ไม่มี await/network call ที่จะค้าง) — **โค้ดที่อ่านดูถูกต้องบนกระดาษ แต่ user ยืนยันว่าไม่ทำงานจริง**
- **ยังไม่เจอสาเหตุจริง** — เป็นไปได้ว่ามี "5 คำถาม" อีกจุดหนึ่งที่ไม่ใช่ `FinetuningQuestions.tsx` (ยังไม่เจอ) หรือ state บางอย่างทำให้ click handler ไม่ fire จริง (ต้อง live-test ด้วยเบราว์เซอร์จริงถึงจะฟันธงได้ — sandbox นี้ไม่มี session ที่ล็อกอินอยู่)
- **งานต่อ:** ต้อง reproduce ด้วยเบราว์เซอร์จริงจากทั้ง 2 เส้นทาง (สมัครใหม่ / กลับมา login) แล้ว inspect element ว่าปุ่ม skip element ไหนถูกคลิกจริง, มี event listener ซ้อนกันบังหรือไม่

### 3.2 `/api/profile`, `/api/blueprint` 500 (ยังไม่แก้ — root cause ไม่รู้)
อ่านโค้ด `unified-handler.ts` เทียบ migration แล้ว **schema/คอลัมน์ถูกต้องทุกอย่าง** (`selfprint.users_profiles`, `selfprint.blueprints` มีคอลัมน์ตรงกับที่โค้ด insert/upsert หมด) — เดาไม่ออกจากการอ่านโค้ดอย่างเดียวอีกแล้ว
- โค้ดมี `debug: {message, code, details, hint}` ส่งกลับใน response body อยู่แล้วสำหรับ POST — **ต้องดู response body จริงถึงจะรู้สาเหตุ** (ขอไปแล้วรอบก่อน ยังไม่ได้รับ)
- **งานต่อ:** เปิด Network tab → คลิก request ที่ 500 → tab Response → copy JSON ทั้งก้อนมาให้ (หรือด Cloudflare Realtime Logs ที่ user เคยเปิดสำเร็จแล้ว ดู `console.error('[profile] upsert error:', ...)` ตอน error เกิดจริง)

### 3.3 "เริ่มสำรวจสะท้อนคิด วิเคราะห์ข้อดีเสีย แบ่งปันข้อคิด" — ไม่เข้าใจขอบเขตปัญหา
ยังไม่ชัดว่าหมายถึงฟีเจอร์ไหนพังตรงไหน — ต้องขยายความในแชทใหม่

### 3.4 CoreAwakening redesign, App Selector dropdown ออนบอร์ด, Thai audit ทั้งเว็บ
ยังไม่แตะเลยตั้งแต่ต้น (งานใหญ่ ตกลงกันแล้วว่าเป็นงานแยกรอบถัดไป)

### 3.5 dead code ที่เจอระหว่างทาง (ไม่ได้ลบ ไม่ใช่ scope งานนี้)
`src/api/twin-evolution.ts`, `src/services/SelfPrintOrchestrator.ts`, `src/services/TwinEvolutionService.ts`+`TwinEvolutionProgress.tsx`, `src/api/sice/process.ts` (unclear — มี middleware import อยู่แต่ middleware เองก็ไม่ชัดว่า wire เข้า route จริงไหม) — ไม่มีใคร import ใช้งานจริงในเส้นทาง production เท่าที่ตรวจสอบได้

---

## ส่วนที่ 4: คำสั่งที่ต้องทำต่อ (เรียงตามลำดับ)

```bash
# 1. Build/test/lint/typecheck ให้ผ่านก่อน (sandbox รัน lint ไม่ได้ — ขาด native binding ของ oxlint สำหรับ Linux ต้องรันในเครื่อง Windows จริง)
npm run build
npm test
npm run lint
npx tsc -b   # ยืนยันแล้วว่าผ่าน 0 errors ในรอบนี้

# 2. Commit + push (sandbox commit ไม่ได้ ต้องรันเองใน VS Code terminal)
git add -A
git commit -m "fix: production DB schema mismatches (WorldContext schema, decisions/user_profiles columns, chat_messages/twin_visual_dna/sice_results phantom tables, twins 406 x18, SICE English text)"
git push

# 3. รอ Cloudflare Pages deploy เสร็จ (auto-deploy จาก master)

# 4. รัน PRODUCTION_DB_CATCHUP_2026-09-01.sql ใน Supabase SQL Editor
#    (แก้ policy-already-exists bug แล้ว ปลอดภัยรันซ้ำได้)

# 5. ทดสอบสด: signup ใหม่ทั้ง flow, ดู Network tab ว่า 404/406/400 หายไปจริงไหม
```

---

## สรุปสำหรับแชทใหม่

**สิ่งที่ต้องหยิบต่อทันที:**
1. ยืนยันว่า commit/push/deploy ของรอบนี้ผ่านจริง (build/test/lint local)
2. รัน SQL catch-up (รอบใหม่ที่แก้ policy bug แล้ว) แล้ว "0 rows" / success message ครบทุกส่วน
3. Live-test แบบ end-to-end อีกครั้งจากเบราว์เซอร์จริง — เก็บ Network tab log แบบเต็มเหมือนที่เคยแปะมา เทียบว่า error ตัวไหนหายไปแล้วบ้าง ตัวไหนยังอยู่
4. โฟกัส 2 บั๊กที่ยังไม่แก้: **ข้ามคำถามไม่ได้** (ต้อง reproduce สด) และ **`/api/profile`/`/api/blueprint` 500** (ต้องขอ response body จริง)

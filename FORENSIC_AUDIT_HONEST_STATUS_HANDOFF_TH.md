# FORENSIC AUDIT — สถานะจริงของ SELFPRINT V3 (ฉบับแทนที่ทั้งหมด)

**วันที่:** 3 กันยายน 2026
**Baseline:** `3cbbaf6` (= HEAD ของ `master` บน GitHub ตรงกับเครื่อง)
**วิธีตรวจ:** อ่านซอร์สโค้ดจริงอย่างเดียว — **ไม่เชื่อไฟล์ `.md` ใด ๆ ในรีโปนี้เลย**
รวมถึงไฟล์ฉบับเดิมของไฟล์นี้เอง (รีโปมีไฟล์ `.md` ที่ root 87 ไฟล์ ส่วนใหญ่ล้าสมัย
และหลายไฟล์อ้างสิ่งที่โค้ดไม่ได้ทำ)
**เครื่องมือ:** clone ใหม่จาก GitHub + typecheck จริง + agent 5 ตัว (security / backend /
frontend / database / adversarial review ของงานแก้เอง)

> ⚠️ **ไฟล์นี้แทนที่เอกสารสถานะเดิมทั้งหมด** ไฟล์ `HANDOFF_*.md`, `PHASE_A*.md`,
> `SESSION_*.md`, `*_STATUS_TH.md`, `PHASE_3_AUTOMATION_CLEANUP_HANDOFF.md`
> **ล้าสมัยและห้ามเชื่อ** — ดูหัวข้อ "เอกสารที่โกหก" ท้ายไฟล์

---

## 0. TL;DR — 6 บรรทัดสำหรับคนรีบ

1. **แชททั้งระบบพังมาตลอด 100% ของ request** — client ไม่เคยส่ง `Authorization` แต่ CF Pages บังคับ → 401 ทุกครั้ง (แก้แล้ว)
2. **`/chat/nova` จอขาวทุกครั้ง** — `useNova()` ถูกเรียกโดยไม่มี `NovaProvider` ที่ไหนเลย (แก้แล้ว)
3. **ไม่มี ErrorBoundary ทั้งโปรเจกต์** — error ทุกตัวกลายเป็นจอขาวเปล่า และ Sentry ติดตั้งไว้แต่ไม่เคย init (แก้แล้ว)
4. **OpenRouter API key ที่ใช้งานได้จริงอยู่ใน repo สาธารณะ** — `KEY/open_router API KEY.txt` ⚠️ **ต้อง revoke เดี๋ยวนี้**
5. **เอกสารอ้าง "91 TypeScript errors จาก Phase 3" — ไม่จริงเลย** ไฟล์ 43 ไฟล์นั้นต่างกันแค่ CRLF ไม่มี error สักตัว
6. **`npm test` รันแค่ 7 จาก 73 ไฟล์เทสต์** — เพราะ `vitest.config.ts` ล็อก allowlist ไว้ ที่ผ่านมาที่เห็นเขียว = เขียวจาก 9.6% ของ suite

---

## 1. สิ่งที่แก้เสร็จแล้วในรอบนี้ (verify ด้วย compiler จริง)

ทุกข้อผ่าน `tsc` แล้ว — ดูหลักฐานหัวข้อ 4

| # | รหัส | เรื่อง | ไฟล์ที่แตะ |
|---|------|--------|-----------|
| 1 | `AUTHHDR-001` | เพิ่ม `Authorization: Bearer` ให้ทุก fetch ที่เรียก `/api/nova`, `/api/twin`, `/api/metrics` | `src/lib/supabase/client.ts` (+`getAuthHeaders()`), `NovaAPIService.ts`, `TwinAPIService.ts`, `PerformanceMonitor.ts` |
| 2 | `NOVAPROV-001` | ครอบ route `/chat/nova` ด้วย `<NovaProvider>` | `src/App.tsx`, comment ใน `CoreAwakening.tsx` |
| 3 | `ERRBOUND-001` + `SENTRY-INIT-001` | สร้าง ErrorBoundary + เรียก `initializeSentry()` | `src/components/ErrorBoundary.tsx` (ใหม่), `src/main.tsx` |
| 4 | `AUTONOMY-FIX-001` | เขียนใหม่ทั้งไฟล์: verifyUser, CORS allowlist, payload ตรงกับ client, เขียนลงตารางที่มีจริง, await insert | `functions/api/autonomy-log.ts` |
| 5 | `METRICS-FIX-001` | verifyUser, CORS allowlist, `.schema('selfprint')`, แก้ operator precedence ของ `rating`, await insert | `functions/api/metrics.ts` |
| 6 | `CFBUFFER-001` | เลิกใช้ `Buffer` ใน `generateShareCode()` | `api/unified-handler.ts` |
| 7 | `STRIPEWH-001` | `constructEvent` → `constructEventAsync` + `createSubtleCryptoProvider()` | `api/unified-handler.ts` |
| 8 | `ENVNAME-001` | `getAnonSupabase` อ่าน `SUPABASE_URL`/`SUPABASE_ANON_KEY` ก่อน แล้วค่อย fallback `VITE_*` | `api/unified-handler.ts` |
| 9 | `NOTIFAUTH-001` | POST ของ notifications ทุก action ต้อง login และใช้ `user.id` ไม่ใช่ `body.userId` | `api/unified-handler.ts` |
| 10 | `NOTIFCOL-001` | `notification_queue` เลิกใช้ชื่อคอลัมน์ camelCase → snake_case | `api/unified-handler.ts` |
| 11 | `TWINEVOAUTH-001` | `/api/twin-evolution` ต้อง login + filter `user_id` | `api/unified-handler.ts` |
| 12 | `DEBUGLEAK-001` | ลบการส่ง Postgres error / stack ให้ client ทั้งหมด 10 จุด | `api/unified-handler.ts`, `functions/api/{nova,twin}.ts` |
| 13 | `COACH404-001` | ปิด AskCoach (rollout default 10 → 0) เพราะ `/api/coach` ไม่มี handler | `src/components/dashboard/AskCoach.tsx` |
| 14 | `JOURNAL404-001` | เจอ 404 แล้วหยุด ไม่ mark ข้อความว่า failed ถาวร | `src/hooks/useJournalQueue.ts` |
| 15 | `SCHEMA-TS-002` | ย้าย `blueprints`/`users_profiles`/`share_links` ไป schema `selfprint` ใน type file | `api/_utils/database.types.ts` |
| 16 | `TSCONFIG-FUNCTIONS-001` | เพิ่ม typecheck ให้ `functions/` + `api/` (ไม่เคยมีมาก่อน) | `tsconfig.functions.json` (ใหม่), `package.json` |
| 17 | `GITIGNORE-FIX-001` + `CRLF-001` | แก้ `.gitignore` 2 บรรทัดที่เขียนผิดจนกฎไม่ทำงาน + เพิ่ม `.gitattributes` | `.gitignore`, `.gitattributes` |

---

## 2. รายละเอียดปัญหา P0 — สาเหตุ + หลักฐาน + วิธีแก้

### P0-1 · แชททั้งระบบตอบ 401 ทุก request ✅ แก้แล้ว

**อาการ:** Nova chat, Twin chat, floating assistant ใช้ไม่ได้เลย

**สาเหตุ (หลักฐาน):**
- `functions/api/nova.ts:87-94` และ `functions/api/twin.ts:90-97` — `if (!authHeader) return 401`
- แต่ผู้เรียกทุกจุดส่งแค่ `Content-Type`:
  `NovaAPIService.ts:79-81`, `NovaAPIService.ts:190-192`, `TwinAPIService.ts:90-92`
- ทั้งโปรเจกต์ไม่มี global fetch interceptor เลย (grep `window.fetch =` → ไม่เจอ)
- ผู้เรียกจริง: `pages/NovaChat.tsx:114`, `features/chat/hooks/useChat.ts:106`,
  `components/chat/FloatingSelfprintChat.tsx:93`, `pages/TwinChat.tsx:235`

**แก้:** เพิ่ม `getAuthHeaders()` ใน `src/lib/supabase/client.ts` แล้วใช้ที่ 3 จุด

**เกณฑ์ยืนยัน:** login แล้วเปิด DevTools → Network → พิมพ์ข้อความ →
`POST /api/twin` ต้องมี header `Authorization: Bearer ey...` และตอบ 200

**⚠️ หมายเหตุตรงไปตรงมา:** `/chat/nova` ถูกจดไว้ใน `publicPages` (`App.tsx:144`)
แต่ backend บังคับ login — **ผู้ใช้ที่ยังไม่ล็อกอินจะยังเจอ 401 อยู่** ต่างจากเดิมตรงที่
ตอนนี้เห็นข้อความ error แทนจอขาว ต้องตัดสินใจ: ย้าย route ไปเป็น protected
หรือปล่อยให้ Nova ตอบได้แบบ anonymous

---

### P0-2 · `/chat/nova` จอขาวทุกครั้ง ✅ แก้แล้ว

**สาเหตุ:** `pages/NovaChat.tsx:23` เรียก `useNova()` ก่อน guard `!session`
แต่ grep ทั้งรีโปแล้ว **ไม่มีที่ไหน mount `NovaProvider` เลย** → throw
`"useNova must be used within NovaProvider"` (`NovaContext.tsx:93`) ทุกครั้ง

คอมเมนต์ที่ `CoreAwakening.tsx:14` เขียนว่า *"useNova เรียกใน NovaChat เท่านั้น
ที่ wrap ใน NovaProvider"* — **คอมเมนต์นั้นไม่จริง** (แก้คอมเมนต์แล้วด้วย)

**แก้:** `App.tsx:144` → `<NovaProvider><NovaChat /></NovaProvider>`

**เกณฑ์ยืนยัน:** เปิด `/th/chat/nova` → หน้าต้อง render ไม่ใช่จอขาว

---

### P0-3 · ไม่มี ErrorBoundary + Sentry ไม่เคยทำงาน ✅ แก้แล้ว

**สาเหตุ:**
- `grep -rn "componentDidCatch|ErrorBoundary|getDerivedStateFromError" src/` → **ไม่เจอเลย**
- `<Suspense fallback={null}>` (`App.tsx:269`) จับแค่ *loading* ไม่จับ *throw*
- `@sentry/react` อยู่ใน dependencies, `initializeSentry()` มีอยู่ 2 ตัว
  (`services/error-tracking.ts:20`, `services/SentryService.ts:67`) แต่
  **ไม่มีใครเรียกสักตัว** → production ไม่มี error telemetry เลย

**ผลรวม:** lazy chunk 404 หลัง deploy (ปัญหา SW cache ที่บันทึกไว้หลายเซสชัน)
= จอขาวเงียบ ๆ ไม่มี log ไม่มีทางกู้

**แก้:** `src/components/ErrorBoundary.tsx` (ไทย/อังกฤษ, ตรวจจับ stale-chunk error
แล้วเสนอปุ่มโหลดใหม่โดยเฉพาะ) + `main.tsx` เรียก `initializeSentry()` และครอบ tree

**เกณฑ์ยืนยัน:** โยน error ปลอมในคอมโพเนนต์ → ต้องเห็นการ์ด error ไม่ใช่จอขาว

---

### P0-4 · `/api/autonomy-log` — พัง 4 ชั้นซ้อนกัน บันทึกได้ 0 แถวมาตลอด ✅ แก้แล้ว

| ชั้น | ปัญหา | หลักฐาน |
|-----|-------|---------|
| 1 | **ไม่มี auth เลย** ทั้งที่คอมเมนต์หัวไฟล์เขียนว่า "JWT verified" | เดิม `functions/api/autonomy-log.ts:13` vs โค้ดจริงที่ไม่มี `verifyUser` |
| 2 | **payload คนละ contract** — handler ขอ `{userId,twinId,autonomyLevel}` แต่ client ส่ง `{hub,mood,autonomy_level,...}` → **400 ทุกครั้ง** | `useChat.ts:166-175` |
| 3 | **เขียนผิดตาราง** — `autonomy_signals` สร้างใน `migrations/` ที่ CLI ไม่เคย apply และ migration นั้น **รันไม่ผ่านอยู่แล้ว** เพราะอ้าง `selfprint.twins` ที่ไม่มีจริง | `migrations/autonomy_signals_table.sql:7` |
| 4 | **โกหกว่าสำเร็จ** — insert แบบ fire-and-forget แล้ว return `{ok:true,stored:true}` ทุกกรณี | เดิมบรรทัด 93-95 |

**แก้:** เขียนใหม่ทั้งไฟล์ — บังคับ `verifyUser`, เอา `user_id` จาก token เท่านั้น,
รับ payload ตามที่ client ส่งจริง, เขียนลง `public.decision_log` (ตารางที่มีจริง +
มี RLS policy จริง — `supabase/migrations/001_decision_log_autonomy_tracking.sql:15-36`),
`await` insert แล้วรายงานผลตามจริง, CORS เปลี่ยนจาก `*` เป็น allowlist

**เกณฑ์ยืนยัน:** คุยกับ Twin 1 รอบ → `SELECT * FROM decision_log ORDER BY created_at DESC LIMIT 1;`
ต้องมีแถวใหม่ที่ `user_id` ตรงกับผู้ใช้ที่ล็อกอิน

---

### P0-5 · `/api/metrics` — ไม่มี auth + เขียนผิด schema + บั๊ก precedence ✅ แก้โค้ดแล้ว (แต่ยังมีเงื่อนไข DB)

**สาเหตุ 4 ข้อ:**
1. ไม่มี `verifyUser` + `CORS: *` + ใช้ service_role + อ่าน `user_id` จาก body →
   ใครก็ได้บนอินเทอร์เน็ตเขียนแถวสวมชื่อคนอื่นได้ ข้าม RLS
2. `.from('performance_metrics')` ตกไปที่ `public` ซึ่ง**ไม่มี**คอลัมน์
   `fcp_ms/lcp_ms/inp_ms/cls_value/ttfb_ms` (`migrations/002_security_tables.sql:44`)
3. **บั๊ก operator precedence:**
   ```ts
   rating: payload.metrics?.average ?? 0 < 1000 ? 'good' : 'needs-improvement'
   ```
   `<` ผูกแน่นกว่า `??` → parse เป็น `average ?? ((0<1000) ? 'good' : '...')`
   แปลว่า `rating` ได้ค่า **ตัวเลข** ผิด `CHECK (rating IN ('good','needs-improvement','poor'))`
4. return `{ok:true,stored:true}` เสมอ ทำให้ทั้ง 3 ข้อบนไม่มีใครเห็น

**⚠️ ยังต้องเช็คก่อน deploy (DB-02):** `selfprint.performance_metrics` สร้างไว้ใน
`migrations/metrics_table.sql` ซึ่งอยู่ในโฟลเดอร์ที่ CLI ไม่เคย apply — เหตุผลเดียวกับที่ทำให้
`autonomy_signals` ใช้ไม่ได้ **ต้องรันคำสั่งนี้ก่อน:**
```sql
SELECT to_regclass('selfprint.performance_metrics');
-- ได้ NULL → เอา migrations/metrics_table.sql ไปรันใน SQL Editor ก่อน
```

**หมายเหตุ:** `PerformanceMonitor.reportMetrics()` **ยังไม่มีใครเรียกเลย** ทั้งโปรเจกต์
(ตรวจแล้ว 0 importers) — endpoint นี้จึงยังไม่มี traffic จริงจนกว่าจะไปเรียกใน `main.tsx`

---

### P0-6 · 🔴 Secrets หลุดใน repo สาธารณะ — ยังไม่ปิด ต้องทำด้วยมือ

**ยืนยันแล้วว่า repo เป็น public** (clone ได้โดยไม่ต้อง auth)

| ไฟล์ | สิ่งที่หลุด | ความร้ายแรง |
|------|-----------|-------------|
| `KEY/open_router API KEY.txt:3` | `sk-or-v1-4bc0...` **key ใช้งานได้จริง** | 🔴 P0 — ใครก็ได้เอาไปใช้จ่ายเงินคุณ |
| `.env.local:2` | `VERCEL_OIDC_TOKEN` (หมดอายุ 2026-08-26 แล้ว) | 🟠 P1 — ปัญหาเชิงโครงสร้าง ครั้งหน้าจะหลุดของจริง |
| `e2e/fixtures/test-user.ts:13,92-94`, `scripts/seed-test-users.ts:44+` | รหัสผ่านบัญชี staging จริง | 🟡 P2 |
| `supabase/.temp/.../docker.env:3` | service-role key ของ Supabase local (เป็น demo key สาธารณะ ไม่อันตราย) | 🟡 P2 — แต่กฎ gitignore พังจึงหลุดมาได้ |

**ต้นตอเชิงโครงสร้าง:** `.gitignore` มี `.env*` และ `node_modules` อยู่แล้ว **แต่
gitignore ไม่มีผลกับไฟล์ที่ถูก track ไปแล้ว** — และตัวไฟล์เองมีบั๊กเขียน 2 จุด:
- บรรทัดแรกเดิม: `e2e/.auth/user.json# Logs` → `#` กลางบรรทัดไม่ใช่คอมเมนต์
- `"supabase/.temp/"` → มีเครื่องหมายคำพูดติดมา กฎเลยไม่ทำงาน

**แก้แล้ว:** `.gitignore` เขียนใหม่ทั้งไฟล์ + เพิ่ม `KEY/`, `*.pem`, `*.key`, `!.env.example`

**❗ สิ่งที่ต้องทำด้วยมือ (ผมทำแทนไม่ได้):**

1. **revoke OpenRouter key เดี๋ยวนี้** ที่ openrouter.ai → Keys → ออกใหม่
2. ลบ `.git\index.lock` ก่อน (มี lock ค้างจาก sandbox — git จะฟ้อง "Another git process")
3. untrack ของที่หลุด:
   ```powershell
   cd D:\selfprint-v3-react
   del .git\index.lock
   git rm --cached -r ".env.local" "KEY" "supabase/.temp"
   git rm -r --cached node_modules dist
   git add .gitignore .gitattributes
   git commit -m "SEC-01: untrack secrets, node_modules, dist"
   ```
4. **ล้างประวัติ** (key ยังกู้จาก history เก่าได้ ต่อให้ลบไฟล์แล้ว):
   ```powershell
   git filter-repo --path "KEY/" --path ".env.local" --invert-paths
   git push --force origin master
   ```
5. เปลี่ยนรหัสบัญชี staging ที่อยู่ใน `e2e/fixtures/test-user.ts`

---

## 3. ปัญหาที่ยัง **ไม่ได้แก้** — ต้องให้เจ้าของตัดสินใจ

### 🔴 SEC-02 · Supabase Edge Functions 4 ตัวเปิดโล่ง — IDOR ระดับร้ายแรง

โฟลเดอร์ `supabase/functions/` มี 13 ฟังก์ชัน ในนั้น **4 ตัวไม่ verify JWT เลย**
แต่ใช้ service_role และอ่าน `userId` จาก body ตรง ๆ:

| ไฟล์ | ทำอะไรได้ |
|------|----------|
| `send-push/index.ts:234-254` | ส่ง push notification ข้อความอะไรก็ได้ ไปหาผู้ใช้คนไหนก็ได้ → ช่องทาง phishing ที่ใส่แบรนด์คุณเอง |
| `daily-brief/index.ts:34-102` | อ่าน decision log + journal ของ **คนอื่น** แล้ว **ส่งกลับมาใน response** |
| `pattern-detect/index.ts:54-200` | อ่าน **และเขียน** behavioral pattern ของคนอื่น |
| `auth-registration-options` + `auth-register-passkey` | **account takeover** — ผูก passkey ของตัวเองเข้ากับอีเมลเหยื่อได้ เช็คแค่ว่า email ที่ส่งมาตรงกับ challenge ที่ตัวเองเพิ่งสร้างด้วย email เดียวกัน |

เพิ่มเติม: `auth-verify-passkey/index.ts:130-137` **ปั้น JWT ด้วย signature เป็นศูนย์ 32 ไบต์**
(`// For MVP, skip signature verification`) แล้วส่งกลับเป็น `session.access_token`

> **ทำไมยังไม่แก้ให้:** ไฟล์เหล่านี้ deploy แยกผ่าน Supabase CLI ไม่ได้อยู่ใน build ของ CF Pages
> การแก้ auth ของ passkey flow กระทบ flow ล็อกอินจริงของผู้ใช้ปัจจุบัน — ต้องคุยก่อนว่าจะ
> migrate ผู้ใช้เดิมยังไง **แต่ 3 ตัวแรก (`send-push`, `daily-brief`, `pattern-detect`)
> แก้ได้ทันทีและควรแก้ก่อนอย่างอื่น** — ก็อป pattern จาก `data-export/index.ts:74-87`
> ในรีโปเดียวกันที่ทำถูกอยู่แล้ว

---

### 🔴 DB-01 · Migration 3 โฟลเดอร์ ทับกัน มีแค่โฟลเดอร์เดียวที่ถูกรัน

`supabase/config.toml` ชี้ไปที่ `supabase/migrations/` เท่านั้น → ที่เหลือ**ไม่เคยถูก apply**:

| โฟลเดอร์ | ตารางที่โค้ดใช้จริงแต่ไม่เคยถูกสร้าง |
|---------|-----------------------------------|
| `migrations/` | `user_feedback`, `quality_metrics`, `improvement_actions`, `twin_prompt_updates`, `feedback_sentiment`, `csrf_tokens`, `sessions`, `error_logs`, `security_audit_log`, `twin_world_expertise`, `user_lifecycle`, `performance_metrics`, `autonomy_signals` |
| `src/services/migrations/` | `user_profiles` |
| `src/services/supabase-schema.sql` | 13 ตาราง รวมถึง `twins` เวอร์ชันที่มีคอลัมน์ archetype |
| root `20260825_add_archetype_columns.sql` | `world_preferences.primary_archetype/secondary_archetype` |

**เลขซ้ำกันด้วย:** `001`–`004` มีอยู่ 2–3 ที่ เนื้อหาคนละเรื่องกันสิ้นเชิง

**ผลที่ตามมาโดยตรง:** `FeedbackService`, `QualityMetricsService`,
`ContinuousImprovementService`, `SecurityService`, `AlertingService`,
`WorldExpertiseService`, `lifecycleStore` — **ทั้งหมดเขียนลงตารางที่ไม่มีอยู่จริง**
(คือ subsystem feedback + security ทั้งชุดเป็น no-op) ซึ่งขัดกับที่ CLAUDE.md อ้างว่า
"P1 ✅ Data Persistence (FBS) — Complete"

---

### 🔴 DB-02 · Migration 028 ↔ 029 ตีกัน

`028_consolidate_phase_a_schema.sql:134` สั่ง `DROP TABLE IF EXISTS twin_memory CASCADE;`
เพื่อล้างชื่อตารางที่ชนกัน แต่ Supabase apply เรียงตามชื่อไฟล์ → **028 รันก่อน 029**
แล้ว `029_phase_a_core_schema.sql:50` สร้าง `twin_memory` กลับมาใหม่
คอมเมนต์ที่ `028:6-7` เขียนว่า "this will run last" — จริงตอนที่ไฟล์ยังชื่อ
`20260825_001_...` แต่หลังเปลี่ยนเลขแล้ว**ไม่จริงอีกต่อไป**

---

### 🔴 DB-03 · โค้ดคุยกับตารางที่ไม่มีอยู่ ~20 ตาราง

ตัวอย่างที่กระทบ flow หลัก (รายการเต็มอยู่ในผลตรวจ agent):

| ไฟล์ | query | ปัญหา |
|------|-------|-------|
| `src/services/SelfPrintOrchestrator.ts` (12 จุด) | `.from('profiles_blueprints')` | ไม่มี migration ไหนสร้าง |
| `src/services/TwinSupabaseService.ts:136-139` | `twins.insert({primary_archetype, secondary_archetype, maturity_score, evolution_stage})` | คอลัมน์เหล่านี้อยู่แค่ใน `supabase-schema.sql` ที่ไม่ถูก apply |
| `src/services/TwinEvolutionService.ts:127,211` | `twins.update({stage})` | คอลัมน์ชื่อ `evolution_stage` ไม่ใช่ `stage` → **evolution ไม่เคยถูกบันทึกเลย** |
| `src/services/DecisionService.ts:80-88` | `decision_log.insert({twin_id, world, question, ...})` | ใช้ `decision_log` เหมือนเป็น `decisions` — ผิดตาราง ผิดคอลัมน์ 6 ตัว และขาด NOT NULL `hub` |
| `src/services/database-init.ts:80-128` | `.schema('selfprint').from('users_profiles').eq('id', userId)` | ผิด schema (ของจริงอยู่ `public.user_profiles`) + ขาด NOT NULL `user_id` |
| `src/pages/PasskeySettings.tsx:92+` | `.from('user_passkeys')` | ตารางจริงชื่อ `user_credentials` |
| `src/lib/intelligence/PersonalContextBuilder.ts:286` | `personal_contexts.insert({context_type,title,...})` | คอลัมน์พวกนี้อยู่บน `personal_context` (เอกพจน์) คนละตาราง |

---

### 🟠 SEC-03 · RLS เปิดแต่ไม่มี policy INSERT — ฟีเจอร์เงียบ ๆ ไม่ทำงาน

ตารางที่ client เขียนด้วย anon key แต่ policy ไม่อนุญาต INSERT:
`twin_capabilities`, `twin_personality`, `twin_state`, `notification_queue`,
`notification_analytics`, `follow_up_schedule`, `twin_visual_dna`,
`twin_learning_profiles`, `conversation_settings`, `conversation_memory`
→ insert ถูกปฏิเสธเงียบ ๆ (`029:164-190`, `030:140-148`, `020:88-99`)

**และ 3 policy ที่เปิดกว้างเกินจริง:**
- `019_daily_briefs.sql:28-31` — `FOR ALL USING (true)` ชื่อ policy บอกว่า "Service role"
  แต่ `USING (true)` ใช้กับ **ทุก role** → anon อ่าน/เขียน daily brief ของทุกคนได้
- `032_twin_learning_profiles.sql:30-34` — แบบเดียวกันสำหรับ UPDATE
- `001_decision_log_autonomy_tracking.sql:68-84` — view `autonomy_analytics`
  `GRANT SELECT TO anon` และ view ไม่ถูก RLS กรอง (ไม่มี `security_invoker`)
  → anon ดึงสถิติ autonomy/confidence ของผู้ใช้ทุกคนได้

---

### 🟠 API-01 · Endpoint ที่ client เรียกแต่ไม่มี handler (404 บน CF Pages)

`functions/api/[[route]].ts:33-40` รู้จักแค่ 7 module: `notifications`,
`twin-evolution`, `sice`, `stripe`, `profile`, `blueprint`, `share`

| path | ผู้เรียก | สถานะ |
|------|---------|-------|
| `/api/coach` | `AskCoach.tsx:78` | 404 → **ปิดฟีเจอร์แล้ว (COACH404-001)** |
| `/api/journal-sync` | `useJournalQueue.ts:157` | 404 → **หยุด mark failed แล้ว (JOURNAL404-001)** แต่ยังไม่ sync |
| `/api/nova-stream`, `/api/twin-stream` | `streamNovaResponse`, `streamTwinResponse` | 404 แต่ 2 ฟังก์ชันนี้ไม่มีใครเรียก (dead) |
| `/api/chat`, `/api/push`, `/api/personal-model` | chain ที่ตายแล้วทั้งหมด | ไม่กระทบผู้ใช้ |

---

### 🟠 API-02 · `/api/og` คืน HTML ไม่ใช่รูป — social preview พังทุกช่อง

`functions/api/og.ts:209-215` return `Content-Type: text/html`
แต่ `index.html:75,87` และ `src/constants/seoMetadata.ts:44,50` ใช้เป็น `og:image`
(ตัวเดิมบน Vercel ใช้ `ImageResponse` จาก `@vercel/og` ซึ่ง render PNG จริง —
ตอน port มา CF เหลือแต่ template HTML)

เพิ่มเติม: `og:image` ต้องเป็น absolute URL แต่ที่ใส่ไว้เป็น root-relative

**ทางเลือก:** render PNG บน Worker (satori + resvg) **หรือ** ใช้ `.jpg` static
เหมือนอีก 5 หน้าที่ทำถูกอยู่แล้ว (`seoMetadata.ts:60-130`) — อย่างหลังง่ายกว่ามาก

---

### 🟠 QA-01 · `npm test` รันแค่ 9.6% ของ suite

`vitest.config.ts` มี `include` เป็น allowlist แค่ 7 pattern
แต่ในรีโปมีไฟล์เทสต์ที่ vitest รันได้ **73 ไฟล์** (+ playwright อีก 8 spec)

```
73 ไฟล์เทสต์ใน src/ + api/
 7 ไฟล์ที่ include ครอบถึง  →  9.6%
```

แปลว่า "test ผ่านหมด" ที่เขียนไว้ในทุกเอกสาร = ผ่านจาก 7 ไฟล์
**ต้องตัดสินใจ:** เปิด include ให้ครบแล้วไล่แก้ที่พัง หรือลบเทสต์ 66 ไฟล์ที่ไม่ได้ใช้ทิ้ง —
สภาพปัจจุบัน (มีเทสต์แต่ไม่รัน) แย่กว่าทั้งสองทาง เพราะให้ความมั่นใจปลอม

---

### 🟡 QA-02 · TypeScript **ไม่ได้เปิด strict mode**

`tsconfig.app.json` ไม่มี `"strict": true` (grep แล้ว = 0)
มีแค่ `noUnusedLocals`/`noUnusedParameters` เอกสารที่เขียนว่า
"TypeScript strict mode passes" (CLAUDE.md Session 6) **ไม่ตรงกับ config**

`as any` ที่เหลือใน `src/`+`api/`+`functions/` (ไม่นับไฟล์เทสต์) = **101 จุด**
(เอกสาร Session 11 บอก 77 — ตัวเลขนั้นก็ล้าสมัยแล้ว)

---

### 🟡 CODE-01 · Dead code ที่หลอกให้เข้าใจผิด

| ของ | หลักฐาน |
|-----|---------|
| `functions/api/rate-limiter.ts` | ไม่ export `onRequest` → ไม่เกิด route และ **ไม่มีไฟล์ไหน import** เอกสาร Session 9/10 บอก "TD-03 CF KV rate limiting ✅ DONE" — **ไม่จริง โค้ดไม่เคยอยู่บน request path** และ `checkRateLimitSync` fallback เป็น `allowed: true` เสมอ |
| `src/middleware/csrf-middleware.ts` | 0 call site (แต่ API นี้ใช้ bearer token ไม่ใช่ cookie → ไม่ต้องมี CSRF อยู่แล้ว **ควรลบทิ้ง** ไม่ใช่ไป wire) |
| `src/middleware/rate-limit-middleware.ts`, `src/api/middleware/rateLimiter.ts` | rate limiter ตัวที่ 3 และ 4 ทั้งคู่ตาย |
| `src/api/unified-api-handler.ts` | บรรทัดที่ 1 เขียนเองว่า DEAD CODE |
| `src/api/core-awakening.ts` | สร้าง service_role client อยู่ใน `src/` (ยัง tree-shake ทิ้งเพราะไม่มีใคร import — แต่ถ้าใครเผลอ import เมื่อไหร่ key จะถูก inline ลง bundle ที่เบราว์เซอร์โหลดได้) |
| `server/` ทั้งโฟลเดอร์ | `server/index.ts:28` import `../api/decisions` ที่ไม่มีอยู่ → `npm run start` / `npm run dev:backend` พังทั้งคู่ |
| duplicate components 5 คู่ | `components/decision/DecisionForm.tsx`, `components/decision/DecisionLogger.tsx`, `components/TwinEvolutionDisplay.tsx`, `components/WorldEnvironment.tsx`, `components/features/DecisionList.tsx` — ทั้ง 5 ไม่มีใคร import (ตัวจริงอยู่ในโฟลเดอร์ย่อย) แก้ผิดไฟล์แล้วจะงงว่าทำไมไม่มีอะไรเปลี่ยน |
| `three` ใน dependencies | grep `from 'three'` ทั่ว `src/` = **0 จุด** แต่ `vite.config.ts:34` ยังมี `manualChunks` สร้าง `vendor-three` พร้อมคอมเมนต์อธิบายโค้ดที่ไม่มีอยู่ |

---

### 🟡 REPO-01 · `node_modules` + `dist` ถูก commit เข้า git

```
node_modules → 10,650 ไฟล์ถูก track
dist         →    105 ไฟล์ถูก track
.git         →     38 MB, clone ทั้ง repo = 253 MB
```

`.gitignore` เขียนถูก แต่ไฟล์ถูก add ก่อนกฎ → กฎไม่มีผล ทำให้ทุก `npm install`
กลายเป็น diff มหาศาล และ binary ของ Windows (`@oxlint/binding-win32-x64-msvc`,
`@rolldown/binding-win32-x64-msvc`) ติดไปกับ repo ด้วย

---

### 🟡 FE-01 · Frontend อื่น ๆ ที่เจอ

| รหัส | เรื่อง | หลักฐาน |
|------|-------|---------|
| FE-01a | ผู้ใช้ที่ล็อกอินแล้วเปิด `/th/` ได้ **หน้าเปล่าถาวร** — `HomeRoute` return `null` เมื่อมี session แล้วโยนให้ `useRecoveryRoute` แต่ hook นั้นปิดตัวเองหลังทำงานครั้งแรก (`sessionStorage['sp_recovery_done_for_user']`) → ไม่มีใคร navigate | `App.tsx:113-115` + `useRecoveryRoute.ts:85-93,124-127` |
| FE-01b | `EnvironmentContext` ตั้ง `setInterval` 60 วิ ด้วย `useEffect(..., [])` แต่ `compute` เป็น `useCallback` ที่เปลี่ยนตาม world/mood → interval ค้างที่ closure ตอน mount แล้วเขียนทับ CSS var ด้วยค่าเก่าทุกนาที | `EnvironmentContext.tsx:146-158` vs `:142` |
| FE-01c | `FeedbackProvider` ไม่ถูก mount → `useFeedback()` จะ throw (ตอนนี้ยังไม่ระเบิดเพราะ chain ทั้งเส้นเป็น dead code) | `contexts/FeedbackContext.tsx:20,44` |
| FE-01d | context value object ไม่ทำ `useMemo` เลยสัก provider (8 ตัว) — มี 14 provider ซ้อนกัน setState ตัวบนสุดครั้งเดียว re-render ทั้งแอป | `AuthContext.tsx:189`, `WorldContext.tsx:375`, ฯลฯ |
| FE-01e | `LanguageContext` เริ่มที่ `'en'` แล้วค่อยแก้ใน `useEffect` แต่ `/` redirect ไป `/th/` → คนไทยเห็นเฟรมภาษาอังกฤษ 1 เฟรมทุกครั้ง | `LanguageContext.tsx:14,18-23` |
| FE-01f | fetch ใน `useEffect` 8 จุดไม่มี AbortController — `BlogArticle.tsx:92,104` มี race จริง (เปลี่ยน slug เร็ว ๆ แล้วได้บทความผิด) | `BlogArticle.tsx`, `BlogListPage.tsx:184`, `AskCoach.tsx:49,78` |
| FE-01g | `translations.ts` มี 161 key แต่ใช้จริง 15 key — i18n จริงในโปรเจกต์ทำด้วย `isTh ? ... : ...` inline ประมาณ 40 คอมโพเนนต์ ตอนนี้มี 2 ระบบซ้อนกัน | `src/constants/translations.ts` |

---

## 4. หลักฐานการ verify (รันจริง ไม่ใช่คำกล่าวอ้าง)

```
สภาพแวดล้อม: clone ใหม่จาก GitHub @3cbbaf6 + npm install + ก็อปไฟล์ที่แก้ทับ

✅ npx tsc -p tsconfig.app.json --noEmit         → 0 errors   (src/, 458 ไฟล์)
✅ npx tsc -p tsconfig.functions.json --noEmit   → 0 errors   (functions/ + api/)
```

**negative control** (พิสูจน์ว่า typecheck ทำงานจริงไม่ใช่ผ่านเปล่า ๆ):
แทรก `const x: number = "str"` ลงใน `main.tsx` → รายงาน `error TS2322` ตามคาด แล้วลบออก

**ตอนรัน `tsconfig.functions.json` ครั้งแรกเจอ 13 errors** ซึ่งซ่อนอยู่มาตลอด
เพราะ `functions/` และ `api/` ไม่เคยอยู่ใน tsconfig ไหนเลย — แก้ครบทั้ง 13 แล้ว:
- 9 จุด: `.schema('selfprint')` ที่ Database type ไม่มี schema นั้น
- 4 จุด: `Env` interface ส่งเข้า `verifyUser()` ไม่ได้ (ไม่มี index signature)

### ❌ สิ่งที่ verify ในเซสชันนี้ **ไม่ได้** — พูดตรง ๆ

| คำสั่ง | ผล | เหตุผล |
|--------|-----|--------|
| `npm run build` (vite) | ❌ bus error (exit 135) | native binding ของ Rolldown crash ใน Linux sandbox |
| `npm test` (vitest) | ❌ bus error (exit 135) | สาเหตุเดียวกัน |
| `npm run lint` (oxlint) | ❌ bus error (exit 135) | สาเหตุเดียวกัน |

**ต้องรัน 3 คำสั่งนี้บน Windows เองก่อน deploy** — `tsc` ผ่านแล้วแต่ไม่ครอบคลุม
runtime และ bundling **อย่าเพิ่งถือว่าเสร็จจนกว่าจะรันผ่าน**

---

## 5. ลำดับที่ควรทำต่อ

### ทำวันนี้ (ยังมีความเสี่ยงค้างอยู่)
1. 🔴 **revoke OpenRouter key** — เป็นข้อเดียวที่ของหลุดออกไปนอกมือคุณแล้ว
2. 🔴 ลบ `.git\index.lock` → untrack secrets/node_modules/dist → filter-repo → force push
3. 🔴 แก้ auth ของ `send-push`, `daily-brief`, `pattern-detect` (ก็อป pattern จาก `data-export/index.ts:74-87`)
4. 🟠 รัน `npm run build` + `npm test` + `npm run lint` บน Windows ให้ผ่าน
5. 🟠 เช็ค `SELECT to_regclass('selfprint.performance_metrics');` ก่อน deploy metrics

### สัปดาห์นี้
6. ล้าง CRLF: `del .git\index.lock` → `git add --renormalize .` → commit (มี `.gitattributes` แล้ว)
7. ตัดสินใจเรื่อง migration 3 โฟลเดอร์ (DB-01) — นี่คือ root cause ของ "ฟีเจอร์เขียน DB ไม่ลง" เกือบทั้งหมด
8. แก้ 028↔029 (DB-02): ย้าย `DROP TABLE twin_memory` ไป migration ที่เลขมากกว่า 030
9. ตัดสินใจ QA-01: เปิด vitest include ให้ครบ หรือลบเทสต์ที่ไม่ใช้
10. แก้ FE-01a (หน้าเปล่าเมื่อ login แล้วกดโลโก้) — ผู้ใช้เจอบ่อยแน่นอน

### เมื่อว่าง
11. เลือกทางเดียวระหว่าง Vercel กับ Cloudflare แล้วลบอีกฝั่งทิ้ง — โค้ด auth ที่แตกเป็น 2 ชุด
    คือต้นตอของช่องโหว่หลายข้อในรายงานนี้ (`api/twin.ts` / `api/nova.ts` ไม่มี auth
    ขณะที่ `functions/api/` เวอร์ชันเดียวกันมี)
12. ลบ dead code ตาม CODE-01 — ทำให้ audit รอบหน้าเชื่อถือได้
13. เปิด `"strict": true` แล้วไล่แก้ `as any` 101 จุด
14. เพิ่ม `tsconfig.functions.json` เข้า `references` ของ `tsconfig.json` เมื่อพร้อมให้ build fail ได้

---

## 6. เอกสารที่โกหก — เทียบกับโค้ดจริง

| เอกสารอ้าง | ที่มา | ความจริงจากโค้ด |
|-----------|------|----------------|
| "Phase 3 automation → 91 TypeScript errors, 72 ไฟล์พัง" | `CLAUDE.md` Session 12, `PHASE_3_AUTOMATION_CLEANUP_HANDOFF.md` | **ไม่จริงเลย** 43 ไฟล์ต่างกันแค่ LF→CRLF (`git diff --ignore-cr-at-eol` = ว่าง, insertions = deletions เป๊ะ ๆ 8754 = 8754) ไม่มี TS error สักตัว |
| "Auth: JWT verified via Authorization header" | `functions/api/autonomy-log.ts:13` (เดิม) | ไม่มีโค้ด verify ในไฟล์เลย |
| "TD-03 CF KV rate limiting ✅ DONE (deployed)" | `CLAUDE.md` Session 9, `SESSION_10_HANDOFF.md:112` | `checkRateLimitKV` ไม่มีใคร import และไฟล์ไม่ export `onRequest` → ไม่เกิด route ด้วยซ้ำ |
| "TypeScript strict mode passes" | `CLAUDE.md` Session 6 | `tsconfig.app.json` ไม่มี `"strict"` เลย |
| "P1 ✅ Data Persistence (FBS) Complete" | `CLAUDE.md` Session 2 | ตาราง `user_feedback` ฯลฯ อยู่ใน `migrations/` ที่ CLI ไม่เคย apply |
| "P2 Production Verification ✅ 100%, zero stubs" | `CLAUDE.md` Session 6 | `/api/metrics` เขียนผิด schema + `rating` เป็นตัวเลข, `/api/autonomy-log` 400 ทุก request — ทั้งคู่บันทึกได้ 0 แถว |
| "รันแค่ทดสอบผ่านหมด / test ผ่าน" | หลายไฟล์ | vitest include ครอบ 7 จาก 73 ไฟล์ |
| "no `dangerouslySetInnerHTML` found (0 occurrences)" | `docs/SECURITY_AUDIT_2026-08-18.md:143` | มี 7 จุด (บังเอิญปลอดภัย เพราะ escape `</` ถูกต้อง แต่ผลสแกนผิด) |
| "TD-04 ลบ `as any` ครบ 50 จุด" | `CLAUDE.md` Session 10 | SICE layer สะอาดจริง ✅ แต่ทั้งโปรเจกต์ยังเหลือ 101 จุด (Session 11 นับได้ 77 ก็ล้าสมัยแล้ว) |
| `src/api/core-awakening.ts` เป็น dead code | ไฟล์นี้ฉบับเดิม | ✅ **ข้อนี้จริง** — verify แล้วไม่มีใคร import |

**บทเรียน:** ไฟล์ `.md` 87 ไฟล์ที่ root คือหนี้เชิงข้อมูล ไม่ใช่แค่ของรก
มันทำให้เซสชันถัดไปเริ่มจากสมมติฐานที่ผิดแล้วแก้ผิดจุด
**ควรลบให้เหลือไฟล์นี้ไฟล์เดียว + `docs/` ที่ยังมีสาระ**

---

## 7. รหัสอ้างอิงทั้งหมดในรอบนี้

`AUTHHDR-001` · `NOVAPROV-001` · `ERRBOUND-001` · `SENTRY-INIT-001` ·
`AUTONOMY-FIX-001` · `METRICS-FIX-001` · `CORS-ALLOWLIST-001` · `CFBUFFER-001` ·
`STRIPEWH-001` · `ENVNAME-001` · `NOTIFAUTH-001` · `NOTIFCOL-001` ·
`TWINEVOAUTH-001` · `DEBUGLEAK-001` · `COACH404-001` · `JOURNAL404-001` ·
`SCHEMA-TS-002` · `ENVTYPE-001` · `TSCONFIG-FUNCTIONS-001` · `GITIGNORE-FIX-001` · `CRLF-001`

grep รหัสเหล่านี้ในโค้ดจะเจอคอมเมนต์อธิบายว่าแก้อะไรและทำไม ตรงจุดที่แก้

---

**เขียนโดย:** Claude (forensic audit + fix session) — 3 ก.ย. 2026
**หลักการ:** ตรวจจากโค้ด ไม่ตรวจจากเอกสาร · แยก "แก้แล้ว verify แล้ว" ออกจาก
"แก้แล้วแต่ verify ไม่ได้" ออกจาก "ยังไม่แก้" · ไม่อ้างว่าทำสิ่งที่ยังไม่ได้ทำ

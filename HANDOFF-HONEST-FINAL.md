# 🚨 SELFPRINT V3 — Honest Handoff Final
**2026-08-28** | เขียนหลังอ่านโค้ดจริงทุกไฟล์

---

## สิ่งที่ฉันบอกผิดใน Handoff ก่อน → ความจริง

| ที่บอกผิด | ความจริง |
|-----------|---------|
| "CF Pages ยังไม่ deploy" | **Deploy แล้ว 35+ ครั้ง** ตั้งแต่เมื่อวาน ✅ |
| "ต้องทำ CF Pages ก่อน" | **ทำแล้ว** ปัญหาอยู่ที่อื่น |
| "Stripe ยังไม่รู้ status" | **มีครบ**: stripeService.ts + subscriptions table + handleStripe() ✅ |

---

## 🔴 ROOT CAUSE ที่แท้จริงของ APIs ทั้งหมดตาย

### ปัญหา: ไฟล์ API ยังเป็น Vercel format — CF Pages ไม่รู้จัก

```
api/twin.ts    ← import { VercelRequest, VercelResponse } from '@vercel/node'  ❌
api/nova.ts    ← import { VercelRequest, VercelResponse } from '@vercel/node'  ❌
api/metrics.ts ← import { VercelRequest, VercelResponse } from '@vercel/node'  ❌
api/og.ts      ← import { VercelRequest, VercelResponse } from '@vercel/node'  ❌
```

### ปัญหา: ไม่มี `functions/` directory

CF Pages ต้องการไฟล์ API อยู่ใน **`functions/`** เท่านั้น  
ไฟล์ใน `api/` ไม่ถูก serve เป็น serverless function บน CF Pages เลย

```
❌ api/twin.ts        → CF Pages ไม่สนใจไฟล์นี้เลย
✅ functions/api/twin.ts → CF Pages serve เป็น endpoint ได้
```

### ผลที่เกิดขึ้นตอนนี้ใน Production

```
GET  /api/twin        → CF Pages คืน HTML (SPA fallback)
POST /api/twin        → CF Pages คืน HTML (SPA fallback)
POST /api/nova        → CF Pages คืน HTML (SPA fallback)
GET  /api/stripe/*    → CF Pages คืน HTML (SPA fallback)
```

Frontend พยายาม `.json()` → **SyntaxError: Unexpected token '<'**  
→ Twin chat ตาย, Nova ตาย, Stripe ตาย, ทุก API ตาย

### unified-handler.ts

ไฟล์นี้เขียนเป็น CF Workers format ถูกต้องแล้ว:
```ts
export async function handler(request: Request): Promise<Response> { ... }
```
แต่ไม่ได้ถูก wire ขึ้นไปเป็น CF Pages Function หรือ CF Worker ที่ไหนเลย  
**เป็น dead code ณ ตอนนี้**

---

## 🗂️ Migration Status — ต้องเช็คด้วยตัวเอง

มี migration ทั้งหมด **36+ ไฟล์** ใน 3 โฟลเดอร์:

```
supabase/migrations/   ← 36 ไฟล์ (001–032 + dated files)
migrations/            ← 4 ไฟล์ (001–004 feedback/security/twin/lifecycle)
src/services/migrations/ ← 1 ไฟล์ (001-add-user-profiles)
```

**ไฟล์ที่น่าจะยังไม่ได้ apply (เพิ่มล่าสุด):**
```
supabase/migrations/032_twin_learning_profiles.sql
supabase/migrations/20260825_004_twin_visual_dna.sql
supabase/migrations/20260826_001_onboarding_checkpoints.sql
supabase/migrations/20260812000002_fix_decision_logs_uuid.sql
```

**วิธีเช็ค:** Supabase Dashboard → SQL Editor รัน:
```sql
SELECT name FROM supabase_migrations.schema_migrations ORDER BY name;
```
แล้วเทียบกับรายการไฟล์ใน supabase/migrations/

---

## 📊 Production Status จริงๆ (ณ วันนี้)

| Feature | Code | CF Deploy | API Works | DB Ready | Tested E2E |
|---------|------|-----------|-----------|----------|-----------|
| Landing Page | ✅ | ✅ | N/A | N/A | ❓ |
| Login / Auth | ✅ | ✅ | Supabase direct | ❓ | ❓ |
| Blog (list) | ✅ CRLF fix | ✅ | N/A | N/A | ❌ ยังไม่ verified |
| Blog (article) | ✅ CRLF fix | ✅ | N/A | N/A | ❌ ยังไม่ verified |
| Onboarding / Nova | ✅ | ✅ | ❌ /api/nova dead | ❓ | ❌ |
| CoreAwakening | ✅ Thai | ✅ | ❌ /api/sice dead | ❓ | ❌ |
| TwinChat | ✅ | ✅ | ❌ /api/twin dead | ❓ | ❌ |
| AnalysisPage | ✅ fallback | ✅ | ❌ | ❓ | ❌ |
| Worlds | ✅ | ✅ | ❌ | ❓ | ❌ |
| Stripe / Payment | ✅ code | ✅ | ❌ /api/stripe dead | ✅ schema | ❌ |
| Dashboard | ✅ | ✅ | ❌ | ❓ | ❌ |

**สรุป: frontend ขึ้น CF ได้ แต่ API ทุกตัวตายหมด**

---

## 🛠️ สิ่งที่ต้องทำเพื่อให้ API ทำงาน

### Option A — CF Pages Functions (แนะนำ, เร็วกว่า)

สร้าง `functions/api/` directory แล้ว port:

```
functions/
  api/
    twin.ts      ← ลบ VercelRequest/Response, เปลี่ยนเป็น CF Pages Functions format
    nova.ts      ← เดียวกัน
    [[route]].ts ← catch-all สำหรับ unified-handler (stripe, profile, blueprint ฯลฯ)
```

CF Pages Functions format:
```ts
// แทนที่ Vercel format:
export async function onRequest(context: EventContext<Env, any, any>) {
  const request = context.request;
  // ... logic เดิม ...
  return Response.json({ content });
}
```

### Option B — CF Worker แยก (ซับซ้อนกว่า)

Deploy unified-handler.ts เป็น CF Worker แยก แล้วทำ route ใน wrangler.toml  
ต้องตั้ง environment variables ทั้งสองที่ (Pages + Worker)

---

## 🔑 Environment Variables ที่ต้องตั้งใน CF Pages Dashboard

ไป CF Pages → selfprint-pwa-react → Settings → Environment Variables:

```
ANTHROPIC_API_KEY          ← สำหรับ Twin + Nova chat
STRIPE_SECRET_KEY          ← สำหรับ payment
STRIPE_WEBHOOK_SECRET      ← สำหรับ webhook
SUPABASE_SERVICE_ROLE_KEY  ← สำหรับ admin operations
VITE_SUPABASE_URL          ← อาจตั้งแล้ว
VITE_SUPABASE_ANON_KEY     ← อาจตั้งแล้ว
```

ถ้า env vars ไม่ตั้ง → API จะ deploy แต่ error 500 ทันที

---

## ✅ สิ่งที่ทำใน Session 3-4 (รวม code ที่ push แล้ว)

| งาน | สถานะ |
|-----|--------|
| Blog 25 บทความ + filePath index.json | ✅ push + deploy |
| Blog CRLF regex fix (BlogListPage + BlogArticle) | ✅ push + deploy |
| Blog scroll-to-top + restore position | ✅ push + deploy |
| Blog renderInline (bold, lists) | ✅ push + deploy |
| SEO/GEO/AEO JSON-LD schemas | ✅ push + deploy |
| TwinChat ANALYSIS-PERSIST-001 (fetch awakening_essence) | ✅ push + deploy |
| TwinChat BIRTHDATE-RECOVER-001 | ✅ push + deploy |
| CoreAwakening CEREMONY-REDIRECT-001 | ✅ push + deploy |
| AnalysisPage ANALYSIS-FALLBACK-001 | ✅ push + deploy |
| WorldBadgeTracker PGRST205 fix | ✅ push + deploy |
| CoreAwakening.tsx ภาษาไทย | ✅ push + deploy |

---

## 📋 Checklist ที่ต้องทำใน Session ถัดไป (เรียงตามด่วน)

### 1. Port API เป็น CF Pages Functions [ด่วนที่สุด]
- [ ] สร้าง `functions/api/twin.ts` (CF format)
- [ ] สร้าง `functions/api/nova.ts` (CF format)
- [ ] สร้าง `functions/api/[[route]].ts` (unified handler สำหรับ stripe, profile, blueprint, sice)
- [ ] ลบ import `@vercel/node` ทั้งหมด

### 2. ตั้ง Environment Variables ใน CF Pages [ด่วน]
- [ ] ตรวจว่า ANTHROPIC_API_KEY ตั้งใน CF Pages Dashboard แล้วหรือยัง
- [ ] ตรวจ STRIPE_SECRET_KEY
- [ ] ตรวจ SUPABASE_SERVICE_ROLE_KEY

### 3. เช็ค Migration [สำคัญ]
- [ ] Supabase SQL Editor → เช็ค migrations ที่ apply แล้ว
- [ ] Apply ไฟล์ที่ยังไม่ได้ apply (โดยเฉพาะ 20260826, 20260825, 032)

### 4. ทดสอบหลัง API fix
- [ ] selfprint.one/th/blog → บทความแสดงเนื้อหาไทย ไม่ใช่ raw text
- [ ] Login → ผ่าน
- [ ] Nova onboarding chat → ตอบได้ (test ง่ายที่สุด)
- [ ] CoreAwakening → Twin เกิดได้
- [ ] TwinChat → Twin ตอบด้วย behavioral data
- [ ] Stripe pricing page → ราคาถูกต้อง
- [ ] Payment flow → ไม่ crash

### 5. Supabase Auth redirect URL
- [ ] เพิ่ม `https://selfprint.one` ใน Supabase Auth → Redirect URLs (ถ้ายังไม่มี)
- [ ] เพิ่ม `http://localhost:5173` สำหรับ dev

---

## 📁 ไฟล์ที่ต้อง Port เป็น CF Format

```
api/twin.ts     → functions/api/twin.ts      (ลบ VercelRequest/Response)
api/nova.ts     → functions/api/nova.ts      (ลบ VercelRequest/Response)
api/unified-handler.ts → functions/api/[[route]].ts  (wire up แล้ว)
```

twin.ts และ nova.ts เป็นไฟล์ที่ใหญ่และซับซ้อน (rate limit, streaming)  
ต้องทำอย่างระวัง ทดสอบทีละ endpoint

---

*Honest handoff — 2026-08-28 — อ่านจาก source code จริง ไม่มีเดา*

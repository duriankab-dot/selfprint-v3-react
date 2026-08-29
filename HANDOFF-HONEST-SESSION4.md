# 🚨 SELFPRINT V3 — Honest Handoff (Session 4)
**วันที่:** 2026-08-28 | สำหรับเริ่มแชทใหม่

> ⚠️ เอกสารนี้เขียนแบบ honest ตรงไปตรงมา ไม่มีการโป้ปด

---

## 🔴 สถานะจริงของ Production

**selfprint.one ไม่ทำงานเลย** — Vercel paused (เกิน quota จาก k6 CI hammering)

```
selfprint.one   → CNAME → selfprint-pwa-react.pages.dev  (VERCEL, PAUSED)
www.selfprint.one → CNAME → selfprint-pwa-react.pages.dev  (VERCEL, PAUSED)
Nameservers: Cloudflare ✅ (พร้อม redirect DNS ไป CF Pages)
```

**ผลคือ:** ทุก fix ที่ทำมาตลอด session 3-4 ยังไม่ได้ถูกทดสอบใน production จริง แม้แต่บรรทัดเดียว

---

## 📦 Git Status ที่แท้จริง

### Commit ล่าสุดที่ push แล้ว
```
b27e7d6  fix: blog filePath resolver + SEO/GEO/AEO JSON-LD schema
```

### ✅ ไฟล์ที่ commit+push แล้ว (verified อยู่ใน repo)
- `src/pages/TwinChat.tsx` — ANALYSIS-PERSIST-001 + BIRTHDATE-RECOVER-001
- `src/pages/CoreAwakeningCeremony.tsx` — redirect fix
- `src/pages/AnalysisPage.tsx` — ANALYSIS-FALLBACK-001
- `src/services/WorldBadgeTracker.ts` — ลบ `.schema('selfprint')`
- `src/components/dashboard/AITwinSection.tsx` — content-type guard
- `public/blog/index.json` — เพิ่ม filePath field ทุก 25 บทความ
- `src/pages/BlogListPage.tsx` — (version แรก)
- `src/pages/BlogArticle.tsx` — (version แรก)

### ❌ ไฟล์ที่แก้ใน session นี้ ยังไม่ push
| ไฟล์ | การแก้ | ทำไมสำคัญ |
|------|--------|-----------|
| `src/pages/BlogListPage.tsx` | CRLF fix + scroll behavior + renderInline helper | บทความแสดงเป็น raw code บน Windows |
| `src/pages/BlogArticle.tsx` | CRLF fix (เพิ่งแก้ session นี้) | "Invalid article format" error ทุกครั้ง |
| `src/pages/CoreAwakening.tsx` | แปล UI เป็นภาษาไทย | ยังเห็น "Your Intelligence Awakens" อยู่ |

### คำสั่ง push
```bash
git add src/pages/BlogListPage.tsx \
        src/pages/BlogArticle.tsx \
        src/pages/CoreAwakening.tsx
git commit -m "fix: blog CRLF render + scroll behavior + CoreAwakening Thai UI"
git push
```

---

## 🔍 Honest Bug Status — แยกให้ชัด

### 🟢 แก้แล้ว + push แล้ว (แต่ยังไม่ production verified)
| Bug | Fix | สถานะ |
|-----|-----|--------|
| Twin บอก "ข้อมูลไม่พอ" 20 รอบ | เปลี่ยน fetch จาก `profiles_blueprints.final_analysis` → `awakening_essence.personal_intelligence` | code ✅, production ❌ ยังไม่ deploy |
| CoreAwakeningCeremony redirect 404 | `/twin/${id}/chat` → `/${lang}/chat/twin` | code ✅, production ❌ |
| AnalysisPage ว่างเปล่า | fallback query ไปที่ `awakening_essence` | code ✅, production ❌ |
| PGRST205 unlocked_badges | ลบ `.schema('selfprint')` | code ✅, production ❌ |
| API 405 (CF Pages SPA) | content-type guard | code ✅, production ❌ |

### 🟡 แก้แล้ว + ยังไม่ push (session นี้)
| Bug | Root Cause ที่พบจริง | Fix |
|-----|---------------------|-----|
| บล็อกบทความแสดง raw markdown / โค้ด | Windows CRLF (\r\n) ทำให้ regex `/^---\n/` ล้มเหลว ใน **ทั้ง BlogListPage และ BlogArticle** | normalize ก่อน parse ✅ |
| BlogArticle throw "Invalid article format" | regex เดียวกัน | แก้ทั้ง 2 ไฟล์แล้ว ✅ |
| scroll ไม่กลับมาที่หัวข้อเดิม | ไม่มี scroll save/restore | เพิ่ม `savedScrollY.current` ✅ |
| CoreAwakening ภาษาอังกฤษ | hardcode EN strings | แปลเป็น Thai ✅ |

### 🔴 ยังไม่ได้แก้ (ค้างอยู่)
| Bug | สาเหตุ | สิ่งที่ต้องทำ |
|-----|--------|-------------|
| **Dev login ไม่ได้** | Supabase Auth ไม่มี `http://localhost:5173` ใน Redirect URLs | เข้า Supabase Dashboard → Auth → URL Config → เพิ่ม localhost |
| **selfprint.one down** | Vercel paused | Deploy CF Pages (ดูหัวข้อถัดไป) |
| **Worlds content ว่างเปล่า** | analysis data ไม่ flow เข้า WorldContext หลัง Twin ตื่น | ยังไม่ได้สืบสวน root cause |
| **blog ในdev แสดงหัวข้อแต่ไม่มีบทความ** | ต้องทดสอบหลัง CRLF fix push | รอ push + dev server reload |
| **TwinNaming component** ยังเป็น EN | อยู่ใน `src/components/twin/TwinNaming.tsx` | ยังไม่ได้แตะ |
| **Error messages จาก services** ยังเป็น EN | TwinContextInitializer, FirstConversationSetup, CoreAwakeningService | ยังไม่ได้แตะ |
| **`firstInsight` text จาก DB** | ถ้า insight ถูก generate เป็น EN จะยังแสดง EN | ต้องดูว่า CoreAwakeningService generate ภาษาอะไร |

---

## ⚠️ สิ่งที่ยัง UNVERIFIED ทั้งหมด (ไม่มีอะไร E2E tested จริง)

**ตามที่ production down ตลอด session นี้ ทุกอย่างต่อไปนี้ไม่เคยผ่านการทดสอบจริง:**

```
❌ Login flow ใน production
❌ Onboarding → FineTuning → FullAnalysis → CoreAwakening flow
❌ Twin creation (ข้อมูลเข้า awakening_essence จริงหรือเปล่า?)
❌ TwinChat กับ analysis data จริง (ไม่รู้ว่า personal_intelligence มีข้อมูลใน DB)
❌ Blog ทุกบทความ (CRLF fix ยังไม่ deploy)
❌ WorldBadge (PGRST205 fix ยังไม่ deploy)
❌ AnalysisPage fallback (ยังไม่ deploy)
❌ Payment / Subscription flow
❌ Mobile responsive (ไม่ได้ทดสอบ)
❌ Dark mode
❌ /en/* routes (English version)
```

---

## 🛠️ ขั้นตอนที่ต้องทำเพื่อให้ Production Live

### Step 1 — Push code (5 นาที)
```bash
git add src/pages/BlogListPage.tsx src/pages/BlogArticle.tsx src/pages/CoreAwakening.tsx
git commit -m "fix: blog CRLF render + scroll behavior + CoreAwakening Thai UI"
git push
```

### Step 2 — Deploy Cloudflare Pages (30 นาที)
1. [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create project → Connect GitHub
2. เลือก repo `selfprint-v3-react`
3. Build: `npm run build` | Output: `dist` | Node: 22
4. รอ deploy → ได้ URL ใหม่ เช่น `selfprint-v3-react.pages.dev`

### Step 3 — อัพเดต DNS (5 นาที)
Cloudflare Dashboard → selfprint.one → DNS:
```
แก้ CNAME: selfprint.one → selfprint-v3-react.pages.dev (CF Pages ใหม่)
แก้ CNAME: www.selfprint.one → selfprint-v3-react.pages.dev
```
เพิ่ม Custom Domain ใน CF Pages Project: `selfprint.one`

### Step 4 — แก้ Dev login (2 นาที)
Supabase Dashboard → Authentication → URL Configuration:
```
เพิ่ม: http://localhost:5173
เพิ่ม: http://localhost:5174  (vite อาจใช้ port อื่น)
```

### Step 5 — E2E Verify (ทำก่อนบอกว่า production ready)
```
[ ] selfprint.one เปิดได้ (200 OK)
[ ] Login ด้วย email จริง
[ ] Onboarding ไปถึง CoreAwakening ได้
[ ] Twin ตื่น + redirect ไปหน้า chat ถูก route
[ ] TwinChat — Twin ตอบด้วยข้อมูลพฤติกรรม ไม่ใช่ generic
[ ] Blog list โหลดได้
[ ] คลิกบทความ → เห็นเนื้อหา (ไม่ใช่ raw markdown)
[ ] กดกลับ → scroll ไปที่การ์ดเดิม
[ ] AnalysisPage แสดงผล (ไม่ว่าง)
[ ] Dashboard โหลดได้
[ ] Worlds เปิดได้
```

---

## 🏗️ งานใหญ่ที่ยังไม่ได้เริ่มเลย

| งาน | Priority | ความซับซ้อน |
|-----|----------|------------|
| **CF Workers migration** — port 12 APIs จาก `@vercel/node` format | P0 หลัง CF Pages deploy | สูงมาก (ต้องเขียนใหม่ทุก API) |
| **Worlds content** — ทำไมว่างเปล่าหลัง Twin ตื่น | P1 | ต้องสืบสวนก่อน |
| **Stripe/Subscription** — เคยมี package ตั้งไว้ ไม่รู้ status | P1 | ไม่ได้ตรวจสอบใน session นี้ |
| **Phase B (Community)** | P2 | ยังไม่ได้วางแผน |
| **English version** (`/en/*` routes) | P2 | ไม่ได้ทดสอบ |
| **TwinNaming component → Thai** | P2 | ไม่ได้แตะ |
| **Mobile UX audit** | P2 | ไม่ได้ทดสอบ |

---

## 📁 Files ที่ต้องรู้จัก

```
src/pages/CoreAwakening.tsx         ← WOW#3 ceremony (แก้ Thai แล้ว)
src/pages/TwinChat.tsx              ← chat + analysis fetch (แก้แล้ว push แล้ว)
src/pages/AnalysisPage.tsx          ← analysis display (fallback แก้แล้ว push แล้ว)
src/pages/BlogListPage.tsx          ← blog list + inline reader (CRLF fix รอ push)
src/pages/BlogArticle.tsx           ← blog full page (CRLF fix รอ push)
src/services/CoreAwakeningService.ts ← SICE orchestration (ไม่ได้แตะ)
src/lib/intelligence/InsightEngine.ts ← analysis generation (ไม่ได้แตะ)
src/config/twin-prompts.ts          ← Twin system prompt (ไม่ได้แตะ)
public/blog/index.json              ← 25 บทความ + filePath (push แล้ว)
public/blog/selfprint/**/*.md       ← 25 ไฟล์ .md (ไฟล์อยู่ครบ push แล้ว)
```

---

## 🔒 Security Constraints (ห้ามลืม)

```
userId:   useAuth().session?.user?.id เท่านั้น
supabase: import { supabase } from '../services/supabase-service'
          guard: if (!supabase) return
CSS:      var(--...) เท่านั้น — ห้าม hardcode
import:   verbatimModuleSyntax → "import type {}" สำหรับ type-only
ห้ามแตะ: .env / migrations / config production
ห้ามลาก lib ใหม่โดยไม่ถาม
ห้าม refactor นอก scope
```

---

## 📊 Production Readiness Score (Honest)

| Feature | Code | Tested | Production |
|---------|------|--------|-----------|
| Landing Page | ✅ | ✅ (dev) | ❌ down |
| Login / Auth | ✅ | ⚠️ dev broken | ❌ down |
| Onboarding | ✅ | ⚠️ partial | ❌ down |
| CoreAwakening | ✅ | ❌ | ❌ down |
| TwinChat | ✅ | ❌ | ❌ down |
| AnalysisPage | ✅ | ❌ | ❌ down |
| Blog | ✅ | ❌ | ❌ down |
| Worlds | ✅ | ❌ | ❌ down |
| Dashboard | ✅ | ❌ | ❌ down |
| Payment/Stripe | ❓ | ❌ | ❌ down |

**Overall: code พร้อม แต่ 0% production verified เพราะ hosting down**

---

> สิ่งที่ต้องทำก่อนอื่นคือ: **CF Pages deploy + DNS redirect** — หลังจากนั้นค่อยทำ E2E verify ทีละฟีเจอร์
> ห้ามประกาศ "production ready" จนกว่าจะผ่าน E2E checklist ข้างบนครบ

*Handoff: 2026-08-28*

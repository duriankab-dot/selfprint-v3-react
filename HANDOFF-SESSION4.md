# 📋 SELFPRINT V3 — Handoff Session 4
**วันที่:** 2026-08-28 | **เตรียมโดย:** AI Dev (Claude)

---

## 1. สถานะโค้ดปัจจุบัน

### Git commit ล่าสุด
```
b27e7d6  fix: blog filePath resolver + SEO/GEO/AEO JSON-LD schema
```

### ไฟล์ที่แก้แล้ว (Session 3–4) แต่ **ยังไม่ push**

| ไฟล์ | การแก้ไข |
|------|---------|
| `src/pages/TwinChat.tsx` | ANALYSIS-PERSIST-001: fetch จาก `awakening_essence.personal_intelligence` แทน `profiles_blueprints.final_analysis` + BIRTHDATE-RECOVER-001 |
| `src/pages/CoreAwakeningCeremony.tsx` | CEREMONY-REDIRECT-001: แก้ URL `/twin/${id}/chat` → `/${lang}/chat/twin` |
| `src/pages/AnalysisPage.tsx` | ANALYSIS-FALLBACK-001: เพิ่ม fallback query ไปที่ `awakening_essence` |
| `src/services/WorldBadgeTracker.ts` | ลบ `.schema('selfprint')` ออก (unlocked_badges อยู่ใน public schema) |
| `src/components/dashboard/AITwinSection.tsx` | content-type guard + retry:false |
| `src/pages/BlogListPage.tsx` | CRLF fix, scroll behavior, inline markdown renderer |
| `src/pages/CoreAwakening.tsx` | แปลข้อความ UI เป็นภาษาไทย |
| `public/blog/index.json` | เพิ่ม `filePath` field ทุก 25 บทความ |

### คำสั่ง push ที่ต้องรัน
```bash
git add src/pages/TwinChat.tsx \
        src/pages/CoreAwakeningCeremony.tsx \
        src/pages/CoreAwakening.tsx \
        src/pages/AnalysisPage.tsx \
        src/pages/BlogListPage.tsx \
        src/services/WorldBadgeTracker.ts \
        src/components/dashboard/AITwinSection.tsx \
        public/blog/index.json

git commit -m "fix: Twin data pipeline, blog CRLF render, CoreAwakening Thai UI, scroll behavior"
git push
```

---

## 2. สถานะ Domain / Hosting

### ปัญหาหลัก: selfprint.one ชี้ไปที่ Vercel ที่ Paused
```
selfprint.one   CNAME → selfprint-pwa-react.pages.dev  ← VERCEL (PAUSED เพราะ quota)
www.selfprint.one CNAME → selfprint-pwa-react.pages.dev  ← เดียวกัน
```

### Nameservers
```
amy.ns.cloudflare.com  ✅
carl.ns.cloudflare.com ✅
```
(Porkbun ส่ง NS ไป Cloudflare แล้ว — ควบคุม DNS ผ่าน CF Dashboard ได้เลย)

### สิ่งที่ต้องทำเพื่อให้ selfprint.one ทำงาน

**ขั้นตอน A — Deploy Cloudflare Pages (Frontend)**
1. ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create a project
2. เชื่อม GitHub repo `selfprint-v3-react`
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: 22
4. รอ deploy → จะได้ URL เช่น `selfprint-v3-react.pages.dev`

**ขั้นตอน B — เปลี่ยน CNAME ใน Cloudflare DNS**
1. ไปที่ Cloudflare Dashboard → selfprint.one → DNS
2. แก้ CNAME record `selfprint.one` (หรือ root/apex) → ชี้ไปที่ `selfprint-v3-react.pages.dev`
3. แก้ CNAME `www.selfprint.one` → ชี้ไปที่ `selfprint-v3-react.pages.dev`
4. Add custom domain ใน CF Pages project: `selfprint.one` และ `www.selfprint.one`

**ขั้นตอน C — CF Workers (APIs)**
- port 12 APIs จาก `@vercel/node` format → CF Workers format
- ไฟล์หลัก: `unified-api-handler.ts` (ต้องเขียนใหม่)
- แต่ละ API ต้องเปลี่ยน:
  - `import { VercelRequest, VercelResponse }` → `export default { fetch(request: Request) }`
  - `req.body` → `await request.json()`
  - `res.json()` → `new Response(JSON.stringify(...), { headers: ... })`

---

## 3. ปัญหาที่ยังค้างอยู่ (เรียงตามความเร่งด่วน)

### 🔴 CRITICAL

| # | ปัญหา | สาเหตุ | วิธีแก้ |
|---|-------|--------|---------|
| C1 | **selfprint.one ไม่ทำงาน** | Vercel paused, CF Pages ยังไม่ deploy | ทำขั้นตอน A-C ด้านบน |
| C2 | **ไฟล์แก้แล้วยังไม่ push** | git lock file (timeout session ก่อน) | รัน `git add ... && git commit && git push` ข้างต้น |

### 🟡 HIGH

| # | ปัญหา | สาเหตุ | วิธีแก้ |
|---|-------|--------|---------|
| H1 | **บล็อกบทความแสดง raw text / โค้ด** | Markdown file ใช้ CRLF — regex `\n` ล้มเหลว | **แก้แล้วใน BlogListPage.tsx** (รอ push + deploy) |
| H2 | **Login ใน dev ไม่ได้** | Supabase Auth redirect URL อาจไม่มี `localhost:5173` | ไปที่ Supabase Dashboard → Auth → URL Configuration → เพิ่ม `http://localhost:5173` ใน Redirect URLs |
| H3 | **Twin ยังบอก "ข้อมูลไม่พอ"** | fetch จาก column ที่ไม่มี | **แก้แล้วใน TwinChat.tsx** (รอ push + deploy) |

### 🟢 MEDIUM

| # | ปัญหา | สาเหตุ | วิธีแก้ |
|---|-------|--------|---------|
| M1 | **Worlds content ว่างเปล่า** | FullAnalysis data ไม่ flow เข้า world context | ตรวจสอบหลัง TwinChat fix deploy แล้ว |
| M2 | **AnalysisPage แสดงผลว่าง** | `personal_context` table ว่างสำหรับ new users | **แก้แล้วใน AnalysisPage.tsx** (รอ push + deploy) |
| M3 | **Blog scroll behavior** | ไม่มี scroll-to-top / restore position | **แก้แล้วใน BlogListPage.tsx** (รอ push + deploy) |
| M4 | **CoreAwakening ภาษาอังกฤษ** | UI text เป็น EN ทั้งหมด | **แก้แล้วใน CoreAwakening.tsx** (รอ push + deploy) |

---

## 4. Architecture Twin Data Pipeline (ตรวจสอบหลัง deploy)

```
Onboarding → FineTuning → FullAnalysis
    ↓
awakening_essence table
  ├── personal_intelligence  (PersonalIntelligence object)
  ├── sice_results           (SICEOutput[])
  └── synthesis              (CrossEngineSynthesis)
    ↓
TwinChat.tsx (ANALYSIS-PERSIST-001 fix)
  └── fetch awakening_essence → map → FullAnalysisOutput → setCurrentAnalysis()
    ↓
buildTwinSystemPrompt(twinName, twinProfile, ...) → OpenAI
  └── ห้าม Twin พูด "ข้อมูลไม่พอ" (prompt instructed)
```

**Success criteria:** เปิด Chat แล้ว Twin ตอบด้วยข้อมูลพฤติกรรมจริง ไม่ใช่ generic response

---

## 5. กติกาการทำงาน (Security Constraints)

```
userId:   useAuth().session?.user?.id เท่านั้น
supabase: import { supabase } from '../services/supabase-service'
          supabase อาจเป็น null → ต้องมี guard: if (!supabase) return
CSS:      ใช้ var(--...) เท่านั้น — ห้าม hardcode สี/ขนาด
import:   verbatimModuleSyntax → ใช้ "import type {}" สำหรับ type-only
ห้ามแตะ: .env / migrations / config production
ห้ามลาก lib/pattern ใหม่โดยไม่ถาม
ห้าม refactor นอก scope
```

---

## 6. งานใหญ่ที่ยังไม่ได้ทำ (Blocked)

- **CF Workers migration:** port 12 APIs จาก @vercel/node → CF Workers format
- **Phase B (Community):** ยังไม่ได้วางแผน — รอ Phase A complete ก่อน
- **WorldBadge + Worlds content:** ต้องทดสอบหลัง Twin pipeline fix deploy

---

## 7. คำสั่งตรวจงาน (Verify Commands)

```bash
# ก่อน commit
npm run build      # TypeScript + build ต้องผ่าน
npm run lint       # ไม่มี error ใหม่

# หลัง deploy
# 1. เปิด selfprint.one/th/blog → เห็นรายการบทความ ✅
# 2. คลิกบทความ → เห็นเนื้อหาภาษาไทย (ไม่ใช่ raw markdown) ✅
# 3. กดกลับ → scroll กลับไปที่การ์ดบทความเดิม ✅
# 4. Login → เข้า Chat → Twin ตอบด้วย behavioral data ✅
# 5. AnalysisPage → เห็น analysis (ไม่ว่างเปล่า) ✅
```

---

## 8. ลำดับงาน Next Session

1. `git push` ทั้งหมด (ดูคำสั่งหัวข้อ 1)
2. Deploy CF Pages (ขั้นตอน A-B หัวข้อ 2)
3. แก้ Supabase redirect URL สำหรับ dev (H2)
4. ทดสอบ blog → Twin → Analysis pipeline ครบ
5. เริ่มวางแผน Phase B Community

---

*Handoff เตรียมโดย AI Dev — ข้อมูล ณ 2026-08-28*

# 🤝 SELFPRINT V3 — คู่มือการมีส่วนร่วม (CONTRIBUTING GUIDE)

**อัปเดตล่าสุด:** 6 กันยายน 2026 · HEAD `da855c5`
**เอกสารสถานะฉบับเดียวที่ถูกต้อง:** [`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`](./FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md)

---

## 🔴 หลักการสูงสุดของโปรเจกต์นี้

1. **ตรวจจากโค้ด ไม่ตรวจจากเอกสาร** — เอกสาร `.md` ที่ root 84 ไฟล์ถูกลบทิ้งแล้วเพราะอ้างสิ่งที่โค้ดไม่ได้ทำ
2. **ห้ามอ้างว่าทำเสร็จ ถ้ายังไม่ได้ verify** — แยกให้ชัด: "แก้แล้ว verify แล้ว" / "แก้แล้วแต่ verify ไม่ได้" / "ยังไม่แก้"
3. **Surgical changes** — แตะเฉพาะไฟล์ที่เกี่ยวข้อง ไม่ refactor นอก scope
4. **ทุกงานต้องมี success criteria + วิธีตรวจ** — ห้ามจบด้วย "แก้แล้วครับ" เฉย ๆ

---

## 🚀 การตั้งค่า Development Environment

### 1. Clone + Install

```bash
git clone https://github.com/duriankab-dot/selfprint-v3-react.git
cd selfprint-v3-react
npm ci
```

### 2. Environment Variables

```bash
cp .env.example .env.local
# แก้ .env.local ด้วย Supabase credentials (ดู .env.example ให้ครบทั้ง client / server / e2e)
```

### 3. คำสั่งที่ใช้จริง (verify จาก package.json แล้ว)

| คำสั่ง | หน้าที่ |
|--------|--------|
| `npm run dev` | เริ่ม Vite dev server |
| `npm run build` | `tsc -b && vite build` — type check + production build |
| `npm test` | รัน Vitest ทั้งหมด (`vitest run`) |
| `npm run lint` | รัน oxlint |
| `npm run typecheck:functions` | type-check `functions/` + `api/` (strict) |
| `npm run preview` | preview production build |
| `npm run test:e2e` | รัน Playwright E2E tests |
| `npm run test:e2e:staging` | รัน staging E2E tests |

> ⚠️ ถ้า build/test พังด้วย **bus error** = ไฟล์ native ติดตั้งไม่ครบ ไม่ใช่ Linux ไม่รองรับ
> เช็คขนาด: `@rolldown/binding-*` ต้อง ~19.9 MB · `lightningcss-*` ~10 MB · `@oxlint/binding-*` ~16 MB
> ถ้าเล็กกว่านั้นมาก ให้ `rm -rf node_modules && npm install` ใหม่ให้จบจริง

---

## 🚫 โซนห้ามแตะ (DO-NOT-TOUCH ZONES)

**ห้ามแก้ไขโดยไม่ขออนุมัติเด็ดขาด** — ถ้าต้องแตะ ให้ STOP แล้วขอ approval ก่อน:

```
SICE / SICE Orchestrator        AI intelligence pipeline
Zustand business state          Auth
Lifecycle logic                 Twin intelligence
Analysis calculation            routing core
rename NOVA ใน code             ← ห้าม rename NOVA ในโค้ดเด็ดขาด
```

### เกร็ดที่ต้องรู้ก่อนแตะโค้ด (verify แล้ว)

- **`functions/` เท่านั้นที่ deploy** — `api/` เข้าถึงได้เพราะ `[[route]].ts` import เข้ามา
- **`src/lib/intelligence/*` กับ `src/services/sice/engines/*` เป็น fork คนละตัวจริง ๆ**
  ทั้งคู่ live คนละ implementation เชื่อมทางเดียวผ่าน `SICEBridge.ts`
  — **ห้ามลบฝั่งไหนทิ้งเพราะคิดว่าซ้ำ**
- **`personal_context` (เอกพจน์) ≠ `personal_contexts` (พหูพจน์)** คนละตาราง คนละคอลัมน์
- **`selfprint.users_profiles.id` เป็น surrogate key** ไม่ใช่ auth uid
  ต้อง query ด้วย `.eq('user_id', userId)` เสมอ
- **i18n** ทำด้วย inline `isTh ? ... : ...` (958 จุด) + `useLanguage`/`TRANSLATIONS`/`t(` (1607 จุด)
  — มี 2 ระบบซ้อนกันอยู่ ตัดสินใจใน Track C
- **CRLF**: มี `.gitattributes` แล้ว commit ครั้งถัดไปจะมี renormalize diff ก้อนใหญ่ครั้งเดียว
  — **นั่นไม่ใช่การเปลี่ยนเนื้อหา**
- **`components/features/DecisionList.tsx` ยังใช้อยู่จริง** (`DecisionLogger.tsx:24`) อย่าลบ

---

## 📏 Change Budget (กฎจาก Track C — guardrail ไม่ใช่ quota)

| ขนาด | ข้อกำหนด |
|------|---------|
| **≤ 8 files** | ปกติ — ทำได้เลย |
| **9–15 files** | ต้องมี **change map** + **test** ครอบคลุม |
| **16–30 files** | ต้องเป็น **dedicated phase** แยกต่างหาก |
| **> 30 files** หรือ **แตะ SICE / API / DB / Lifecycle / Auth / AI pipeline / core state** | **STOP — ขออนุมัติก่อน** |

---

## 🔀 Commit Discipline

**แยก commit เสมอ** ตามลำดับนี้ (ห้ามรวมเป็น commit เดียว):

```
VISUAL FOUNDATION
→ <SCREEN> UX
→ <SCREEN> PRESENTATION REFACTOR
→ <SCREEN> VERIFICATION
```

ตัวอย่าง:

```bash
git checkout -b track-c/landing
git commit -m "VISUAL FOUNDATION: design tokens + layout primitives"
git commit -m "LANDING UX: hero + value props"
git commit -m "LANDING PRESENTATION REFACTOR: extract section components"
git commit -m "LANDING VERIFICATION: vitest + build + lint pass"
```

- 1 branch = 1 งาน
- Commit message ต้องบอก **what + why**
- Push เมื่อ **COMPLETE + VERIFIED** เท่านั้น

---

## 🧪 ข้อกำหนดการทดสอบ

- **`npm test` ต้องผ่านทั้งหมด** — ปัจจุบัน 66/66 ไฟล์ · 1037 tests · 0 fail · 0 skip
- **ห้ามเทสต์ยิงเน็ตจริง / Supabase จริง** — เทสต์ต้องไม่พึ่ง network หรือ DB จริง
  (ถ้าเจอเทสต์ที่ยิงเน็ต ให้ mock หรือแยกออก)
- **`npm run build` ต้องผ่าน** (`tsc -b && vite build`)
- **`npm run lint` ต้อง 0 errors** (oxlint — ปัจจุบัน 187 warnings ที่ยอมรับได้)
- **`npm run typecheck:functions` ต้องผ่าน** ถ้าแตะ `functions/` หรือ `api/`

### Definition of Done (ทุกงานต้องผ่านครบ)

```
✓ tsc -b                    0 errors
✓ npm run typecheck:functions  0 errors
✓ vite build                สำเร็จ
✓ oxlint                    0 errors
✓ vitest                    ผ่านครบทุกไฟล์
✓ ไม่มี placeholder / fake data / TODO ใน production path
✓ ของเดิมที่เคยทำงาน ยังทำงาน
```

---

## 📖 หลักความซื่อสัตย์ของเอกสาร (Documentation Honesty)

- **ห้ามอ้างว่าทำเสร็จ ถ้ายังไม่ได้ verify** — "แก้แล้ว" ≠ "เสร็จ" ถ้ายังไม่ได้รันเทสต์/ตรวจจริง
- **`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` คือ source of truth** — ถ้าเอกสารอื่นขัดแย้ง ให้เชื่อไฟล์นี้
- เอกสารที่เชื่อได้มีแค่: `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` · `docs/Experience Architecture v2.md` · `docs/PLAN_TRACKS_TH.md` · `README.md` · `CLAUDE.md` · `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md`
- ถ้าอัปเดตสถานะ ต้องระบุ **วันที่ + หลักฐานการวัดจริง** (เช่น "1037/1037 tests ผ่าน 5 ก.ย. 2026")
- ห้ามเขียน "PRODUCTION READY" หรือ "100% verified" — ยังไม่จริงจนกว่าจะครบ 4 เงื่อนไขใน forensic หัวข้อ 8.6

---

## 🔧 Refactor Only When Earned

- ไฟล์ 900 บรรทัด **ไม่ได้แปลว่าต้องแยก** — ถามก่อนว่า "มันขวาง UX implementation จริงไหม?"
- ถ้าไม่ขวาง **อย่าแตะ** — refactor นอก scope คือการเพิ่มความเสี่ยงโดยไม่จำเป็น
- ทุก refactor ต้องมีเหตุผลที่วัดได้ (performance / maintainability ที่พิสูจน์ได้) ไม่ใช่ "สวยกว่า"

---

## 📝 Pull Request Process

1. สร้าง branch: `git checkout -b <track>/<งาน>`
2. ทำตาม change budget + commit discipline ด้านบน
3. รัน verification ครบทุก gate
4. Push + สร้าง PR พร้อมระบุ:
   - **สิ่งที่ทำ** (อะไร เปลี่ยนที่ไหน)
   - **สิ่งที่ทดสอบ** (คำสั่ง + ผลลัพธ์จริง)
   - **เอกสารที่อัปเดต** (ถ้ามี)

---

## 🔴 สถานะปัจจุบันที่ต้องรู้ก่อนเริ่ม (5 ก.ย. 2026)

- ✅ Track B + C0 เสร็จหมดแล้ว (โค้ด) · Track A งานที่บล็อก UX/UI เสร็จแล้ว — เหลือ Track C (visual redesign)
- ⚠️ Track A ยังเปิด 2 ข้อ (ไม่บล็อก Track C): A1 ล้าง dead code — ปิดแล้ว (6 Sep 2026: 6 orphan files deleted) · A7 `as any` — ปิดแล้ว (47 จุด วัด 6 Sep 2026)
- ⚠️ ยังไม่ "100% product-verified" — 4 เงื่อนไขค้าง:
  ~~apply migration 035~~ ✅ done · 1. deploy Edge Functions (12 functions; verify Supabase dashboard) · 2. แก้/ตัดสินใจ passkey flow · 3. ตัดสินใจ voice route
- ⚠️ มี stub/mock ค้าง: VoiceChat, VoiceInput, VoiceOutput, AdvancedAnalytics, SentryService, CommunityPage, ExplorePage, DecisionDashboard, structuredData, soundscape-manifest — ดู forensic หัวข้อ 8.5

**อ่านก่อนเริ่มทุกครั้ง:** `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` → `docs/PLAN_TRACKS_TH.md` → `CLAUDE.md` → `docs/PHASE0_VISUAL_PERF_FORENSIC_TH.md` (ก่อน Track C)

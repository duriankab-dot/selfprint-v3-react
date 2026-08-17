# SelfPrint Rebrand — Handoff / Status Doc

**อัปเดตล่าสุด**: 2026-08-04 | **สถานะ**: Phase 1 เสร็จสมบูรณ์ (git init แล้ว, commit `ea52f1b`) | Phase 2 (SICE Baseline v3.2) ก้อน 1-3 เขียนเสร็จ + **ยืนยันแล้วบนเว็บจริงว่าใช้งานได้** (โฟลว sc-land → loading → sc-sice-baseline ขึ้นจริงบน astrovera-v2.pages.dev) | รอ commit ก้อนนี้ (คำสั่งท้ายข้อ 0) | งานถัดไปที่รู้แล้วว่าค้าง: ควิซย่อ 4 ข้อ + เกจ % — ดูหัวข้อ "0. Phase 2 progress"

อ่านไฟล์นี้ก่อนถ้าเปิดแชทใหม่มาทำงานต่อ — สรุปทุกอย่างที่ตัดสินใจและทำไปแล้ว ไม่ต้องไล่อ่านเอกสารทั้งหมดซ้ำ

---

## 0. Phase 2 progress (SICE Baseline v3.2) — อ่านก่อนถ้าทำต่อเรื่องนี้

**บริบท**: เอกสารวิสัยทัศน์ใน `D:\SelfPrint\Docs\` (61 ไฟล์) มี 3 สโคปปนกัน (ดูรายละเอียดเดิมในข้อ 7 ด้านล่าง) — **ตัดสินใจแล้ว**: ไม่รื้อเป็น React/PostgreSQL ตามเอกสาร (สมมติ React rewrite ที่ไม่มีจริง) แต่เอา "เจตนา" ของ SICE Baseline (60 วิ instant onboarding) มาสร้างบน stack เดิม (vanilla JS + Cloudflare + Supabase) แบบค่อยเป็นค่อยไป

**เจอว่า 12 SICE (SelfPrint Intelligence Core Engines) มีอยู่แล้วเกือบหมด** — ระบบเดิมมี `buildAllSciencesPayload()` ใน `js/features/self/self.js` (บรรทัด 355) ที่รวม 12 ศาสตร์อยู่แล้ว (westernAstrology, lifePathNum, bloodType, nakshatra, baziDayMaster, thaiZodiacYear, fullNatalChart, humanDesign, geneKeys, thaiPlanet, kua, lastHexagram) — ใช้ gate ตาม subscription plan อยู่แล้วด้วย หน้า `sc-land` ก็เก็บ dob/time/place อยู่แล้ว และหน้าเว็บโฆษณา "12 ศาสตร์" เป็นจุดขายหลักอยู่แล้วตั้งแต่แรก

### ทำไปแล้ว (ยังไม่ commit — รอสั่ง `git add`/`commit` เอง ดูคำสั่งท้ายไฟล์นี้)

**ก้อน 1 — SICE orchestrator** (`js/calc/sice-baseline.js` ไฟล์ใหม่ + เพิ่มใน `js/bundles/bundle-data-calc.js`):
- `buildSICEBaseline(input)` — ฟังก์ชัน pure ไม่พึ่ง localStorage (ต่างจาก `buildAllSciencesPayload` เดิมที่อ่าน LSP/LSN) เพราะช่วง onboarding ยังไม่มีโปรไฟล์บันทึกจริง รับ `{dob,time,place,bloodType,gender,natal}` ตรงๆ
- คืน `{profile, accuracy, disciplinesAvailable, disciplinesTotal, dataUsed}` — accuracy คำนวณจาก **ความครบของข้อมูล** (60-70%) ไม่ใช่จาก subscription plan (คนละมิติกับ `SCIENCE_TIERS` เดิมโดยตั้งใจ — onboarding ควรโชว์เต็มก่อนเสนอขาย ยังไม่ยืนยันกับสเปกธุรกิจ ถ้าอยากผูก plan gating แทนบอกได้)
- **decisionType/strengths/blindSpots ตั้งใจไม่ใส่** (ตัดสินใจร่วมกับเจ้าของโปรเจกต์แล้ว 2026-08-04) — โชว์ข้อมูลดิบจาก 12 ศาสตร์ตรงๆ แทนการเดา/heuristic เพราะเชื่อถือได้กว่า
- ทดสอบแล้วจริง (เรียก engine จริงกับ dob ตัวอย่าง) ผ่าน 3 เคส: dob อย่างเดียว (63%), ไม่มี dob (null ถูกต้อง), ข้อมูลครบ+natal (70%)

**ก้อน 2 — หน้า reveal** (`index.html` เพิ่ม screen `sc-sice-baseline` + `js/features/self/self.js`/`bundle-features.js` เพิ่ม `renderSICEBaselineReveal()`/`_renderSICECards()`):
- แทรกหน้าใหม่ระหว่าง loading กับควิซใน `startAnalysis()` — **ไม่ตัด flow เดิมออก** แค่คั่นกลาง: กรอกข้อมูล → loading → **SICE baseline instant** → ควิซ (85%) → ผลลัพธ์เดิม
- ปุ่ม "ตอบคำถามเพิ่ม" บนหน้าใหม่ไปควิซต่อเหมือนเดิมทุกประการ

**ก้อน 3 — natal chart + skip** (`self.js`/`bundle-features.js`):
- `fetchSICENatal(dob,time,place)` — เวอร์ชัน decoupled ของ `fetchNatalChart()` เดิม (ตัวเดิมพึ่ง DOM ของหน้า sc-self + อ่าน dob จาก LSP ที่ยังไม่มีค่าตอน onboarding เรียกตรงๆ จะพัง) ยิง worker เดียวกัน (`AV_WORKERS.natal`) cache ลง LSN ด้วย key เดิม (ไม่ fetch ซ้ำตอนเข้า sc-self ทีหลัง)
- `renderSICEBaselineReveal()` โชว์ผล sync ทันที (60-63%) แล้วยิง natal แบบ async เบื้องหลัง ถ้าสำเร็จอัปเดต meter เป็นสูงสุด 70% แบบไม่บล็อกหน้าจอ (ถ้า fetch fail/timeout ก็เงียบๆ ไม่กระทบ baseline เดิม)
- ปุ่ม "ข้ามไปก่อน" บนหน้า SICE baseline **reuse `skipQuiz()` ที่มีอยู่แล้ว** (จากหน้า sc-quiz เดิม) — ไม่ได้เขียน skip logic ใหม่

**ตรวจสอบแล้วทุกก้อน**: `node --check` ผ่านทุกไฟล์ที่แก้ (source + bundle), `npm test` ผ่านครบ 9 เคสเหมือนเดิม

### ยังไม่ทำ / ต้องทำต่อ (สั่งต่อได้เลยในแชทหน้า)
- **priority ถัดไป**: ปุ่ม "ตอบเพิ่ม 4 ข้อ" บนหน้า sc-sice-baseline ตอนนี้ยังพาไป **ควิซเต็มชุดเดิม** (ไม่มีเกจ %) — ของจริงตามสเปก V3.2 ต้องเป็นควิซย่อแค่ 4 ข้อ + เกจวิ่งไป 85% ยังไม่ได้ทำ (ทดสอบจริงบนเว็บแล้วเจอ 2026-08-04)
- ยังไม่มี "first decision log → 95%" stage ตามสเปก
- ยังไม่ได้ตัดสินใจเรื่อง accuracy gating (data completeness vs plan tier) กับสเปกธุรกิจจริง — เป็นแค่ assumption ของผมตอนนี้

### คำสั่ง git ที่ต้องรัน (รวมทุกอย่างของ Phase 2 + fix deploy-pages.bat)
```
cd D:\astrovera-v2
git status
git add -A
git commit -m "Phase 2: SICE Baseline orchestrator + onboarding reveal screen + natal chart integration; fix deploy-pages.bat branch bug"
git log --oneline -5
```
(`git status` ก่อนเพื่อดูว่ามีไฟล์อะไรเปลี่ยนบ้างก่อน add จริง — เช็คแล้วว่า `.gitignore` กันไฟล์ secret ไว้ครบ ใช้ `-A` ได้ปลอดภัย)

### 🐛 เจอบั๊กใน deploy-pages.bat (2026-08-04) — แก้แล้ว
`deploy-pages.bat` เดิม**ไม่มี** `cd /d D:\astrovera-v2` ก่อนรัน `wrangler pages deploy .` (ต่างจาก `deploy-workall.bat` ที่มี) — ถ้า terminal ที่รันมี working directory ไม่ตรง จะ deploy โฟลเดอร์ผิดโดยไม่มี error ให้เห็น (log จริงที่เจอ: `Success! Uploaded 0 files (710 already uploaded)` ทั้งที่ไฟล์เปลี่ยนจริง) — **แก้แล้ว** เพิ่ม `cd /d D:\astrovera-v2` เข้าไป ยังไม่ commit (รวมอยู่ใน `git add` เพิ่ม `deploy-pages.bat` ด้วย)

**อัปเดต (2026-08-04 รอบ 2) — เจอ root cause ตัวจริงแล้ว**: หลัง fix `cd` ข้างบน deploy ก็ยัง "สำเร็จ" (`Uploaded 2 files`) แต่โดเมนจริง `astrovera-v2.pages.dev` ยังไม่มีโค้ดใหม่ ตรวจสอบตรงๆ (fetch `/index.html`, `/js/bundles/bundle-features.js` จาก origin, `cache:'no-store'`) → **ไม่มี** `sc-sice-baseline` เลย แต่ไปเช็คที่ `https://master.astrovera-v2.pages.dev/` (branch preview alias) → **มี** โค้ดใหม่ครบ

สาเหตุ: Cloudflare Pages project ตั้ง **Production branch = `production`** (เช็คจาก dashboard Settings → Builds & deployments) แต่ git branch ในเครื่องคือ **`master`** — ตั้งแต่มี git เข้ามา (git init รอบก่อน) `wrangler pages deploy .` จะ auto-detect branch จาก git แล้วส่งเป็น **preview deployment** ของ branch `master` เสมอ ไม่เคย promote ไปโดเมน production เลยสักครั้ง (deploy "สำเร็จ" จริงแต่ขึ้นผิดที่)

**แก้แล้ว**: เพิ่ม `--branch=production` ต่อท้ายคำสั่งใน `deploy-pages.bat` (บังคับให้ deploy เป็น production เสมอ ไม่สนใจ git branch จริง) — **ยืนยันแล้ว (2026-08-04) ผู้ใช้รันซ้ำ deploy ผ่าน โฟลวใหม่ขึ้นจริงบนโดเมน production แล้ว** ยังไม่ commit ไฟล์นี้

### 📝 พบระหว่างทดสอบจริง — ปุ่ม "ตอบเพิ่ม 4 ข้อ" ยังไม่ใช่โฟลวเป้าหมาย (ยังไม่แก้ ตั้งใจ)
กดปุ่ม "ตอบเพิ่ม 4 ข้อ" จากหน้า sc-sice-baseline แล้ว → ไม่มีเกจ % ขึ้น และเข้า **quiz เต็มชุดของเดิม** (ไม่ใช่ quiz แบบสั้น 4 ข้อ) — เป็นไปตามที่คาดไว้ เพราะปุ่มนี้ยังผูกกับ `prepareQuiz();go('sc-quiz')` เดิม (quiz เต็ม ไม่มี progress gauge) ยังไม่ได้ทำ "quiz ย่อ 4 ข้อ + เกจ % ไป 85%" ตามวิสัยที่วางไว้ — เป็น item ที่ระบุไว้ล่วงหน้าแล้วว่ายังไม่ทำ (ดูหัวข้อ "งานเปิดค้างของเฟส 2")

### 🐛 เจอบั๊กจริงใน database — ยังไม่แก้ (ต้องเจ้าของโปรเจกต์รันเอง)
กด "ทดลอง 7 วัน" แล้ว error 500: Postgres CHECK constraint `user_entitlements_source_check` ไม่อนุญาตค่า `source='self_trial'` ที่โค้ด `handleStartTrial()` (`workers/sync/save-data.js` บรรทัด ~486) ส่งเข้าไป — เป็นบั๊กเดิมจากตอนเพิ่มฟีเจอร์ trial แต่ไม่เคยอัปเดต constraint ใน Supabase ต้องขอผลจาก:
```sql
SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'user_entitlements_source_check';
```
แล้วเขียน `ALTER TABLE` เพิ่ม `'self_trial'` เข้า allowed list (รอผลจากเจ้าของโปรเจกต์ก่อน — ไม่มีสิทธิ์เข้า Supabase จริง)

---

## 1. บริบท / การตัดสินใจหลัก

- โปรเจกต์เดิมชื่อ **Astrovera** (แอปดูดวง/โหราศาสตร์ไทย, live จริงที่ astrovera.net, มี subscription จ่ายเงินจริงผ่าน GB Pay, deploy บน Cloudflare Pages + Workers 9 ตัว, บัญชี Cloudflare = `duriankab`)
- เอกสารใน `D:\SelfPrint\Docs` (150+ ไฟล์) วาดวิสัยทัศน์ **SelfPrint V3.2** เป็นสินค้าใหม่ทั้งหมด (AI Twin, 11 Hub × 6 Mood, เขียนใหม่เป็น React) ซึ่ง **ยังไม่มีโค้ดจริงเลยแม้แต่บรรทัดเดียว** — นี่คือวิสัยทัศน์ระยะยาว ไม่ใช่งานตอนนี้
- **ทางที่เลือก (อนุมัติแล้ว)**: ทางสายกลาง — rebrand โค้ดปัจจุบัน (`D:\astrovera-v2`, vanilla JS + Cloudflare) ให้เป็น SelfPrint แบบ cosmetic + แก้บั๊ก critical ให้พร้อม launch ก่อน แล้วค่อยขยับสู่วิสัยทัศน์ AI Twin เต็มรูปแบบเป็นเฟสถัดไป (ยังไม่เริ่ม)
- **โดเมน**: selfprint.one = โดเมนหลักของเว็บ, selfprint.app = เตรียมไว้สำหรับ mobile app ในอนาคต (ยังไม่ทำ), **astrovera.net = เก็บไว้เป็น backend/เก็บข้อมูลสำคัญ ไม่ยกเลิก**
- **โทนสี**: เปลี่ยนจากม่วงเข้ม mystical เดิม (#0A0118 / #B040FF) → Navy + Purple ตาม SelfPrint design tokens (#0F1F3F navy, #8B7BB8 purple accent, #FAFBFC ขาวครีม) — ดู mapping เต็มด้านล่าง
- **ไม่มี user จริงใช้งาน payment/auth ตอนนี้** (ยืนยันโดยเจ้าของโปรเจกต์ 2026-08-03) → เปลี่ยน infra ได้โดยไม่ต้องกังวลเรื่อง breaking live users มากนัก แต่ยังต้องระวังเรื่อง Cloudflare resource/DB schema จริง (ดูข้อ 4)

---

## 2. ทำเสร็จแล้ว (Phase 1)

### ชื่อแบรนด์ (Astrovera → SelfPrint)
ไฟล์ user-facing ทั้งหมดเปลี่ยนแล้ว: `index.html` (66 จุด), `terms.html`, `privacy.html`, `pricing.html`, `404.html`, `admin-approve.html`, `manifest.json` (PWA name/theme), `package.json`, `sw.js` (cache name `selfprint-v1`, push defaults), `robots.txt`, `sitemap.xml` → ทุกจุดชี้ไป `selfprint.one`
`workers/cron/email-sender.js` และ `workers/cron/push-sender.js` — ข้อความ subject/body/notification ที่ผู้ใช้เห็นจริงเปลี่ยนเป็น SelfPrint แล้ว, ตัวแปร `site` ในอีเมลชี้ไป `https://selfprint.one`

**ไม่แตะ (ตั้งใจ)**: ชื่อตาราง Supabase `astrovera_profiles` (schema จริง), worker name `astrovera-advisor-deep` / `astrovera-orchestrator` (rename = สร้าง Cloudflare resource ใหม่ ต้องตั้ง secrets ใหม่ทั้งหมด, endpoint นี้ผู้ใช้ไม่เห็นอยู่แล้ว), comment/internal identifier (`AV_`, `av_` prefix) ในไฟล์ js/brain อีก ~45+35 ไฟล์ — cosmetic ล้วนๆ ความเสี่ยงสูงกว่าประโยชน์ถ้าไม่ได้วางแผนดี

### ธีมสี (Navy + Purple)
`css/main.css` (ตัวแปร CSS ทั้ง `:root` และ `.light-mode`) + ขยายไปแก้ inline hex/rgba ใน **30 ไฟล์ JS** (`js/features/**`, `js/modules/**`, `js/core/**`, `js/bundles/*.js` ที่เป็นไฟล์จริงที่ index.html โหลดใช้งาน — ตรวจแล้วว่า index.html โหลด `js/bundles/bundle-*.js` ไม่ใช่ source ไฟล์แยก จึงแก้ทั้งสองชุดให้ตรงกัน)

Mapping สีหลัก (ใช้ค่านี้ถ้าต้องแก้เพิ่มที่อื่น):
| เดิม | ใหม่ | ใช้เป็น |
|---|---|---|
| `#0A0118` | `#0F1F3F` | bg หลัก (navy-900) |
| `#130028` | `#16294D` | bg2 |
| `#1C0040` | `#1E3A5F` | bg3 (navy-800) |
| `#27005A` | `#2D5A7F` | bg4 (navy-700) |
| `#B040FF` | `#8B7BB8` | accent หลัก (purple-base / --gold) |
| `#E0A0FF` | `#B4A7D0` | accent2 (purple-light) |
| `#818CF8` | `#3B82F6` | indigo/info accent |
| `#F5F0FF` | `#FAFBFC` | ข้อความหลัก (ขาวครีม) |
| rgba(176,64,255,x) | rgba(139,123,184,x) | glow/border เดิม |

### บั๊ก critical
- **DOB validation**: ตรวจแล้วพบว่า**มีอยู่แล้ว**ใน `syncDob()` (`js/features/self/self.js` บรรทัด ~1257) เช็ค leap year ถูกต้อง (รายงาน audit เก่าวันที่ 28 ก.ค. ที่บอกว่ายังไม่มี เป็นข้อมูลล้าสมัย) — ไม่ต้องทำอะไรเพิ่ม
- **XSS**: โค้ดส่วนใหญ่ escape ด้วย `esc()`/`_esc()`/`_rfEsc()`/`_lsEsc()` อยู่แล้วอย่างสม่ำเสมอ (self.js, profile.js, people.js, reflection.js, robot-chat.js, advisor-copilot.js) — เจอช่องโหว่จริง **1 จุด**: `js/features/journal/journal.js` บรรทัด 399 (และ bundle คู่กันใน `js/bundles/bundle-features.js` บรรทัด 535) แสดงตัวอย่าง `j.goal` ในลิสต์ journal โดยไม่ escape → **แก้แล้วทั้งสองไฟล์**

### โลโก้/ไอคอน
ผู้ใช้แนบไฟล์ `Gemini_Generated_Image_y4eknny4eknny4ek.png` (brand sheet "Option A: The Living Fingerprint") — ครอปลายเส้นไอคอน (fingerprint/S mark) มาทำใหม่ทั้งหมดด้วยพื้นหลัง navy ใหม่ (ไม่ใช่พื้นหลังเข้มเดิมจาก mockup):
- `favicon.webp` (64px), `favicon-16x16.webp`, `favicon-32x32.webp`
- `assets/icons/android-chrome-192x192.webp`, `android-chrome-512x512.webp` (padding แบบ maskable 30%)
- `assets/icons/apple-touch-icon.webp`, `apple-touch-icon.png` (180px)
- `og-image.jpg` (1200×630, ไอคอน + wordmark "SELFPRINT" + tagline "Wise Decision for Life")
- `App icon_center top.webp` (lockup แนวตั้ง: ไอคอน + wordmark + tagline, ใช้ใน index.html เป็น hero image), `App icon_Top bar.webp` และ `App icon_center bar.webp` (lockup แนวนอน, ไฟล์เหมือนกันทั้งคู่)

ไฟล์ทั้งหมดนี้แทนที่ของเดิมในตำแหน่งเดียวกัน ขนาดตรงกับที่ index.html/manifest.json อ้างอิงอยู่แล้ว ไม่ต้องแก้ path เพิ่ม

### ตรวจสอบ
`npm test` ผ่านทั้ง 9 เคส, `node --check` ผ่านทุกไฟล์ที่แก้ (source + bundle), `npm run check:api`/`check:orchestrator` ผ่าน (`check:app` fail เพราะอ้างอิง `js/app.js` ที่ไม่มีอยู่แล้ว — **บั๊กเดิมที่มีอยู่ก่อน ไม่เกี่ยวกับงานนี้**, แนะนำแก้/ลบ script นี้ทีหลัง)

---

## 2.1 อัปเดต (รอบต่อมา — sweep เต็มรูปแบบ)

ผู้ใช้ยืนยันให้ทำข้อ 4 ต่อ (ข้อ 5 ปล่อยไว้ตามคำแนะนำ) จึงกวาดคำว่า Astrovera/ASTROVERA/astrovera.net ที่เหลือทั้งหมดใน `js/`, `workers/`, `brain/`, `components/*.html`, `css/ux-restructure.css` (244 ไฟล์ ยกเว้น node_modules) แบบ 2 pattern:
- `astrovera.net` → `selfprint.one` (โดเมนทุกที่ที่เป็น URL จริงหรือ display text)
- `ASTROVERA`/`Astrovera` (คำเต็ม ไม่ใช่ prefix) → `SelfPrint`

**⚠️ จุดที่มีผลจริงกับระบบ ไม่ใช่แค่ cosmetic — ต้องรู้ไว้:**
- `workers/sync/save-data.js` บรรทัด 655-656: **WebAuthn `RP_ID`/`RP_ORIGIN` เปลี่ยนจาก `astrovera.net` → `selfprint.one`** — passkey ใดๆ ที่เคยลงทะเบียนไว้ (ถ้ามี) จะใช้ไม่ได้อีกต่อไปเพราะ RP ID ผูกกับโดเมนตรงๆ ตามสเปก WebAuthn (ไม่ใช่ปัญหาเพราะยังไม่มี user จริง แต่จะพังทันทีถ้ามีคนลงทะเบียน passkey ไปแล้วก่อนหน้านี้) — ค่านี้จะทำงานถูกต้องก็ต่อเมื่อ selfprint.one ถูกต่อ Custom Domain ใน Cloudflare Pages จริงแล้ว (ดูข้อ 3.1)
- `workers/payment/payment.js`: ชื่อแพ็กเกจที่ส่งไป GB Pay (`Astrovera Basic/Pro/Founder` → `SelfPrint Basic/Pro/Founder`) และข้อความหน้า callback หลังจ่ายเงินเสร็จ — ผู้ใช้จะเห็น/ธนาคารจะบันทึกชื่อนี้ตอน checkout จริง
- ลิงก์แชร์/referral ทั้งหมด (compat check, daily card, year review, people pair, PDF export ฯลฯ ในไฟล์ทั้ง source และ bundle) ตอนนี้ชี้ไป `selfprint.one` แล้ว — **จะใช้งานได้จริงก็ต่อเมื่อโดเมนต่อเสร็จ** ไม่งั้นลิงก์ที่แชร์ออกไปจะ 404
- `js/data/i18n.js` (และ bundle คู่กัน `bundle-data-calc.js`) มีข้อความ "Astrovera Intelligence Core Engine (AICE)" ในทุกภาษา (TH/EN/ZH) → เปลี่ยนเป็น SelfPrint แล้ว

**ยังไม่แตะ (ตามที่ตกลง)**: `astrovera_profiles` (ตาราง Supabase จริง), worker name `astrovera-advisor-deep`/`astrovera-orchestrator` (คงไว้ตามคำแนะนำข้อ 5), README.md ในโฟลเดอร์ `components/astra prime/`, `components/nova elite/` (ไฟล์เอกสารเก่า ไม่กระทบการทำงาน), คอมเมนต์ทดสอบใน `brain/__tests__/ux-modules.test.mjs` (mock string ภายในไฟล์ทดสอบเอง ไม่กระทบ)

ตรวจสอบแล้ว: `node --check` ผ่านทุกไฟล์ที่แก้, `npm test` ผ่านทั้ง 9 เคสเหมือนเดิม

### 2.2 เก็บงานเล็กสุดท้าย (comment ที่เหลือ + app icon 1024)
- แก้ comment "ASTROVERA" ที่เหลือใน `db/*.sql` (5 ไฟล์ — แค่บรรทัด comment หัวไฟล์ ไม่แตะชื่อ CREATE TABLE จริง เช็คแล้วไม่มีตารางไหนชื่อขึ้นต้นด้วย astrovera), `deploy-pages.bat` (echo message), `wipe-users.cjs` (comment บรรทัด 2 เท่านั้น — โค้ดที่เหลือยังอ้าง `astrovera_profiles` ตามเดิมเพราะเป็นตารางจริง)
- เพิ่ม `assets/icons/app-icon-1024.png` (1024×1024, ไม่มี transparency) ไว้ล่วงหน้าสำหรับตอนทำ mobile app (selfprint.app) — App Store/Play Store ต้องใช้ขนาดนี้
- **ยังคงไม่แตะ**: `--project-name astrovera-v2` ใน `deploy-pages.bat` (ชื่อ Cloudflare Pages project จริง — rename เหมือนกรณี worker), `astrovera-v2` folder path ใน `.bat` อื่นๆ, secrets.bat/deploy-orchestrator.bat (อ้างชื่อ worker ที่ตั้งใจคงไว้)
- ตรวจสอบแล้ว: `node --check`, `npm test` ผ่านเหมือนเดิมหลังแก้

---

## 3. ยังไม่ได้ทำ / ต้องทำต่อ (ลำดับความสำคัญ)

### สถานะล่าสุด (อัปเดตจากเจ้าของโปรเจกต์)
- **ข้อ 3 (deploy) เสร็จแล้ว** — รัน deploy จริงแล้ว หน้าเพจเปลี่ยนเป็น SelfPrint แล้ว
- **ข้อ 1 (ต่อโดเมน selfprint.one กับ Cloudflare Pages)**: ⏳ รอเชื่อมอยู่
- **ข้อ 2 (verify โดเมนใน Resend สำหรับอีเมล)**: ⏳ รอเชื่อมอยู่
- จนกว่าข้อ 1-2 จะเสร็จ: ลิงก์แชร์/referral ทั้งหมดที่ชี้ไป selfprint.one, ปุ่ม "กลับไปแอป" หลังจ่ายเงิน, และ WebAuthn RP_ID จะยังใช้งานไม่ได้เต็มที่ (404 หรือ error) — เป็นเรื่องปกติระหว่างรอต่อโดเมน ไม่ใช่บั๊กจากโค้ด

### ต้องให้เจ้าของโปรเจกต์ทำเอง (ผมทำจากตรงนี้ไม่ได้ — ไม่มีสิทธิ์เข้าถึง Cloudflare/DNS/Resend ของจริง)
1. **เชื่อมโดเมน selfprint.one เข้ากับ Cloudflare Pages** (Custom domains ใน Dashboard) + ตั้ง DNS ที่ registrar — ⏳ กำลังทำอยู่
2. **Verify โดเมน selfprint.one ใน Resend** ก่อนเปลี่ยน `MAIL_FROM` secret เป็น `hello@selfprint.one` — ⏳ กำลังทำอยู่ (ถ้ายังไม่ verify ให้คง `MAIL_FROM` เป็น astrovera.net ไปก่อนได้ ไม่ต้องรีบสลับ)
3. ~~Deploy จริง~~ — ✅ เสร็จแล้ว

### รอทำต่อได้ (ไม่เร่งด่วน, ความเสี่ยงต่ำ-กลาง)
4. ✅ **เสร็จแล้ว** (2026-08-04) — กวาดคำ "Astrovera" ที่เหลือใน 29 ไฟล์ เจอจุดที่กระทบผู้ใช้จริง (ไม่ใช่แค่ cosmetic ตามคาด): ข้อความแชร์ผลลัพธ์ภาษาไทย/จีนใน `i18n.js`/`sharing.js`/`dashboard.js` (+bundle คู่กัน) ยังมีคำ ASTROVERA ฝังอยู่ — แก้แล้ว, และ `customerEmail: noreply@astrovera.app` ใน `payment.js` ที่ส่งไป GB Pay จริง — แก้เป็น `noreply@selfprint.one` (มีผลจริงกับระบบ ไม่ใช่แค่ cosmetic) ที่เหลือ (table name, worker URL, smoke test BASE_URL) ตั้งใจไม่แตะเหมือนเดิม `node --check`/`npm test` ผ่านหมด
5. ✅ **ตัดสินใจแล้ว** (2026-08-04) — **ไม่ rename** worker name `astrovera-advisor-deep`/`astrovera-orchestrator` ตามคำแนะนำเดิม (internal endpoint ผู้ใช้ไม่เห็น, rename แล้วต้องตั้ง Cloudflare resource/secrets ใหม่ทั้งหมด ความเสี่ยงสูงกว่าประโยชน์)
6. ✅ **เสร็จแล้ว** (2026-08-04) — สร้าง `assets/icons/selfprint-social-profile-1080.png` (1080×1080 navy + ไอคอน จาก app-icon-1024.png เดิม) สำหรับ IG/FB/LinkedIn/X

### เฟสถัดไป — สำรวจแล้ว (2026-08-04), ยังไม่เริ่มโค้ด รอตัดสินใจสโคป
7. วิสัยทัศน์ SelfPrint V3.2 — สำรวจ `D:\SelfPrint\Docs\` (61 ไฟล์ md) แล้วพบว่ามี **3 สโคปที่ไม่ตรงกัน** ปนอยู่:
   - (ก) วิสัยทัศน์เต็ม AI Twin + React rewrite + 11 Hub × 6 Mood — ยังไม่มีโค้ดจริง
   - (ข) แผนเขียนเอกสารเพิ่ม 32 ไฟล์ 7 สัปดาห์ (`00_QUICK_REFERENCE_DOCUMENTS_LIST.md`) — สมมติทีม 8 role แยกกัน ไม่เหมาะกับคนเดียว+AI
   - (ค) `HANDOFF_V3_2_UNIFIED_ENGINEERING_SPEC_WITH_VIRAL_LOOP.md` — ฟีเจอร์ย่อยที่ scope เล็กกว่า (SCIE Baseline onboarding 60 วิ + viral loop) มาร์คว่า "Ready to Build" **แต่ระบุ tech stack เป็น React+Zustand+PostgreSQL+Vercel/Railway ซึ่งไม่ตรงกับของจริงที่ deploy อยู่ (vanilla JS + Cloudflare + Supabase)** — สมมติว่า React rewrite เสร็จแล้ว ทั้งที่ยังไม่มี
   - **ต้องคุยกับเจ้าของโปรเจกต์ก่อนว่าจะเลือกทางไหน** ก่อนเริ่มเขียนโค้ดจริง

---

## 4. โซนห้ามแตะ (ยืนยันแล้วระหว่างทำงาน)
- ตาราง Supabase `astrovera_profiles` — schema จริงที่ deploy แล้ว ห้ามเปลี่ยนชื่อโดยไม่ migrate จริงก่อน
- Cloudflare Worker `name =` ทุกตัวใน `wrangler-*.toml` — เปลี่ยนชื่อ = สร้าง resource ใหม่ ต้องตั้ง secret/rate-limit namespace ใหม่หมด
- Secrets จริง (AV_SHARED_SECRET, ANTHROPIC_API_KEY, GB_PUBLIC_KEY ฯลฯ) — ไม่เคยเห็น/ไม่เคยแตะค่าจริง อยู่ใน Cloudflare Dashboard เท่านั้น

---

## 5. หมายเหตุทางเทคนิค
- โปรเจกต์นี้**ไม่มี git** (`git status` fail) — ไม่มี version control safety net ถ้าต้องการ rollback ต้องดูจาก diff ที่บันทึกไว้ในหัวข้อ 2 ด้านบนหรือ backup มือ แนะนำให้ตั้ง git repo ไว้ก่อนแก้ไขรอบต่อไป
- `index.html` โหลด `js/bundles/bundle-*.js` (ไฟล์ concat) ไม่ใช่ `js/features/**/*.js` โดยตรง — **ถ้าแก้โค้ดใน source ไฟล์แยก ต้องแก้ bundle คู่กันด้วยเสมอ** (ไม่มี build script อัตโนมัติในโปรเจกต์นี้ที่เจอ)
- `npm test` มีแค่ 9 unit test (numerology calc) ไม่ครอบคลุม UI/integration — การ verify งาน UI ต้องอาศัย manual/visual check เป็นหลัก

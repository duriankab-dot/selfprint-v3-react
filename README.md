# 🌟 SELFPRINT — Living Intelligence Platform

**แพลตฟอร์ม AI Twin ที่เรียนรู้รูปแบบพฤติกรรมของคุณผ่าน 12 มิติปัญญา**  
*(An AI-powered "living Twin awakening" system for self-understanding, learning, and growth.)*

---

> **สถานะปัจจุบัน:** `MASTER GATE — NOT PASS` ⚠️ (วัดจากการรันจริง 12 ก.ย. 2026)
> Phase A production ✅ 27/27 · Mobile ✅ 24/24 · Phase B staging ❌ 21/49 (27 ยังล้มเนื่องจาก UI/test contract ที่ deployed bundle ยังไม่ตรง)

---

## 📊 สถานะการผลิต (จริง — 12 ก.ย. 2026)

| พื้นที่ | สถานะ | หลักฐาน |
|--------|--------|---------|
| Build | ✅ PASS | `npm run build` ผ่าน |
| Typecheck | ✅ PASS | `npm run typecheck` (`tsc -b`) + `typecheck:functions` ผ่าน |
| Lint | ✅ PASS | `npm run lint` — 0 errors (warnings เดิมไม่บล็อก) |
| Unit Tests | ✅ PASS | `npm test` — 1042/1042, 67 files |
| E2E Phase A (Production) | ✅ 27/27 | `--project=chromium` vs `https://www.selfprint.one` |
| E2E Mobile | ✅ 24/24 | Mobile Chrome + Mobile Safari (production smoke) |
| E2E Phase B (Staging) | ❌ **21/49** | 27 failed / 1 skipped (LIFE-15) |
| Full suite (4 projects) | 72/27/1 | `npx playwright test` 100 tests |
| Auth pipeline (staging) | ✅ ทำงาน | REST login → inject → reload → storageState → หน้า dashboard แสดง session จริง |
| Three.js / Living Body | ❌ ยังไม่ผ่าน test | MG-01 ล้มเหลวบน deployed staging (ไม่มี Twin/visual) |
| Intelligent World | ❌ ยังไม่ผ่าน test | MG-02/MG-06 ล้มเหลว (contract แปรผันจาก design ใหม่) |
| `staging.selfprint.one` | ❌ 525 SSL | ใช้ `selfprint-staging.pages.dev` แทน |

**สถานะโดยรวม: ⚠️ NOT PASS — blocker คนเดียว: Phase B UI/test contract drift (ไม่ใช่ auth/infra)**

---

## 🧠 SELFPRINT คืออะไร

SELFPRINT เป็น **Living Intelligence experience** — ระบบ AI Twin ที่ช่วยให้ผู้ใช้เข้าใจตนเอง เรียนรู้ และเติบโต Twin AI เกิดผ่านกระบวนการ **Core Awakening** และเติบโตผ่าน 5 ขั้นตอน

**ประสบการณ์การใช้งาน:**

```
Nova (ผู้แนะนำ) → 12 มิติ / SICE analysis → Blueprint → Core Awakening
→ Twin Birth → Twin + memory/evolution → Today (living entry)
```

**5 แท็บนำทาง:**

| # | แท็บ | Route |
|---|------|-------|
| 1 | 🌅 Today | `/en/` |
| 2 |  Explore | `/en/explore` |
| 3 | 💬 Chat | `/en/chat/twin` |
| 4 | 📊 Dashboard | `/en/dashboard` |
| 5 |  Menu | `/en/menu` |

---

## 🚀 Getting Started

### Install

```bash
npm install
```

### Environment Variables

สร้าง `.env.local` / `.env.e2e.staging` (ถูก git-ignore) อย่า commit ค่าจริง

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# staging / E2E:
E2E_SUPABASE_URL=https://your-staging.supabase.co
E2E_SUPABASE_ANON_KEY=your-staging-anon-key
E2E_TEST_PASSWORD=...
STAGING_URL=https://selfprint-staging.pages.dev
```

⚠️ ข้อควรระวัง: ค่าใน header ต้องเป็น ASCII เท่านั้น — ถ้ามีอักขระไทย/Unicode ปนใน `E2E_SUPABASE_ANON_KEY` จะโดน `ByteString` error; `global-setup` ตอนนี้รายงานตัวแปร + index + U+code point ที่ชัดเจน (ไม่ปริ้นค่า)

### Run

```bash
npm run dev                 # dev server
npm run build               # tsc -b && vite build
npm run typecheck           # tsc -b (type-check เต็มโปรเจกต์)
npm run typecheck:functions # tsc -p tsconfig.functions.json --noEmit
npm run lint                # oxlint
npm test                    # vitest unit tests
```

### E2E Tests

```bash
npx playwright test --project=chromium          # Phase A production (27)
npm run test:e2e:staging                        # Phase B staging (ต้องมี .env.e2e.staging)
npx playwright test                             # full suite (100 tests, ต้อง webkit ติดตั้ง: npx playwright install webkit)
```

หมายเหตุ: `chromium-staging` ถูก define เสมอ; รันโดยไม่มี credentials → error ชัดเจน และห้ามใช้วิธี "project หายไป" เป็น skip

---

## 🧪 Test Coverage (ปัจจุบัน)

| Suite | Scope | สถานะจริง |
|-------|-------|-----------|
| `smoke.spec.ts` (Phase A) | Production landing/OG/etc. | 12/12 ✅ |
| `auth.spec.ts` (Phase A) | Production auth flows | 7/7 ✅ |
| `critical-journey.spec.ts` (Phase A) | Crucial journeys | 8/8 ✅ |
| `lifecycle.spec.ts` (Phase B) | staging public pages | 15 pass · 1 skip (LIFE-15) ✅ |
| `master-gate.spec.ts` (Phase B) | MG suite | 7/12 ✅ · 5 fail |
| `twin.spec.ts` (Phase B) | Twin creation | 0/5 ❌ (testid drift) |
| `decision.spec.ts` (Phase B) | Decisions | 0/5 ❌ (testid drift) |
| `upload.spec.ts` (Phase B) | Uploads | 0/5 ❌ (testid drift) |
| `world-visual.spec.ts` (Phase B) | Worlds | 0/7 ❌ (testid drift) |

**Phase A: 51/51 ✅ · Phase B: 21/49 ❌ (blocker); ตัวเลข "76/76 PASS" จาก README เก่าไม่เป็นความจริง — ถูกเขียนทับแล้ว**

---

## 🔧 Recent Changes (2026-09-12)

| File | Change |
|------|--------|
| `package.json` | เพิ่ม `typecheck` script |
| `playwright.config.ts` | `chromium-staging` define แบบไม่มีเงื่อนไข (กำจัด existsSync race) |
| `e2e/global-setup.ts` | ByteString/ASCII guard + deterministic staging detection + placeholder state + fail-hard เมื่อ login fail |
| `e2e/fixtures/test-user.ts` | lazy env getters (collection ไม่พังเมื่อไม่มี password) |
| `e2e/run-staging.mjs` | set `E2E_STAGING_RUN=1` |

---

## 📄 License

SELFPRINT — Living Intelligence Platform
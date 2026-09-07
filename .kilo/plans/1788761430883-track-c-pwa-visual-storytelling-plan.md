# Plan — Track C Enhancement: PWA + Visual Storytelling + UX/UI

**สร้าง:** 7 ก.ย. 2026 · **HEAD:** `710afa0` (latest `4ed4762`)  
**แหล่งข้อมูล:** `FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md` · `docs/Experience Architecture v2.md` · `TRACK_C_VISUAL_REDESIGN_TH.md` (มี 2 addendum แล้ว)  
**หลักการ:** RECOMPOSE ไม่ใช่ REBUILD (§44) · ตรวจสอบจากโค้ดจริง · ไม่แตะ do-not-touch zones

---

## Goal

ปรับปรุง Track C ให้เป็น **PWA มากกว่าเดิม** + **เล่าเรื่องด้วยวิชวลให้เหมาะขึ้น** + **UX/UI ดีขึ้น** โดยไม่รื้อระบบเดิม

---

## Dependencies & Approvals

| งาน | ต้องอนุมัติก่อน? | Notes |
|-----|------------------|-------|
| App shell precache (`vite-plugin-pwa`) + data API caching | ✅ **A4-like approval** | แตะ build pipeline (`vite.config.ts`, `sw.js`) |
| ส่วนที่เหลือ | ❌ ไม่ต้อง | เปลี่ยน UI/CSS/manifest/config อย่างเดียว |

> **ตัดสินใจแล้ว:** ไม่ทำ Twin unification facade (C1) — ใช้ orb/SVG/canvas แยกตาม context แต่ละหน้า

---

## Task List (เรียงตาม dependency)

### Phase 1 — Foundation (PWA audit + quick fixes)

**เป้าหมาย:** วัด baseline PWA + แก้ไขด่วนที่ไม่ต้องอนุมัติ

| # | งาน | ไฟล์ที่กระทบ | รายละเอียด |
|---|-----|-------------|-----------|
| **1.1** | **PWA audit baseline** | ไม่มี (report only) | รัน Lighthouse PWA audit → บันทึกตัวเลข installability / offline / best-practices เป็น baseline ก่อน/หลัง |
| **1.2** | **Fix push icon/badge** | `public/sw.js:187-188` | เปลี่ยน `badge: '/logo.png'` และ `icon: '/logo.png'` → `/icons/icon-192x192.png` (ไฟล์นี้มีจริง) |
| **1.3** | **Align theme_color** | `index.html:24` และ `public/manifest.json:10` | ตั้งทั้งสองที่ให้เป็น `#5B5CEB` (accent brand color เดิม) |
| **1.4** | **Fix background_color** | `public/manifest.json:9` | เปลี่ยน `#FFFFFF` → `#0F1F3F` (navy brand matching `data-mode="dark"`) |
| **1.5** | **Add manifest `id` + `start_url` polish** | `public/manifest.json` | เพิ่ม `"id": "https://selfprint.one/"` ; ปรับ `start_url` เป็น `/` แทน `/th/` เพื่อให้ browser ใช้ language preference |
| **1.6** | **Capture real screenshots + ใส่ manifest** | `public/screenshots/` (โฟลเดอร์ใหม่) + `public/manifest.json:56` | Capture screenshot จริงจากแอป (desktop/mobile) 3–4 รูป → ใส่ใน `screenshots[]` ของ manifest |
| **1.7** | **Create Skeleton component** | `src/components/ui/Skeleton.tsx` (ใหม่) | Component skeleton loading ทั่วไปสำหรับทุกหน้า (แทน blank/loading spinner) |
| **1.8** | **Create OfflineBanner component** | `src/components/pwa/OfflineBanner.tsx` (ใหม่) | Banner แสดงเมื่อ `navigator.onLine === false` — ใช้ style tokens เดิม |

**Change budget:** ≤8 ไฟล์ → ปกติ (ไม่ต้อง change map)

---

### Phase 2 — App Shell + Data API Precache (requires approval)

**เป้าหมาย:** SW precache hashed JS/CSS chunks + cache twin_memories/decision_logs → offline ได้จริงทั้ง app และ data

| # | งาน | ไฟล์ที่กระทบ | รายละเอียด |
|---|-----|-------------|-----------|
| **2.1** | **เพิ่ม vite-plugin-pwa** | `package.json` (devDeps) + `vite.config.ts` | ติดตั้ง `vite-plugin-pwa` → configure precache runtime cache strategies สำหรับ JS/CSS/assets |
| **2.2** | **Configure plugin — app shell** | `vite.config.ts` | ตั้ง `workbox` options: `globPatterns: ['**/*.{js,css,html,svg,png,ico,json}']` สำหรับ precache assets ทั้งหมด |
| **2.3** | **Configure plugin — data API caching** | `vite.config.ts` | เพิ่ม `runtimeCaching` rules: cache twin_memories / decision_logs / daily_briefs (cache-first, stale-while-revalidate) — เก็บข้อมูลผู้ใช้ไว้ offline |
| **2.4** | **Remove manual sw.js** | `public/sw.js` (ลบหรือ replace) | `vite-plugin-pwa` จะ generate SW อัตโนมัติ → ลบ manual `sw.js` หรือ keep เป็น fallback |
| **2.5** | **Register generated SW** | `src/main.tsx:36-67` | ปรับ registration ให้ใช้ generated SW path (`/sw.js` จาก plugin) + update notification hook |
| **2.6** | **Create branded offline page** | `public/offline.html` (ใหม่) | หน้า "คุณออฟไลน์" ที่เป็นแบรนด์ SELFPRINT — มีปุ่ม retry / แสดง cached content (twin_memories ที่ cache ไว้) |
| **2.7** | **Verify PWA post-change** | ไม่มี (test) | รัน Lighthouse PWA ใหม่ → เปรียบเทียบกับ baseline (1.1) |

**Change budget:** ~7 ไฟล์ → ปกติ (แต่แตะ build pipeline → ต้องขออนุมัติ)

---

### Phase 3 — Visual Storytelling (atmosphere + motion)

**เป้าหมาย:** วิชวลสื่อสารเรื่องเล่าผ่าน atmosphere + motion (§14 + §24)

| # | งาน | ไฟล์ที่กระทบ | รายละเอียด |
|---|-----|-------------|-----------|
| **3.1** | **Add CSS atmosphere tokens** | `src/styles/global.css` หรือ token file | เพิ่ม CSS custom properties สำหรับ atmosphere per chapter/world: `--atmosphere-gradient-*`, `--atmosphere-overlay-*` |
| **3.2** | **Motion categories** | `src/styles/global.css` หรือ token file | กำหนด motion classes ตาม §24: `.motion-emergence` (slow), `.motion-insight` (subtle), `.motion-shift` (atmospheric) |
| **3.3** | **ProvenanceStrip component** | `src/components/story/ProvenanceStrip.tsx` (ใหม่) | Component แสดง source of truth ของ insight — เช่น "จาก 3 pattern ใน 2 สัปดาห์" — ใช้ style tokens เดิม |
| **3.4** | **Apply atmosphere to WorldDetail** | `src/pages/WorldDetail.tsx` | ใส่ CSS atmosphere gradient/background ตาม world archetype (ใช้ §14 CSS atmosphere ไม่ใช้ 3D) |
| **3.5** | **Apply provenance strip to Today insights** | `src/pages/Dashboard.tsx` (Today section) | เพิ่ม ProvenanceStrip ด้านล่าง primary insight |

**Change budget:** ≤8 ไฟล์ → ปกติ

---

### Phase 4 — UX/UI Polish

**เป้าหมาย:** ลด card density, micro-interaction, accessibility, app-like touch

| # | งาน | ไฟล์ที่กระทบ | รายละเอียด |
|---|-----|-------------|-----------|
| **4.1** | **Refactor Today layout** | `src/pages/Dashboard.tsx` | เปลี่ยนจากหลาย cards แข่งกัน → hierarchy เดียว: Twin presence → one primary insight → recommended action → your day → recent evolution (ตาม §6) |
| **4.2** | **Micro-interaction CSS** | `src/styles/global.css` | เพิ่ม hover/active/breathe animations สำหรับ Twin visual และ interactive elements (§24) |
| **4.3** | **Thai typography fix** | `src/styles/global.css` + font import | เพิ่ม font import (Noto Sans Thai / IBM Plex Sans Thai), line-height สูงกว่า EN สำหรับภาษาไทย, truncation สำหรับคำยาว |
| **4.4** | **Accessibility: aria labels** | ทุกหน้าที่มี Twin visual | เพิ่ม `aria-label` สำหรับ Twin visual, animation controls, reduced-motion support |
| **4.5** | **Safe-area + standalone-aware layout** | `src/components/layout/BottomNav.tsx` และ `PWAInstallPrompt.tsx` | ปรับ padding ด้วย `env(safe-area-inset-bottom)` — BottomNav มีแล้ว แต่ต้องตรวจสอบทุก footer/nav; ปรับ PWAInstallPrompt ให้ซ่อนเมื่อ `display-mode: standalone` |

**Change budget:** ≤8 ไฟล์ → ปกติ

---

## Validation Checklist

- [ ] Lighthouse PWA score ≥ 90 (ก่อน ≈ ?, หลัง ≥ ?)
- [ ] `tsc -b` ผ่าน 0 errors
- [ ] `vitest run` ผ่านครบ 1037 tests
- [ ] `oxlint` 0 errors
- [ ] Offline test: เปิด airplane mode → แอปแสดง branded offline page ไม่ใช่ blank
- [ ] Offline test: ข้อมูล twin_memories ที่ cache ไว้ยังแสดงผลได้ตอน offline
- [ ] Install test: Chrome Android → สามารถติดตั้งได้ → เปิดจาก home screen → standalone mode ทำงาน
- [ ] Push notification: ส่ง push → แสดง icon จริงไม่ใช่ broken image
- [ ] Theme color ใน browser chrome ตรงกับ brand (`#5B5CEB`)
- [ ] Splash/background สี navy (`#0F1F3F`) ไม่ใช่ขาวตอนเปิดแอป
- [ ] Twin visual แยกตาม context (orb ใน dashboard, SVG ใน worlds, canvas ใน awakening) — ไม่มีการบังคับ unified
- [ ] No new `as any` points (วัดแล้ว 47 จุด — ห้ามเพิ่ม)
- [ ] ไม่แตะ SICE core / API / DB / Auth / Lifecycle

---

## Rollout Strategy

1. **Phase 1** ทำได้เลย (ไม่ต้องอนุมัติ) — แก้ไขด่วน + baseline + capture screenshots
2. **Phase 2** ขอ approval ออกจากเจ้าของ (แตะ build pipeline + data caching)
3. **Phase 3-4** ทำต่อได้หลัง 1-2 เสร็จ (เปลี่ยน UI/CSS อย่างเดียว)

---

## Open Questions

1. ✅ **Font:** ยอมรับ Noto Sans Thai / IBM Plex Sans Thai (Open Font License)
2. ✅ **Screenshots:** ใช้ screenshot จริงจากแอป (capture ก่อนใส่ manifest)
3. ✅ **Offline scope:** Cache ทั้ง app shell + data API (twin_memories/decision_logs/daily_briefs)
4. ✅ **Twin Unification:** แยกใช้ orb/SVG/canvas ตาม context — ไม่ต้องรวม facade
5. **Push notification backend:** Edge Function `send-push` มีอยู่แล้ว แต่ badge/icon ยังชี้ไฟล์ที่ไม่มี — แก้ sw.js แล้วจะทำงานถูกต้อง

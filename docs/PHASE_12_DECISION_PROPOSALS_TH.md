# PHASE 12 — TASK 3: DECISION PROPOSALS (UO-7 · TEST-ONLY 9 · RV-01/UO-1)

**วันที่:** 27 กันยายน 2026 · **สถานะ:** OWNER DECISIONS SIGNED (27 ก.ย. 2026) — ดู Section 5 · **HEAD:** `daa96ae` @ `master`
**หลักการ:** evidence-based เท่านั้น — UNPROVEN = ผลลัพธ์ที่ถูกต้องหาก evidence ไม่พอ; Agent ห้ามสรุปแทน Owner

---

## 1. UO-7 — sw.js Journal Machinery (จดทะเบียน Batch 7 §11.4)

### 1.1 Evidence (ตรวจ 27 ก.ย. 2026)
- `src/sw.js:57` — `const SYNC_TAG = 'journal-sync'`
- `src/sw.js:204-209` — `sync` event listener (tag `journal-sync`) → `syncJournalQueue()`
- `src/sw.js:215-228` — `syncJournalQueue()` โพสต์ `{ type: 'SYNC_JOURNAL' }` หาทุก client
- `src/sw.js:312-314` — `message` listener รับ `TRIGGER_SYNC` → `syncJournalQueue()` — **ไม่พบ sender ใดใน repo**
- ฝั่ง client ถูกลบแล้ว (Batch 7, commit `cc38ff0`): `useJournalQueue.ts` + `journalQueueDB.ts`
- `/api/journal-sync` **ไม่มี handler บน CF Pages** (JOURNAL404-001 — ทราบจาก comment เดิมใน useJournalQueue.ts:172-186 ซึ่งถูกลบไปพร้อมไฟล์; ข้อเท็จจริงบันทึกใน Ledger §11.4)
- ผลตอนนี้: machinery = **inert residue** — SW โพสต์หา client ที่ไม่มีแล้ว (ไม่มี error), sync event ยิงแล้วจบ

### 1.2 ทางเลือกเสนอ
| ทางเลือก | เนื้อหา | ความเสี่ยง | เมื่อไหร่ |
|----------|---------|-----------|----------|
| **A — ลบ machinery** | ลบ 4 บล็อกใน sw.js (`SYNC_TAG`, sync listener, `syncJournalQueue()`, TRIGGER_SYNC handler) — **คงไว้:** SKIP_WAITING (`:309-311`), push/notification (`:230-305`), precache/fetch — ไม่ bump CACHE_VERSION (precache ไม่เปลี่ยน) | ต่ำ — แตะไฟล์ PWA build source (injectManifest) ต้อง verify `vite build` + PWA; sync tags เก่าที่เคย register ไว้จะยิงโดยไม่มี listener = no-op ตามพฤติกรรม browser (harmless) | micro-batch แยก หลังงาน consolidation หลักของ Phase 12 |
| **B — คงไว้ (inert)** | ไม่แตะ sw.js เลย | ศูนย์ — แต่ Phase 14 Master Ledger ต้องจดว่ามี machinery ตายอยู่ใน SW | ทุกเวลา |

**ข้อเสนอ:** A (ทำเป็น micro-batch แยก พร้อม build verification) — เหตุผล: Master Ledger ไม่ควรต้องอธิบาย machinery ตาย แต่จังหวะและการอนุมัติเป็นของ Owner

---

## 2. TEST-ONLY 9 — จำแนกความปลอดภัยเพื่อ Batch 8 Strategy

### 2.1 ผลจำแนกต่อไฟล์ (import map ตรวจ 27 ก.ย. 2026 — grep ทั้ง src)
| # | ไฟล์ | Test importer(s) | Production importer |
|---|------|------------------|---------------------|
| 1 | `src/services/SentimentAnalyzer.ts` | `services/__tests__/SentimentAnalyzer.test.ts:7` | **ไม่มี** |
| 2 | `src/services/QualityMetricsService.ts` | `services/__tests__/QualityMetricsService.test.ts:7` | **ไม่มี** |
| 3 | `src/services/FeedbackService.ts` | `services/__tests__/FeedbackService.test.ts:7` | **ไม่มี** |
| 4 | `src/services/ContinuousImprovementService.ts` | `services/__tests__/ContinuousImprovementService.test.ts:18` | **ไม่มี** |
| 5 | `src/services/FollowUpScheduler.ts` | `__tests__/FollowUpScheduler.test.ts:37` + `__tests__/Phase_E_Integration.test.ts:31` | **ไม่มี** (`TwinContext.tsx:273` comment ยืนยันถูกถอดออกจาก eager provider โดยตั้งใจ) |
| 6 | `src/components/features/TwinAvatar.tsx` | `__tests__/Avatars.test.tsx:9` | **ไม่มี** |
| 7 | `src/components/SEO/JsonLdSchemas.tsx` | `components/SEO/__tests__/JsonLdSchemas.test.tsx:15` | **ไม่มี** |
| 8 | `src/lib/visual/VisualStateEngine.ts` | `lib/visual/__tests__/VisualStateEngine.test.ts:7` | **ไม่มี** |
| 9 | `src/lib/worldRecommender.ts` | `tests/WorldRecommender.test.ts:7` + `tests/simple.test.ts:64` (dynamic import) | **ไม่มี** (live recommender = `useWorldRecommendation` hook — Phase 9 M2 VERIFIED ACTIVE) |

### 2.2 ความปลอดภัยเชิงกลไก (ทุกไฟล์ให้ผลเหมือนกัน)
- ทั้ง 9 = client-side pure modules, ไม่มีเชื่อม Supabase Edge Functions / CF API endpoints
- Import graph: production entry (`main.tsx` → `App.tsx`) **ไม่นำไปถึงไฟล์ใด ๆ ใน 9** — การ static import มีเฉพาะจากไฟล์ test → Vite จะ tree-shake ออกจาก production bundle (ข้อสรุปเชิง static — ต้องยืนยันด้วย bundle analysis ก่อน execute Batch 8)
- การลบไฟล์ใด ๆ = ต้องลบ test คู่ไปด้วย → จะทำให้ vitest count ลดจาก 1,102 — **ขัดเกณฑ์ pipeline ที่ Owner กำหนด (≥1,102)**

### 2.3 ทางเลือก Batch 8 Strategy
| ทางเลือก | เนื้อหา | ผลต่อ vitest | ข้อเสนอ |
|----------|---------|--------------|---------|
| **S1 — Keep + document** | คงไว้ทั้ง 9 + ลงทะเบียนใน Master Ledger เป็น "test-support modules" + ยืนยัน tree-shaking ด้วย bundle analysis 1 ครั้ง | คง 1,102 | **แนะนำ** — ศูนย์ความเสี่ยง รักษา regression coverage |
| S2 — Relocate | ย้ายไป `src/test/fixtures/` + แก้ import paths เฉพาะไฟล์ test | คง 1,102 (นับได้เท่าเดิม) | ทำภายหลังได้ — medium churn, แตะเฉพาะไฟล์ test |
| S3 — Delete ทั้งไฟล์ + test | ลบ 9 ไฟล์ + test คู่ | **ลดลงจาก 1,102** — ขัดเกณฑ์ pipeline | **ไม่แนะนำ** |

**ข้อเสนอ:** S1 เป็นทางเดินของ Batch 8; S2 เป็น optional ภายหลัง

---

## 3. RV-01 / UO-1 — SFXProvider Chain (รวบรวม Static & Dynamic Evidence เพื่อ re-classify)

### 3.1 Static evidence สมบูรณ์ (ตรวจใหม่ 27 ก.ย. 2026)
| ชั้น | หลักฐาน |
|------|---------|
| Mount ระดับ app | `App.tsx:54-55` lazy import `SFXProvider` · `App.tsx:379-389` render `<SFXProvider>` จริงใน JSX |
| Public API | `SFXProvider.tsx:37` `export function useSFX()` |
| Consumer จริงของ API | `ImmersiveTwinChat.tsx:32` (import) · `:220` `const sfx = useSFX()` |
| **Invocation จริง (call sites)** | `ImmersiveTwinChat.tsx:375` `sfx.twin.play('interact')` · `:410` `sfx.twin.play('glitch')` · `:421` `sfx.twin.play('sweep')` · `:429` `sfx.ui.play('option-select')` |
| Hooks trio | `useUISFX.ts:129`, `useTwinSFX.ts:100`, `useTransitionSFX.ts:92` — consumer เดียวคือ `SFXProvider.tsx:19-21, 54-56` |
| Barrels | `hooks/sfx.ts` = **zero importers** (OP-01 ฝั่ง barrel ยัง orphan) · `audio/index.ts` = Dashboard.tsx:15 (UO-6 — VERIFIED ACTIVE แล้ว) |
| Tests | **ไม่มีไฟล์ test ใดอ้างถึง SFX chain** (grep 27 ก.ย.) → vitest ให้ dynamic evidence ไม่ได้ |

### 3.2 Dynamic evidence — สถานะความเป็นไปได้
- Dynamic (runtime playback) evidence **ไม่สามารถรวบรวมได้จาก repo** — การเล่นเสียงต้องใช้ browser runtime + audio assets จริง
- ทางยืนยัน runtime ที่เสนอ (owner-side): เปิด `/immersive-twin-chat` แล้วกด interaction — ฟังเสียง interact/sweep; หรือ optional e2e spec ภายหลัง (ยังไม่เสนอ execute)

### 3.3 ข้อเสนอ re-classify (รอ Owner ตัดสิน)
- **เสนอ:** OP-05 (SFXProvider render) + OP-01 (sfx hooks trio) → **VERIFIED ACTIVE (static)** — พิสูจน์ด้วย render จริง + consumer จริง + **invocation จริง 4 call sites** — chain มีชีวิตเชิงโครงสร้างชัดเจน
- **ความจริงที่ต้องคงไว้ใน wording:** ยัง**ไม่พิสูจน์**ว่า audio playback สำเร็จจริง ณ runtime (asset loading/sound output) — นี่คือคำถามเรื่อง assets ไม่ใช่คำถามความมีชีวิตของ code
- ถ้า Owner อนุมัติ: ปิด UO-1, RV-01 ปิดด้วย evidence static
- **แยกประเด็น:** `hooks/sfx.ts` barrel (zero importers) เป็นไปตาม dead-barrel cleanup ปกติ — ตัดสินแยกจาก chain liveness (ลบได้โดยไม่กระทบ chain เพราะ SFXProvider import ตรงจากไฟล์ hook)

---

## 4. สรุป Decision Matrix (ทั้ง 3 หัวข้อ — ตามที่เสนอ)

| หัวข้อ | ทางเลือก | ข้อเสนอของ Agent |
|--------|----------|-------------------|
| UO-7 sw.js | A ลบ machinery / B คงไว้ | A — micro-batch แยก + build verify |
| TEST-ONLY 9 | S1 keep / S2 relocate / S3 delete | S1 (+ bundle analysis) — Batch 8 |
| RV-01/UO-1 | re-classify VERIFIED ACTIVE (static) / คง UNPROVEN | re-classify พร้อม wording ระบุข้อจำกัด playback |

---

## 5. OWNER DECISIONS (ลงนาม 27 กันยายน 2026)

| หัวข้อ | คำตัดสิน Owner | ข้อบังคับ |
|--------|----------------|-----------|
| UO-7 (sw.js journal machinery) | **อนุมัติทางเลือก A** — ลบ machinery 4 บล็อก (`sw.js:57`, `204-209`, `215-228`, `312-314`) ใน **micro-batch แยกต่างหาก** | รักษา PWA Core Infrastructure (push, precache, SKIP_WAITING) 100% · ต้องมี Build Verification (tsc -b / vitest run / vite build) ยืนยัน injectManifest + SW compilation ผ่าน |
| TEST-ONLY 9 | **อนุมัติ S1 — Re-classify เป็น VERIFIED TEST INFRASTRUCTURE** (Keep + Document) | รักษา Vitest baseline 1,102 tests และความสมบูรณ์ของ Test Suite · PWA Build integrity |
| RV-01 / UO-1 (SFXProvider) | **อนุมัติ Re-classify RV-01 → VERIFIED ACTIVE (STATIC)** | Note ใน Ledger: Audio Playback Runtime Behavior ขึ้นอยู่กับ Browser AudioContext / User Gesture ในการทดสอบจริง |

**สถานะเอกสารนี้:** APPROVED โดย Owner — 27 กันยายน 2026 (แทนสถานะ PROPOSAL เดิม)
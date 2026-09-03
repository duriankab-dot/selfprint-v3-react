# Memory

## ⚠️ อ่านก่อนเริ่มงานทุกครั้ง

**`FORENSIC_AUDIT_HONEST_STATUS_HANDOFF_TH.md`** (root) คือเอกสารสถานะฉบับเดียวที่ถูกต้อง
เขียนใหม่ทั้งฉบับเมื่อ **3 ก.ย. 2026** จากการตรวจซอร์สโค้ดจริง

repo นี้มีไฟล์ `.md` ที่ root **87 ไฟล์** — `HANDOFF_*.md` / `PHASE_A*.md` /
`SESSION_*.md` / `*_STATUS_TH.md` / `PHASE_3_AUTOMATION_CLEANUP_HANDOFF.md`
**ล้าสมัยและห้ามเชื่อ** หลายไฟล์อ้างสิ่งที่โค้ดไม่ได้ทำ (มีตารางเทียบไว้ในหัวข้อ 6
ของไฟล์ forensic) รวมถึงบันทึก Session 2–12 เดิมใน CLAUDE.md ไฟล์นี้ ซึ่งถูกแทนที่แล้ว
เพราะ verify แล้วพบว่าหลายข้อไม่ตรงกับโค้ด

**อ่าน forensic ไฟล์เดียวก่อนแตะโค้ดใด ๆ**

---

## Me
**jb_DEV** (Durian Kab). Senior dev + entrepreneur. Solo SELFPRINT V3 developer.
Code-first, ecosystem thinking, production-focused. ตอบภาษาไทย กระชับ ตรงประเด็น

## Preferences
- Current repo state = source of truth — **ห้าม cache สมมติฐานจากเอกสาร**
- แยกให้ชัด: facts / gaps / recommendations / completed
- ทุกงานต้องมี success criteria + วิธีตรวจ ห้ามจบด้วย "แก้แล้วครับ" เฉย ๆ
- Surgical changes — แตะเฉพาะไฟล์ที่เกี่ยว ไม่ refactor นอก scope
- ถ้าไม่มั่นใจใน assumption ให้พูดออกมาก่อนลงมือ

## Terms
| Term | Meaning |
|------|---------|
| **SELFPRINT** | Personal Intelligence Platform |
| **V3** | Current production version |
| **SICE** | 12-engine intelligence orchestration (client-side) |
| **FBS** | Feedback Service |
| **CF Pages** | Cloudflare Pages — production runtime ปัจจุบัน |
| **P0 / P1 / P2** | Priority (P0 = drop everything) |

---

## สถาปัตยกรรมจริง (verify จากโค้ด 3 ก.ย. 2026)

```
CF Pages (selfprint.one) ← auto-deploy จาก master
  functions/ = โฟลเดอร์เดียวที่ deploy จริง (api/, server/, src/api/ ไม่ใช่ route source)
  ├── functions/api/nova.ts          → /api/nova         (verifyUser ✅)
  ├── functions/api/twin.ts          → /api/twin         (verifyUser ✅)
  ├── functions/api/og.ts            → /api/og           (⚠️ คืน HTML ไม่ใช่รูป)
  ├── functions/api/metrics.ts       → /api/metrics      (verifyUser ✅ หลังแก้)
  ├── functions/api/autonomy-log.ts  → /api/autonomy-log (verifyUser ✅ หลังแก้)
  ├── functions/api/[[route]].ts     → catch-all → api/unified-handler.ts
  │     รู้จักแค่ 7 module: notifications | twin-evolution | sice |
  │                        stripe | profile | blueprint | share
  │     นอกเหนือจากนี้ = JSON 404 (ไม่ fallback ไป index.html)
  └── functions/api/rate-limiter.ts  → ❌ ไม่ export onRequest = ไม่เกิด route, ไม่มีใคร import

Supabase Edge Functions (deploy แยกผ่าน CLI, ไม่อยู่ใน build ของ CF):
  13 ฟังก์ชันใน supabase/functions/ — ⚠️ 4 ตัวไม่ verify JWT (ดู SEC-02)

DB: Supabase — ⚠️ migration กระจาย 3 โฟลเดอร์ CLI apply แค่ supabase/migrations/
```

---

## สถานะจริง ณ 3 ก.ย. 2026

### ✅ แก้แล้วในเซสชัน forensic (ผ่าน tsc จริง — ดูหัวข้อ 4 ของไฟล์ forensic)
1. **P0** แชททั้งระบบตอบ 401 ทุก request — client ไม่ส่ง `Authorization` (`AUTHHDR-001`)
2. **P0** `/chat/nova` จอขาว — ไม่มี `NovaProvider` mount ที่ไหนเลย (`NOVAPROV-001`)
3. **P0** ไม่มี ErrorBoundary + Sentry ไม่เคย init (`ERRBOUND-001`, `SENTRY-INIT-001`)
4. **P0** `/api/autonomy-log` พัง 4 ชั้น บันทึกได้ 0 แถว (`AUTONOMY-FIX-001`)
5. **P0** `/api/metrics` ไม่มี auth + ผิด schema + บั๊ก precedence (`METRICS-FIX-001`)
6. **P1** `Buffer` บน Workers runtime, Stripe webhook ใช้ sync crypto, env var ผิดชื่อ
7. **P1** notification POST เชื่อ `body.userId`, คอลัมน์ camelCase ผิด, twin-evolution ไม่มี auth
8. **P1** ลบการ leak Postgres error ให้ client 10 จุด (`DEBUGLEAK-001`)
9. **P1** ปิด AskCoach (404) + หยุด journal-sync mark failed ถาวร
10. **P1** เพิ่ม typecheck ให้ `functions/` + `api/` ครั้งแรก — เจอ 13 errors ที่ซ่อนอยู่ แก้ครบแล้ว
11. **P0-sec** แก้ `.gitignore` 2 บรรทัดที่เขียนผิดจนกฎไม่ทำงาน + เพิ่ม `.gitattributes`

### 🔴 ยังไม่แก้ — ต้องทำด้วยมือ / ต้องตัดสินใจ
| รหัส | เรื่อง |
|------|-------|
| **SEC-01** | **OpenRouter key ใช้งานได้จริงอยู่ใน repo สาธารณะ** → revoke + filter-repo (มีคำสั่งครบในไฟล์ forensic) |
| **SEC-02** | Supabase Edge Functions 4 ตัวไม่ verify JWT → IDOR + account takeover ผ่าน passkey |
| **DB-01** | migration 3 โฟลเดอร์ CLI apply แค่โฟลเดอร์เดียว → ~20 ตารางที่โค้ดใช้ไม่มีอยู่จริง |
| **DB-02** | migration 028 DROP `twin_memory` แต่ 029 สร้างกลับ (เรียงตามชื่อไฟล์ 028 รันก่อน) |
| **DB-03** | โค้ดคุยกับตาราง/คอลัมน์ที่ไม่มีจริงหลายสิบจุด (Twin evolution ไม่เคยถูกบันทึก) |
| **SEC-03** | RLS เปิดแต่ไม่มี INSERT policy หลายตาราง + 3 policy `USING (true)` ที่เปิดให้ anon |
| **API-02** | `/api/og` คืน HTML → social preview พังทุกช่อง |
| **QA-01** | `vitest.config.ts` include ครอบ 7 จาก 73 ไฟล์เทสต์ (9.6%) |
| **QA-02** | TypeScript **ไม่ได้เปิด strict** · `as any` เหลือ 101 จุด |
| **REPO-01** | `node_modules` (10,650 ไฟล์) + `dist` ถูก commit เข้า git |
| **FE-01a** | login แล้วเปิด `/th/` ได้หน้าเปล่าถาวร |

### ⚠️ ยัง verify ไม่ได้ในเซสชันนี้ — ต้องรันบน Windows เอง
```
npm run build    ❌ bus error ใน Linux sandbox (Rolldown native binding)
npm test         ❌ bus error (สาเหตุเดียวกัน)
npm run lint     ❌ bus error (สาเหตุเดียวกัน)
```
**tsc ผ่านแล้วทั้ง 2 project แต่ไม่ครอบคลุม runtime/bundling — อย่าเพิ่งถือว่าเสร็จ**

---

## Commands
```powershell
npm install
npm run dev
npm run build                 # tsc -b && vite build
npm test                      # ⚠️ รันแค่ 7/73 ไฟล์ (ดู QA-01)
npm run lint                  # oxlint
npm run typecheck:functions   # ใหม่ 3 ก.ย. 2026 — typecheck functions/ + api/
```

## โซนห้ามแตะ (ต้องถามก่อนเสมอ)
- `.env*`, `KEY/`, secret ทุกชนิด
- `supabase/migrations/*` ที่ apply ไป production แล้ว
- config production บน Cloudflare dashboard
- `dist/`, `node_modules/` (ยัง track อยู่ใน git — ดู REPO-01)

---

## เกร็ดที่ต้องรู้ก่อนแก้โค้ด (verify แล้ว)

- **`functions/` เท่านั้นที่ deploy** — `api/` เข้าถึงได้เพราะ `[[route]].ts` import
  `api/unified-handler.js` เข้ามา ส่วน `server/` พังอยู่ (`server/index.ts:28`
  import `../api/decisions` ที่ไม่มีอยู่จริง → `npm run start` รันไม่ได้)
- **มี component ชื่อซ้ำ 5 คู่** ตัวจริงอยู่ในโฟลเดอร์ย่อยเสมอ
  (`components/features/DecisionForm.tsx` คือตัวจริง, `components/decision/` คือตัวตาย)
- **`src/lib/intelligence/*` กับ `src/services/sice/engines/*` เป็น fork คนละตัวจริง ๆ**
  ทั้งคู่ live ทั้งคู่ (คนละ implementation คนละจำนวนบรรทัด) เชื่อมกันทางเดียวผ่าน
  `SICEBridge.ts` — **ห้ามลบฝั่งไหนทิ้งเพราะคิดว่าซ้ำ**
- **`three` อยู่ใน dependencies แต่ไม่มีใคร import** — `vendor-three` chunk ใน
  `vite.config.ts` ไม่เคยถูกสร้าง คอมเมนต์ที่นั่นอธิบายโค้ดที่ไม่มีอยู่
- **`translations.ts` มี 161 key ใช้จริง 15** — i18n จริงทำด้วย `isTh ? ... : ...`
  inline ~40 คอมโพเนนต์ ตอนนี้มี 2 ระบบซ้อนกัน
- **CRLF**: มี `.gitattributes` แล้ว (`* text=auto eol=lf`) commit ครั้งถัดไปจะมี
  renormalize diff ก้อนใหญ่ครั้งเดียว — **นั่นไม่ใช่การเปลี่ยนเนื้อหา**
- **มี `.git\index.lock` ค้างอยู่** จาก sandbox — ลบก่อนใช้ git: `del .git\index.lock`

---
Full glossary and deep context: `memory/`

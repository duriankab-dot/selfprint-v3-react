# PRE-DEPLOY CHECKLIST — SYNC DEPLOY PROTOCOL

**จัดทำ:** 27 กันยายน 2026 · **คำสั่ง:** Owner — SYNC DEPLOY PROTOCOL: INITIATED (27 ก.ย. 12:07, ปลด HOLD Push Protocol)
**ประเภท:** Agent-side readiness verification (documentation + verification-only)
**เป้าหมาย:** สร้าง Production SHA ใหม่เพื่อเริ่มต้นนับ Window Rule (≥30 วัน) ของ RV-02/RV-03

---

## 1. Agent-side Gates (รันก่อน push ทุกครั้ง)

| ขั้น | คำสั่ง | เกณฑ์ผ่าน | สถานะรอบนี้ |
|------|--------|-----------|-------------|
| Git state | `git status --short --branch` | tree สะอาด · commits ครบตาม scope | ✅ GREEN — ก่อน commits ฉบับนี้ tree สะอาด (master = origin @ `d91a450`) |
| Typecheck | `npm run typecheck` | 0 errors | ✅ GREEN — 0 errors |
| Typecheck functions | `npm run typecheck:functions` | 0 errors | ✅ GREEN — 0 errors |
| Tests | `npm test -- --run` (vitest) | 1,102/1,102 (72 files) | ✅ GREEN — 1,102/1,102 (72 files, 76.27s) |
| Wrangler gate (เงื่อนไข) | `npx wrangler pages functions build --outdir /tmp/functions-out` | "Compiled Worker successfully" — **ต้องรันเมื่อแตะ api/ หรือ functions/** (discipline จาก CFBUILDFIX-001) | ⏭️ skip — รอบนี้ไม่แตะ api/ หรือ functions/ |

## 2. Scope ของรอบ push นี้ (documentation + comment-only)

- **TC-312 comment fix** (`lighthouse-ci.yml` step comment) + **citation fix** (`CHANGELOG.md`) — อ้าง config จริง (0.7 / 0.9 / 0.9 / 0.95) + rationale ตาม Owner decision (27 ก.ย.: คง Perf 0.7)
- **Master Spec §10** — แถว 1–5 ตามคำสั่ง 5 gates (TC-312 RESOLVED / UO-2 STANDBY / E4 HOLD / SHA INITIATED / logs รอหลักฐาน)
- **Ledger §15.10** — Owner directives + SLOT (Production SHA / dashboard logs / Nightly Watcher) — append-only
- **เอกสารนี้**
- **ห้ามแตะ:** api/, functions/, src/, lighthouserc.json (เกณฑ์ 0.7 คงเดิมตาม decision), scripts/E4_PCB_COLLISION_REPRODUCTION.mjs (HOLD)

## 3. Push → Deploy → Window Rule

| ขั้น | ผู้ดำเนิน | รายละเอียด |
|------|-----------|------------|
| Push | Agent (อนุมัติแล้ว) | `git push origin master` — อนุมัติโดยคำสั่ง SYNC DEPLOY PROTOCOL: INITIATED |
| CF Pages production build | อัตโนมัติ | deploy จาก master — **Production SHA ใหม่ = commit hash ที่ push** |
| ยืนยัน Production SHA + deploy ID | **Owner** (dashboard) | บันทึกลง Ledger §15.10 SLOT แบบ append-only |
| เริ่มนับ Window Rule | อัตโนมัติเมื่อ deploy เสร็จ | ≥30 วัน — นับจาก deploy completion ของ Production SHA ใหม่ |
| Dashboard logs | **Owner** | ตาม `docs/CF_DASHBOARD_RV02_RV03_CLOSURE_CHECKLIST_TH.md` (กรอง path /api/metrics + /api/autonomy-log) |
| ยื่นข้อเสนอ closure | Agent (หลัง evidence) | ยื่นตามเกณฑ์ §3 ของ closure checklist — ห้ามตัดสินเอง |

## 4. Watchers (อัตโนมัติ — ไม่ต้อง permission)

- **Lighthouse CI Nightly** 0:30 UTC @ `selfprint-staging.pages.dev` (3 URLs, numberOfRuns 3 median, เกณฑ์ 0.7 / 0.9 / 0.9 / 0.95 ตาม decision)
- **Lighthouse CI push-trigger**: ยิงเมื่อแตะ `src/**`, `public/**`, `index.html`, `lighthouserc.json` — รอบนี้ (docs + comment-only) **ไม่ trigger** ตาม paths filter

## 5. เงื่อนไขห้ามหลุด (Post-cycle discipline)

- **Push Protocol: ⛔ HOLD มีผลแล้วตั้งแต่ 27 ก.ย. 12:15 UTC (ตามคำสั่ง Owner) — ห้าม push จนกว่าจะมีคำสั่งฉบับใหม่; commits หลังจุดนี้อยู่ local เท่านั้น** (รอบนี้ push ได้โดยคำสั่งตรง — เสร็จสิ้นที่ b8b656c)
- **Deploy ใหม่ = clean window ใหม่**: ตรวจ production SHA ใหม่ + re-attest ตาม RV-07 discipline ก่อนเริ่มสร้าง staging snapshot ใหม่
- **ไม่มี permission ฝั่ง CF dashboard** ฝั่ง Agent — Credentials ทั้งหมดใช้ได้เฉพาะ Owner ตาม Doctrine §1–2

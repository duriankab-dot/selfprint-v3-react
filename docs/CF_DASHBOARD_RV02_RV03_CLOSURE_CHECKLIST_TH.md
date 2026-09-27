# CF DASHBOARD CLOSURE CHECKLIST — RV-02 (/api/metrics) & RV-03 (/api/autonomy-log)

**วันที่จัดทำ:** 27 กันยายน 2026 · **ประเภท:** คู่มือ owner-side evidence collection (documentation-only)
**หลักการ:** closure ของ RV-02/RV-03 ทำได้จาก **Cloudflare Dashboard Logs เท่านั้น** — repo-side พิสูจน์ไม่ได้แล้ว (in-app caller ตาย/ถูกลบ; endpoint ไม่ถูกแตะตาม Boundary B7)

---

## 1. ทำไมต้อง dashboard logs (canonical doctrine)

- **NO EVIDENCE FOUND ≠ NO EXTERNAL CALLER** — การไม่เจอ caller ใน repo ไม่เท่ากับการปฏิเสธ external caller
- Evidence ที่ปิด gate ได้ = **traffic log จริงจาก Cloudflare** ที่แสดงว่ามี/ไม่มี requester นอกแอป
- ผู้เก็บ evidence: **Owner เท่านั้น** (สิทธิ์ dashboard) — Agent บันทึกผลลง Ledger แบบ append-only

## 2. Checklist ต่อ Endpoint

### RV-02 — `/api/metrics` (`functions/api/[[route]].ts`)
- [ ] เข้า Cloudflare Dashboard → Pages project `selfprint-v3-react` → **Analytics & Logs** (หรือ Workers/Pages → Real-time Logs)
- [ ] ตั้งช่วงเวลา: จาก deploy ล่าสุด (production SHA `54ee3610`) ถึงวันที่ตรวจ — **แนะนำ ≥30 วัน**
- [ ] กรอง requests ที่ path = `/api/metrics` — บันทึก: จำนวน hits, source IP / ASN / user-agent, timestamp กลุ่มใหญ่
- [ ] ตรวจว่า traffic มาจากแอปจริงหรือไม่ (โดยทั่วไปแอปไม่เรียก — caller ใน repo = ไม่มี, ตรวจ 27 ก.ย.)
- [ ] บันทึก: `logs export` (CSV/JSON) หรือ screenshot + วันที่เก็บ

### RV-03 — `/api/autonomy-log` (`functions/api/autonomy-log.ts`)
- [ ] ขั้นตอนเดียวกัน กรอง path = `/api/autonomy-log`
- [ ] บันทึก hits + source — โดยเฉพาะ **k6/loadtest user-agents** และ traffic จาก `security.spec.ts:71` (e2e)
- [ ] หมายเหตุ: in-app caller เดิม (`useChat.ts:160,166-175`) ถูกลบแล้ว (Batch 7, `cc38ff0`) — traffic ใด ๆ หลัง deploy ถัดไปที่มาจาก non-app source = external caller **จริง**

## 3. เกณฑ์ตัดสิน (ห้าม Agent ตัดสินเอง — ยื่นให้ Owner)

| ผลที่เจอ | ข้อเสนอสถานะ |
|----------|---------------|
| มี traffic จาก external source (ไม่ใช่แอป/e2e ของเรา) | RV-02/RV-03 → **ORPHAN-UNPROVEN → EXTernal caller CONFIRMED** — endpoint คง B7 ห้ามแตะ |
| ไม่มี traffic เลยในหน้าต่าง ≥30 วัน + ไม่มี cron/analytics config | ข้อเสนอ → CLOSED (NO EXTERNAL TRAFFIC EVIDENCE) — **Owner ตัดสิน** |
| traffic จากแอปเท่านั้น (post-deploy ใหม่) | บันทึกเป็นหลักฐานประกอบ — สถานะตาม Owner decision |

## 4. ขั้นตอนบันทึกหลังเก็บ evidence

1. แนบผล (ตัวเลข + วันที่ + ช่วงเวลา) ให้ Agent
2. Agent บันทึกลง `PHASE_11_GATE_LEDGER_TH.md` แบบ **append-only** (§ ใหม่ + วันที่ + แหล่ง evidence)
3. เปลี่ยนสถานะใน `PHASE_14_MASTER_AUDIT_SPECIFICATION_TH.md` §5 ด้วย owner decision อ้างอิงบันทึกนั้น
4. Push/Deploy ใด ๆ ยังคงอยู่ภายใต้ Push Protocol (HOLD จนกว่าคำสั่งอย่างเป็นทางการ)

## 5. จังหวะที่แนะนำ

- เก็บคู่กับ **deploy ถัดไป** (เมื่อ Owner เปิดกระบวนการ Sync Deploy) — เพราะ deploy ใหม่ให้ clean window นับ traffic ตั้งแต่ SHA ใหม่ + re-attest production SHA ตาม RV-07 discipline
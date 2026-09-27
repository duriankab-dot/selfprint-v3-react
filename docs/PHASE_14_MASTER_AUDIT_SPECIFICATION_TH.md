# PHASE 14 — MASTER AUDIT SPECIFICATION ("หนังสือหลัก") — PROPOSAL

**วันที่:** 27 กันยายน 2026 · **สถานะ:** PROPOSAL — ร่างโครงสร้าง + เนื้อหาย่อยต่อบท — **รอ Owner อนุมัติโครงร่างก่อนเขียนฉบับเต็ม**
**HEAD:** `6ae88bd` @ `master` · **เป้าหมาย:** สร้าง SSOT Master Ledger ฉบับสมบูรณ์ที่รวมหลักฐาน Forensic ทั้งหมด + Architectural Map ของระบบ

---

## 0. วัตถุประสงค์และหลักการ

1. **SSOT เดียว:** ทุกคำกล่าวอ้างใน Master Audit Specification ต้องอ้าง evidence ต้นทาง (file:line / commit SHA / Owner attestation) — ห้ามประกาศอะไรเกินหลักฐาน
2. **ต่อยอดจาก Ledger เดิม:** สถานะทุก gate/UO/E อ้าง `docs/PHASE_11_GATE_LEDGER_TH.md` เป็น registry ต้นทาง — Master Ledger คือ **consolidation** ไม่ใช่การตัดสินใหม่
3. **Append-only discipline:** เมื่อเขียนฉบับเต็ม การเปลี่ยนสถานะใด ๆ ต้องผ่าน owner decision และบันทึกวันที่ + เหตุผล
4. **ข้อจำกัดที่ยังคงอยู่:** production ≠ HEAD (RV-07 attestation @ `54ee3610`) — ทุกข้อความระดับ runtime ต้องระบุ SHA ที่พิสูจน์

## 1. แหล่ง Input ทั้งหมด (รวมเป็นฉบับเต็มได้ทันที)

| แหล่ง | บทบาทในหนังสือหลัก |
|-------|---------------------|
| `FORENSIC_PHASE_00..09` + `PHASE_09_RECONCILIATION_REPORT` (11 ไฟล์) | รายฐาน: repo map, architecture, capability, requirement reconciliation, user simulation, edge/recovery, consistency, test/CI/deploy, dead-orphan classification (DC-xx) |
| `PHASE_10_REMEDIATION_PLAN_TH.md` | แผน remediation → กลายเป็น Batch 5-7 ที่ execute แล้ว |
| `PHASE_11_GATE_LEDGER_TH.md` (§1-§14) | registry ของ gates/UO/E-packets + execution logs ทุก batch |
| `PHASE_11_CLOSURE_PHASE_12_TRANSITION_TH.md` | สถานะปิด Phase 11 + 8 boundaries (approved) |
| `PHASE_12_E1_CONVERGENCE_DESIGN_TH.md` | E1-C1 canonical boundary contract (SICE dual-layer) |
| `PHASE_12_DECISION_PROPOSALS_TH.md` | D2/D3/D4 decisions + evidence tables |
| `PHASE_13_BOUNDARY_MAP_VERIFICATION_TH.md` | **canonical 8-boundary map + verification** (input หลักของ §4) |

## 2. โครงสร้างหนังสือหลัก (สารบัญที่เสนอ)

### §1 บทนำ วิธีวิทยา และขอบเขต
Forensic cycle (00→14) · นิยาม gate/UO/E-packet · stop rules · "UNPROVEN = ผลลัพธ์ที่ถูกต้อง" · ข้อจำกัด evidence แต่ละชนิด (static vs runtime vs dashboard)

### §2 System Inventory (verified live tree)
แผนที่โมดูลที่พิสูจน์ว่ามีชีวิต แยกตามเลเยอร์: app routes / components / hooks / stores / services (CoreAwakeningService, VisualDNAService, supabase-service, world routing ฯลฯ) / lib (intelligence, experience, visual, twin, astrology, twinVisualDNA ×2) / SICE runtime / PWA / Supabase functions — อ้าง consumer evidence จาก Phase 9 + ตรวจซ้ำ 27 ก.ย.

### §3 Dead-Code Ledger (สิ่งที่ถูกลบแล้ว + candidates)
- **ลบแล้ว:** Batch 5 = 51 ไฟล์ (`4bc4a96`, restore 4 ตาม UO-3..6) · Batch 7 = B2 chains 4 ไฟล์ 795 บรรทัด (`cc38ff0`: useChat, ChatWindow DC-20, useJournalQueue, journalQueueDB — row 18/49 M5/M9) · UO-7 = journal-sync machinery ใน sw.js (`6ae88bd`)
- **Candidates ที่เหลือ:** `WorldRoutingService.ts` + `WorldContextAdapter.ts` (DC-11 — zero production callers, instantiation ตายที่ :67) — รอ owner เปิด dead-code batch
- กติกาการลบ (zero-consumer proof + stop rule + pipeline) เป็นมาตรฐาน

### §4 Architectural Boundary Map (8 boundaries — CANONICAL)
อ้างตรงจาก `PHASE_13_BOUNDARY_MAP_VERIFICATION_TH.md`: B1 CoreAwakeningService SSOT · B2 SICE dual-layer + SICEBridge seam (E1-C1) · B3 TSE ×3 (E2 Retain) · B4 TVD ×3 (E3 Retain) · B5 PCB cache key + sites (E4 เปิด) · B6 Supabase Functions ×8 (RV-05 ปิด) · B7 CF API endpoints (RV-02/03 unproven) · B8 sw.js PWA (UO-7 ปิด)

### §5 Gate Registry (สถานะสุดท้าย)
RV-01 = VERIFIED ACTIVE (STATIC, 4 invocation sites — playback runtime เป็นของ AudioContext/user gesture) · RV-02/03 = REMAINS UNPROVEN (external callers — ปิดได้ด้วย CF dashboard logs เท่านั้น) · RV-04 = NO EVIDENCE FOUND (≠ NO EXTERNAL CALLER) · RV-05 = CLOSED (owner dashboard, 8 functions) · RV-06 = UNPROVEN (A/B build authorized — UO-2) · RV-07 = VERIFIED @ `54ee3610` (owner attestation)

### §6 UO Registry (สถานะสุดท้าย)
UO-1 CLOSED · UO-2 เปิด (authorized A/B — รอคำสั่ง) · UO-3..UO-6 CLOSED (VERIFIED ACTIVE) · UO-7 CLOSED

### §7 E-Packet Registry (สถานะสุดท้าย)
E1 = CLOSED ด้วย C1 · E2 = Retain ×3 · E3 = Retain ×3 · E4 = เปิด (wording canonical + runtime reproduction script เขียนได้/ห้ามรัน) · E5 = Wire — executed (Batch 6, DC-16/17/18 WIRED LIVE)

### §8 Verification Pipeline Standards
`tsc -b` = 0 errors · `vitest run` = ≥1,102 (72 files) · `vite build` + PWA injectManifest ผ่าน · bundle proofs (TEST-ONLY tree-shaking พิสูจน์ 27 ก.ย.) · ห้ามสมมติ HEAD == production

### §9 วินัยการทำงาน (carried forward)
Append-only ledger · Stop Rule · owner decision gates · **ห้าม Push โดยไม่มีคำสั่งยืนยันจาก Owner** · ห้ามเดาสโคป

### §10 Open Items & Handoff
1. UO-2 (RV-06 A/B build) — authorized, รอคำสั่ง
2. Remote Push — 6 commits รอคำสั่งอย่างเป็นทางการ
3. Production sync — CF Pages deploy ครั้งถัดไปต้องอ้าง SHA ใหม่ + ปิด RV-02/03 ด้วย dashboard logs
4. TEST-ONLY 9 — ลงทะเบียน VERIFIED TEST INFRASTRUCTURE ฉบับเต็มใน §2 (รวม bundle proof)
5. DC-11 dead-code batch — เมื่อ Owner เปิด
6. E4 runtime reproduction — เมื่อ Owner อนุมัติการรัน
7. Docblock ล้าสมัย (comment-only fixes): `sice/engines/FutureSelfEngine.ts:3`, `Onboarding.tsx:541` ("12 engines" → 16), `supabase-service.ts:15-16,274`, `functions/api/autonomy-log.ts:18,41`, `global-webapi-types.d.ts:30` — ทำเมื่อ Owner เปิด cleanup batch

## 3. ขั้นตอนต่อไป (เมื่อ Owner อนุมัติโครงร่าง)

1. เขียนฉบับเต็ม §1-§10 โดยดึงเนื้อหาจาก input docs ทั้งหมด (§1 table) — ไม่ตัดสินใหม่ ไม่แตะ code
2. ทุกบทต้องมีตาราง evidence + อ้าง file:line/SHA
3. ส่ง DRAFT ให้ Owner ตรวจ → ปรับ → **ปิด Phase 14 = หนังสือหลักฉบับสมบูรณ์**

**สถานะเอกสารนี้:** PROPOSAL — รอ Owner อนุมัติโครงร่าง (ไม่ commit จนกว่า Owner สั่ง)
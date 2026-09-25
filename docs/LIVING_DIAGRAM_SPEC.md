# LIVING_DIAGRAM_SPEC.md — สเปคเส้นเรื่องราว LivingDiagram
**VERSION: 1.1 | LAST_UPDATED: 2026-09-25**  
**เกี่ยวข้อง: TC-102, TC-103, TC-104, TC-105, TC-106, TC-205, TC-301, TC-302, TC-303, TC-304, TC-305, TWIN_DNA_SPEC.md, UNIFIED_PIPELINE_SPEC.md**  
**สถานะ: IMPLEMENTED สมบูรณ์ (เฟส 1-3) — EVS ถูกลบ (TC-304), rollout 100% default (TC-305), mobile sheet + a11y (TC-301/303)**

---

## 🎯 วัตถุประสงค์

LivingDiagram คือ **เส้นเรื่องราวเดียว (narrative spine)** ที่ครอบ Landing → Onboarding → Dashboard/Webboard ทั้งหมด:

1. ผู้ใช้เห็น "คน → สร้างฝาแฝด → เครื่องยนต์ 12 มิติ → แผนที่พฤติกรรม" ครั้งเดียวบน Landing
2. ตอน Onboarding เห็น Twin ของตัวเอง "กำลังเกิด" ด้วย DNA ของตัวเอง (ไม่ใช่ภาพ generic)
3. ตอน Dashboard เห็นแผนที่พฤติกรรมจริงที่ animate ตามข้อมูลจริง + วง confidence
4. เมื่อ pipeline เลื่อนเวอร์ชัน (v1→v2→v3) แผนที่ animate ตาม diff — เห็น Twin โตขึ้นจริง

---

## 🧩 สถาปัตยกรรม (2 ชั้น)

### ชั้นที่ 1 — SVGCore (`src/components/living/SVGCore.tsx`)

**สัญญาความบริสุทธิ์ (purity contract):**
- Pure function ของ props → props เดิม = พิกเซลเดิม (test ได้ 100%)
- ไม่มี useEffect / useRef / window access — driver เป็นคนป้อน `progress`
- โครงสร้าง 4 เฟส **เหมือนเดิมทุกเกณฑ์** กับ EvolutionaryVisualSystem เดิม:
  - Phase 1 (0→0.43): Human → AI Twin draw-on (streams, ISM grid)
  - Transition (0.38→0.60): Core Synapse Sphere
  - Phase 2 (0.56→1.0): 12 SICE nodes ค่อย ๆ เปิดตาม `NODE_THRESH`
  - Climax (0.84→1.0): Behavioral Map polygon
- **DNA-driven**: รูปร่าง (headShape/eyeOffset/shoulderTilt/spineCurvature/limbLengthRatio) และสี (hsl จาก hue ของ DNA) มาจาก `TwinVisualDNA`
- `scores` (12 ค่า 0..1) override รัศมี polygon แต่ละมิติ — โหมด Data
- `confidence` (0..1) วาดวงโค้งรอบ core
- `animate=false` เมื่อ prefers-reduced-motion → render สถิต ไม่มี CSS animation

### ชั้นที่ 2 — LivingDiagram (`src/components/living/LivingDiagram.tsx`)

Wrapper + **3 drivers**:

| Driver | mode | แหล่ง progress | ใช้ที่ |
|--------|------|----------------|--------|
| ScrollDriver | `landing` | scroll progress จาก `containerRef` (rAF-batched, passive — pattern เดิมของ EVS) หรือ `progress` prop ถ้าส่งมา | LandingPage |
| StepDriver | `onboarding` | step index → `STEP_PROGRESS = [0.16, 0.38, 0.6, 0.82, 1]` | Onboarding (ขั้น ai-creation) |
| DataDriver | `dashboard` | progress=1 ตลอด + `scores`/`confidence`/`version` จากข้อมูลจริง | Dashboard |

**ความปลอดภัย/ประสิทธิภาพ (สืบทอดจาก fix เดิมของ EVS):**
- Mount gating ด้วย IntersectionObserver (EVISUAL-IDLE-001) — ไม่ build โหนดถ้ายังไม่ใกล้ viewport, jsdom/legacy ไม่มี IO → render เลย
- prefers-reduced-motion → render สถิต progress=1 ไม่มี loop, ไม่สร้าง IntersectionObserver
- Version badge (v1/v2/v3 + %) แสดงเฉพาะ mode=dashboard เมื่อส่ง `version`

---

## 🔌 จุด integrate (ทุกจุด gated ด้วย `isFeatureEnabled('LIVING_DIAGRAM')`)

| หน้า | ไฟล์ | สิ่งที่เพิ่ม |
|------|------|--------------|
| Landing | `src/pages/LandingPage.tsx` | แทน EvolutionaryVisualSystem ด้วย LivingDiagram mode=landing, DNA จาก DOB + `sp_visitor_id` (บันทึกด้วย `saveTwinDNA`) — flag ปิด = EVS เดิม 100% |
| Onboarding | `src/pages/Onboarding.tsx` | ใน step `ai-creation`: LivingDiagram step=2 + DNA จาก birthData (`saveTwinDNA`); หลัง SICE submit → `refineTwinDNA` เป็น v2 |
| Dashboard | `src/pages/Dashboard.tsx` | mode=dashboard: scores จาก `onboarding_sice_snapshot`, confidence จาก `twin.maturityScore/100`; ถ้า `UNIFIED_PIPELINE` เปิด → อ่านจาก `twinStore.current` (TC-205) ทับ proxy |
| TwinProfile | `src/pages/TwinProfilePage.tsx` (TC-107) | `DNAAvatarStrip` — TwinDNAAvatar + seed/shape/dominant จาก persisted DNA |
| Worlds | `src/components/world/WorldEnvironment.tsx` (TC-108) | DNA `accentHue` → radial overlay มุมขวาบนของ world (ไม่มี DNA = ไม่เปลี่ยน) |

**โฟลว์ DNA ตลอด journey:**
```
Landing (ใส่ DOB)      → generateTwinDNA(dob, visitorId) → saveTwinDNA → v1
Onboarding (จบ SICE)   → refineTwinDNA(dna, dominantSICE+blindSpot) → v2
Dashboard (มี decision)→ twinStore.current.scores + confidence → v3 (UNIFIED_PIPELINE)
```

---

## 🧪 การทดสอบ

`src/components/living/__tests__/livingDiagram.test.tsx` — 10 tests:
- SVGCore: 12 label TH/EN, deterministic (props เดิม = HTML เดิม), DNA ต่างกัน = output ต่างกัน, phase math (progress 0 vs 1), polygon จาก scores, **ไม่มี hex/rgb ใน source** (token gate contract)
- LivingDiagram: 3 modes ทำงานถูก, version badge + confidence แสดงถูก
- TwinDNAAvatar: DNA ต่างกัน → avatar ต่างกัน

## 🚦 วิธีเปิดใช้

```bash
# .env.local
VITE_FEATURE_LIVING_DIAGRAM=true    # เฟส 1 เปิดทีละหน้า
VITE_FEATURE_UNIFIED_PIPELINE=true  # เฟส 2: DataDriver อ่าน twinStore
```
Rollback < 30 วินาที: ปิด flag แล้วทุกหน้ากลับไป render ของเดิมทันที (EVS/Twin ไม่ถูกแตะ)
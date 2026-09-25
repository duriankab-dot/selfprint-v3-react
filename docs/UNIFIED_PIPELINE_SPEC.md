# UNIFIED_PIPELINE_SPEC.md — สเปค Pipeline เดียว v1→v2→v3
**VERSION: 1.1 | LAST_UPDATED: 2026-09-25**  
**เกี่ยวข้อง: TC-201, TC-202, TC-203, TC-204, TC-205, TC-209, TC-210, TC-305, LIVING_DIAGRAM_SPEC.md**  
**สถานะ: IMPLEMENTED เสร็จสมบูรณ์ (เฟส  ั2-3) — rollout 100% default (TC-305; rollback =ตั้ง env เป็น false**

---

## 🎯 วัตถุประสงค์

หัวใจของโปรเจกต์: **วิเคราะห์ครั้งเดียว ต่อยอดตลอดทาง — ไม่ analyze ใหม่ซ้ำทุกครั้ง**

เดิม: แต่ละหน้าวิเคราะห์ใหม่ตั้งแต่ศูนย์ → Twin ไม่เคย "จำ" อะไร
ตอนนี้: ทุก input ใหม่ (DOB / mood / คำตอบปรับแต่ง / การตัดสินใจจริง) เข้า **ชั้นเดียว** แล้ว merge เป็น `UnifiedAnalysis` หนึ่งเดียว ที่ confidence ไต่ขึ้นเรื่อย ๆ

---

## 📊 โครงสร้าง 3 ชั้น + สัญญา Confidence

| ชั้น | แหล่งข้อมูล | confidence | trigger |
|------|-------------|-----------|---------|
| `v1_landing` | DOB + mood (หน้าแรก) | **20%** | มี DOB + mood |
| `v2_onboarding` | คำตอบปรับแต่ง + SICE result | **65%** | จบ fine-tune (มี answers + SICE result) |
| `v3_living` | การตัดสินใจจริง + feedback | **85%+** | มี decision log เข้าระบบ |

สัญญาแข็ง (บังคับด้วย test): **ห้าม downgrade** — ถึง v3 แล้วอยู่ v3 เสมอ

---

## 🧩 โมดูล (ไฟล์จริง + หน้าที่)

### 1. TwinStore — `src/store/twinStore.ts` (TC-202)

Zustand store ชั้นเดียวของระบบ:

```ts
layers: Partial<Record<1|2|3, TwinLayer>>  // ข้อมูลดิบของแต่ละชั้น
current: UnifiedAnalysis | null            // ผล merge ชั้นเดียว (อ่านอย่างเดียว)
evolutionLog: EvolutionEvent[]             // ทุกการเลื่อนเวอร์ชัน (from/to/reason) — เอาไป animate diff
```

- `recordInput(version, inputs, scores?)` — บันทึก/แทนที่ layer ตามเวอร์ชัน
- `mergeLayers()` — รวมทุก layer **ถ่วงน้ำหนักตาม confidence** (ชั้นใหม่นำ 60%, ชั้นเดิม anchor 40% ที่ระดับ AnalysisEngine) → `UnifiedAnalysis` เดียว (insights, blindSpots, dominantSICE, scores, sources)
- `logEvolution(from, to, reason)` — เก็บ event (dedupe ที่ `to` ล่าสุด, cap 50 รายการ)

### 2. AnalysisEngine — `src/lib/analysis/AnalysisEngine.ts` (TC-201)

```ts
analyze(input: TwinInput, context: AnalysisContext, previous?: UnifiedAnalysis | null): UnifiedAnalysis
```

- **Merge ไม่ regenerate**: ถ้ามี `previous` → score ใหม่ = `prev*0.4 + new*0.6` (ความต่อเนื่องของพฤติกรรม), insights เดิมยกมาตามจำนวนที่เวอร์ชันใหม่รองรับ, sources สะสม
- `baselineScores(input, userId)` — deterministic จาก (dob|userId|version) — คนเดิมข้อมูลเดิมได้ scores เดิม
- Blind spots = มิติที่ merged score < 0.42 (สูงสุด 4)
- `dominantSICE` = มิติที่แข็งแรงสุดของ merged scores

### 3. VersionManager — `src/lib/analysis/VersionManager.ts` (TC-203)

```ts
nextVersion({ inputs, hasSiceResult?, hasDecisionLog?, currentVersion }) → 1 | 2 | 3 | null
```

- อ่านจาก **สัญญาณที่มีจริงเท่านั้น** (dob+mood → 1; +finetune+SICE → 2; +decision log → 3)
- คืน `null` = ไม่มีสิทธิ์เลื่อน (ข้อมูลไม่พอ หรือจะ downgrade)
- `versionReason()` — เหตุผลอ่านได้สำหรับ evolution log + UI

### 4. useTwinInput — `src/hooks/useTwinInput.ts` (TC-204)

Accumulator hook — ประตูเดียวสำหรับทุก input:

```ts
const { inputs, version, confidence, current, accumulate, reanalyze } = useTwinInput(userId);

accumulate({ dob, mood })                        // → v1 (20%)
accumulate({ finetuneAnswers }, { hasSiceResult: true })  // → v2 (65%)
accumulate({ decisionCount }, { hasDecisionLog: true })   // → v3 (85%)
```

- `accumulate` รวม union ของทุก layer เดิม + partial ใหม่ → VersionManager ตัดสิน → recordInput → analyze (merge กับ current เดิม) → logEvolution → mergeLayers
- `reanalyze()` — merge ใหม่จาก layer ที่มี **โดยไม่เพิ่ม input/log**

---

## 🔌 จุดเชื่อมต่อปัจจุบัน

| จุด | สถานะ |
|------|--------|
| Dashboard LivingDiagram อ่าน `twinStore.current` (scores/confidence/version) เมื่อ `UNIFIED_PIPELINE` เปิด (TC-205) | ✅ ต่อแล้ว |
| `useTwinInput` พร้อมใช้สำหรับ wiring Landing/Onboarding/decision logger ในเฟสถัดไป | ✅ hook พร้อม + tested (hook ยังไม่ถูกยิงจากหน้าจริงเพื่อคุมความเสี่ยงเฟสนี้ — เปิด flag ค่อยเชื่อม) |
| evolutionLog → animate diff ใน LivingDiagram | ข้อมูลพร้อม (evolutionLog ใน store), animation เป็นงานต่อยอดเฟส 3 |

---

## 🧪 การทดสอบ

`src/__tests__/Phase2Pipeline.test.ts` — 17 tests:
- TC-202: recordInput/confidence contract, mergeLayers = UnifiedAnalysis เดียว, **confidence progression 20%→65%→85%**, logEvolution บันทึกเมื่อเลื่อน + dedupe, reset
- TC-201: merge 60/40, blindSpots จากมิติอ่อนเท่านั้น, baselineScores deterministic
- TC-203: ทุก trigger + ห้าม downgrade + สัญญาณไม่พอ = ไม่เลื่อน
- TC-204: accumulate ไต่ v1→v2→v3, union เก็บ input ครบทุกชั้น, reanalyze ไม่เพิ่ม log

## 🚦 วิธีเปิดใช้

```bash
VITE_FEATURE_UNIFIED_PIPELINE=true
```
ปิด flag = ทุก code path ใหม่ถูก bypass (Dashboard ใช้ scores จาก snapshot proxy เดิม)
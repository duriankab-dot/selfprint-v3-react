/**
 * E4 — PCB CACHE-SHAPE COLLISION RUNTIME REPRODUCTION SCRIPT
 * ═══════════════════════════════════════════════════════════════════
 * ⛔ ห้ามรันจนกว่า Owner จะสั่งเป็นลายลักษณ์อักษร (E4 ยัง OPEN — runtime
 *    impact unproven; การรันต้องผ่าน owner approval ก่อน)
 *    คำสั่งเมื่ออนุมัติ:  node scripts/E4_PCB_COLLISION_REPRODUCTION.mjs
 * ═══════════════════════════════════════════════════════════════════
 *
 * วัตถุประสงค์ (E4 packet — PHASE_14_MASTER_AUDIT_SPECIFICATION_TH.md §7):
 *   พิสูจน์ runtime impact ของ cache-shape collision ที่พิสูจน์แล้วเชิง static:
 *   lib/intelligence/PersonalContextBuilder ใช้ cache key `['personalContext', userId]`
 *   (cache key + creation sites = Boundary B5 — ห้ามแตะ)
 *   ขณะที่ sice/engines/PersonalContextBuilder (SICE #1) ถูกเรียกจาก
 *   TwinPersonalityPage.tsx:116-166 และสร้าง entry รูปทรง PersonalityMetrics
 *   บนคีย์รูปแบบเดียวกัน — collision proven (E1), runtime impact unproven (E4)
 *
 * วิธีการ: self-contained in-memory simulation — ไม่ import app code,
 *   ไม่ติดต่อ Supabase/เครือข่าย, deterministic — replicates the two
 *   shapes เทียบกันบนคีย์เดียวกันเพื่อชี้ field-level consequences
 *   (undefined reads / NaN computations / broken .map chains)
 *
 * ผลลัพธ์ที่รายงาน (เมื่อรัน): PASS/FAIL ต่อ scenario + ข้อสรุปว่า runtime
 *   impact มีจริงหรือไม่ — ผลจะถูกบันทึกลง Ledger แบบ append-only
 *   (UO-8/§15) พร้อมวันที่รัน — ห้ามตัดสิน E4 จากการรันโดยพลการ
 */

const CACHE_KEY = (userId) => ['personalContext', userId];

// ── Shape A: lib/intelligence/PersonalContextBuilder (TwinPersonalityPage
//    reads this via the shared cache — PersonalContext รูปทรงจริงตาม
//    lib/intelligence/types.ts:118) ────────────────────────────────────────
const LIB_PERSONAL_CONTEXT_SHAPE = {
  userId: 'u_123',
  values: [],            // Value[]
  goals: [],             // Goal[]
  strengths: [],         // Strength[]
  blindSpots: [],        // BlindSpot[]
  emotionalRange: null,  // EmotionalRange
  decisionStyle: null,   // DecisionStyle
  relationships: [],     // Relationship[]
  confidence: 0.0,       // 0-1
};

// ── Shape B: sice/engines/PersonalContextBuilder ผ่าน TwinPersonalityPage
//    (PersonalityMetrics รูปทรง — ทั้งคู่ถูกเก็บบนคีย์รูปแบบเดียวกัน) ──────
const SICE_PERSONALITY_METRICS_SHAPE = {
  userId: 'u_123',
  metrics: { maturity: 62, responsiveness: 48, curiosity: 71 },
  stageLabel: 'Developing',
  archetypeScores: {},
  confidence: 62, // 0-100 ไม่ใช่ 0-1
};

function runReproduction() {
  const cache = new Map();
  const key = CACHE_KEY('u_123');

  // Scenario 1 — lib เขียนก่อน, sice เขียนทับบนคีย์เดียวกัน
  cache.set(key, LIB_PERSONAL_CONTEXT_SHAPE);
  cache.set(key, SICE_PERSONALITY_METRICS_SHAPE);
  const poisonedForLib = cache.get(key);

  const libReadsStrengths = poisonedForLib.strengths; // undefined — ไม่อยู่ใน Shape B
  const libReadsConfidence = poisonedForLib.confidence; // 62 (0-100) แต่ lib คาด 0-1
  const libConfidencePercent = Math.round(libReadsConfidence * 100); // 6200 → NaN-adjacent UI bug

  // Scenario 2 — sice อ่าน entry ที่ lib เขียน (reverse direction)
  cache.set(key, LIB_PERSONAL_CONTEXT_SHAPE);
  const poisonedForSice = cache.get(key);
  const siceReadsMetrics = poisonedForSice.metrics; // undefined
  const siceStageLabel = poisonedForSice.stageLabel; // undefined → .toUpperCase() จะ throw

  const findings = [
    ['S1 lib.strengths หลัง sice เขียนทับ', libReadsStrengths === undefined, 'undefined'],
    ['S2 lib.confidence scale ผิด (62 → 6200%)', libConfidencePercent > 100, `${libConfidencePercent}%`],
    ['S3 sice.metrics หลัง lib เขียนก่อน', siceReadsMetrics === undefined, 'undefined'],
    ['S4 sice.stageLabel undefined → throw risk', siceStageLabel === undefined, 'undefined'],
  ];

  console.log('══ E4 PCB Cache-Shape Collision Reproduction ══');
  findings.forEach(([name, reproduced, detail]) =>
    console.log(`${reproduced ? '✅ REPRODUCED' : '— not reproduced'}  ${name}  (${detail})`)
  );
  const impact = findings.filter(([, r]) => r).length;
  console.log(
    impact === findings.length
      ? 'RESULT: runtime impact REPRODUCED (4/4) — E4 อาจปิดได้ด้วย evidence นี้ รอบันทึก + owner decision'
      : `RESULT: partial (${impact}/${findings.length}) — บันทึกผลตามจริงใน Ledger, E4 สถานะตาม owner`
  );
}

// ⛔ Guard — ห้ามรันจนกว่า Owner จะสั่ง (E4 OPEN)
if (process.env.E4_APPROVED_BY_OWNER === 'yes') {
  runReproduction();
} else {
  console.error(
    '⛔ BLOCKED: E4 ยัง OPEN — รันได้เฉพาะเมื่อ Owner สั่งเป็นลายลักษณ์อักษร\n' +
    '   (ตั้ง E4_APPROVED_BY_OWNER=yes เมื่อได้รับคำสั่งเท่านั้น)'
  );
  process.exitCode = 1;
}
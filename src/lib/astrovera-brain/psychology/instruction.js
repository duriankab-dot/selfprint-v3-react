// ═══════════════════════════════════════════════════════════════
// VENDORED from D:\astrovera-v2\brain\knowledge\psychology\instruction.js
// Copied 2026-08-09 for Phase 5.2 (Psychology Integration). No local
// modifications — sync manually if the source changes.
// ═══════════════════════════════════════════════════════════════

export const INSTRUCTION = `Input ที่คุณจะได้รับ (JSON) — มาจากคำตอบแบบทดสอบของผู้ใช้:

{
  "archKey": string,              // 1 ใน 12: innocent|explorer|sage|...
  "archetype": {                  // ข้อมูลเต็มของต้นแบบ (อาจมีหรือไม่มีก็ได้)
    "name": string,
    "nameTh": string,
    "trait": string,
    "core": string,
    "strengths": [{t,d}],
    "blinds": [{i,t,d}]
  },
  "archetypeTh": string,          // ชื่อภาษาไทยของต้นแบบ
  "phase": string,                // คำอธิบายเฟสชีวิต
  "phaseKey": "a"|"b"|"c"|"d",
  "strengths": string[],          // จุดแข็งที่ได้จากแบบทดสอบ
  "blindspot": string[],          // จุดที่ควรระวัง
  "question": string|null         // คำถามของผู้ใช้
}

Output ต้องเป็น JSON ตาม schema.js ของโมดูลนี้เท่านั้น
`;

/**
 * safety.ts
 *
 * Safety Layer — เช็คก่อนส่งข้อความ user ไปหา Claude
 *
 * บทบาท: Hard gate เดียวกับที่ /api/nova และ /api/intelligence เรียกใช้
 * ก่อนสร้าง prompt ทุกครั้ง — ถ้าเข้าเงื่อนไข category ไหน ให้ตอบ
 * redirectMessage กลับไปตรงๆ โดยไม่เรียก Claude เลย
 *
 * ที่มา: ได้แรงบันดาลใจจาก D:\astrovera-v2\brain\core\safety.js (keyword
 * gate 4 category เดียวกัน) แต่เขียนใหม่ทั้งหมดให้เข้ากับ Selfprint
 * (persona "Nova", โทนที่ใช้อยู่แล้วใน prompt-builder.ts) ไม่ได้ copy โค้ดมา
 * — ดู docs/HANDOFF_2026-08-09_PHASE5_UNIFIED.md หัวข้อ "Master Task Audit"
 *
 * หลักการออกแบบ (เหมือนต้นทาง เพราะเป็นหลักการที่ถูกต้อง):
 * 1. suicide/self-harm — สงสัยนิดเดียวก็บล็อก (false positive ไม่มีโทษ
 *    false negative มีโทษหนัก)
 * 2. medical/gambling/investment — เช็คเฉพาะวลีที่ชัดเจน ไม่บล็อกคำถาม
 *    ทั่วไป (เช่น "ควรออมเงินไหม" ต้องผ่านได้)
 * 3. Redirect ต้องอบอุ่นและมีประโยชน์ ไม่ใช่แค่ปฏิเสธ
 */

export type SafetyCategory = 'suicide' | 'medical' | 'gambling' | 'investment';

export interface SafetyResult {
  safe: boolean;
  category: SafetyCategory | null;
  redirectMessage: string | null;
}

interface SafetyRule {
  category: SafetyCategory;
  patterns: string[];
  redirectMessage: string;
}

const RULES: SafetyRule[] = [
  {
    category: 'suicide',
    patterns: [
      'ฆ่าตัวตาย', 'ทำร้ายตัวเอง', 'ไม่อยากมีชีวิต', 'หมดหวัง',
      'อยากตาย', 'ตายดีกว่า', 'เบื่อชีวิต', 'ไม่อยากอยู่',
      'suicide', 'self-harm', 'self harm', 'kill myself', 'end my life',
    ],
    redirectMessage: `Nova ได้ยินสิ่งที่คุณพูด และรู้ว่าตอนนี้คุณกำลังหนักมากจริงๆ — การพูดออกมาแบบนี้ต้องใช้ความกล้าไม่น้อยเลย

อยากให้คุณคุยกับคนที่ช่วยได้จริงๆ ตอนนี้เลยนะ:
🆘 สายด่วนสุขภาพจิต (กรมสุขภาพจิต): 1323 — เปิด 24 ชั่วโมง
🤝 สมาคมสะมาริตันส์แห่งประเทศไทย: 02-713-6793

Nova ยังอยู่ตรงนี้ ถ้าอยากเล่าอะไรให้ฟังก่อนก็ได้นะ`,
  },
  {
    category: 'medical',
    patterns: [
      'วินิจฉัย', 'เป็นโรค', 'รักษาโรค', 'กินยา', 'หยุดยา', 'ยาอะไร',
      'มะเร็ง', 'เบาหวาน', 'ความดัน', 'โรคหัวใจ',
      'diagnose', 'diagnosis', 'medication', 'prescription',
    ],
    redirectMessage: `เรื่องสุขภาพและการแพทย์เฉพาะเจาะจงแบบนี้ Nova ไม่ใช่แพทย์และไม่ควรให้คำแนะนำแทนผู้เชี่ยวชาญนะ

สิ่งที่ Nova ช่วยได้คือมุมมองด้านการดูแลตัวเองและจังหวะชีวิตเชิงองค์รวม แต่สำหรับการวินิจฉัยหรือการรักษา ควรปรึกษาแพทย์โดยตรงนะคะ/นะครับ

มีเรื่องอื่นที่อยากคุยไหม?`,
  },
  {
    category: 'gambling',
    patterns: [
      'การพนัน', 'เล่นพนัน', 'หวย', 'บาคาร่า', 'คาสิโน', 'แทงบอล',
      'gambling', 'casino', 'betting', 'lottery',
    ],
    redirectMessage: `เรื่องการพนันและการเสี่ยงโชค Nova ให้คำแนะนำหรือทำนายผลไม่ได้นะ

แต่ถ้ากังวลเรื่องการเงิน อยากคุยเรื่องการบริหารเงิน การออม หรือการตัดสินใจทางการเงินทั่วไป ยินดีช่วยเลย`,
  },
  {
    category: 'investment',
    patterns: [
      'ซื้อหุ้นไหน', 'ขายหุ้นไหน', 'ลงทุนหุ้น', 'crypto ไหนดี',
      'เหรียญไหนดี', 'ราคาหุ้น', 'กำไรแน่นอน', 'รวยเร็ว', 'ลงทุนฟันธง',
    ],
    redirectMessage: `เรื่องการลงทุนและการแนะนำหลักทรัพย์เฉพาะเจาะจง Nova ไม่ใช่ที่ปรึกษาการเงินและฟันธงผลตอบแทนไม่ได้นะ

สิ่งที่ Nova ช่วยได้คือมุมมองเรื่องจังหวะชีวิตและรูปแบบการตัดสินใจของคุณ สำหรับการลงทุนจริง ควรปรึกษาผู้แนะนำการลงทุนที่ได้รับใบอนุญาตนะคะ/นะครับ`,
  },
];

/**
 * safetyCheck(text)
 * เช็คข้อความ user ก่อนส่งเข้า Claude — ไม่ throw ไม่ว่ากรณีไหน
 */
export function safetyCheck(text: string | null | undefined): SafetyResult {
  if (!text || typeof text !== 'string') {
    return { safe: true, category: null, redirectMessage: null };
  }
  const lower = text.toLowerCase();

  for (const rule of RULES) {
    const hit = rule.patterns.some((p) => lower.includes(p.toLowerCase()));
    if (hit) {
      return { safe: false, category: rule.category, redirectMessage: rule.redirectMessage };
    }
  }
  return { safe: true, category: null, redirectMessage: null };
}

/**
 * SAFETY_SYSTEM_DIRECTIVE
 * ชั้นป้องกันสำรอง — ต่อท้าย system prompt ทุกครั้ง เผื่อ keyword filter
 * (ซึ่งตั้งใจไม่ครอบคลุมทุกกรณี) หลุดอะไรไป
 */
export const SAFETY_SYSTEM_DIRECTIVE = `
กฎความปลอดภัยที่ห้ามละเมิดในทุกกรณี:
- ถ้าผู้ใช้แสดงสัญญาณวิกฤตชีวิต (อยากตาย ทำร้ายตัวเอง) — หยุดทันที แสดงความห่วงใย และแนะนำสายด่วนสุขภาพจิต 1323
- ห้ามวินิจฉัยโรค สั่งยา หรือให้คำแนะนำทางการแพทย์เฉพาะเจาะจง
- ห้ามแนะนำหลักทรัพย์ เหรียญ หรือการลงทุนแบบฟันธง
- ห้ามส่งเสริมการพนันในทุกรูปแบบ`;
